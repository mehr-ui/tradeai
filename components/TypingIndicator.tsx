'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{
            background: 'var(--text-muted)',
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.9s',
          }}
        />
      ))}
    </div>
  )
}
