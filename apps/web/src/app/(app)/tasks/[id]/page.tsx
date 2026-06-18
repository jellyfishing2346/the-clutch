'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { StarRating } from '@/components/ui/StarRating'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { fetchTaskById, applyToTask, fetchApplications, acceptApplication, rejectApplication, completeTask } from '@/lib/api/tasks'
import { fetchReviews, fetchHelpersBySkills } from '@/lib/api/users'
import { formatRelativeTime } from '@/lib/utils'
import { TASK_CATEGORIES, TRUST_LEVELS, SUPPORTED_LANGUAGES, SKILLS } from 'shared'
import type { Task, Review, UserProfile, TaskApplication } from 'shared'
import { createClient } from '@/lib/supabase/client'

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [creatorReviews, setCreatorReviews] = useState<Review[]>([])
  const [matchingHelpers, setMatchingHelpers] = useState<UserProfile[]>([])
  const [applications, setApplications] = useState<TaskApplication[]>([])
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    fetchTaskById(id)
      .then(data => {
        setTask(data)
        if (data?.creator_id) {
          fetchReviews(data.creator_id)
            .then(reviews => setCreatorReviews(reviews.slice(0, 3)))
            .catch(console.error)
        }
        if (data?.category && data?.neighborhood) {
          const skillIds = SKILLS
            .filter(s => s.category === data.category)
            .map(s => s.id)
          if (skillIds.length > 0) {
            fetchHelpersBySkills(skillIds, data.neighborhood)
              .then(helpers => setMatchingHelpers(helpers.filter(h => h.id !== data.creator_id)))
              .catch(console.error)
          }
        }
        fetchApplications(data?.id ?? id).then(setApplications).catch(console.error)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleAccept(appId: string, applicantId: string) {
    if (!task) return
    setActionLoading(appId)
    const convId = await acceptApplication(appId, task.id, applicantId)
    if (convId) {
      setTask(t => t ? { ...t, status: 'in_progress' } : t)
      setApplications(prev => prev.map(a =>
        a.id === appId ? { ...a, status: 'accepted' } :
        a.status === 'pending' ? { ...a, status: 'rejected' } : a
      ))
      window.location.href = `/messages/${convId}`
    }
    setActionLoading(null)
  }

  async function handleReject(appId: string) {
    setActionLoading(appId)
    await rejectApplication(appId)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a))
    setActionLoading(null)
  }

  async function handleComplete() {
    if (!task) return
    setActionLoading('complete')
    await completeTask(task.id)
    setTask(t => t ? { ...t, status: 'completed' } : t)
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-5" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div className="h-48 card animate-pulse" />
            <div className="h-20 card animate-pulse" />
            <div className="h-36 card animate-pulse" />
          </div>
          <div className="h-64 card animate-pulse" />
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Task not found.</p>
        <Link href="/tasks" className="text-clutch-600 hover:underline text-sm mt-2 inline-block">← Back to tasks</Link>
      </div>
    )
  }

  const category = TASK_CATEGORIES[task.category]
  const trustInfo = TRUST_LEVELS[task.required_trust_level]

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!task) return
    setApplying(true)
    setApplyError('')
    const ok = await applyToTask(task.id, message)
    if (ok) {
      setApplied(true)
    } else {
      setApplyError('Something went wrong. You may have already applied, or the task is no longer available.')
    }
    setApplying(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
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

          {/* Applicants panel — only visible to the task creator */}
          {currentUserId === task.creator_id && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  People who offered to help ({applications.length})
                </h3>
                {task.status === 'in_progress' && (
                  <button
                    onClick={handleComplete}
                    disabled={actionLoading === 'complete'}
                    className="text-xs btn-primary py-1.5 px-4"
                  >
                    {actionLoading === 'complete' ? '◌ Saving...' : '✓ Mark complete'}
                  </button>
                )}
                {task.status === 'completed' && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    ✓ Completed
                  </span>
                )}
              </div>

              {applications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No one has offered to help yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                      app.status === 'accepted' ? 'bg-green-50 border-green-200' :
                      app.status === 'rejected' ? 'bg-gray-50 border-gray-100 opacity-60' :
                      'bg-white border-gray-200'
                    }`}>
                      <Avatar src={app.applicant?.avatar_url ?? null} name={app.applicant?.name ?? '?'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/profile/${app.applicant_id}`} className="text-sm font-medium text-gray-900 hover:text-clutch-600">
                            {app.applicant?.name ?? 'Unknown'}
                          </Link>
                          {app.applicant && <TrustBadge level={app.applicant.trust_level} size="sm" />}
                          {app.applicant && <StarRating rating={app.applicant.rating_avg} count={app.applicant.rating_count} size="sm" />}
                        </div>
                        {app.message && (
                          <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{app.message}&rdquo;</p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{formatRelativeTime(app.created_at)}</div>
                      </div>
                      <div className="shrink-0 flex flex-col gap-1.5">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(app.id, app.applicant_id)}
                              disabled={actionLoading === app.id}
                              className="text-xs bg-clutch-600 text-white px-3 py-1.5 rounded-lg hover:bg-clutch-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === app.id ? '◌' : '✓ Accept'}
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              disabled={actionLoading === app.id}
                              className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {app.status === 'accepted' && (
                          <Link href={`/messages`} className="text-xs text-green-700 font-medium bg-green-100 px-3 py-1.5 rounded-lg">
                            💬 Message
                          </Link>
                        )}
                        {app.status === 'rejected' && (
                          <span className="text-xs text-gray-400">Declined</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                {applyError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{applyError}</p>
                )}
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
              <p className="text-sm text-green-600 mt-1">
                {task.creator?.name?.split(' ')[0] ?? 'The poster'} will reach out if they pick you.
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <Link href="/tasks" className="btn-secondary text-sm py-2 px-4">
                  Browse more tasks
                </Link>
                <Link href="/credits" className="btn-ghost text-sm py-2 px-4">
                  View my credits
                </Link>
              </div>
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
                    <span className="text-xs text-gray-700">
                      {task.creator.languages.map(code =>
                        SUPPORTED_LANGUAGES.find(l => l.code === code)?.label ?? code
                      ).join(', ')}
                    </span>
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

          {/* Matching helpers */}
          {matchingHelpers.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Neighbors who can help</h3>
              <p className="text-xs text-gray-400 mb-3">
                People in {task.neighborhood} with matching skills.
              </p>
              <div className="space-y-3">
                {matchingHelpers.map(helper => {
                  const helperSkills = SKILLS.filter(s =>
                    helper.skills.includes(s.id) && s.category === task.category
                  )
                  return (
                    <Link
                      key={helper.id}
                      href={`/profile/${helper.id}`}
                      className="flex items-start gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar src={helper.avatar_url} name={helper.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{helper.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <TrustBadge level={helper.trust_level} size="sm" />
                          <StarRating rating={helper.rating_avg} size="sm" />
                        </div>
                        {helperSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {helperSkills.slice(0, 2).map(s => (
                              <span key={s.id} className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded-full border border-orange-100">
                                {s.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
