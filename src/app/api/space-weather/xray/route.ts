import { NextResponse } from "next/server";
import { fetchXrayFlux } from "@/lib/space-weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const xray = await fetchXrayFlux();

    return NextResponse.json(
      { xray },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, xray: [] }, { status: 500 });
  }
}
