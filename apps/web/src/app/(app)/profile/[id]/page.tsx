'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { StarRating } from '@/components/ui/StarRating'
import { TaskCard } from '@/components/tasks/TaskCard'
import { fetchProfile, fetchReviews, updateProfile } from '@/lib/api/users'
import { fetchTasksByUser } from '@/lib/api/tasks'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { TRUST_LEVELS, SUPPORTED_LANGUAGES, BOROUGHS, NEIGHBORHOODS, SKILLS } from 'shared'
import type { UserProfile, Review, Task } from 'shared'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [postedTasks, setPostedTasks] = useState<Task[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [discardWarning, setDiscardWarning] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', bio: '', borough: '', neighborhood: '', languages: [] as string[], skills: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    Promise.all([
      fetchProfile(id),
      fetchReviews(id),
      fetchTasksByUser(id),
      createClient().auth.getUser(),
    ]).then(([profile, revs, tasks, { data: { user: authUser } }]) => {
      setUser(profile)
      setReviews(revs)
      setPostedTasks(tasks.slice(0, 3))
      setCurrentUserId(authUser?.id ?? null)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user && !isEditing) {
      setEditForm({
        name: user.name,
        bio: user.bio ?? '',
        borough: user.borough ?? '',
        neighborhood: user.neighborhood ?? '',
        languages: user.languages ?? [],
        skills: user.skills ?? [],
      })
    }
  }, [user, isEditing])

  const isDirty = user && (
    editForm.name !== user.name ||
    editForm.bio !== (user.bio ?? '') ||
    editForm.borough !== (user.borough ?? '') ||
    editForm.neighborhood !== (user.neighborhood ?? '') ||
    JSON.stringify(editForm.languages) !== JSON.stringify(user.languages ?? []) ||
    JSON.stringify(editForm.skills) !== JSON.stringify(user.skills ?? [])
  )

  function handleCloseModal() {
    if (isDirty) {
      setDiscardWarning(true)
      return
    }
    setIsEditing(false)
    setDiscardWarning(false)
  }

  function handleDiscardConfirm() {
    setIsEditing(false)
    setDiscardWarning(false)
  }

  function toggleLanguage(code: string) {
    setEditForm(p => ({
      ...p,
      languages: p.languages.includes(code)
        ? p.languages.filter(l => l !== code)
        : [...p.languages, code],
    }))
  }

  function toggleSkill(id: string) {
    setEditForm(p => ({
      ...p,
      skills: p.skills.includes(id)
        ? p.skills.filter(s => s !== id)
        : [...p.skills, id],
    }))
  }

  async function handleSaveProfile(e: React.FormEvent) {
  e.preventDefault()
  setSaving(true)
  setSaveError('')
  const ok = await updateProfile({
    name: editForm.name,
    bio: editForm.bio || null,
    borough: editForm.borough || null,
    neighborhood: editForm.neighborhood || null,
    languages: editForm.languages,
    skills: editForm.skills,
  })
  if (ok) {
    setUser(prev => prev ? {
      ...prev,
      name: editForm.name,
      bio: editForm.bio || null,
      borough: editForm.borough || null,
      neighborhood: editForm.neighborhood || null,
      languages: editForm.languages,
      skills: editForm.skills,
    } : prev)
    setIsEditing(false)
    setDiscardWarning(false)
  } else {
    setSaveError('Failed to save changes. Please try again.')
  }
  setSaving(false)
}

  function handleAvatarUploaded(url: string) {
    setUser(prev => prev ? { ...prev, image_url: url } : prev)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-5" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="card p-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse mx-auto mb-3" />
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mx-auto mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mx-auto" />
            </div>
            <div className="h-36 card animate-pulse" />
          </div>
          <div className="md:col-span-2 space-y-5">
            <div className="h-48 card animate-pulse" />
            <div className="h-32 card animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">User not found.</p>
        <Link href="/home" className="text-clutch-600 hover:underline text-sm mt-2 inline-block">← Back</Link>
      </div>
    )
  }

  const isMe = currentUserId === id
  const trustInfo = TRUST_LEVELS[user.trust_level]
  const editNeighborhoods = editForm.borough
    ? NEIGHBORHOODS[editForm.borough as keyof typeof NEIGHBORHOODS] ?? []
    : []
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
            <Avatar src={user.avatar_url} name={user.name} size="xl" className="mx-auto mb-3" priority />
            <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
            {(user.neighborhood || user.borough) && (
              <div className="text-sm text-gray-500 mb-3">
                {[user.neighborhood, user.borough].filter(Boolean).join(', ')}
              </div>
            )}
            <div className="flex justify-center mb-3">
              <TrustBadge level={user.trust_level} />
            </div>
            <StarRating rating={user.rating_avg} count={user.rating_count} size="md" />
            {user.bio && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{user.bio}</p>
            )}
            {isMe && (
              <div className="mt-4 space-y-2">
                <button onClick={() => setIsEditing(true)} className="btn-secondary w-full text-sm py-2">
                  Edit profile
                </button>
                <button onClick={handleLogout} className="w-full text-sm py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium">
                  Sign out
                </button>
              </div>
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

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map(skillId => {
                  const skill = SKILLS.find(s => s.id === skillId)
                  return skill ? (
                    <span key={skillId} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100">
                      {skill.label}
                    </span>
                  ) : null
                })}
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
          {/* Reviews */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
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

          {/* Posted tasks */}
          {postedTasks.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Posted tasks</h2>
              <div className="space-y-3">
                {postedTasks.map(task => (
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

      {/* Edit profile modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) handleCloseModal() }}
        >
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit profile</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">✕</button>
            </div>

            <div className="flex justify-center mb-4">
              <AvatarUpload currentSrc={user.avatar_url} name={user.name} onUploaded={handleAvatarUploaded} />
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  required
                  maxLength={80}
                />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input resize-none min-h-[90px]"
                  placeholder="Tell your neighbors a bit about yourself..."
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  maxLength={300}
                />
                <div className="text-right text-xs text-gray-400 mt-1">{editForm.bio.length}/300</div>
              </div>

              <div>
                <label className="label">Borough</label>
                <select
                  className="input"
                  value={editForm.borough}
                  onChange={e => setEditForm(p => ({ ...p, borough: e.target.value, neighborhood: '' }))}
                >
                  <option value="">Select borough...</option>
                  {BOROUGHS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {editNeighborhoods.length > 0 && (
                <div>
                  <label className="label">Neighborhood</label>
                  <select
                    className="input"
                    value={editForm.neighborhood}
                    onChange={e => setEditForm(p => ({ ...p, neighborhood: e.target.value }))}
                  >
                    <option value="">Select neighborhood...</option>
                    {editNeighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleLanguage(lang.code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        editForm.languages.includes(lang.code)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Skills</label>
                <p className="text-xs text-gray-400 mb-2">Select what you can help neighbors with.</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        editForm.skills.includes(skill.id)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {skill.label}
                    </button>
                  ))}
                </div>
              </div>
                {saveError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {saveError}
                </p>
              )}

              {discardWarning ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <p className="text-sm text-amber-800 font-medium mb-2">Discard unsaved changes?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscardWarning(false)}
                      className="btn-secondary flex-1 text-xs py-1.5"
                    >
                      Keep editing
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscardConfirm}
                      className="flex-1 text-xs py-1.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={saving || !editForm.name.trim()}
                  >
                    {saving ? <><span className="animate-spin inline-block">◌</span> Saving...</> : 'Save changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
