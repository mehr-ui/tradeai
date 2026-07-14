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
        <div>
          <img src="/logo.svg" alt="The Trade" style={{ height: 22, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }} />
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
