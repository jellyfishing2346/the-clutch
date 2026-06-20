import { createClient } from '@/lib/supabase/client'
import type { Review } from 'shared'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function submitReview(
  taskId: string,
  revieweeId: string,
  rating: number,
  comment: string
): Promise<boolean> {
  if (IS_DEMO) return false
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('reviews')
    .insert({
      task_id: taskId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment,
    })

  return !error
}

export async function fetchMyReviewForTask(taskId: string): Promise<Review | null> {
  if (IS_DEMO) return null
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('task_id', taskId)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  return data as Review | null
}
