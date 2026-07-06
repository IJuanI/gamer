/**
 * Visual regression for the GamER Hub frontend (es-AR).
 * Public pages (landing/login/register) snapshot standalone. The dashboard test
 * logs in against the API, so the full stack must be up for that spec:
 *   docker compose up -d  (or pnpm db:up && pnpm dev)
 */
declare const _default: import("@playwright/test").PlaywrightTestConfig<{}, {}>;
export default _default;
