type Props = {
  label: string
  value?: string
  placeholder?: string
  type?: string
  required?: boolean
  onChange?: (value: string) => void
}

export function TextField({ label, value, placeholder, type = 'text', required, onChange }: Props) {
  return (
    <label className="tt-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="tt-label">{label}</span>
      <input
        className="tt-input"
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  )
}
