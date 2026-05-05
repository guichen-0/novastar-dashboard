import { NextResponse } from "next/server";
import { fetchSolarWind, fetchMagData } from "@/lib/space-weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [plasma, mag] = await Promise.all([fetchSolarWind(), fetchMagData()]);

    return NextResponse.json(
      { plasma, mag },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message, plasma: [], mag: [] },
      { status: 500 }
    );
  }
}
