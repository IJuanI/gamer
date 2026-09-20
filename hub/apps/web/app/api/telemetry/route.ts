import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const TELEMETRY_FILE = join(process.cwd(), ".telemetry.json");
const MAX_EVENTS = 1000;

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

function getEvents(): TelemetryEvent[] {
  try {
    if (!existsSync(TELEMETRY_FILE)) {
      return [];
    }
    const data = readFileSync(TELEMETRY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read telemetry:", e);
    return [];
  }
}

function saveEvents(events: TelemetryEvent[]) {
  try {
    const trimmed = events.slice(-MAX_EVENTS);
    writeFileSync(TELEMETRY_FILE, JSON.stringify(trimmed, null, 2));
  } catch (e) {
    console.error("Failed to save telemetry:", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, event, events: clearAll } = body;

    if (action === "clear") {
      saveEvents([]);
      return NextResponse.json({ success: true, message: "Telemetry cleared" });
    }

    if (event) {
      const events = getEvents();
      events.push(event);
      saveEvents(events);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (e) {
    console.error("Telemetry POST error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "100");

    let events = getEvents();

    if (type) {
      events = events.filter((e) => e.type === type);
    }
    if (severity) {
      events = events.filter((e) => e.severity === severity);
    }

    events = events.slice(-limit);

    return NextResponse.json({ events, count: events.length, total: getEvents().length });
  } catch (e) {
    console.error("Telemetry GET error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
