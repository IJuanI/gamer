# Multi-stage production build for GamER Hub API
# Stage 1: Builder
ARG CACHE_BUST=1
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

# Mark builder stage completion
RUN echo "Builder stage complete - $(date)" > /tmp/builder.txt && cat /tmp/builder.txt

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy marker file to test if COPY works at all
COPY --from=builder /tmp/builder.txt ./builder-marker.txt

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy built API code
COPY --from=builder /app/apps/api/dist ./dist

# Remove source maps
RUN find ./dist -name "*.map" -delete

# Debug: verify what was copied
RUN echo "=== Checking copied files ===" && \
    [ -f ./builder-marker.txt ] && echo "✓ builder-marker.txt exists" || echo "✗ builder-marker.txt missing" && \
    [ -d ./node_modules ] && echo "✓ node_modules dir exists: $(ls -d ./node_modules)" || echo "✗ node_modules missing" && \
    [ -d ./dist ] && echo "✓ dist dir exists" || echo "✗ dist missing"

# Expose the port (Cloud Run uses 8080)
EXPOSE 8080

# Start the API
CMD ["node", "dist/main.js"]
