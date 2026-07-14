'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import '@/components/onboarding/onboarding.css'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { Button } from '@/components/onboarding/Button'
import { tokens as t } from '@/components/onboarding/tokens'
import { supabase } from '@/lib/supabase'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  async function resend() {
    if (email) await supabase.auth.resend({ type: 'signup', email })
  }

  return (
    <OnboardingLayout current="confirm">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}>
        <span style={{
          width: 54, height: 54, borderRadius: '50%',
          border: `1.5px solid ${t.clay}`, display: 'grid', placeItems: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={t.clay} strokeWidth="1.6">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </span>

        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.clay, marginBottom: 10, fontFamily: t.sans }}>
            Almost there
          </div>
          <h1 style={{ fontFamily: t.serif, fontWeight: 500, fontSize: 40, lineHeight: 1.04, letterSpacing: '-0.01em', margin: 0, color: t.ink }}>
            Check your inbox.
          </h1>
          <p style={{ fontSize: 14.5, color: t.inkSoft, lineHeight: 1.65, margin: '14px 0 0', maxWidth: 360, fontFamily: t.sans }}>
            We sent a confirmation link to <b style={{ color: t.ink }}>{email || 'your email address'}</b>. Click it to verify your account and continue setup.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 4 }}>
          <Button onClick={resend}>Resend email</Button>
          <a href="/login" style={{ fontSize: 13.5, color: t.clay, textDecoration: 'none', fontFamily: t.sans }}>
            Wrong address?
          </a>
        </div>
      </div>
    </OnboardingLayout>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  )
}
