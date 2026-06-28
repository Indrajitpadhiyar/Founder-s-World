# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Create directory for logs
RUN mkdir -p logs

EXPOSE 4000

CMD ["node", "dist/server.js"]
