'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { StarRating } from '@/components/ui/StarRating'
import { TaskCard } from '@/components/tasks/TaskCard'
import { MOCK_USERS, MOCK_TASKS, MOCK_REVIEWS } from '@/lib/mock-data'
import { fetchProfile, fetchReviews } from '@/lib/api/users'
import { fetchNearbyTasks } from '@/lib/api/tasks'
import { formatRelativeTime } from '@/lib/utils'
import { TRUST_LEVELS, SUPPORTED_LANGUAGES } from 'shared'
import type { UserProfile, Review, Task } from 'shared'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<UserProfile | null>(
    MOCK_USERS.find(u => u.id === id) ?? null
  )
  const [reviews, setReviews] = useState<Review[]>(
    MOCK_REVIEWS.filter(r => r.reviewee_id === id)
  )
  const [completedTasks, setCompletedTasks] = useState<Task[]>(
    MOCK_TASKS.filter(t => t.creator_id === id).slice(0, 3)
  )

  useEffect(() => {
    fetchProfile(id).then(data => { if (data) setUser(data) })
    fetchReviews(id).then(setReviews)
    fetchNearbyTasks().then(tasks =>
      setCompletedTasks(tasks.filter(t => t.creator_id === id).slice(0, 3))
    )
  }, [id])

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">User not found.</p>
        <Link href="/home" className="text-clutch-600 hover:underline text-sm mt-2 inline-block">← Back</Link>
      </div>
    )
  }

  const isMe = user.id === 'u1'
  const trustInfo = TRUST_LEVELS[user.trust_level]

  const langLabels = user.languages.map(
    code => SUPPORTED_LANGUAGES.find(l => l.code === code)?.label ?? code
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/home" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-clutch-600 mb-5 transition-colors">
        ← Back
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="md:col-span-1 space-y-4">
          <div className="card p-6 text-center">
            <Avatar src={user.avatar_url} name={user.name} size="xl" className="mx-auto mb-3" />
            <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
            <div className="text-sm text-gray-500 mb-3">{user.neighborhood}, {user.borough}</div>

            <div className="flex justify-center mb-3">
              <TrustBadge level={user.trust_level} />
            </div>

            <StarRating rating={user.rating_avg} count={user.rating_count} size="md" />

            {user.bio && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{user.bio}</p>
            )}

            {isMe && (
              <button className="btn-secondary w-full mt-4 text-sm py-2">Edit profile</button>
            )}
          </div>

          {/* Stats */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tasks done', value: user.tasks_completed },
                { label: 'Tasks posted', value: user.tasks_posted },
                { label: 'Credits', value: isMe ? user.credits_balance : '—' },
                { label: 'Reviews', value: user.rating_count },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-clutch-600">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          {langLabels.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-1.5">
                {langLabels.map(lang => (
                  <span key={lang} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-100">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trust info */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Trust level</h3>
            <div className="space-y-1.5">
              {trustInfo.requirements.map(req => (
                <div key={req} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span> {req}
                </div>
              ))}
              {user.is_id_verified && (
                <div className="flex items-center gap-2 text-xs text-green-700 font-medium mt-2">
                  <span>✓</span> ID Verified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-5">
          {/* Recent reviews */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Reviews ({reviews.length})
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      {review.reviewer && (
                        <Avatar src={review.reviewer.avatar_url} name={review.reviewer.name} size="xs" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{review.reviewer?.name}</span>
                          <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">&ldquo;{review.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            )}
          </div>

          {/* Recent tasks */}
          {completedTasks.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Recent tasks</h2>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          <div className="text-center text-xs text-gray-400">
            Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  )
}