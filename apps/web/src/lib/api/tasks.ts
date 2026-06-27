import { createClient } from '@/lib/supabase/client'
import { CREDITS_CONFIG } from 'shared'
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

  let tasks = data as Task[]

  // Filter and sort by distance if location parameters are provided
  if (opts.near && opts.radiusKm) {
    tasks = tasks
      .filter(task => {
        const distance = calculateDistance(
          opts.near!.lat,
          opts.near!.lng,
          task.location.lat,
          task.location.lng
        )
        return distance <= opts.radiusKm!
      })
      .sort((a, b) => {
        const distA = calculateDistance(opts.near!.lat, opts.near!.lng, a.location.lat, a.location.lng)
        const distB = calculateDistance(opts.near!.lat, opts.near!.lng, b.location.lat, b.location.lng)
        return distA - distB
      })
  }

  return tasks
}

// Haversine formula to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
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
  if (IS_DEMO) return { id: 'mock-task-id' }
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
  if (IS_DEMO) return true
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

  const { data: task } = await supabase
    .from('tasks')
    .select('payment_type, credits_amount, creator_id')
    .eq('id', taskId)
    .single()

  if (!task || task.creator_id !== user.id) return null

  // If this is a credits task, confirm the creator can actually afford it
  // before accepting — avoids accepting then silently failing to pay.
  if (task.payment_type === 'credits' && task.credits_amount) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()
    if (!profile || profile.credits_balance < task.credits_amount) return null
  }

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

  // Deduct credits from the creator now; paid out to the helper on completion
  if (task.payment_type === 'credits' && task.credits_amount) {
    await supabase.rpc('increment_credits', { user_id: user.id, amount: -task.credits_amount })
    await supabase.from('credits_transactions').insert({
      user_id: user.id,
      amount: -task.credits_amount,
      type: 'spent',
      description: 'Task accepted — credits committed to helper',
      task_id: taskId,
    })
  }

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
    .select('id, participant_ids')
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: task } = await supabase
    .from('tasks')
    .select('creator_id, payment_type, credits_amount')
    .eq('id', taskId)
    .single()

  if (!task || task.creator_id !== user.id) return false

  const { data: accepted } = await supabase
    .from('task_applications')
    .select('applicant_id')
    .eq('task_id', taskId)
    .eq('status', 'accepted')
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', taskId)

  if (error) return false

  if (accepted?.applicant_id) {
    const helperId = accepted.applicant_id

    if (task.payment_type === 'credits' && task.credits_amount) {
      await supabase.rpc('increment_credits', { user_id: helperId, amount: task.credits_amount })
      await supabase.from('credits_transactions').insert({
        user_id: helperId,
        amount: task.credits_amount,
        type: 'earned',
        description: 'Completed a credits task',
        task_id: taskId,
      })
    } else if (task.payment_type === 'free') {
      await supabase.rpc('increment_credits', { user_id: helperId, amount: CREDITS_CONFIG.earnPerHelpTask })
      await supabase.from('credits_transactions').insert({
        user_id: helperId,
        amount: CREDITS_CONFIG.earnPerHelpTask,
        type: 'earned',
        description: 'Helped with a free task',
        task_id: taskId,
      })
    }

    // tasks_completed was never being incremented anywhere, which also meant
    // maybe_upgrade_trust's thresholds could never be hit — fixed here.
    await supabase.rpc('increment_tasks_completed', { user_id: helperId })
    await supabase.rpc('maybe_upgrade_trust', { p_user_id: helperId })
  }

  return true
}
