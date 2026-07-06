"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const shared_1 = require("@gamer/shared");
const logo_1 = require("@/components/logo");
const auth_provider_1 = require("@/components/auth-provider");
const api_1 = require("@/lib/api");
const format_1 = require("@/lib/format");
const roleAccent = {
    ADMIN: "var(--gamer-purple-text)",
    EDITOR: "var(--gamer-green-text)",
    MEMBER: "var(--text-secondary)",
};
function DashboardPage() {
    const router = (0, navigation_1.useRouter)();
    const { user, loading, logout } = (0, auth_provider_1.useAuth)();
    const [members, setMembers] = (0, react_1.useState)(null);
    const [membersError, setMembersError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!loading && !user)
            router.replace("/login");
    }, [loading, user, router]);
    // Admin-only: load the member list (RBAC enforced server-side).
    (0, react_1.useEffect)(() => {
        if (user?.role === shared_1.Role.ADMIN) {
            api_1.api
                .listUsers()
                .then((r) => setMembers(r.users))
                .catch((e) => setMembersError(e instanceof Error ? e.message : "Error"));
        }
    }, [user]);
    if (loading || !user) {
        return (<main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Cargando…
      </main>);
    }
    return (<main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade"/>

      <header className="relative border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <logo_1.Logo />
          <button onClick={async () => {
            await logout();
            router.push("/");
        }} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white">
            <lucide_react_1.LogOut className="h-4 w-4"/> Salir
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        {/* Profile card */}
        <section className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-8">
          <div className="hud-bracket-tl"/>
          <div className="hud-bracket-br"/>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl neon-border-purple font-azonix text-2xl text-white">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-azonix text-2xl text-white">
                Hola, {user.displayName}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <lucide_react_1.ShieldCheck className="h-4 w-4" style={{ color: roleAccent[user.role] }}/>
                <span style={{ color: roleAccent[user.role] }} className="font-medium">
                  {shared_1.ROLE_LABELS[user.role]}
                </span>
                <span className="text-[var(--muted)]">· {user.email}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Miembro desde el {(0, format_1.formatDate)(user.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Role-aware capability tiles */}
        <h2 className="mt-12 mb-4 font-azonix text-lg text-[var(--text-secondary)]">
          Tu acceso
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Tile icon={lucide_react_1.Gamepad2} title="Eventos" body="Inscribite a torneos y eventos de la comunidad." accent="green"/>
          {(user.role === shared_1.Role.EDITOR || user.role === shared_1.Role.ADMIN) && (<Tile icon={lucide_react_1.Pencil} title="Gestión de contenido" body="Crear y editar eventos, torneos y banners." accent="purple"/>)}
          {user.role === shared_1.Role.ADMIN && (<Tile icon={lucide_react_1.Users} title="Administración" body="Gestionar miembros y roles de la comunidad." accent="purple"/>)}
        </div>

        {/* Admin-only member list */}
        {user.role === shared_1.Role.ADMIN && (<section className="mt-12">
            <h2 className="mb-4 font-azonix text-lg text-[var(--text-secondary)]">
              Miembros de la comunidad
            </h2>
            {membersError && (<p className="text-sm text-[var(--gamer-purple-text)]">{membersError}</p>)}
            <div className="overflow-hidden rounded-lg border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Gamer</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {(members ?? []).map((m) => (<tr key={m.id} className="border-t border-white/5">
                      <td className="px-4 py-3 text-white">{m.displayName}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{m.email}</td>
                      <td className="px-4 py-3" style={{ color: roleAccent[m.role] }}>
                        {shared_1.ROLE_LABELS[m.role]}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </section>)}
      </div>
    </main>);
}
function Tile({ icon: Icon, title, body, accent, }) {
    const isGreen = accent === "green";
    return (<div className="relative panel-clip border border-white/5 bg-[var(--background-elevated)] p-6 transition-colors hover:border-white/10">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${isGreen ? "neon-border-green" : "neon-border-purple"}`}>
        <Icon className="h-5 w-5" style={{ color: isGreen ? "var(--gamer-green)" : "var(--gamer-purple-text)" }}/>
      </div>
      <h3 className="mt-4 font-azonix text-base text-white">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{body}</p>
    </div>);
}
