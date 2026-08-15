import { NextRequest, NextResponse } from "next/server";
import { runFullIngestion } from "@/lib/ingest";

// Machine-to-machine endpoint for an external scheduler (Render Cron Job,
// GitHub Actions, cron-job.org, etc.) to trigger a monitoring scan over
// HTTP — no browser session required, just a shared secret. This is what
// keeps mentions/brand signals updating automatically once deployed.
export async function POST(request: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "INGEST_SECRET is not configured on the server." },
      { status: 500 }
    );
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runFullIngestion();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[api/ingest] scan failed:", err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
