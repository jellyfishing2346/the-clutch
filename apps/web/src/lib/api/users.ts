import { createClient } from '@/lib/supabase/client'
import type { UserProfile, Review } from 'shared'
import { MOCK_USERS, MOCK_REVIEWS } from 'shared'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  if (IS_DEMO) {
    return MOCK_USERS.find(u => u.id === userId) ?? null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as UserProfile
}

export async function fetchHelpersBySkills(skillIds: string[], neighborhood: string): Promise<UserProfile[]> {
  if (IS_DEMO) {
    return MOCK_USERS.filter(u =>
      u.skills.some(s => skillIds.includes(s)) &&
      (u.neighborhood === neighborhood || true)
    ).slice(0, 3)
  }
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .overlaps('skills', skillIds)
    .eq('neighborhood', neighborhood)
    .order('tasks_completed', { ascending: false })
    .limit(3)
  if (error || !data?.length) {
    const { data: fallback } = await supabase
      .from('profiles')
      .select('*')
      .overlaps('skills', skillIds)
      .order('tasks_completed', { ascending: false })
      .limit(3)
    return (fallback ?? []) as UserProfile[]
  }
  return data as UserProfile[]
}

export async function fetchReviews(userId: string): Promise<Review[]> {
  const supabase = createClient()

  if (IS_DEMO) {
    return MOCK_REVIEWS.filter(r => r.reviewee_id === userId)
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles(*)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return []
  return data as Review[]
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return !error
}

export async function uploadAvatar(file: File): Promise<string | null> {
  if (IS_DEMO) return URL.createObjectURL(file)
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  if (uploadError) {
    console.error('uploadAvatar:', uploadError.message)
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

  const ok = await updateProfile({ avatar_url: avatarUrl })
  return ok ? avatarUrl : null
}
