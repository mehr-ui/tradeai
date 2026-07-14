import { tokens as t } from './tokens'

type Props = { value: number; onChange: (value: number) => void; min?: number; max?: number }

export function SeatStepper({ value, onChange, min = 1, max = 99 }: Props) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)))
  const btn = {
    width: 36, height: 36,
    border: `1.5px solid ${t.line}`,
    background: 'transparent', borderRadius: 2,
    fontSize: 19, color: t.ink, lineHeight: 1,
    cursor: 'pointer',
  } as const

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button className="tt-seatbtn" style={btn} onClick={() => set(value - 1)} type="button">–</button>
      <span style={{ fontFamily: t.serif, fontSize: 24, fontWeight: 500, minWidth: 26, textAlign: 'center', color: t.ink }}>{value}</span>
      <button className="tt-seatbtn" style={btn} onClick={() => set(value + 1)} type="button">+</button>
    </div>
  )
}
