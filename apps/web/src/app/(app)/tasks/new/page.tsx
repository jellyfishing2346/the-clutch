'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TASK_CATEGORIES, BOROUGHS, NEIGHBORHOODS, CREDITS_CONFIG } from 'shared'
import type { TaskCategory, PaymentType } from 'shared'
import { createTask } from '@/lib/api/tasks'
import { fetchCreditsBalance } from '@/lib/api/credits'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const BOROUGH_COORDS: Record<string, { lat: number; lng: number }> = {
  Manhattan:     { lat: 40.7831, lng: -73.9712 },
  Brooklyn:      { lat: 40.6782, lng: -73.9442 },
  Queens:        { lat: 40.7282, lng: -73.7949 },
  Bronx:         { lat: 40.8448, lng: -73.8648 },
  'Staten Island': { lat: 40.5795, lng: -74.1502 },
}

const STEPS = ['Task details', 'Location & timing', 'Payment'] as const

export default function NewTaskPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as TaskCategory | '',
    borough: '',
    neighborhood: '',
    address: '',
    scheduledFor: '',
    paymentType: 'credits' as PaymentType,
    cashAmount: '',
    creditsAmount: '',
  })

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) fetchCreditsBalance(user.id).then(setCreditsBalance)
    })
  }, [])

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const selectedCategory = form.category ? TASK_CATEGORIES[form.category] : null
  const neighborhoods = form.borough ? NEIGHBORHOODS[form.borough as keyof typeof NEIGHBORHOODS] ?? [] : []

  const estimatedCost = form.paymentType === 'credits'
    ? selectedCategory
      ? selectedCategory.trustRequired === 'new'
        ? CREDITS_CONFIG.simpleTaskCost
        : selectedCategory.trustRequired === 'established'
          ? CREDITS_CONFIG.moderateTaskCost
          : CREDITS_CONFIG.skilledTaskCost
      : CREDITS_CONFIG.simpleTaskCost
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 2) { setStep(s => s + 1); return }
    if (!form.category) return
    setSubmitting(true)
    setSubmitError('')

    const location = BOROUGH_COORDS[form.borough] ?? { lat: 40.7831, lng: -73.9712 }
    const result = await createTask({
      title: form.title,
      description: form.description,
      category: form.category as TaskCategory,
      location,
      address: form.address,
      neighborhood: form.neighborhood,
      borough: form.borough,
      paymentType: form.paymentType,
      paymentAmount: form.cashAmount ? parseFloat(form.cashAmount) : undefined,
      creditsAmount: form.paymentType === 'credits' ? estimatedCost : undefined,
      scheduledFor: form.scheduledFor || undefined,
    })

    if (result) {
      setPosted(true)
      setTimeout(() => router.push('/tasks'), 2000)
    } else {
      setSubmitError('Failed to post your task. Please try again.')
      setSubmitting(false)
    }
  }

  if (posted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Task posted!</h2>
          <p className="text-gray-500 text-sm mb-6">Your neighbors can now see it and offer to help.</p>
          <div className="animate-spin text-2xl text-clutch-400">◌</div>
          <p className="text-xs text-gray-400 mt-2">Redirecting to tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a task</h1>
        <p className="text-gray-500 text-sm">Describe what you need help with.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full mb-1.5 transition-colors ${i <= step ? 'gradient-brand' : 'bg-gray-200'}`} />
            <div className={`text-xs font-medium ${i === step ? 'text-clutch-600' : 'text-gray-400'}`}>{label}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 0: Task details */}
        {step === 0 && (
          <div className="card p-6 space-y-5 animate-fade-in">
            <div>
              <label className="label" htmlFor="title">Task title <span className="text-red-400">*</span></label>
              <input
                id="title"
                className="input"
                placeholder="e.g. Help carry groceries from the store"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                required
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-400 mt-1">{form.title.length}/100</div>
            </div>

            <div>
              <label className="label" htmlFor="category">Category <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(TASK_CATEGORIES) as [TaskCategory, typeof TASK_CATEGORIES[TaskCategory]][]).map(([key, cat]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => update('category', key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.category === key
                        ? 'border-clutch-500 bg-clutch-50 text-clutch-700'
                        : 'border-gray-200 hover:border-clutch-300 bg-white'
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="description">Description <span className="text-red-400">*</span></label>
              <textarea
                id="description"
                className="input min-h-[110px] resize-none"
                placeholder="Describe what you need, how long it might take, any requirements..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                required
                maxLength={600}
              />
              <div className="text-right text-xs text-gray-400 mt-1">{form.description.length}/600</div>
            </div>

            {selectedCategory && (
              <div className="bg-clutch-50 rounded-xl p-3 text-sm text-clutch-700 flex gap-2">
                <span>ℹ️</span>
                <div>
                  This category requires a <strong>{selectedCategory.trustRequired}</strong> trust level helper.{' '}
                  {selectedCategory.trustRequired === 'new' && 'Anyone can help!'}
                  {selectedCategory.trustRequired === 'established' && 'Helpers with 3+ tasks & 4.0+ rating.'}
                  {selectedCategory.trustRequired === 'trusted' && 'Helpers with 10+ tasks & 4.5+ rating.'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="card p-6 space-y-5 animate-fade-in">
            <div>
              <label className="label" htmlFor="borough">Borough <span className="text-red-400">*</span></label>
              <select
                id="borough"
                className="input"
                value={form.borough}
                onChange={e => update('borough', e.target.value)}
                required
              >
                <option value="">Select borough...</option>
                {BOROUGHS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {neighborhoods.length > 0 && (
              <div>
                <label className="label" htmlFor="neighborhood">Neighborhood</label>
                <select
                  id="neighborhood"
                  className="input"
                  value={form.neighborhood}
                  onChange={e => update('neighborhood', e.target.value)}
                >
                  <option value="">Select neighborhood...</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="label" htmlFor="address">Approximate address or landmark</label>
              <input
                id="address"
                className="input"
                placeholder="e.g. Near C-Town on 125th St"
                value={form.address}
                onChange={e => update('address', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Your exact address is only shared after you accept a helper.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="scheduled">When do you need help? (optional)</label>
              <input
                id="scheduled"
                type="datetime-local"
                className="input"
                value={form.scheduledFor}
                onChange={e => update('scheduledFor', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="card p-6 space-y-5 animate-fade-in">
            <div>
              <label className="label">How will you pay? <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'credits', label: '◈ Credits', desc: 'Use your Clutch credits' },
                  { value: 'cash', label: '$ Cash', desc: 'Pay in person' },
                  { value: 'exchange', label: '⇄ Exchange', desc: 'Trade skills or goods' },
                  { value: 'free', label: '♥ Free', desc: 'No payment, just community' },
                ] as { value: PaymentType; label: string; desc: string }[]).map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => update('paymentType', opt.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.paymentType === opt.value
                        ? 'border-clutch-500 bg-clutch-50'
                        : 'border-gray-200 hover:border-clutch-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {form.paymentType === 'cash' && (
              <div>
                <label className="label" htmlFor="cash-amount">Cash amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    id="cash-amount"
                    type="number"
                    className="input pl-8"
                    placeholder="0.00"
                    min="0"
                    step="0.50"
                    value={form.cashAmount}
                    onChange={e => update('cashAmount', e.target.value)}
                  />
                </div>
              </div>
            )}

            {form.paymentType === 'credits' && (
              <div className="bg-clutch-50 rounded-xl p-4 text-sm text-clutch-700">
                <div className="font-semibold mb-1">Estimated cost: {estimatedCost} credits</div>
                <div className="text-clutch-600 text-xs">
                  Credits are deducted when your task is accepted.{' '}
                  {creditsBalance !== null
                    ? <>Your balance: <strong>{creditsBalance} CR</strong>{creditsBalance < estimatedCost && <span className="text-red-500 ml-1">— insufficient credits</span>}</>
                    : 'Loading balance...'}
                </div>
              </div>
            )}

            {form.paymentType === 'free' && (
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
                <div className="font-semibold mb-1">♥ Community task</div>
                <div className="text-green-600 text-xs">
                  Your helper will earn <strong>10 Clutch Credits</strong> for completing this for free!
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Task summary</h3>
              <div className="flex justify-between">
                <span className="text-gray-500">Title</span>
                <span className="text-gray-900 font-medium text-right max-w-[60%] truncate">{form.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-900">{selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900">{form.neighborhood || form.borough || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{submitError}</p>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
              ← Back
            </button>
          )}
          <button
            type="submit"
            className="btn-primary flex-1 flex justify-center items-center gap-2"
            disabled={submitting || (step === 0 && (!form.title || !form.category || !form.description))}
          >
            {submitting
              ? <><span className="animate-spin">◌</span> Posting...</>
              : step < 2 ? 'Continue →' : '🚀 Post task'
            }
          </button>
        </div>

        {step === 0 && (!form.title || !form.category || !form.description) && (
          <p className="text-xs text-gray-400 text-center -mt-1">
            Title, category, and description are required to continue.
          </p>
        )}

        {step === 0 && (
          <div className="text-center">
            <Link href="/tasks" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Cancel
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}
