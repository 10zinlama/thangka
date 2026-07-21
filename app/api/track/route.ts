import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/site-analytics";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!isSameSiteRequest(request.headers)) {
      return trackingResponse(false);
    }

    const text = await request.text();
    if (text.length > 2048) {
      return trackingResponse(false);
    }

    const body = text ? JSON.parse(text) : {};
    const result = await recordPageView(
      {
        path: stringValue(body.path),
        referrer: stringValue(body.referrer),
        sessionId: stringValue(body.sessionId),
        language: stringValue(body.language),
        title: stringValue(body.title),
      },
      request.headers
    );

    return trackingResponse(result.tracked);
  } catch (error) {
    console.warn("Analytics tracking failed.", error);
    return trackingResponse(false, 202);
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function trackingResponse(tracked: boolean, status = 200) {
  return NextResponse.json(
    { tracked },
    {
      status,
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}

function isSameSiteRequest(headers: Headers) {
  const origin = headers.get("origin");
  const host = headers.get("host");
  const fetchSite = headers.get("sec-fetch-site");

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    return false;
  }

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
