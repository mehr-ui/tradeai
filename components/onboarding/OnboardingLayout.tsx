import type { ReactNode } from 'react'
import { tokens as t } from './tokens'
import { Stepper, ONBOARDING_STEPS, type Step } from './Stepper'

type Props = { current: string; steps?: Step[]; children: ReactNode }

export function OnboardingLayout({ current, steps = ONBOARDING_STEPS, children }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '100vh' }}>
      {/* Brand panel */}
      <aside style={{
        position: 'relative', overflow: 'hidden',
        background: t.brandBg, color: t.brandInk,
        padding: '40px 34px', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{
            width: 32, height: 32,
            border: `1.5px solid rgba(246,239,227,0.85)`,
            borderRadius: '50%', display: 'grid', placeItems: 'center',
          }}>
            <span style={{ width: 11, height: 11, background: t.clay, borderRadius: '50%' }} />
          </span>
          <span style={{ fontFamily: t.serif, fontSize: 20, fontWeight: 600 }}>The&nbsp;Trade</span>
        </div>
        <Stepper steps={steps} current={current} />
      </aside>

      {/* Form area */}
      <main style={{
        background: t.panel, padding: '48px 56px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 24,
      }}>
        {children}
      </main>
    </div>
  )
}
