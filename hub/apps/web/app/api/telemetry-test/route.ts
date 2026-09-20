import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const TELEMETRY_FILE = join(process.cwd(), ".telemetry.json");

export async function GET() {
  try {
    if (!existsSync(TELEMETRY_FILE)) {
      return NextResponse.json({ error: "No telemetry file", events: [] });
    }

    const data = readFileSync(TELEMETRY_FILE, "utf-8");
    const events = JSON.parse(data);
    const recent = events.slice(-20);

    return NextResponse.json({
      success: true,
      totalStored: events.length,
      recentEvents: recent,
      html: `
        <div style="padding: 20px; font-family: monospace; background: #0f172a; color: #e2e8f0;">
          <h2>📊 Telemetry Test Result</h2>
          <p><strong>Total events stored:</strong> ${events.length}</p>
          <p><strong>Recent events (last 20):</strong></p>
          <pre style="background: #1e293b; padding: 10px; overflow: auto; max-height: 400px;">
${JSON.stringify(recent, null, 2)}
          </pre>
        </div>
      `
    });
  } catch (e) {
    return NextResponse.json({
      error: String(e),
      totalStored: 0,
      recentEvents: []
    }, { status: 500 });
  }
}
