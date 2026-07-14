import type { ReactNode } from 'react'
import { tokens as t } from './tokens'
import { SeatStepper } from './SeatStepper'

export function PlanCardFree() {
  return (
    <div style={{
      border: `1px solid ${t.line}`, borderRadius: 3,
      padding: '20px 22px', background: t.panelRaised,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.clay, marginBottom: 6, fontFamily: t.sans }}>Free plan</div>
        <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.6, fontFamily: t.sans }}>Unlimited projects · 1 seat · Core AI drafting</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: t.serif, fontSize: 34, fontWeight: 500, lineHeight: 1, color: t.ink }}>$0</div>
        <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 2, fontFamily: t.sans }}>forever</div>
      </div>
    </div>
  )
}

type PlanCardTeamProps = { seats: number; onSeatsChange: (n: number) => void; note?: ReactNode }

export function PlanCardTeam({ seats, onSeatsChange, note = '$0 / seat · pricing coming soon' }: PlanCardTeamProps) {
  return (
    <div style={{
      border: `1px solid ${t.line}`, borderRadius: 3,
      padding: '20px 22px', background: t.panelRaised,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.clay, marginBottom: 6, fontFamily: t.sans }}>Team plan</div>
          <div style={{ fontSize: 13, color: t.inkSoft, fontFamily: t.sans }}>How many seats?</div>
        </div>
        <SeatStepper value={seats} onChange={onSeatsChange} />
      </div>
      <div style={{ height: 1, background: t.line }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12.5, color: t.inkSoft, fontFamily: t.sans }}>{note}</span>
        <span style={{ fontFamily: t.serif, fontSize: 30, fontWeight: 500, color: t.ink }}>$0</span>
      </div>
    </div>
  )
}
