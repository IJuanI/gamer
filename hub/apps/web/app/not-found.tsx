export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted">Página no encontrada</p>
      </div>
    </main>
  );
}
