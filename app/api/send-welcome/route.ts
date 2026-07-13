import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email, name } = await req.json()

  const { error } = await resend.emails.send({
    from: 'The Trade <hello@thetrade.ai>',
    to: email,
    subject: 'Welcome to The Trade',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 48px 32px; color: #2C2A27;">
        <img src="https://www.thetrade.ai/logo.svg" alt="The Trade" style="height: 28px; margin-bottom: 40px;" />
        <h1 style="font-size: 24px; font-weight: 400; margin: 0 0 16px;">Welcome${name ? `, ${name}` : ''}.</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #5C5752; margin: 0 0 24px;">
          You now have access to The Trade — an AI assistant built specifically for interior design and construction professionals.
        </p>
        <p style="font-size: 16px; line-height: 1.7; color: #5C5752; margin: 0 0 32px;">
          Use it to draft client emails, build project budgets, write change orders, create schedules, and more. Just start a conversation.
        </p>
        <a href="https://www.thetrade.ai" style="display: inline-block; background: #2C2A27; color: #F7F4F0; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-family: sans-serif;">
          Open The Trade
        </a>
        <p style="font-size: 13px; color: #9C9790; margin-top: 48px; line-height: 1.6;">
          The Trade · Built for the trades industry
        </p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
