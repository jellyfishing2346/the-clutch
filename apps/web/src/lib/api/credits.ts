import { createClient } from '@/lib/supabase/client'
import type { CreditsTransaction } from 'shared'
import { MOCK_TRANSACTIONS } from 'shared'

export async function fetchCreditsBalance(userId: string): Promise<number> {
  const supabase = createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 145 // mock
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  if (error) return 0
  return (data as { credits_balance: number }).credits_balance
}

export async function fetchTransactions(userId: string): Promise<CreditsTransaction[]> {
  const supabase = createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return MOCK_TRANSACTIONS.filter(t => t.user_id === userId)
  }

  const { data, error } = await supabase
    .from('credits_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []
  return data as CreditsTransaction[]
}
