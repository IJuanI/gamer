# Multi-stage production build for GamER Hub API
# Stage 1: Builder
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

# Copy the workspace files
COPY hub/pnpm-workspace.yaml hub/pnpm-lock.yaml ./
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

WORKDIR /app

ENV NODE_ENV=production

# Copy all node_modules from builder (installed at workspace root)
COPY --from=builder /app/node_modules ./node_modules

# Copy package files and built code
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages ./packages

# Expose the port (Cloud Run uses 8080)
EXPOSE 8080

# Start the API
CMD ["node", "dist/main.js"]
