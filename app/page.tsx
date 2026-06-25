'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage, { Message, ImageAttachment } from '@/components/ChatMessage'
import TypingIndicator from '@/components/TypingIndicator'
import Sidebar from '@/components/Sidebar'

const EXAMPLE_PROMPTS = [
  'Help me put together a budget for a kitchen remodel',
  'Create a project schedule for a bathroom renovation',
  'Draft a client update email about a two-week delay',
  'Write a change order for some added electrical work',
]

const MAX_CSV_ROWS = 500

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<{ name: string; content: string } | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([])
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
    // reset so the same file can be re-uploaded
    e.target.value = ''
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

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

  function handleSelectChat(id: number) {
    setActiveChat(id)
    setMessages([])
    setInput('')
    setCsvFile(null)
    setCsvError(null)
    setPendingImages([])
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
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

  const HamburgerIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="1.4" rx="0.7" fill="currentColor"/>
      <rect x="2" y="8.3" width="14" height="1.4" rx="0.7" fill="currentColor"/>
      <rect x="2" y="12.6" width="14" height="1.4" rx="0.7" fill="currentColor"/>
    </svg>
  )

  return (
    <div className="flex h-full" style={{ background: 'var(--bg-deep)' }}>

      {/* ── DESKTOP sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        {sidebarOpen && (
          <Sidebar activeId={activeChat} onSelect={handleSelectChat} onNew={handleNew} />
        )}
      </div>

      {/* ── MOBILE sidebar drawer + backdrop ── */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 h-full">
            <Sidebar
              activeId={activeChat}
              onSelect={handleSelectChat}
              onNew={handleNew}
              onClose={() => setMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header
          className="flex-shrink-0 flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 md:border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-deep)' }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          >
            <HamburgerIcon />
          </button>

          {/* Desktop hamburger */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="hidden md:flex p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--border)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <HamburgerIcon />
          </button>

          <div
            className="hidden md:block text-sm tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {activeChat ? 'Conversation' : 'New Conversation'}
          </div>
        </header>

        {/* Messages area — also holds empty state logo on mobile */}
        <div className="flex-1 overflow-y-auto">
          {hasMessages ? (
            <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col gap-4 md:gap-6">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Empty state logo — centered in the content area */
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <img
                src="/logo.svg"
                alt="The Trade"
                className="mx-auto mb-4"
                style={{ height: '50px', width: 'auto', filter: 'brightness(0) saturate(100%) invert(18%) sepia(10%) saturate(800%) hue-rotate(340deg) brightness(90%)' }}
              />
              <p className="text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                What should we build, budget, or schedule?
              </p>
            </div>
          )}
        </div>

        {/* Input area — always pinned to bottom */}
        <div
          className="flex-shrink-0 py-3 md:py-5 px-4 md:px-6 md:border-t"
          style={{ borderColor: 'var(--border)', background: 'transparent' }}
        >


          <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">

            {/* CSV file chip */}
            {csvFile && (
              <div className="flex items-center gap-2 max-w-2xl mx-auto w-full">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: '#6B7A5C20', border: '1px solid #6B7A5C50', color: '#6B7A5C' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2h5l3 3v5a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M7 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  <span>{csvFile.name}</span>
                  <button onClick={() => setCsvFile(null)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">✕</button>
                </div>
                <span className="text-xs hidden md:inline" style={{ color: 'var(--text-muted)' }}>attached to this conversation</span>
              </div>
            )}

            {csvError && (
              <p className="text-xs max-w-2xl mx-auto w-full" style={{ color: '#B04040' }}>{csvError}</p>
            )}

            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

            {/* Pending image previews */}
            {pendingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-2xl mx-auto w-full">
                {pendingImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={`data:${img.mediaType};base64,${img.data}`}
                      alt={img.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      style={{ border: '1px solid var(--border)' }}
                    />
                    <button
                      onClick={() => setPendingImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input box */}
            <div
              className="flex gap-2 md:gap-3 items-end rounded-2xl border px-3 md:px-4 py-3 max-w-2xl mx-auto w-full"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                boxShadow: '0 4px 20px rgba(61,53,48,0.12)',
              }}
            >
              {/* CSV upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                title="Upload CSV"
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-deep)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6B7A5C'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v6M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Image upload button */}
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isStreaming}
                title="Upload image"
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ color: pendingImages.length > 0 ? '#6B7A5C' : 'var(--text-muted)', background: 'var(--bg-deep)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6B7A5C'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = pendingImages.length > 0 ? '#6B7A5C' : 'var(--text-muted)'}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <circle cx="4.5" cy="5.5" r="1" fill="currentColor"/>
                  <path d="M1 9l3-3 2.5 2.5L9 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize() }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a budget, timeline, estimate, order, or client update…"
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontFamily: 'var(--font-inter), sans-serif', fontSize: '16px' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-25"
                style={{ background: '#6B7A5C' }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="#F7F4F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Prompt chips — 2 col on desktop, 1 col on mobile */}
            {!hasMessages && (
              <div className="hidden md:grid md:grid-cols-2 gap-2 mt-1 w-full max-w-2xl mx-auto">
                {EXAMPLE_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isStreaming}
                    className="text-xs px-4 py-2.5 rounded-xl border transition-all duration-200 disabled:opacity-40 cursor-pointer text-left"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-elevated)',
                      fontFamily: 'var(--font-inter), sans-serif',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.background = '#6B7A5C'; el.style.color = '#F7F4F0'; el.style.borderColor = '#6B7A5C'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.background = 'var(--bg-elevated)'; el.style.color = 'var(--text-muted)'; el.style.borderColor = 'var(--border)'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {!hasMessages && (
              <p className="text-center text-xs mt-1 hidden md:block" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                Enter to send · Shift+Enter for new line
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
