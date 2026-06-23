'use client'

const DUMMY_CHATS = [
  { id: 1, title: 'Kitchen remodel budget', preview: "Here's a breakdown for a mid-range kitchen…", date: 'Today' },
  { id: 2, title: 'Bathroom renovation schedule', preview: 'Week 1–2: Demo and rough plumbing…', date: 'Today' },
  { id: 3, title: 'Client delay email draft', preview: 'Subject: Project Update — Revised Timeline…', date: 'Yesterday' },
  { id: 4, title: 'Change order — electrical', preview: 'Change Order #004: Additional recessed…', date: 'Yesterday' },
  { id: 5, title: 'Master bath tile selection', preview: "For a cohesive look, I'd recommend…", date: 'Jun 15' },
  { id: 6, title: 'Contractor payment schedule', preview: 'A standard draw schedule typically…', date: 'Jun 14' },
  { id: 7, title: 'Living room FF&E budget', preview: 'Furniture, fixtures & equipment estimate…', date: 'Jun 12' },
]

export default function Sidebar({
  activeId,
  onSelect,
  onNew,
  onClose,
  isMobile = false,
}: {
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  onClose?: () => void
  isMobile?: boolean
}) {
  const today = DUMMY_CHATS.filter(c => c.date === 'Today')
  const yesterday = DUMMY_CHATS.filter(c => c.date === 'Yesterday')
  const older = DUMMY_CHATS.filter(c => c.date !== 'Today' && c.date !== 'Yesterday')

  function ChatItem({ chat }: { chat: typeof DUMMY_CHATS[0] }) {
    const isActive = chat.id === activeId
    return (
      <button
        onClick={() => { onSelect(chat.id); if (isMobile && onClose) onClose() }}
        className="w-full text-left px-3 py-3 rounded-lg transition-all duration-150"
        style={{
          background: isActive ? '#6B7A5C' : 'transparent',
          color: isActive ? '#F7F4F0' : 'var(--text-primary)',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#E8E3DA' }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div className="text-sm truncate" style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}>
          {chat.title}
        </div>
        {!isMobile && (
          <div className="text-xs truncate mt-0.5" style={{ color: isActive ? 'rgba(247,244,240,0.65)' : 'var(--text-muted)', fontSize: '11px' }}>
            {chat.preview}
          </div>
        )}
      </button>
    )
  }

  function Section({ label, chats }: { label: string; chats: typeof DUMMY_CHATS }) {
    if (!chats.length) return null
    return (
      <div className="mb-4">
        <div className="px-3 mb-1 text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
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
      className="flex flex-col h-full border-r"
      style={{
        width: isMobile ? '80vw' : '256px',
        maxWidth: isMobile ? '320px' : '256px',
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <img
          src="/logo.svg"
          alt="The Trade"
          style={{ height: '24px', width: 'auto', filter: 'brightness(0) saturate(100%) invert(18%) sepia(10%) saturate(800%) hue-rotate(340deg) brightness(90%)' }}
        />
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Desktop new chat button */}
      {!isMobile && (
        <div className="px-2 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onNew}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
            style={{ color: 'var(--text-primary)', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8E3DA' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12.5 2.5a1.5 1.5 0 0 1 2.121 2.121l-8.5 8.5-2.829.707.707-2.828 8.5-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '13.5px', fontWeight: 500 }}>New chat</span>
          </button>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <Section label="Today" chats={today} />
        <Section label="Yesterday" chats={yesterday} />
        <Section label="Earlier" chats={older} />
      </div>

      {/* Mobile new chat pill button */}
      {isMobile && (
        <div className="px-4 py-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => { onNew(); if (onClose) onClose() }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)', fontFamily: 'var(--font-inter), sans-serif' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New chat
          </button>
        </div>
      )}

      {/* Desktop footer */}
      {!isMobile && (
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div style={{ fontStyle: 'italic', fontSize: '11px', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Bold solutions for innovative<br />interior design businesses
          </div>
        </div>
      )}
    </div>
  )
}
