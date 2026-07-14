import { tokens as t } from './tokens'

export type Step = { key: string; label: string }

export const ONBOARDING_STEPS: Step[] = [
  { key: 'confirm', label: 'Confirm email' },
  { key: 'details', label: 'Your details' },
  { key: 'plan', label: 'Choose plan' },
]

export function Stepper({ steps, current }: { steps: Step[]; current: string }) {
  const activeIdx = steps.findIndex((s) => s.key === current)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {steps.map((s, i) => {
        const done = i < activeIdx
        const active = i === activeIdx
        return (
          <div key={s.key} style={{ display: 'flex', gap: 13, alignItems: 'center', opacity: active ? 1 : 0.55 }}>
            <span style={{
              width: 24, height: 24, flex: 'none', borderRadius: '50%',
              display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
              background: active ? t.brandAccent : 'transparent',
              color: active ? t.brandBg : t.brandInk,
              border: active ? 'none' : `1.5px solid rgba(246,239,227,0.6)`,
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.brandAccent} strokeWidth="3">
                  <path d="M5 12l5 5L20 6" />
                </svg>
              ) : i + 1}
            </span>
            <span style={{ fontSize: 14, fontFamily: t.sans, color: t.brandInk }}>{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}
