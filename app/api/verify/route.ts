import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js'

export async function POST(req: NextRequest) {
  const { payload, action } = await req.json()
  const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`
  const response = await verifyCloudProof(payload, appId, action) as IVerifyResponse
  if (response.success) {
    return NextResponse.json({ success: true, status: 200 })
  } else {
    return NextResponse.json({ success: false, status: 400, detail: response.detail })
  }
}