# ==========================================
# STAGE 1: Build Frontend Assets & Proxies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install openssl and other necessary system packages
RUN apk add --no-cache libc6-compat openssl

# Copy manifests
COPY package*.json ./

# Install devDependencies for compilation
RUN npm ci

# Copy full monorepo codebase
COPY . .

# Run production compilation of client bundle and server entry points
ENV NODE_ENV=production
RUN npm run build

# Remove development packages to shrink final filesystem footprint
RUN npm prune --production

# ==========================================
# STAGE 2: Micro-Runtime Execution Engine
# ==========================================
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 web

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy compiled bundles, manifests, and production nodeModules
COPY --from=builder --chown=web:nodejs /usr/src/app/package*.json ./
COPY --from=builder --chown=web:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=web:nodejs /usr/src/app/node_modules ./node_modules

# Ensure unprivileged execution context
USER web

EXPOSE 3000

# Start custom Express-Vite backend web portal layer
CMD ["node", "dist/server.cjs"]
