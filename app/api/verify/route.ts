import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { payload, action } = await req.json()
  
  const appId = process.env.NEXT_PUBLIC_APP_ID
  
  const verifyRes = await fetch(
    `https://developer.worldcoin.org/api/v2/verify/${appId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, action }),
    }
  )

  const data = await verifyRes.json()

  if (verifyRes.ok) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ success: false, detail: data.detail }, { status: 400 })
  }
}