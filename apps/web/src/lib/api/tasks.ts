import { createClient } from '@/lib/supabase/client'
import type { Task, TaskCategory, PaymentType, GeoPoint } from 'shared'

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

export async function applyToTask(taskId: string, message: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('task_applications')
    .insert({ task_id: taskId, applicant_id: user.id, message })

  return !error
}
