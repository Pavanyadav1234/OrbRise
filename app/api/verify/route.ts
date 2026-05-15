import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${process.env.NEXT_PUBLIC_APP_ID}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("World ID verify failed:", data);
      return NextResponse.json({ success: false, detail: data }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify route error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}