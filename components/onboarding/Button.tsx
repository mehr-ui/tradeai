import type { CSSProperties, ReactNode } from 'react'
import { tokens as t } from './tokens'

type Props = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
  fullWidth?: boolean
  withArrow?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function Button({ children, variant = 'primary', type = 'button', fullWidth = false, withArrow = false, disabled = false, onClick }: Props) {
  const base: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 9, height: 48, padding: '0 24px',
    width: fullWidth ? '100%' : undefined,
    borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: t.sans, fontSize: 14.5, fontWeight: 600,
    opacity: disabled ? 0.6 : 1,
  }
  const skin: CSSProperties = variant === 'primary'
    ? { background: t.clay, border: 0, color: t.panel }
    : { background: 'transparent', border: `1.5px solid ${t.line}`, color: t.ink, fontWeight: 500 }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`tt-btn tt-btn--${variant}`} style={{ ...base, ...skin }}>
      {children}
      {withArrow && (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}
