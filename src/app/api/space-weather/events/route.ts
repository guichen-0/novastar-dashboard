import { NextResponse } from "next/server";
import { fetchSpaceWeatherEvents } from "@/lib/space-weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await fetchSpaceWeatherEvents();

    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, events: [] }, { status: 500 });
  }
}
