"use client";

import { useEffect, useState } from "react";
import { captureEvent } from "@/lib/telemetry";

interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: "error" | "event" | "performance" | "navigation";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  data?: Record<string, unknown>;
  url?: string;
  sessionId?: string;
  userAgent?: string;
}

export default function TelemetryDashboard() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("ready");
  const [clickFeedback, setClickFeedback] = useState<boolean>(false);

  const loadEvents = async () => {
    setClickFeedback(true);
    setTimeout(() => setClickFeedback(false), 500);

    setStatus("loading...");
    captureEvent("event", "LoadEvents triggered", "info");
    try {
      const response = await fetch(`/api/telemetry?limit=200`);
      const data = await response.json();

      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events.reverse());
        setTotal(data.total || data.events.length);
        setStatus("ok");
        captureEvent("event", "Events loaded successfully", "info", { count: data.events.length });
      } else {
        setStatus("no events");
        captureEvent("event", "No events in response", "warning");
      }
    } catch (e) {
      const errorMsg = String(e);
      setStatus(`error: ${errorMsg}`);
      captureEvent("event", "LoadEvents error", "error", { error: errorMsg });
    }
  };

  useEffect(() => {
    captureEvent("event", "TelemetryDashboard mounted", "info");
  }, []);

  useEffect(() => {
    // Auto-load events on first mount for better UX
    if (events.length === 0 && status === "ready") {
      loadEvents();
    }
  }, []);

  useEffect(() => {
    // Attach click handlers directly to all buttons with "Load Events" text
    const attachHandlers = () => {
      const buttons = document.querySelectorAll("button");
      buttons.forEach((button) => {
        if (button.textContent?.includes("Load Events")) {
          // Remove old listeners first
          const newButton = button.cloneNode(true) as HTMLButtonElement;
          button.parentNode?.replaceChild(newButton, button);

          // Add new listener
          newButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            captureEvent("event", "Load button clicked", "info");
            loadEvents();
          });
        }
      });
    };

    attachHandlers();
    const timer = setTimeout(attachHandlers, 100);

    return () => clearTimeout(timer);
  }, []);

  const errorCount = events.filter((e) => e.severity === "error" || e.severity === "critical").length;
  const warningCount = events.filter((e) => e.severity === "warning").length;

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      info: "#3b82f6",
      warning: "#f59e0b",
      error: "#ef4444",
      critical: "#dc2626",
    };
    return colors[severity] || "#6b7280";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      error: "❌",
      event: "📍",
      performance: "⚡",
      navigation: "🔄",
    };
    return icons[type] || "•";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui", backgroundColor: "#0f172a", color: "#e2e8f0", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ padding: "15px", backgroundColor: "#1e293b", marginBottom: "20px", borderRadius: "8px", border: "2px solid #fca5a5" }}>
          <strong>🔧 DEBUG:</strong> Total: {total} | Events: {events.length} | Status: <span style={{ color: status === "ok" ? "#84cc16" : status === "loading..." ? "#f59e0b" : "#ef4444" }}>{status}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1>📊 Telemetry Dashboard (Server)</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={loadEvents}
              style={{
                padding: "8px 16px",
                backgroundColor: clickFeedback ? "#84cc16" : "#1e293b",
                border: clickFeedback ? "2px solid #84cc16" : "1px solid #475569",
                borderRadius: "4px",
                color: clickFeedback ? "#000" : "#e2e8f0",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: clickFeedback ? "scale(1.05)" : "scale(1)",
                fontWeight: clickFeedback ? "bold" : "normal",
              }}
            >
              {clickFeedback ? "✅ CLICKED!" : "📥 Load Events"}
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 16px", backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "4px", color: "#e2e8f0", cursor: "pointer" }}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
          <div style={{ padding: "15px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Total Events</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px" }}>{total}</div>
          </div>
          <div style={{ padding: "15px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Errors</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px", color: "#ef4444" }}>{errorCount}</div>
          </div>
          <div style={{ padding: "15px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Warnings</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "5px", color: "#f59e0b" }}>{warningCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b", maxHeight: "75vh", overflowY: "auto" }}>
          {events.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              {status === "loading..." ? (
                <>
                  <div style={{ fontSize: "18px", marginBottom: "12px" }}>⏳ Loading telemetry events...</div>
                  <div style={{ fontSize: "13px" }}>Please wait while we fetch your events from the server.</div>
                </>
              ) : status === "no events" ? (
                <>
                  <div style={{ fontSize: "18px", marginBottom: "12px" }}>📭 No events recorded</div>
                  <div style={{ fontSize: "13px" }}>Events will appear here as they're captured from your application.</div>
                </>
              ) : status.includes("error") ? (
                <>
                  <div style={{ fontSize: "18px", marginBottom: "12px", color: "#ef4444" }}>❌ Error loading events</div>
                  <div style={{ fontSize: "13px", color: "#ef4444" }}>{status}</div>
                  <button onClick={loadEvents} style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "18px", marginBottom: "12px" }}>📊 Telemetry Dashboard</div>
                  <div style={{ fontSize: "13px" }}>Click "Load Events" to fetch telemetry data from the server.</div>
                </>
              )}
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #1e293b",
                  borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "start", flex: 1 }}>
                    <span style={{ fontSize: "18px" }}>{getTypeIcon(event.type)}</span>
                    <div>
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{event.message}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      {event.sessionId && (
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                          Session: {event.sessionId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", padding: "4px 8px", backgroundColor: "#1e293b", borderRadius: "4px", color: getSeverityColor(event.severity) }}>
                    {event.type}
                  </div>
                </div>

                {event.data && Object.keys(event.data).length > 0 && (
                  <details style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                    <summary style={{ cursor: "pointer", marginBottom: "8px" }}>📋 Details</summary>
                    <pre
                      style={{
                        backgroundColor: "#0f172a",
                        padding: "8px",
                        borderRadius: "4px",
                        overflow: "auto",
                        maxHeight: "200px",
                        fontSize: "11px",
                      }}
                    >
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
