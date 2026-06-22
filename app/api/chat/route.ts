import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid messages', { status: 400 })
  }

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a helpful AI assistant for The Trade, a platform built for interior design and construction businesses. You help professionals with project planning, budgeting, client communication, scheduling, and business operations. Be concise, practical, and professional. Use markdown formatting when it helps clarity — bullet points for lists, bold for key terms, code blocks for templates.`,
    messages,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
