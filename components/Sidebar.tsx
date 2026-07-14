'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import '@/components/onboarding/onboarding.css'

const T = {
  paper: '#F4EDE1',
  panel: '#F8F3EA',
  ink: '#2C2621',
  inkSoft: '#6A6055',
  inkFaint: '#9A9083',
  clay: '#B0552F',
  clayDeep: '#8F401F',
  line: 'rgba(44,38,33,0.14)',
  lineSoft: 'rgba(44,38,33,0.08)',
  brandBg: '#3A2A24',
  brandInk: '#F6EFE3',
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: '"Instrument Sans", system-ui, sans-serif',
}

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
  const initial = userEmail ? userEmail[0].toUpperCase() : 'U'

  return (
    <div style={{
      width: isMobile ? '80vw' : '260px',
      maxWidth: isMobile ? '320px' : '260px',
      background: T.paper,
      borderRight: `1px solid ${T.line}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '22px 14px 14px',
      fontFamily: T.sans,
    }}>

      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 22px' }}>
        <img src="/logo.svg" alt="The Trade" style={{ height: 22, width: 'auto', display: 'block' }} />
        {isMobile && onClose && (
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint, padding: 4 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* New conversation button */}
      <button
        onClick={() => { onNew(); if (isMobile && onClose) onClose() }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', border: `1.5px solid ${T.line}`,
          borderRadius: 999, color: T.ink, fontSize: 13.5, fontWeight: 500,
          background: 'transparent', cursor: 'pointer', fontFamily: T.sans,
          transition: 'background .25s, border-color .25s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = `rgba(176,85,47,0.06)`
          ;(e.currentTarget as HTMLElement).style.borderColor = `rgba(176,85,47,0.5)`
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.borderColor = T.line
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.clay} strokeWidth="1.9">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New conversation
      </button>

      {/* History */}
      <div style={{ marginTop: 26, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {conversations.length > 0 && (
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.inkFaint, padding: '4px 10px 10px' }}>
            Recent
          </div>
        )}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {conversations.map(c => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => { onSelect(c.id); if (isMobile && onClose) onClose() }}
                style={{
                  padding: '9px 11px', borderRadius: 6, fontSize: 13.5,
                  color: isActive ? T.clayDeep : T.inkSoft,
                  background: isActive ? 'rgba(176,85,47,0.10)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontFamily: T.sans, transition: 'background .2s, color .2s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(44,38,33,0.05)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {c.title || 'Untitled'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Account footer */}
      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14, marginTop: 10, position: 'relative' }}>
        {menuOpen && (
          <div style={{
            position: 'absolute', bottom: 56, left: 0, right: 0,
            background: T.paper, border: `1px solid ${T.line}`,
            borderRadius: 8, padding: '4px 0', boxShadow: '0 8px 24px rgba(44,38,33,0.12)',
          }}>
            {userEmail && (
              <div style={{ padding: '8px 14px', fontSize: 11, color: T.inkFaint, fontFamily: T.sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </div>
            )}
            <div style={{ height: 1, background: T.line }} />
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13.5,
                color: T.ink, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: T.sans, display: 'flex', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(44,38,33,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 11, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{
            width: 30, height: 30, borderRadius: '50%', background: T.clay, color: T.brandInk,
            display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, flexShrink: 0,
          }}>
            {initial}
          </span>
          <span style={{ fontSize: 12.5, color: T.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: T.sans }}>
            {userEmail ?? 'Account'}
          </span>
        </button>
      </div>
    </div>
  )
}
