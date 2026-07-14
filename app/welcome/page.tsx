'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '@/components/onboarding/onboarding.css'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { Button } from '@/components/onboarding/Button'
import { TextField } from '@/components/onboarding/TextField'
import { Select, ROLE_OPTIONS } from '@/components/onboarding/Select'
import { OptionCard } from '@/components/onboarding/OptionCard'
import { PlanCardFree, PlanCardTeam } from '@/components/onboarding/PlanCard'
import { tokens as t } from '@/components/onboarding/tokens'
import { supabase } from '@/lib/supabase'

type Step = 'details' | 'plan'
type PlanType = 'personal' | 'team'

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [plan, setPlan] = useState<PlanType>('personal')
  const [seats, setSeats] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFinish() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: name, company, role })
      .eq('id', user.id)

    if (profileError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.id)
      .single()

    if (profile?.workspace_id) {
      await supabase
        .from('workspaces')
        .update({
          name: plan === 'team' && company ? company : 'Personal',
          type: plan,
          seats: plan === 'team' ? seats : 1,
        })
        .eq('id', profile.workspace_id)
    }

    await fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name }),
    })

    window.location.href = '/'
  }

  return (
    <>
      {step === 'details' && (
        <OnboardingLayout current="details">
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.clay, marginBottom: 10, fontFamily: t.sans }}>
              Welcome
            </div>
            <h1 style={{ fontFamily: t.serif, fontWeight: 500, fontSize: 38, lineHeight: 1.04, letterSpacing: '-0.01em', margin: 0, color: t.ink }}>
              Tell us who you are.
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 400 }}>
            <TextField label="Full name" placeholder="Jordan Ellery" value={name} onChange={setName} required />
            <TextField label="Company name" placeholder="Ellery Studio" value={company} onChange={setCompany} />
            <Select label="Your role" placeholder="Select your role" options={ROLE_OPTIONS} value={role} onChange={setRole} />
          </div>

          <div style={{ marginTop: 2 }}>
            <Button withArrow onClick={() => name ? setStep('plan') : undefined} disabled={!name}>
              Continue
            </Button>
          </div>
        </OnboardingLayout>
      )}

      {step === 'plan' && (
        <OnboardingLayout current="plan">
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.clay, marginBottom: 10, fontFamily: t.sans }}>
              Choose plan
            </div>
            <h1 style={{ fontFamily: t.serif, fontWeight: 500, fontSize: 34, lineHeight: 1.04, letterSpacing: '-0.01em', margin: 0, color: t.ink }}>
              How will you use The Trade?
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <OptionCard title="Just me" desc="Personal account" selected={plan === 'personal'} onSelect={() => setPlan('personal')} />
            <OptionCard title="My team" desc="Shared workspace & seats" selected={plan === 'team'} onSelect={() => setPlan('team')} />
          </div>

          {plan === 'personal' ? <PlanCardFree /> : <PlanCardTeam seats={seats} onSeatsChange={setSeats} />}

          {error && <p style={{ fontSize: 13, color: '#c0392b', fontFamily: t.sans, margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Button variant="secondary" onClick={() => setStep('details')}>Back</Button>
            <Button withArrow onClick={handleFinish} disabled={loading}>
              {loading ? 'Setting up…' : 'Enter The Trade'}
            </Button>
          </div>
        </OnboardingLayout>
      )}
    </>
  )
}
