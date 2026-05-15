import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rpId = process.env.NEXT_PUBLIC_RP_ID!;

    // Add action to the body
    const verifyBody = {
      ...body,
      action: 'orbrise-verify',
    };

    const response = await fetch(
      `https://developer.world.org/api/v4/verify/${rpId}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(verifyBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, detail: data },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}