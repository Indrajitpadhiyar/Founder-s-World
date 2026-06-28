module.exports = {
  apps: [
    {
      name: 'business-empire-backend',
      script: './dist/server.js',
      instances: 'max', // Utilizes all CPU cores
      exec_mode: 'cluster', // Enables clustering
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
