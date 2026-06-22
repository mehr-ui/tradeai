'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage, { Message } from '@/components/ChatMessage'
import TypingIndicator from '@/components/TypingIndicator'
import Sidebar from '@/components/Sidebar'

const EXAMPLE_PROMPTS = [
  'Help me put together a budget for a kitchen remodel',
  'Create a project schedule for a bathroom renovation',
  'Draft a client update email about a two-week delay',
  'Write a change order for some added electrical work',
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  function autoResize() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  function handleNew() {
    setMessages([])
    setInput('')
    setActiveChat(null)
  }

  function handleSelectChat(id: number) {
    setActiveChat(id)
    // In a real app this would load the conversation — for demo just clear
    setMessages([])
    setInput('')
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
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

  return (
    <div className="flex h-full" style={{ background: 'var(--bg-deep)' }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          activeId={activeChat}
          onSelect={handleSelectChat}
          onNew={handleNew}
        />
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header
          className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--border)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            title="Toggle sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3.5" width="12" height="1.2" rx="0.6" fill="currentColor"/>
              <rect x="2" y="7.4" width="12" height="1.2" rx="0.6" fill="currentColor"/>
              <rect x="2" y="11.3" width="12" height="1.2" rx="0.6" fill="currentColor"/>
            </svg>
          </button>
          <div
            className="text-sm tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {activeChat ? `Conversation` : 'New Conversation'}
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {hasMessages && (
            <div className="w-full max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area — centered when empty, pinned to bottom when chatting */}
        <div
          className={`flex-shrink-0 ${!hasMessages ? 'flex flex-col items-center justify-center flex-1 pb-10 px-6' : 'border-t py-5 px-6'}`}
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          {/* Empty state heading */}
          {!hasMessages && (
            <div className="text-center mb-8">
              <div
                className="text-[11px] tracking-[0.35em] uppercase mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                — THE —
              </div>
              <div
                className="text-5xl font-bold tracking-[0.18em] uppercase mb-4"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                TRADE
              </div>
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                Where should we begin?
              </p>
            </div>
          )}

          <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">

            {/* Input row */}
            <div
              className="flex gap-3 items-end rounded-xl border px-4 py-3 max-w-2xl mx-auto w-full"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                boxShadow: '0 1px 4px rgba(61,53,48,0.06)',
              }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize() }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your project…"
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-25"
                style={{ background: '#6B7A5C' }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
                    stroke="#F7F4F0"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Prompt chips — below input, horizontal row, empty state only */}
            {!hasMessages && (
              <div className="grid grid-cols-2 gap-2 mt-1 w-full">
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
                      el.style.background = '#6B7A5C'
                      el.style.color = '#F7F4F0'
                      el.style.borderColor = '#6B7A5C'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.background = 'var(--bg-elevated)'
                      el.style.color = 'var(--text-muted)'
                      el.style.borderColor = 'var(--border)'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {!hasMessages && (
              <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                Enter to send · Shift+Enter for new line
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
