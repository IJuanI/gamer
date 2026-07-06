"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthButtons = OAuthButtons;
const api_1 = require("@/lib/api");
/**
 * OAuth login buttons. The API enables a provider only when its credentials
 * are configured; until then these links will 404 — expected in local dev.
 */
function OAuthButtons() {
    return (<div className="grid gap-3">
      <a href={(0, api_1.oauthUrl)("discord")} className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#5865F2]/15 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5865F2]/25">
        Continuar con Discord
      </a>
      <a href={(0, api_1.oauthUrl)("google")} className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
        Continuar con Google
      </a>
    </div>);
}
