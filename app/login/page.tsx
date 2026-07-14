'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import '@/components/onboarding/onboarding.css'
import { tokens as t } from '@/components/onboarding/tokens'
import { AnimatedField } from '@/components/onboarding/AnimatedField'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError((error as any).message ?? 'Something went wrong.')
    } else {
      window.location.href = isSignUp ? `/check-email?email=${encodeURIComponent(email)}` : '/'
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', minHeight: '100vh' }}>
      {/* Left — form panel */}
      <div style={{
        position: 'relative', background: t.panel,
        padding: '52px 60px', display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${t.line}`,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, color: t.ink }}>
          <span style={{ width: 32, height: 32, border: `1.5px solid ${t.line}`, borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 11, height: 11, background: t.clay, borderRadius: '50%' }} />
          </span>
          <span style={{ fontFamily: t.serif, fontSize: 23, fontWeight: 600 }}>The&nbsp;Trade</span>
        </div>

        {/* Form content */}
        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360 }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.clay, marginBottom: 12, fontFamily: t.sans }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </div>
            <h1 style={{ fontFamily: t.serif, fontWeight: 500, fontSize: 46, lineHeight: 1.02, letterSpacing: '-0.01em', margin: 0, color: t.ink }}>
              {isSignUp ? 'Join\nThe Trade.' : 'Step back\ninto the studio.'}
            </h1>
            <p style={{ fontSize: 14.5, color: t.inkSoft, lineHeight: 1.6, margin: '14px 0 0', fontFamily: t.sans }}>
              Your AI partner for the trades — client emails, budgets, change orders, vendor follow-ups.
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            className="tt-goog"
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
              })
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
              height: 50, background: 'transparent', border: `1.5px solid ${t.line}`,
              borderRadius: 2, cursor: 'pointer', fontFamily: t.sans, fontSize: 14.5,
              fontWeight: 500, color: t.ink,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: t.inkSoft, fontSize: 11, letterSpacing: '0.16em', fontFamily: t.sans }}>
            <div style={{ flex: 1, height: 1, background: t.line }} />OR<div style={{ flex: 1, height: 1, background: t.line }} />
          </div>

          {/* Email field */}
          <label className="tt-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="tt-label">Email</span>
            <input className="tt-input" type="email" placeholder="you@studio.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          {/* Password field */}
          <label className="tt-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="tt-label">Password</span>
              {!isSignUp && <a href="#" style={{ fontSize: 12.5, color: t.clay, fontFamily: t.sans }}>Forgot?</a>}
            </div>
            <input className="tt-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>

          {error && <p style={{ fontSize: 13, color: '#c0392b', fontFamily: t.sans, margin: 0 }}>{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="tt-btn tt-btn--primary"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              height: 50, background: t.clay, border: 0, borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: t.sans, fontSize: 15, fontWeight: 600, color: t.panel,
              opacity: loading ? 0.6 : 1, marginTop: 2,
            }}
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 13.5, color: t.inkSoft, fontFamily: t.sans }}>
          {isSignUp ? 'Already have an account? ' : 'New to The Trade? '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: t.clay, fontFamily: t.sans, fontSize: 13.5, padding: 0 }}
          >
            {isSignUp ? 'Sign in' : 'Request access'}
          </button>
        </div>
      </div>

      {/* Right — brand panel */}
      <div style={{ position: 'relative', overflow: 'hidden', background: t.brandBg }}>
          <AnimatedField warmth={1.2} glow={0.4} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 60, color: t.brandInk }}>
          <div style={{ width: 52, height: 1.5, background: 'rgba(246,239,227,0.7)', marginBottom: 24 }} />
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 42, lineHeight: 1.08, maxWidth: 560, letterSpacing: '-0.005em', color: t.brandInk }}>
            Every purchase order, every vendor thread, every schedule — held in one calm, intelligent room.
          </div>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(246,239,227,0.62)', marginTop: 22, fontFamily: t.sans }}>
            Built for interior design &amp; construction
          </div>
        </div>
      </div>
    </div>
  )
}
