import { redirect } from "next/navigation";

async function getLogs() {
  try {
    const res = await fetch("http://localhost:3000/api/logs", {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { logs: [] };
  }
}

export default async function DebugPage() {
  const data = await getLogs();

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", backgroundColor: "#1a1a1a", color: "#fff", minHeight: "100vh" }}>
      <h1>🔍 Theme Toggle Debug Logs</h1>
      <button
        onClick={() => redirect("/debug")}
        style={{ padding: "10px 20px", marginBottom: "20px", cursor: "pointer" }}
      >
        🔄 Refresh Logs
      </button>
      <div style={{ backgroundColor: "#0a0a0a", padding: "15px", borderRadius: "8px", maxHeight: "80vh", overflowY: "auto" }}>
        {data.logs.length === 0 ? (
          <p style={{ color: "#888" }}>No logs yet. Try clicking the theme toggle button...</p>
        ) : (
          data.logs.map((log: string, i: number) => (
            <div key={i} style={{ marginBottom: "8px", borderBottom: "1px solid #333", paddingBottom: "8px" }}>
              {log}
            </div>
          ))
        )}
      </div>
      <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        Keep this tab open, click the theme toggle on the main page, then refresh to see logs.
      </p>
    </div>
  );
}
