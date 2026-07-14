'use client' // canvas + effects are client-only; Next needs this at the top

import { useEffect, useRef } from 'react'

export function AnimatedField({ warmth = 1, glow = 0.5 }: { warmth?: number; glow?: number }) {
  // 1. Ref to the real <canvas> node
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Keep the latest props in a ref so the loop reads live values
  // without us having to restart the effect every time they change.
  const opts = useRef({ warmth, glow })
  opts.current = { warmth, glow }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, raf = 0

    // 3. Size the pixel buffer to the element * DPR (crisp on retina)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return
      w = r.width; h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // draw in CSS px, not device px
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const start = performance.now()

    const blobs = [
      { hue: 18, sat: 62, lig: 46, r: .85, ax: .22, ay: .28, sx: .00013, sy: .00017, px: 0,   py: 1 },
      { hue: 34, sat: 58, lig: 52, r: .95, ax: .30, ay: .24, sx: .00011, sy: .00009, px: 2,   py: 3 },
      { hue: 8,  sat: 46, lig: 34, r: .90, ax: .26, ay: .30, sx: .00009, sy: .00015, px: 1.5, py: .5 },
      { hue: 76, sat: 22, lig: 42, r: .80, ax: .28, ay: .26, sx: .00015, sy: .00012, px: 4,   py: 2 },
    ]

    const grid = (t: number, spacing: number) => {
        const drift = (t * 0.008) % spacing
        const angle = -0.18                       // ← TILT in radians (~10°). try 0.3, -0.5…
        // optional: make the tilt itself wobble
        // const angle = -0.18 + 0.05 * Math.sin(t * 0.0002)
      
        ctx.save()                                // remember the un-rotated state
        ctx.translate(w / 2, h / 2)               // move origin to center so it spins around the middle
        ctx.rotate(angle)                         // tilt everything drawn from here on
      
        ctx.strokeStyle = 'rgba(246,239,227,0.07)'
        ctx.lineWidth = 1
      
        // draw across a box BIGGER than the panel (diagonal length) so tilting
        // never exposes a bare corner. `m` = margin.
        const m = Math.hypot(w, h)                // covers any rotation
        for (let x = -m + drift; x <= m; x += spacing) {
          ctx.beginPath(); ctx.moveTo(x, -m); ctx.lineTo(x, m); ctx.stroke()
        }
        for (let y = -m + drift; y <= m; y += spacing) {
          ctx.beginPath(); ctx.moveTo(-m, y); ctx.lineTo(m, y); ctx.stroke()
        }
      
        ctx.restore()                             // undo translate+rotate so nothing else is affected
      }

    const draw = (now: number) => {
      if (!w || !h) resize()
      if (!w || !h) return
      const t = now - start
      const { warmth, glow } = opts.current

      ctx.fillStyle = '#3A2A24'; ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const b of blobs) {
        const cx = w * (.5 + b.ax * Math.sin(t * b.sx + b.px))
        const cy = h * (.5 + b.ay * Math.cos(t * b.sy + b.py))
        const hue = b.hue + 6 * Math.sin(t * 0.00006 + b.px)
        const rad = Math.max(0, Math.max(w, h) * b.r)
        const sat = Math.round(b.sat * warmth)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
        g.addColorStop(0,  `hsla(${hue.toFixed(1)},${sat}%,${b.lig}%,${glow.toFixed(3)})`)
        g.addColorStop(.5, `hsla(${hue.toFixed(1)},${sat}%,${b.lig}%,${(glow * 0.28).toFixed(3)})`)
        g.addColorStop(1,  `hsla(${hue.toFixed(1)},${sat}%,${b.lig}%,0)`)
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      grid(t, 55)

      // amber accent line — the warm streak from the login field
      const gy = h * (.5 + .34 * Math.sin(t * 0.00016))
      ctx.beginPath()
      for (let x = -20; x <= w + 20; x += 12) {
        const y = gy + 34 * Math.sin(x * 0.0055 + t * 0.0004) + 18 * Math.sin(x * 0.012 - t * 0.0003)
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(224,150,96,0.42)'; ctx.lineWidth = 1.5; ctx.stroke()
    }

    // 2. The loop — and its cleanup
    const frame = (now: number) => { draw(now); raf = requestAnimationFrame(frame) }
    raf = requestAnimationFrame(frame)

    return () => { cancelAnimationFrame(raf); ro.disconnect() } // ← runs on unmount
  }, []) // empty deps = start once, stop on unmount

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}