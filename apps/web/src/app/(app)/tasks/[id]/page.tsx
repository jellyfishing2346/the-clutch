'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { StarRating } from '@/components/ui/StarRating'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { MOCK_TASKS, MOCK_REVIEWS } from '@/lib/mock-data'
import { formatRelativeTime } from '@/lib/utils'
import { TASK_CATEGORIES, TRUST_LEVELS } from 'shared'

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = MOCK_TASKS.find(t => t.id === params.id)
  if (!task) notFound()

  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [message, setMessage] = useState('')

  const category = TASK_CATEGORIES[task.category]
  const trustInfo = TRUST_LEVELS[task.required_trust_level]
  const creatorReviews = MOCK_REVIEWS.filter(r => r.reviewee_id === task.creator_id).slice(0, 3)

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setApplying(true)
    await new Promise(r => setTimeout(r, 800))
    setApplied(true)
    setApplying(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back */}
      <Link href="/tasks" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-clutch-600 mb-5 transition-colors">
        ← Back to tasks
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-5">
          {/* Task header */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <div className="text-xs text-gray-500 font-medium">{category.label}</div>
                  <div className="text-xs text-gray-400">{task.neighborhood}, {task.borough}</div>
                </div>
              </div>
              <PaymentBadge type={task.payment_type} amount={task.payment_amount} credits={task.credits_amount} />
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-3">{task.title}</h1>
            <p className="text-gray-600 leading-relaxed text-sm">{task.description}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>📍 {task.address}</span>
              <span>🕐 Posted {formatRelativeTime(task.created_at)}</span>
              {task.scheduled_for && (
                <span>📅 Scheduled {new Date(task.scheduled_for).toLocaleDateString()}</span>
              )}
              {task.applicant_count > 0 && (
                <span className="text-clutch-600 font-medium">
                  👋 {task.applicant_count} {task.applicant_count === 1 ? 'person' : 'people'} offered to help
                </span>
              )}
            </div>
          </div>

          {/* Trust requirement */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Trust requirement</h3>
            <div className="flex items-center gap-3">
              <TrustBadge level={task.required_trust_level} />
              <div className="text-xs text-gray-500">
                {trustInfo.description} — {trustInfo.requirements.join(', ')}
              </div>
            </div>
          </div>

          {/* Apply form */}
          {!applied ? (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Offer to help</h3>
              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <label htmlFor="apply-msg" className="label">Introduce yourself (optional)</label>
                  <textarea
                    id="apply-msg"
                    className="input min-h-[90px] resize-none"
                    placeholder="Tell them a bit about yourself and why you'd like to help..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={400}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{message.length}/400</div>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center gap-2"
                  disabled={applying}
                >
                  {applying ? <><span className="animate-spin">◌</span> Sending...</> : '🤝 Offer to help'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-5 border-green-200 bg-green-50 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-semibold text-green-700">You offered to help!</p>
              <p className="text-sm text-green-600 mt-1">{task.creator?.name?.split(' ')[0]} will reach out if they pick you.</p>
            </div>
          )}
        </div>

        {/* Sidebar — Creator profile */}
        <aside className="space-y-4">
          {task.creator && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Posted by</h3>
              <Link href={`/profile/${task.creator.id}`} className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
                <Avatar src={task.creator.avatar_url} name={task.creator.name} size="lg" />
                <div>
                  <div className="font-semibold text-gray-900">{task.creator.name}</div>
                  <div className="text-xs text-gray-500">{task.creator.neighborhood}</div>
                </div>
              </Link>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Trust</span>
                  <TrustBadge level={task.creator.trust_level} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Rating</span>
                  <StarRating rating={task.creator.rating_avg} count={task.creator.rating_count} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tasks done</span>
                  <span className="font-medium text-gray-900">{task.creator.tasks_completed}</span>
                </div>
                {task.creator.languages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Languages</span>
                    <span className="text-xs text-gray-700">{task.creator.languages.map(l => l.toUpperCase()).join(', ')}</span>
                  </div>
                )}
              </div>

              <Link
                href={`/profile/${task.creator.id}`}
                className="mt-4 text-xs text-clutch-600 hover:underline block text-center"
              >
                View full profile →
              </Link>
            </div>
          )}

          {/* Reviews */}
          {creatorReviews.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent reviews</h3>
              <div className="space-y-3">
                {creatorReviews.map(review => (
                  <div key={review.id} className="text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-gray-400 ml-auto">{formatRelativeTime(review.created_at)}</span>
                    </div>
                    <p className="text-gray-600 italic">&ldquo;{review.comment}&rdquo;</p>
                    <div className="text-gray-400 mt-0.5">— {review.reviewer?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
