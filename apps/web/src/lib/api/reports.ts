import { createClient } from '@/lib/supabase/client'
import type { Report, ReportTargetType, ReportReason } from 'shared'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function createReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason,
  description?: string
): Promise<Report | null> {
  if (IS_DEMO) return null

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc('create_report', {
    p_reporter_id: user.id,
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
    p_description: description || null,
  })

  if (error) {
    console.error('Create report error:', error.message)
    return null
  }

  // Fetch the created report
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', data)
    .single()

  return report as Report | null
}

export async function fetchMyReports(): Promise<Report[]> {
  if (IS_DEMO) return []

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false })

  return (data as Report[]) ?? []
}
