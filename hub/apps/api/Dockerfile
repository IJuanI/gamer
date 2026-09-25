# Multi-stage production build for GamER Hub API
# Stage 1: Builder
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

# Copy the workspace files
COPY hub/package.json ./
COPY hub/pnpm-workspace.yaml ./
COPY hub/pnpm-lock.yaml ./
COPY hub/packages ./packages
COPY hub/apps ./apps

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile && \
    echo "Dependencies installed to:" && \
    ls -lah /app/node_modules 2>&1 | head -20 || echo "node_modules not found"

# Build all packages first
RUN pnpm run --filter @gamer/shared build || true

# Build the API
RUN pnpm run --filter @gamer/api build && \
    echo "API built successfully"

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy entire node_modules tree from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built API code
COPY --from=builder /app/apps/api/dist ./dist

# Expose the port (Cloud Run uses 8080)
EXPOSE 8080

# Start the API
CMD ["node", "dist/main.js"]
