'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const DUMMY_CHATS = [
  { id: 1, title: 'Kitchen remodel budget', preview: "Here's a breakdown for a mid-range kitchen…", date: 'Today' },
  { id: 2, title: 'Bathroom renovation schedule', preview: 'Week 1–2: Demo and rough plumbing…', date: 'Today' },
  { id: 3, title: 'Client delay email draft', preview: 'Subject: Project Update — Revised Timeline…', date: 'Yesterday' },
  { id: 4, title: 'Change order — electrical', preview: 'Change Order #004: Additional recessed…', date: 'Yesterday' },
  { id: 5, title: 'Master bath tile selection', preview: "For a cohesive look, I'd recommend…", date: 'Jun 15' },
  { id: 6, title: 'Contractor payment schedule', preview: 'A standard draw schedule typically…', date: 'Jun 14' },
  { id: 7, title: 'Living room FF&E budget', preview: 'Furniture, fixtures & equipment estimate…', date: 'Jun 12' },
]

const QUICK_STARTS = [
  'Kitchen remodel',
  'Bathroom remodel',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Change order',
  'Client email',
  'Project schedule',
]

type Conversation = { id: string; title: string; updated_at: string }

export default function Sidebar({
  activeId,
  onSelect,
  onNew,
  onClose,
  onQuickStart,
  isMobile = false,
  userEmail,
  conversations = [],
}: {
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onClose?: () => void
  onQuickStart?: (topic: string) => void
  isMobile?: boolean
  userEmail?: string
  conversations?: Conversation[]
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const now = new Date()
  const today = conversations.filter(c => {
    const d = new Date(c.updated_at)
    return d.toDateString() === now.toDateString()
  })
  const yesterday = conversations.filter(c => {
    const d = new Date(c.updated_at)
    const y = new Date(now); y.setDate(y.getDate() - 1)
    return d.toDateString() === y.toDateString()
  })
  const older = conversations.filter(c => {
    const d = new Date(c.updated_at)
    const y = new Date(now); y.setDate(y.getDate() - 1)
    return d.toDateString() !== now.toDateString() && d.toDateString() !== y.toDateString()
  })

  function ChatItem({ chat }: { chat: Conversation }) {
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
          {chat.title || 'Untitled'}
        </div>
      </button>
    )
  }

  function Section({ label, chats }: { label: string; chats: Conversation[] }) {
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

      {/* Mobile quick start chips */}
      {isMobile && (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Quick start
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_STARTS.map(topic => (
              <button
                key={topic}
                onClick={() => {
                  if (onQuickStart) onQuickStart(topic)
                  if (onClose) onClose()
                }}
                className="text-xs px-3 py-1.5 rounded-full border transition-all duration-150"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-elevated)',
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = '#6B7A5C'
                  el.style.color = '#F7F4F0'
                  el.style.borderColor = '#6B7A5C'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'var(--bg-elevated)'
                  el.style.color = 'var(--text-primary)'
                  el.style.borderColor = 'var(--border)'
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Desktop footer — user menu */}
      {!isMobile && (
        <div className="px-3 py-3 border-t relative" style={{ borderColor: 'var(--border)' }}>
          {menuOpen && (
            <div
              className="absolute bottom-14 left-3 right-3 rounded-xl py-1 shadow-lg"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              {userEmail && (
                <div className="px-4 py-2 text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
                  {userEmail}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)' }} />
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-inter), sans-serif' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#E8E3DA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M3 7.5h9M8.5 4l3.5 3.5L8.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Log out
              </button>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#E8E3DA'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)' }}>
              {userEmail ? userEmail[0].toUpperCase() : 'U'}
            </div>
            <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {userEmail ?? 'Account'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
