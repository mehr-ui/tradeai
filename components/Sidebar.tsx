'use client'

const DUMMY_CHATS = [
  {
    id: 1,
    title: 'Kitchen remodel budget',
    preview: 'Here\'s a breakdown for a mid-range kitchen…',
    date: 'Today',
  },
  {
    id: 2,
    title: 'Bathroom renovation schedule',
    preview: 'Week 1–2: Demo and rough plumbing…',
    date: 'Today',
  },
  {
    id: 3,
    title: 'Client delay email draft',
    preview: 'Subject: Project Update — Revised Timeline…',
    date: 'Yesterday',
  },
  {
    id: 4,
    title: 'Change order — electrical',
    preview: 'Change Order #004: Additional recessed…',
    date: 'Yesterday',
  },
  {
    id: 5,
    title: 'Master bath tile selection',
    preview: 'For a cohesive look, I\'d recommend…',
    date: 'Jun 15',
  },
  {
    id: 6,
    title: 'Contractor payment schedule',
    preview: 'A standard draw schedule typically…',
    date: 'Jun 14',
  },
  {
    id: 7,
    title: 'Living room FF&E budget',
    preview: 'Furniture, fixtures & equipment estimate…',
    date: 'Jun 12',
  },
]

export default function Sidebar({
  activeId,
  onSelect,
  onNew,
}: {
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
}) {
  const today = DUMMY_CHATS.filter(c => c.date === 'Today')
  const yesterday = DUMMY_CHATS.filter(c => c.date === 'Yesterday')
  const older = DUMMY_CHATS.filter(c => c.date !== 'Today' && c.date !== 'Yesterday')

  function ChatItem({ chat }: { chat: typeof DUMMY_CHATS[0] }) {
    const isActive = chat.id === activeId
    return (
      <button
        onClick={() => onSelect(chat.id)}
        className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group"
        style={{
          background: isActive ? '#6B7A5C' : 'transparent',
          color: isActive ? '#F7F4F0' : 'var(--text-primary)',
        }}
        onMouseEnter={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = '#E8E3DA'
        }}
        onMouseLeave={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
        }}
      >
        <div className="text-xs font-medium truncate" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
          {chat.title}
        </div>
        <div
          className="text-xs truncate mt-0.5"
          style={{ color: isActive ? 'rgba(247,244,240,0.65)' : 'var(--text-muted)', fontSize: '11px' }}
        >
          {chat.preview}
        </div>
      </button>
    )
  }

  function Section({ label, chats }: { label: string; chats: typeof DUMMY_CHATS }) {
    if (!chats.length) return null
    return (
      <div className="mb-4">
        <div
          className="px-3 mb-1 text-[10px] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </div>
        <div className="flex flex-col gap-0.5">
          {chats.map(c => <ChatItem key={c.id} chat={c} />)}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full w-64 flex-shrink-0 border-r"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--text-muted)' }}>
          — THE —
        </div>
        <div
          className="text-lg font-bold tracking-[0.18em] uppercase leading-none"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          TRADE
        </div>
      </div>

      {/* New chat button */}
      <div className="px-2 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onNew}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
          style={{ color: 'var(--text-primary)', background: 'transparent' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#E8E3DA'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12.5 2.5a1.5 1.5 0 0 1 2.121 2.121l-8.5 8.5-2.829.707.707-2.828 8.5-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '13.5px', fontWeight: 500 }}>New chat</span>
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <Section label="Today" chats={today} />
        <Section label="Yesterday" chats={yesterday} />
        <Section label="Earlier" chats={older} />
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4 border-t text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div style={{ fontStyle: 'italic', fontSize: '11px' }}>
          Bold solutions for innovative<br />interior design businesses
        </div>
      </div>
    </div>
  )
}
