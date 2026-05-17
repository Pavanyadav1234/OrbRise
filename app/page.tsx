'use client'
import { useState, useEffect } from 'react'

const challenges = [
  {
    type: 'Logic',
    question: 'If ROSE is coded as 6821, and CHAIR is coded as 73456, what is the code for SEARCH?',
    options: ['216473', '284673', '246138', '816432'],
    correct: 1,
  },
]

export default function OrbRise() {
  const [screen, setScreen] = useState('home')
  const [answered, setAnswered] = useState<number | null>(null)
  const [timer, setTimer] = useState(30)
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [streak, setStreak] = useState(1)
  const [xp, setXp] = useState(0)
  const challenge = challenges[0]

  useEffect(() => {
    if (screen !== 'home' || answered !== null || timer === 0) return
    const t = setTimeout(() => setTimer(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timer, screen, answered])

  const handleAnswer = (i: number) => {
    if (answered !== null) return
    setAnswered(i)
  }

  const handleVerify = async () => {
    setVerifyError('')
    setVerifying(true)

    try {
      const { IDKit, orbLegacy } = await import('@worldcoin/idkit-core')

      const rpRes = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'orbrise-verify' }),
      })
      const rpSig = await rpRes.json()

      if (rpSig.error) {
        setVerifyError('RP error: ' + rpSig.error)
        setVerifying(false)
        return
      }

      const request = await IDKit.request({
        app_id: process.env.NEXT_PUBLIC_APP_ID as `app_${string}`,
        action: 'orbrise-verify',
        rp_context: {
          rp_id: process.env.NEXT_PUBLIC_RP_ID as `rp_${string}`,
          nonce: rpSig.nonce,
          created_at: rpSig.created_at,
          expires_at: rpSig.expires_at,
          signature: rpSig.sig,
        },
        allow_legacy_proofs: true,
        environment: 'production',
      }).preset(orbLegacy())

      const finalPayload = await request.pollUntilCompletion()

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })

      const data = await res.json()

      if (data.success) {
  const nullifier = finalPayload?.result?.responses?.[0]?.nullifier_hash || 'unknown'

  // Step 1: Wallet Auth via MiniKit
  // Step 1: Wallet Auth via MiniKit
let walletAddress = null
try {
  const { MiniKit, ResponseEvent } = await import('@worldcoin/minikit-js')
  
  MiniKit.install(process.env.NEXT_PUBLIC_APP_ID!)
  await new Promise(resolve => setTimeout(resolve, 300))

  walletAddress = await new Promise((resolve) => {
    MiniKit.subscribe(ResponseEvent.MiniAppWalletAuth, (payload: any) => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppWalletAuth)
      if (payload.status === 'success') {
        resolve(MiniKit.walletAddress || payload.address)
      } else {
        resolve(null)
      }
    })

    const nonce = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(0, 8)
    MiniKit.commands.walletAuth({
      nonce,
      statement: 'Sign in to OrbRise',
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
  })
} catch (e) {
  console.log('Wallet auth error:', String(e))
}
  // Step 2: Save user to Supabase with wallet
  const userRes = await fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      world_id: nullifier,
      wallet_address: walletAddress,
    }),
  })
  const userData = await userRes.json()

  if (userData.user) {
    setStreak(userData.user.streak)
    setXp(userData.user.xp)
  }

  setVerified(true)
      } else {
        setVerifyError('Backend failed: ' + JSON.stringify(data.detail || data))
      }
    } catch (err) {
      setVerifyError('CATCH ERROR: ' + String(err))
      console.error(err)
    } finally {
      setVerifying(false)
    }
  }

  const streakDays = Array.from({ length: 35 }, (_, i) => i + 1)

  // GATE SCREEN
  if (!verified) {
    return (
      <div style={{
        background: '#0a0a0f', minHeight: '100vh', color: '#f0eeff',
        fontFamily: 'system-ui, sans-serif', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(124,92,252,0.3),rgba(0,212,255,0.2))',
            border: '1.5px solid rgba(124,92,252,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 24px'
          }}>🌍</div>

          <div style={{
            fontSize: 32, fontWeight: 800, marginBottom: 8,
            background: 'linear-gradient(135deg,#9d82ff,#00d4ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>OrbRise</div>

          <div style={{ fontSize: 14, color: '#9291a5', lineHeight: 1.7, marginBottom: 40, padding: '0 8px' }}>
            OrbRise uses World ID to ensure every player is a real human. Verify once to enter.
          </div>

          {verifyError && (
            <div style={{
              background: 'rgba(255,77,109,0.1)', border: '0.5px solid rgba(255,77,109,0.3)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
              fontSize: 13, color: '#ff4d6d'
            }}>
              {verifyError}
            </div>
          )}

          <button onClick={handleVerify} disabled={verifying} style={{
            width: '100%', padding: 18,
            background: verifying ? '#1a1a24' : '#fff',
            border: verifying ? '0.5px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: 16, fontFamily: 'system-ui', fontSize: 16,
            fontWeight: 700, color: verifying ? '#9291a5' : '#000',
            cursor: verifying ? 'default' : 'pointer', marginBottom: 16
          }}>
            {verifying ? '🌐 Connecting to World ID...' : '🌐 Verify with World ID'}
          </button>

          <div style={{ fontSize: 11, color: '#6b6a7d' }}>
            Powered by World ID · One-time verification
          </div>
        </div>
      </div>
    )
  }

  // MAIN APP
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#f0eeff', fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', paddingBottom: 80 }}>

        {screen === 'home' && (
          <div>
            <div style={{ padding: '48px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#9d82ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OrbRise</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(6,214,160,0.12)', border: '0.5px solid rgba(6,214,160,0.3)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#06d6a0' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06d6a0', display: 'inline-block' }} />
                World ID ✓
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px 24px' }}>
              <div style={{ position: 'relative', width: 180, height: 180 }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c5cfc" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r="80" fill="none" stroke="#1a1a24" strokeWidth="10" />
                  <circle cx="90" cy="90" r="80" fill="none" stroke="url(#g1)" strokeWidth="10" strokeLinecap="round" strokeDasharray="502" strokeDashoffset={502 - Math.min((streak / 100) * 502, 502)} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 44, fontWeight: 800, background: 'linear-gradient(135deg,#9d82ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{streak}</div>
                  <div style={{ fontSize: 11, color: '#9291a5', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Day Streak</div>
                </div>
              </div>
            </div>

            <div style={{ margin: '0 20px', background: '#111118', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ color: '#ffd166', fontWeight: 700, fontSize: 13 }}>
                  {xp >= 5000 ? '👑 OrbMaster' : xp >= 3000 ? '⚡ Elite' : xp >= 1000 ? '🔥 Challenger' : '🌱 Newcomer'}
                </div>
                <div style={{ color: '#9291a5', fontSize: 12, fontFamily: 'monospace' }}>{xp} / 5,000 XP</div>
              </div>
              <div style={{ height: 6, background: '#1a1a24', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min((xp / 5000) * 100, 100)}%`, background: 'linear-gradient(90deg,#7c5cfc,#00d4ff)', borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>

            <div style={{ padding: '20px 20px 10px', fontSize: 13, fontWeight: 600, color: '#9291a5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Today&apos;s Challenge</div>

            <div style={{ margin: '0 20px 14px', height: 3, background: '#1a1a24', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(timer / 30) * 100}%`, background: 'linear-gradient(90deg,#00d4ff,#7c5cfc)', borderRadius: 2, transition: 'width 1s linear' }} />
            </div>

            <div style={{ margin: '0 20px', background: '#111118', border: '0.5px solid rgba(255,255,255,0.13)', borderRadius: 18, padding: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#7c5cfc,#00d4ff)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(79,163,255,0.15)', color: '#4fa3ff', textTransform: 'uppercase' }}>{challenge.type}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9291a5', fontFamily: 'monospace' }}>0:{String(timer).padStart(2, '0')}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6, marginBottom: 16 }}>{challenge.question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {challenge.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} style={{
                    width: '100%', padding: '12px 16px',
                    background: answered === null ? '#1a1a24' : i === challenge.correct ? 'rgba(6,214,160,0.1)' : answered === i ? 'rgba(255,77,109,0.08)' : '#1a1a24',
                    border: `0.5px solid ${answered === null ? 'rgba(255,255,255,0.07)' : i === challenge.correct ? 'rgba(6,214,160,0.4)' : answered === i ? 'rgba(255,77,109,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 10,
                    color: answered === null ? '#f0eeff' : i === challenge.correct ? '#06d6a0' : answered === i ? '#ff4d6d' : '#6b6a7d',
                    fontFamily: 'system-ui', fontSize: 14, fontWeight: 500, textAlign: 'left',
                    cursor: answered === null ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {['A','B','C','D'][i]}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {answered !== null && (
              <div style={{ margin: '14px 20px 0', padding: 16, borderRadius: 14, textAlign: 'center', fontSize: 14, fontWeight: 700,
                background: answered === challenge.correct ? 'rgba(6,214,160,0.12)' : 'rgba(255,77,109,0.1)',
                border: `0.5px solid ${answered === challenge.correct ? 'rgba(6,214,160,0.3)' : 'rgba(255,77,109,0.2)'}`,
                color: answered === challenge.correct ? '#06d6a0' : '#ff4d6d' }}>
                {answered === challenge.correct ? `✓ Correct! +50 XP earned · Streak: ${streak} days!` : '✗ Wrong answer · Keep your streak tomorrow!'}
              </div>
            )}
          </div>
        )}

        {screen === 'streak' && (
          <div>
            <div style={{ padding: '48px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#9d82ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Streak</div>
              <div style={{ fontSize: 12, color: '#9291a5', fontFamily: 'monospace' }}>May 2026</div>
            </div>
            <div style={{ padding: '0 20px 10px', fontSize: 13, fontWeight: 600, color: '#9291a5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>This Month</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, margin: '0 20px 20px' }}>
              {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, color: '#6b6a7d', fontWeight: 600, paddingBottom: 2 }}>{d}</div>)}
              {streakDays.map(d => (
                <div key={d} style={{
                  aspectRatio: '1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                  background: d <= streak ? 'linear-gradient(135deg,#7c5cfc,#00d4ff)' : 'rgba(255,255,255,0.03)',
                  border: d <= streak ? 'none' : '0.5px solid rgba(255,255,255,0.07)',
                  color: d <= streak ? '#fff' : '#6b6a7d',
                  boxShadow: d === streak ? '0 0 12px rgba(124,92,252,0.5)' : 'none'
                }}>{d === streak ? '★' : d}</div>
              ))}
            </div>
            <div style={{ padding: '0 20px 10px', fontSize: 13, fontWeight: 600, color: '#9291a5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Milestones</div>
            {[
              { icon: '🔥', name: '7-Day Streak', desc: streak >= 7 ? 'Achieved!' : `${7 - streak} days to go`, done: streak >= 7 },
              { icon: '⚡', name: '21-Day Streak', desc: streak >= 21 ? 'Achieved!' : `${21 - streak} days to go`, done: streak >= 21 },
              { icon: '💎', name: '30-Day Streak', desc: streak >= 30 ? 'Achieved!' : `${30 - streak} days to go`, done: streak >= 30 },
              { icon: '👑', name: '100-Day Streak', desc: streak >= 100 ? 'OrbMaster!' : `${100 - streak} days to go`, done: streak >= 100 },
            ].map((m, i) => (
              <div key={i} style={{ margin: '0 20px 10px', background: '#111118', border: `0.5px solid ${m.done ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: m.done ? 1 : 0.5 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#9291a5' }}>{m.desc}</div>
                </div>
                <div style={{ color: m.done ? '#06d6a0' : '#6b6a7d', fontSize: 16 }}>{m.done ? '✓' : '→'}</div>
              </div>
            ))}
          </div>
        )}

        {screen === 'lb' && (
          <div>
            <div style={{ padding: '48px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#9d82ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rankings</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, padding: '0 20px 24px' }}>
              {[
                { emoji: '🦊', name: 'Aryan_K', xp: '4,810', h: 36, rank: 2 },
                { emoji: '🏆', name: 'ZeynepX', xp: '5,240', h: 52, rank: 1 },
                { emoji: '🐉', name: 'ryu_dev', xp: '4,450', h: 26, rank: 3 },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: i === 1 ? 54 : 44, height: i === 1 ? 54 : 44, borderRadius: '50%', background: i === 1 ? 'rgba(255,209,102,0.1)' : '#1a1a24', border: i === 1 ? '1.5px solid rgba(255,209,102,0.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === 1 ? 24 : 18 }}>{p.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: i === 1 ? 700 : 600, color: i === 1 ? '#f0eeff' : '#9291a5' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: i === 1 ? '#ffd166' : '#6b6a7d', fontFamily: 'monospace' }}>{p.xp} xp</div>
                  <div style={{ width: 72, height: p.h, borderRadius: '8px 8px 0 0', background: i === 1 ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${i === 1 ? 'rgba(255,209,102,0.3)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i === 1 ? '#ffd166' : 'rgba(255,255,255,0.3)', fontSize: 15 }}>{p.rank}</div>
                </div>
              ))}
            </div>
            {[
              { rank: 4, emoji: '🦋', name: 'nova_21', meta: '38-day streak · Elite', xp: '4,180', me: false },
              { rank: 5, emoji: '🌙', name: 'moonbit', meta: '31-day streak · Elite', xp: '3,970', me: false },
              { rank: 99, emoji: '⭐', name: 'You', meta: `${streak}-day streak`, xp: String(xp), me: true },
            ].map((r, i) => (
              <div key={i} style={{ margin: '0 20px 8px', background: r.me ? 'rgba(124,92,252,0.07)' : '#111118', border: `0.5px solid ${r.me ? 'rgba(124,92,252,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: r.me ? '#9d82ff' : '#6b6a7d', width: 22, textAlign: 'center', fontFamily: 'monospace' }}>{r.rank}</div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a1a24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: r.me ? '#9d82ff' : '#f0eeff' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#9291a5' }}>{r.meta}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9d82ff', fontFamily: 'monospace' }}>{r.xp}</div>
              </div>
            ))}
          </div>
        )}

        {screen === 'profile' && (
          <div>
            <div style={{ padding: '48px 20px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#9d82ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Profile</div>
            </div>
            <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(124,92,252,0.3),rgba(0,212,255,0.2))', border: '2px solid rgba(124,92,252,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>⭐</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Pavan S N</div>
                <div style={{ fontSize: 12, color: '#9291a5', fontFamily: 'monospace' }}>@orbuser_7492</div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,209,102,0.1)', border: '0.5px solid rgba(255,209,102,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#ffd166' }}>
                  {xp >= 5000 ? '👑 OrbMaster' : xp >= 3000 ? '⚡ Elite' : xp >= 1000 ? '🔥 Challenger' : '🌱 Newcomer'} · Rank #99
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '0 20px 16px' }}>
              {[
                { val: String(streak), lbl: 'Streak', color: '#9d82ff' },
                { val: String(xp), lbl: 'XP', color: '#ffd166' },
                { val: '0%', lbl: 'Accuracy', color: '#00d4ff' }
              ].map((s, i) => (
                <div key={i} style={{ background: '#111118', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#9291a5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ margin: '0 20px 16px', background: '#111118', border: '0.5px solid rgba(255,255,255,0.13)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌍</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>World ID Verified</div>
                <div style={{ fontSize: 12, color: '#9291a5' }}>Confirmed real human</div>
              </div>
              <div style={{ color: '#06d6a0', fontSize: 18 }}>✓</div>
            </div>
            <div style={{ margin: '0 20px 16px', background: 'linear-gradient(135deg,rgba(124,92,252,0.2),rgba(0,212,255,0.1))', border: '0.5px solid rgba(124,92,252,0.35)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>👑</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#9d82ff' }}>Upgrade to Pro</div>
                <div style={{ fontSize: 12, color: '#9291a5' }}>Streak shield · AI hints · Elite leaderboard</div>
              </div>
              <button style={{ background: 'linear-gradient(135deg,#7c5cfc,#4fa3ff)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontFamily: 'system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>₹99/mo</button>
            </div>
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 420, background: 'rgba(10,10,15,0.95)', borderTop: '0.5px solid rgba(255,255,255,0.13)', display: 'flex', zIndex: 100, padding: '8px 0 16px' }}>
          {[
            { id: 'home', label: 'Home', icon: '⌂' },
            { id: 'streak', label: 'Streak', icon: '⚡' },
            { id: 'lb', label: 'Ranks', icon: '▦' },
            { id: 'profile', label: 'Profile', icon: '◉' },
          ].map(n => (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0', border: 'none', background: 'none', color: screen === n.id ? '#9d82ff' : '#6b6a7d', fontFamily: 'system-ui', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
