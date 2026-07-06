"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const auth_shell_1 = require("@/components/auth-shell");
const oauth_buttons_1 = require("@/components/oauth-buttons");
const auth_provider_1 = require("@/components/auth-provider");
const api_1 = require("@/lib/api");
function LoginPage() {
    const router = (0, navigation_1.useRouter)();
    const { setUser } = (0, auth_provider_1.useAuth)();
    const [error, setError] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    async function onSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const form = new FormData(e.currentTarget);
        try {
            const { user } = await api_1.api.login({
                email: String(form.get("email")),
                password: String(form.get("password")),
            });
            setUser(user);
            router.push("/dashboard");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Error al ingresar");
        }
        finally {
            setLoading(false);
        }
    }
    return (<auth_shell_1.AuthShell title="Ingresar" subtitle="Bienvenido de nuevo a la comunidad.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <auth_shell_1.Field label="Email" name="email" type="email" required autoComplete="email"/>
        <auth_shell_1.Field label="Contraseña" name="password" type="password" required autoComplete="current-password"/>

        {error && <p className="text-sm text-[var(--gamer-purple-text)]">{error}</p>}

        <button type="submit" disabled={loading} className="mt-1 rounded-md bg-[var(--gamer-purple)] py-2.5 font-semibold text-white box-glow-purple transition-transform hover:scale-[1.02] disabled:opacity-60">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="h-px flex-1 bg-white/10"/> o <span className="h-px flex-1 bg-white/10"/>
      </div>
      <oauth_buttons_1.OAuthButtons />

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        ¿No tenés cuenta?{" "}
        <link_1.default href="/register" className="text-[var(--gamer-green-text)] hover:underline">
          Unite acá
        </link_1.default>
      </p>
    </auth_shell_1.AuthShell>);
}
