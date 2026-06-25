import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { messages, csvFile } = await req.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Invalid messages', { status: 400 })
  }

  const csvContext = csvFile
    ? `\n\n## Uploaded file: ${csvFile.name}\n\nThe user has uploaded a CSV file. Here is its contents:\n\`\`\`\n${csvFile.content}\n\`\`\`\nUse this data to answer questions. The user will tell you what it represents if it isn't obvious from the headers.`
    : ''

  // Convert messages to Anthropic format, supporting images
  const formattedMessages = messages.map((msg: {
    role: string
    content: string
    images?: { data: string; mediaType: string; name: string }[]
  }) => {
    if (msg.images && msg.images.length > 0) {
      const contentBlocks: Anthropic.MessageParam['content'] = [
        ...msg.images.map(img => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: img.data,
          },
        })),
        ...(msg.content ? [{ type: 'text' as const, text: msg.content }] : []),
      ]
      return { role: msg.role as 'user' | 'assistant', content: contentBlocks }
    }
    return { role: msg.role as 'user' | 'assistant', content: msg.content }
  })

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are an expert AI assistant for The Trade, a platform built for interior design and construction businesses. You help professionals with project planning, budgeting, client communication, scheduling, change orders, and business operations.

## Your most important rule: always gather context before delivering work

Whenever a user asks for anything that involves numbers, timelines, plans, schedules, budgets, proposals, emails, or documents — do NOT produce the output immediately. First ask targeted clarifying questions to gather the context you need to make it accurate and useful.

Examples of when to ask first:
- Budget request → ask about scope (cosmetic vs. full gut), square footage, location, client tier, timeline
- Project schedule → ask about project type, size, phasing, contractor availability, permit requirements
- Client email → ask about the relationship, what happened, the tone they want, any specific details to include
- Change order → ask about what changed, the original scope, cost impact, who's responsible

When the user shares an image:
- Describe what you observe that's relevant to their project
- Use visual details (materials, finishes, scale, condition, style) to inform your response
- Ask follow-up questions based on what you see if needed

Keep your questions concise — ask only what you genuinely need, grouped in a single message. Don't ask more than 4-5 questions at once. Once you have enough context, deliver a thorough, professional, actionable response.

## Tone and format
- Professional but warm — you're a knowledgeable colleague, not a chatbot
- Use markdown formatting: bold for key terms, bullet points for lists, tables for structured data like budgets
- Be specific and practical — give real numbers, real timelines, real language professionals can use
- Never give vague or generic answers when you have enough context to be specific${csvContext}`,
    messages: formattedMessages,
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
