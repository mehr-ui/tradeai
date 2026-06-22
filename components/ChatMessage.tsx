'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[70%] px-4 py-3 text-sm leading-relaxed"
          style={{
            background: '#6B7A5C',
            color: '#F7F4F0',
            borderRadius: '18px 18px 4px 18px',
            fontFamily: 'var(--font-inter), sans-serif',
          }}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  // Assistant — no bubble, full width, left-aligned
  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        className="text-sm leading-relaxed w-full prose-trade"
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-inter), sans-serif',
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
