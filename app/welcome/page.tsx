'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WelcomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: name, company, role })
      .eq('id', user.id)

    if (profileError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    await fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name }),
    })

    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-deep)' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <img
            src="/logo.svg"
            alt="The Trade"
            style={{ height: '28px', width: 'auto', filter: 'brightness(0) saturate(100%) invert(18%) sepia(10%) saturate(800%) hue-rotate(340deg) brightness(90%)' }}
          />
        </div>

        <h1 className="text-center mb-1" style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', fontWeight: 400, color: 'var(--text-primary)' }}>
          Welcome to The Trade
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
          Tell us a bit about yourself to get started.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
              Your name
            </label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '16px',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
              Company
            </label>
            <input
              type="text"
              placeholder="Marea Clark Interiors"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '16px',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>
              Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: role ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '16px',
              }}
            >
              <option value="" disabled>Select your role</option>
              <option value="interior_designer">Interior Designer</option>
              <option value="contractor">General Contractor</option>
              <option value="architect">Architect</option>
              <option value="project_manager">Project Manager</option>
              <option value="owner">Business Owner</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-medium transition-opacity mt-2"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-surface)',
              fontFamily: 'var(--font-inter), sans-serif',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Getting things ready…' : 'Get started'}
          </button>
        </form>
      </div>
    </div>
  )
}
