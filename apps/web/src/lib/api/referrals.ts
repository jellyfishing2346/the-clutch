import { createClient } from '@/lib/supabase/client'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function fetchReferralCode(userId: string): Promise<string | null> {
  if (IS_DEMO) return 'DEMO1234'
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single()
  return data?.referral_code ?? null
}

export async function fetchReferralCount(userId: string): Promise<number> {
  if (IS_DEMO) return 3
  const supabase = createClient()
  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
  return count ?? 0
}

export async function processReferral(referralCode: string): Promise<boolean> {
  if (IS_DEMO) return true
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Look up the referrer by their code
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (!referrer || referrer.id === user.id) return false

  // Record the referral (unique constraint on referred_id prevents double-counting)
  const { error: refError } = await supabase
    .from('referrals')
    .insert({ referrer_id: referrer.id, referred_id: user.id })

  if (refError) return false

  // Credit the referrer (+10 CR)
  await supabase.from('credits_transactions').insert({
    user_id: referrer.id,
    amount: 10,
    type: 'bonus',
    description: 'Referral bonus — a neighbor joined with your link',
  })
  await supabase.from('profiles').update({
    credits_balance: supabase.rpc('increment', { x: 10 }),
  }).eq('id', referrer.id)

  // Credit the new user (+10 CR welcome referral bonus, on top of signup bonus)
  await supabase.from('credits_transactions').insert({
    user_id: user.id,
    amount: 10,
    type: 'bonus',
    description: 'Joined via referral — welcome bonus',
  })
  await supabase.from('profiles').update({
    credits_balance: supabase.rpc('increment', { x: 10 }),
    referred_by: referrer.id,
  }).eq('id', user.id)

  // Mark referral as credited
  await supabase
    .from('referrals')
    .update({ credited_at: new Date().toISOString() })
    .eq('referred_id', user.id)

  return true
}
