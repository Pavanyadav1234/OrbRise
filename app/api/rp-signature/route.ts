import { NextRequest, NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit-core/signing";

export async function GET() {
  return NextResponse.json({ status: "rp-signature endpoint is alive" });
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    const { sig, nonce, createdAt, expiresAt } = signRequest({
      signingKeyHex: process.env.RP_SIGNING_KEY!,
      action,
    });

    return NextResponse.json({
      sig,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  } catch (err) {
    console.error("RP signature error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}