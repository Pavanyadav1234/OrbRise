import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body));

    const rpId = process.env.NEXT_PUBLIC_RP_ID!;

    const verifyBody = {
      action: 'orbrise-verify',
      responses: [{
        ...body,
        protocol_version: "orb_v2", // legacy proof version
      }],
    };

    console.log("Sending to World:", JSON.stringify(verifyBody));

    const response = await fetch(
      `https://developer.world.org/api/v4/verify/${rpId}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(verifyBody),
      }
    );

    const data = await response.json();
    console.log("World response:", JSON.stringify(data));

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