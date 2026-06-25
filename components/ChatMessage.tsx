'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type ImageAttachment = {
  data: string        // base64
  mediaType: string   // e.g. 'image/jpeg'
  name: string
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
  images?: ImageAttachment[]
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] flex flex-col gap-2 items-end">
          {/* Image attachments */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={`data:${img.mediaType};base64,${img.data}`}
                  alt={img.name}
                  className="rounded-xl max-h-48 max-w-xs object-cover"
                  style={{ border: '1px solid var(--border)' }}
                />
              ))}
            </div>
          )}
          {/* Text bubble */}
          {message.content && (
            <div
              className="px-4 py-3 text-sm leading-relaxed"
              style={{
                background: '#6B7A5C',
                color: '#F7F4F0',
                borderRadius: '18px 18px 4px 18px',
                fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          )}
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
