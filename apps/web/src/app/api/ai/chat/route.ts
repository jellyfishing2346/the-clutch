import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const GROQ_API_KEY = process.env.GROQ_API_KEY

// Rate limit: 10 requests per minute per IP/user
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 1000 // 1 minute

const SYSTEM_PROMPT = `You are clutch's friendly community assistant. clutch is a hyperlocal NYC task marketplace where neighbors help neighbors with everyday tasks in exchange for credits or cash.

Key facts about clutch:
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
  if (!GROQ_API_KEY) {
    return new Response('AI not configured', { status: 503 })
  }

  // Rate limiting
  const identifier = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'anonymous'
  const rateLimitResult = rateLimit(identifier, RATE_LIMIT, RATE_WINDOW_MS)

  if (!rateLimitResult.success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
      },
    })
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Messages required', { status: 400 })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
        max_tokens: 300,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return new Response('AI service error', { status: 500 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Limit': RATE_LIMIT.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      },
    })
  } catch (error) {
    console.error('Groq request error:', error)
    return new Response('AI service unavailable', { status: 500 })
  }
}
