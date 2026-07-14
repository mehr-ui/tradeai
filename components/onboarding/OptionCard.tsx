import { tokens as t } from './tokens'

type Props = { title: string; desc: string; selected: boolean; onSelect: () => void }

export function OptionCard({ title, desc, selected, onSelect }: Props) {
  return (
    <div
      role="button" tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className="tt-optcard"
      style={{
        flex: 1, display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: 16, borderRadius: 3,
        border: `1.5px solid ${selected ? t.clay : t.line}`,
        background: selected ? 'rgba(176,85,47,0.05)' : 'transparent',
      }}
    >
      <span style={{
        width: 20, height: 20, flex: 'none', marginTop: 1,
        borderRadius: '50%', border: `1.5px solid ${selected ? t.clay : t.line}`,
        display: 'grid', placeItems: 'center',
      }}>
        {selected && <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.clay }} />}
      </span>
      <span>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 15, fontFamily: t.sans, color: t.ink }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12.5, color: t.inkSoft, lineHeight: 1.5, marginTop: 3, fontFamily: t.sans }}>{desc}</span>
      </span>
    </div>
  )
}
