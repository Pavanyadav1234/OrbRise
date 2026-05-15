import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    const { signRequest } = await import("@worldcoin/idkit-core/signing");

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
    console.error("rp-signature error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}