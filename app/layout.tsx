'use client'
import { MiniKit } from '@worldcoin/minikit-js'
import { useEffect } from 'react'
import './globals.css'

function MiniKitProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    MiniKit.install(process.env.NEXT_PUBLIC_APP_ID!)
  }, [])
  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
      </body>
    </html>
  )
}