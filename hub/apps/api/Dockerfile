# Single-stage production build for GamER Hub API
# AuthModule re-enabled for login/register endpoints
FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

# Copy only what's needed to build @gamer/api
COPY hub/package.json ./
COPY hub/pnpm-workspace.yaml ./
COPY hub/pnpm-lock.yaml ./
COPY hub/packages ./packages
COPY hub/apps/api ./apps/api

# Install, build, then produce a self-contained prod-only bundle for @gamer/api
RUN pnpm install --frozen-lockfile && \
    pnpm run --filter @gamer/shared build || true && \
    pnpm run --filter @gamer/api build && \
    pnpm --filter @gamer/api deploy --prod /prod/api && \
    find /prod/api/dist -name "*.map" -delete && \
    pnpm store prune

# Drop everything except the deployed bundle
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=0 /prod/api ./
EXPOSE 8080
CMD ["node", "dist/main.js"]
