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

# Verify node_modules was created
RUN echo "Verifying node_modules in builder:" && ls -la /app/node_modules/.bin/ | head -20

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy ONLY what's needed: node_modules and the built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist

# Remove source maps to reduce size
RUN find ./dist -name "*.map" -delete

# Verify dependencies are present
RUN test -d ./node_modules && echo "node_modules copied successfully" && ls -la node_modules/.bin | head -10

# Expose the port (Cloud Run uses 8080)
EXPOSE 8080

# Start the API
CMD ["node", "dist/main.js"]
