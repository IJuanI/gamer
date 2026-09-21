"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const router = useRouter();
  const [data, setData] = useState({ logs: [] as string[] });

  useEffect(() => {
    const getLogs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/logs", {
          cache: "no-store",
        });
        const json = await res.json();
        setData(json);
      } catch {
        setData({ logs: [] });
      }
    };
    getLogs();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", backgroundColor: "#1a1a1a", color: "#fff", minHeight: "100vh" }}>
      <h1>🔍 Theme Toggle Debug Logs</h1>
      <button
        onClick={() => router.refresh()}
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
