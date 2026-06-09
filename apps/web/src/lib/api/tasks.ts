import { createClient } from '@/lib/supabase/client'
import type { Task, TaskCategory, PaymentType, GeoPoint } from 'shared'
import { MOCK_TASKS } from 'shared'

interface FetchTasksOptions {
  category?: TaskCategory
  paymentType?: PaymentType
  borough?: string
  near?: GeoPoint
  radiusKm?: number
}

export async function fetchNearbyTasks(opts: FetchTasksOptions = {}): Promise<Task[]> {
  const supabase = createClient()

  // Use Supabase RPC if env vars are set, else fall back to mock data
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return MOCK_TASKS

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
    console.warn('fetchNearbyTasks: falling back to mock data')
    return MOCK_TASKS
  }

  return data as Task[]
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  const supabase = createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_TASKS.find(t => t.id === id) ?? null
  }

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
      location: `POINT(${payload.location.lng} ${payload.location.lat})`,
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
    console.warn('createTask error:', error)
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
