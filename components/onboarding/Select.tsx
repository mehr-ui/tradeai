import { tokens as t } from './tokens'

type Props = {
  label: string
  options: string[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function Select({ label, options, placeholder = 'Select…', value, onChange }: Props) {
  return (
    <label className="tt-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="tt-label">{label}</span>
      <span style={{ position: 'relative' }}>
        <select
          className="tt-select"
          value={value}
          defaultValue={value === undefined ? '' : undefined}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.inkSoft} strokeWidth="2"
          style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </label>
  )
}

export const ROLE_OPTIONS = [
  'Interior Designer',
  'Architect',
  'General Contractor',
  'Project Manager',
  'Trades / Subcontractor',
  'Other',
]
