# ==========================================
# STAGE 1: Build & Dependency Resolution
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies (needed for certain native node modules/pg client setups)
RUN apk add --no-cache libc6-compat openssl

# Set Node environment to development for compiling
ENV NODE_ENV=development

# Copy dependency manifests
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY prisma/schema.prisma ./prisma/

# Install dependencies for NestJS and Prisma
WORKDIR /usr/src/app/apps/api-gateway
RUN npm ci

# Generate Prisma Client (crucial for type safety and compilation)
WORKDIR /usr/src/app
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code files
COPY apps/api-gateway ./apps/api-gateway

# Compile NestJS code to production CJS/ESM distribution
WORKDIR /usr/src/app/apps/api-gateway
RUN npm run build

# Prune devDependencies to keep container lean and optimized
RUN npm prune --production

# ==========================================
# STAGE 2: Microservice Minimal Runtime
# ==========================================
FROM node:20-alpine AS runner

# Create secure system group and isolated user for security hardening (no root privilege)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Install openssl (Prisma engines require openssl inside Alpine containers)
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3001
ENV NEST_PORT=3001

# Copy compiled files, node modules, and generated prisma assets
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/apps/api-gateway/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/apps/api-gateway/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Set secure, unprivileged user context
USER nestjs

# Expose backend private service interface port
EXPOSE 3001

# Start NestJS production cluster
CMD ["node", "dist/main.js"]
