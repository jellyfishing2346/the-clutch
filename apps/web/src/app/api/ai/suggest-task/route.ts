import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

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
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { title, borough, neighborhood } = await req.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
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
        messages: [{
          role: 'user',
          content: `You are helping someone post a task on clutch, a hyperlocal NYC community task marketplace.

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
        max_tokens: 400,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    if (!CATEGORIES.includes(result.category)) result.category = 'other'
    result.categoryLabel = CATEGORY_LABELS[result.category]

    return NextResponse.json(result)
  } catch (error) {
    console.error('Groq request error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
