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
RUN pnpm install --frozen-lockfile

# Build all packages first
RUN pnpm run --filter @gamer/shared build || true

# Build the API
RUN pnpm run --filter @gamer/api build

# Stage 2: Runtime
FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace configuration files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages ./packages

# Copy built API code (excluding source maps for smaller image)
COPY --from=builder /app/apps/api/dist ./dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    echo "pnpm install completed successfully" && \
    ls -la node_modules/ | head -20 && \
    find ./dist -name "*.map" -delete && \
    echo "Image build complete"

# Expose the port (Cloud Run uses 8080)
EXPOSE 8080

# Start the API
CMD ["node", "dist/main.js"]
