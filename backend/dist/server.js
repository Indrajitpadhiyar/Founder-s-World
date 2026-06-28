import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './config/database.js';
import { connectRedis, redisClient } from './config/redis.js';
import { SocketService } from './modules/socket/socket.service.js';
import { initWorkers } from './modules/queues/workers.js';
import { initScheduler } from './modules/queues/queue.service.js';
import { seedDatabase } from './database/seed.js';
const server = http.createServer(app);
const startServer = async () => {
    try {
        // 1. Uncaught Exception Handler
        process.on('uncaughtException', (err) => {
            logger.error('CRITICAL: Uncaught Exception!', err);
            gracefulShutdown();
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
        });
        // 2. Connect Database & Redis
        await connectDatabase();
        connectRedis();
        // 3. Seed initial game data
        await seedDatabase();
        // 4. Connect WebSockets
        SocketService.init(server);
        // 5. Connect Background Job queues & workers
        initWorkers();
        await initScheduler();
        // 6. Bind listener port
        server.listen(env.PORT, () => {
            logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        });
    }
    catch (error) {
        logger.error(`Critical Server Startup Error: ${error.message}`);
        process.exit(1);
    }
};
const gracefulShutdown = () => {
    logger.warn('Received kill signal, shutting down gracefully...');
    server.close(async () => {
        logger.info('HTTP server closed.');
        try {
            if (redisClient) {
                await redisClient.quit();
                logger.info('Redis connection closed.');
            }
            logger.info('Database connection closing...');
            // Wait for pending queries to finish and disconnect
            // Mongoose close
            // logger.info('Mongoose disconnected.');
        }
        catch (err) {
            logger.error(`Error during graceful shutdown: ${err.message}`);
        }
        process.exit(0);
    });
    // Force shutdown after 10 seconds if graceful fails
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
startServer();
export default server;
//# sourceMappingURL=server.js.map