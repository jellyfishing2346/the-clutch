import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are Clutch's friendly community assistant. Clutch is a hyperlocal NYC task marketplace where neighbors help neighbors with everyday tasks in exchange for credits or cash.

Key facts about Clutch:
- Free to join. New members get 20 welcome credits.
- Credits (CR) are earned by helping with tasks and spent to get help.
- Trust levels: New → Established → Trusted → Verified. Earn trust by completing tasks and getting good reviews.
- Neighborhoods covered: All 5 NYC boroughs — Manhattan, Brooklyn, Queens, Bronx, Staten Island.
- Task categories: Simple Help, Errands, Delivery, Moving, Cleaning, Cooking, Pet Care, Tech Help, Repairs, Tutoring, Skilled Work.
- Referral bonus: Share your link — you and a friend both get +10 CR when they join.
- Languages supported in the app: English, Spanish, Chinese.

Be warm, concise, and helpful. If someone asks how to do something in the app, give clear step-by-step guidance. If you don't know something specific, suggest they email hello@clutch.nyc.

Keep responses short — 2–4 sentences max unless a list is clearly needed. This is a chat widget, not an essay.`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('AI not configured', { status: 503 })
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Messages required', { status: 400 })
  }

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
