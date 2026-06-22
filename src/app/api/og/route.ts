import { NextRequest, NextResponse } from "next/server";
import { scrapeOg } from "@/lib/og-scraper";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }
  try {
    const data = await scrapeOg(url);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to scrape URL" }, { status: 422 });
  }
}
