import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATEGORIES = [
  'simple_help', 'errands', 'delivery', 'moving', 'cleaning',
  'cooking', 'pet_care', 'tech_help', 'repairs', 'tutoring', 'skilled', 'other',
]

const CATEGORY_LABELS: Record<string, string> = {
  simple_help: 'Simple Help', errands: 'Errands', delivery: 'Delivery',
  moving: 'Moving Help', cleaning: 'Cleaning', cooking: 'Cooking',
  pet_care: 'Pet Care', tech_help: 'Tech Help', repairs: 'Repairs',
  tutoring: 'Tutoring', skilled: 'Skilled Work', other: 'Other',
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { title, borough, neighborhood } = await req.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are helping someone post a task on Clutch, a hyperlocal NYC community task marketplace.

Task title: "${title}"
Location: ${neighborhood ?? 'NYC'}${borough ? `, ${borough}` : ''}

Write a clear, friendly task description (2-3 sentences max) that explains what help is needed. Be specific and practical.

Also pick the best category from this list: ${CATEGORIES.join(', ')}

And suggest a fair credit amount (5–30) based on effort:
- 5 CR: quick, easy (under 30 min)
- 10 CR: moderate (30–90 min)
- 20 CR: significant (2–4 hrs)
- 30 CR: skilled or physically demanding

Respond ONLY with valid JSON in this exact shape:
{"description": "...", "category": "...", "credits": 10}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  const result = JSON.parse(jsonMatch[0])
  if (!CATEGORIES.includes(result.category)) result.category = 'other'
  result.categoryLabel = CATEGORY_LABELS[result.category]

  return NextResponse.json(result)
}
