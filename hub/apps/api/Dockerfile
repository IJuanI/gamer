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

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/node_modules ./root_node_modules
COPY --from=builder /app/packages/*/dist ./packages/*/dist

# Install only production dependencies
RUN pnpm install --frozen-lockfile --production

# Expose the API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the API
CMD ["node", "dist/main.js"]
