import { NextResponse } from "next/server";
import {
  fetchSatelliteTLE,
  computePositions,
  type SatelliteData,
} from "@/lib/satellite";

const SATELLITE_GROUPS = ["stations", "visual", "active"];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group") || "stations";

    const tleText = await fetchSatelliteTLE(group);
    const satellites = computePositions(tleText);

    const response: { satellites: SatelliteData[]; group: string; count: number } = {
      satellites,
      group,
      count: satellites.length,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message, satellites: [], group: "stations", count: 0 },
      { status: 500 }
    );
  }
}
