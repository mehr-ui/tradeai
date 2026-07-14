'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage, { Message, ImageAttachment } from '@/components/ChatMessage'
import TypingIndicator from '@/components/TypingIndicator'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { getConversations, createConversation } from '@/lib/db/conversations'
import { getMessages, saveMessage } from '@/lib/db/messages'
import '@/components/onboarding/onboarding.css'

const T = {
  paper: '#F4EDE1',
  panel: '#F8F3EA',
  raised: '#FCF8F0',
  ink: '#2C2621',
  inkSoft: '#6A6055',
  inkFaint: '#9A9083',
  clay: '#B0552F',
  clayDeep: '#8F401F',
  brandInk: '#F6EFE3',
  line: 'rgba(44,38,33,0.14)',
  lineSoft: 'rgba(44,38,33,0.08)',
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: '"Instrument Sans", system-ui, sans-serif',
}

const PROMPTS = [
  { text: 'Help me put together a budget for a kitchen remodel', path: 'M3 3v18h18M8 17V9M13 17V5M18 17v-6' },
  { text: 'Create a project schedule for a bathroom renovation', path: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' },
  { text: 'Draft a client update email about a two-week delay', path: 'M4 4h16v12H5.2L4 17.2V4z' },
  { text: 'Write a change order for some added electrical work', path: 'M13 2L3 14h7v8l10-12h-7V2z' },
]

const MAX_CSV_ROWS = 500

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [conversations, setConversations] = useState<{ id: string; title: string; updated_at: string }[]>([])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<{ name: string; content: string } | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([])
  const [userEmail, setUserEmail] = useState<string | undefined>()
  const [userName, setUserName] = useState<string | undefined>()
  const [userId, setUserId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const hasMessages = messages.length > 0

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = text.split('\n').filter(r => r.trim())
      if (rows.length > MAX_CSV_ROWS + 1) {
        setCsvError(`File has ${rows.length - 1} rows — limit is ${MAX_CSV_ROWS}. Please trim it down.`)
        return
      }
      setCsvFile({ name: file.name, content: text })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserEmail(data.user.email)
      setUserId(data.user.id)
      try {
        const convos = await getConversations(data.user.id)
        setConversations(convos)
      } catch { /* non-fatal */ }
      try {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single()
        if (profile?.full_name) setUserName(profile.full_name.split(' ')[0])
      } catch { /* non-fatal */ }
    })
  }, [])

  function autoResize() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        const base64 = dataUrl.split(',')[1]
        setPendingImages(prev => [...prev, { data: base64, mediaType: file.type, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function handleNew() {
    setMessages([])
    setInput('')
    setActiveChat(null)
    setCsvFile(null)
    setCsvError(null)
    setPendingImages([])
  }

  async function handleSelectChat(id: string) {
    setActiveChat(id)
    setInput('')
    setCsvFile(null)
    setCsvError(null)
    setPendingImages([])
    const msgs = await getMessages(id)
    setMessages(msgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content ?? '' })))
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setPendingImages([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsStreaming(true)

    try {
      let currentChatId = activeChat
      if (!currentChatId && userId) {
        const title = trimmed.slice(0, 60)
        const convo = await createConversation(userId, title)
        currentChatId = convo.id
        setActiveChat(convo.id)
        setConversations(prev => [convo, ...prev])
      }

      if (currentChatId) {
        await saveMessage(currentChatId, 'user', trimmed)
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, csvFile }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMessage])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }

      if (currentChatId) {
        await saveMessage(currentChatId, 'assistant', assistantText)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const greeting = `${getGreeting()}, ${userName ?? 'there'}.`

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh', background: T.paper, fontFamily: T.sans }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:flex flex-col">
        <Sidebar
          activeId={activeChat}
          onSelect={handleSelectChat}
          onNew={handleNew}
          userEmail={userEmail}
          conversations={conversations}
        />
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(44,38,33,0.35)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
            <Sidebar
              activeId={activeChat}
              onSelect={handleSelectChat}
              onNew={handleNew}
              onClose={() => setMobileSidebarOpen(false)}
              conversations={conversations}
              isMobile
            />
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{ position: 'relative', background: T.panel, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 28px', borderBottom: `1px solid ${T.lineSoft}`, flexShrink: 0 }}>
          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            style={{ width: 34, height: 34, borderRadius: 3, display: 'grid', placeItems: 'center', color: T.inkSoft, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          {/* Desktop hamburger icon */}
          <span className="hidden md:grid" style={{ width: 34, height: 34, borderRadius: 3, placeItems: 'center', color: T.inkSoft }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkSoft }}>
            {activeChat ? 'Conversation' : 'New conversation'}
          </span>
        </header>

        {/* Messages / Empty state */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {hasMessages ? (
            <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px' }}>
              <div style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Logotype */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                  <span style={{ width: 40, height: 1, background: T.line }} />
                  <span style={{ fontSize: 10.5, letterSpacing: '0.34em', textTransform: 'uppercase', color: T.clay }}>The Trade</span>
                  <span style={{ width: 40, height: 1, background: T.line }} />
                </div>

                <h1 style={{ fontFamily: T.serif, fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.01em', margin: 0, textAlign: 'center', color: T.ink }}>
                  {greeting}
                </h1>
                <p style={{ fontSize: 14.5, color: T.inkSoft, lineHeight: 1.6, margin: '12px 0 0', textAlign: 'center', maxWidth: 440 }}>
                  Your planning partner for budgets, schedules, client updates, and change orders. What are we working on?
                </p>

                {/* Suggestion pills */}
                <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 34 }}>
                  {PROMPTS.map(p => (
                    <button
                      key={p.text}
                      onClick={() => sendMessage(p.text)}
                      disabled={isStreaming}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 9,
                        padding: '9px 16px', background: T.raised,
                        border: `1px solid ${T.line}`, borderRadius: 999,
                        cursor: 'pointer', transition: 'border-color .22s, background .22s',
                        fontFamily: T.sans,
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.borderColor = 'rgba(176,85,47,0.5)'
                        el.style.background = 'rgba(176,85,47,0.05)'
                        const ic = el.querySelector<HTMLElement>('.sug-ic')
                        if (ic) ic.style.color = T.clay
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.borderColor = T.line
                        el.style.background = T.raised
                        const ic = el.querySelector<HTMLElement>('.sug-ic')
                        if (ic) ic.style.color = T.inkFaint
                      }}
                    >
                      <span className="sug-ic" style={{ color: T.inkFaint, flexShrink: 0, transition: 'color .22s', display: 'flex' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d={p.path}/>
                        </svg>
                      </span>
                      <span style={{ fontSize: 13, lineHeight: 1.35, color: T.ink }}>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div style={{ flexShrink: 0, padding: '14px 28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* CSV chip */}
          {csvFile && (
            <div style={{ width: '100%', maxWidth: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, fontSize: 12, background: 'rgba(176,85,47,0.08)', border: `1px solid rgba(176,85,47,0.25)`, color: T.clayDeep }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2h5l3 3v5a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M7 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                {csvFile.name}
                <button onClick={() => setCsvFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkFaint, padding: 0, marginLeft: 2, lineHeight: 1 }}>✕</button>
              </div>
            </div>
          )}

          {csvError && (
            <p style={{ fontSize: 12, color: '#c0392b', margin: '0 0 8px', width: '100%', maxWidth: 700 }}>{csvError}</p>
          )}

          {/* Pending image previews */}
          {pendingImages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%', maxWidth: 700, marginBottom: 8 }}>
              {pendingImages.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={`data:${img.mediaType};base64,${img.data}`}
                    alt={img.name}
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: `1px solid ${T.line}` }}
                  />
                  <button
                    onClick={() => setPendingImages(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: T.ink, color: T.raised, border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileSelect} />
          <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />

          {/* Composer pill */}
          <div
            style={{
              width: '100%', maxWidth: 700,
              background: T.raised, border: `1.5px solid ${T.line}`,
              borderRadius: 999, padding: '6px 6px 6px 18px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 6px 18px rgba(58,42,36,0.06)',
              transition: 'border-color .25s, box-shadow .25s',
            }}
            onFocusCapture={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(176,85,47,0.55)'
              el.style.boxShadow = '0 14px 36px rgba(58,42,36,0.14)'
            }}
            onBlurCapture={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = T.line
              el.style.boxShadow = '0 6px 18px rgba(58,42,36,0.06)'
            }}
          >
            {/* Upload icon */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              title="Upload CSV or image"
              style={{ width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', color: T.inkFaint, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background .2s, color .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(44,38,33,0.06)'; (e.currentTarget as HTMLElement).style.color = T.ink }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = T.inkFaint }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M21 15l-5-5L5 21M12 4v12M8 8l4-4 4 4"/>
              </svg>
            </button>

            {/* Image upload */}
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={isStreaming}
              title="Upload image"
              style={{ width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', color: pendingImages.length > 0 ? T.clay : T.inkFaint, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background .2s, color .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(44,38,33,0.06)'; (e.currentTarget as HTMLElement).style.color = T.ink }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = pendingImages.length > 0 ? T.clay : T.inkFaint }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize() }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a budget, timeline, estimate, or client update…"
              disabled={isStreaming}
              style={{
                flex: 1, border: 0, background: 'transparent', outline: 'none',
                resize: 'none', fontFamily: T.sans, fontSize: 15.5, lineHeight: 1.5,
                color: T.ink, maxHeight: 160, alignSelf: 'center', padding: '8px 0',
              }}
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              style={{
                width: 36, height: 36, border: 0, borderRadius: 999,
                background: input.trim() && !isStreaming ? T.clay : 'rgba(176,85,47,0.35)',
                color: T.brandInk, display: 'grid', placeItems: 'center', flexShrink: 0,
                cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
                transition: 'background .25s, transform .12s',
              }}
              onMouseEnter={e => { if (input.trim() && !isStreaming) (e.currentTarget as HTMLElement).style.background = T.clayDeep }}
              onMouseLeave={e => { if (input.trim() && !isStreaming) (e.currentTarget as HTMLElement).style.background = T.clay }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>

          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 10 }}>Enter to send · Shift+Enter for new line</div>
        </div>
      </main>
    </div>
  )
}
