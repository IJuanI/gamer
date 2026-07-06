import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions";

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
            P
          </span>
          Polo Paraná
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/empresas" className="hover:text-brand-600">
            Empresas
          </Link>
          <Link href="/ideas" className="hover:text-brand-600">
            Ideas
          </Link>
          {user ? (
            <>
              <Link href="/panel" className="hover:text-brand-600">
                Mi panel
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="hover:text-brand-600">
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-600">
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand-500 px-3 py-1 text-white hover:bg-brand-600"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
