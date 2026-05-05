import { NextResponse } from "next/server";
import { fetchKpIndex, fetchKpForecast } from "@/lib/space-weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [kp, forecast] = await Promise.all([
      fetchKpIndex(),
      fetchKpForecast(),
    ]);

    return NextResponse.json(
      { kp, forecast },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, kp: [], forecast: [] }, { status: 500 });
  }
}
