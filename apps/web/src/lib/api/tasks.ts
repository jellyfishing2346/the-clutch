import { createClient } from '@/lib/supabase/client'
import type { Task, TaskApplication, TaskCategory, PaymentType, GeoPoint } from 'shared'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

interface FetchTasksOptions {
  category?: TaskCategory
  paymentType?: PaymentType
  borough?: string
  near?: GeoPoint
  radiusKm?: number
}

export async function fetchNearbyTasks(opts: FetchTasksOptions = {}): Promise<Task[]> {
  if (IS_DEMO) return []
  const supabase = createClient()

  let query = supabase
    .from('tasks')
    .select('*, creator:profiles(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50)

  if (opts.category) query = query.eq('category', opts.category)
  if (opts.paymentType) query = query.eq('payment_type', opts.paymentType)
  if (opts.borough) query = query.eq('borough', opts.borough)

  const { data, error } = await query
  if (error) {
    console.error('fetchNearbyTasks:', error.message)
    return []
  }
  return data as Task[]
}

export async function fetchTasksByUser(userId: string): Promise<Task[]> {
  if (IS_DEMO) return []
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, creator:profiles(*)')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('fetchTasksByUser:', error.message)
    return []
  }
  return data as Task[]
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  if (IS_DEMO) return null
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, creator:profiles(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Task
}

interface CreateTaskPayload {
  title: string
  description: string
  category: TaskCategory
  location: GeoPoint
  address: string
  neighborhood: string
  borough: string
  paymentType: PaymentType
  paymentAmount?: number
  creditsAmount?: number
  scheduledFor?: string
}

export async function createTask(payload: CreateTaskPayload): Promise<{ id: string } | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      creator_id: user.id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      location: { lat: payload.location.lat, lng: payload.location.lng },
      address: payload.address,
      neighborhood: payload.neighborhood,
      borough: payload.borough,
      payment_type: payload.paymentType,
      payment_amount: payload.paymentAmount ?? null,
      credits_amount: payload.creditsAmount ?? null,
      scheduled_for: payload.scheduledFor ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createTask:', error.message)
    return null
  }

  return data
}

export async function cancelTask(taskId: string): Promise<boolean> {
  if (IS_DEMO) return false
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'cancelled' })
    .eq('id', taskId)
    .eq('creator_id', user.id)

  return !error
}

export async function applyToTask(taskId: string, message: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('task_applications')
    .insert({ task_id: taskId, applicant_id: user.id, message })

  return !error
}

export async function fetchApplications(taskId: string): Promise<TaskApplication[]> {
  if (IS_DEMO) return []
  const supabase = createClient()

  const { data, error } = await supabase
    .from('task_applications')
    .select('*, applicant:profiles(*)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data as TaskApplication[]
}

export async function acceptApplication(appId: string, taskId: string, applicantId: string): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Accept this application
  const { error: accErr } = await supabase
    .from('task_applications')
    .update({ status: 'accepted' })
    .eq('id', appId)

  if (accErr) return null

  // Reject all others
  await supabase
    .from('task_applications')
    .update({ status: 'rejected' })
    .eq('task_id', taskId)
    .neq('id', appId)

  // Move task to in_progress
  await supabase
    .from('tasks')
    .update({ status: 'in_progress' })
    .eq('id', taskId)

  // Create or find conversation between poster and helper
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('task_id', taskId)
    .single()

  if (existing?.id) return existing.id

  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .insert({ task_id: taskId, participant_ids: [user.id, applicantId] })
    .select('id')
    .single()

  if (convErr) return null
  return conv.id
}

export async function rejectApplication(appId: string): Promise<boolean> {
  if (IS_DEMO) return false
  const supabase = createClient()
  const { error } = await supabase
    .from('task_applications')
    .update({ status: 'rejected' })
    .eq('id', appId)
  return !error
}

export async function completeTask(taskId: string): Promise<boolean> {
  if (IS_DEMO) return false
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', taskId)
  return !error
}
