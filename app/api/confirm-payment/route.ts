import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { payload } = await req.json();

    const url = `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transactionId}?app_id=${process.env.NEXT_PUBLIC_APP_ID}&type=payment`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    });

    const transaction = await response.json();
    return NextResponse.json(transaction);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}