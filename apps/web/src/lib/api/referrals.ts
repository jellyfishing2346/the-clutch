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
  if (IS_DEMO) {
    console.log('[Referral] Demo mode: returning true for referral code', referralCode)
    return true
  }
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('[Referral] No authenticated user found')
    return false
  }

  console.log('[Referral] Processing referral code', referralCode, 'for user', user.id)

  // Look up the referrer by their code
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (!referrer || referrer.id === user.id) {
    console.log('[Referral] Invalid referrer or self-referral', referrer?.id, user.id)
    return false
  }

  console.log('[Referral] Found referrer', referrer.id)

  // Record the referral (unique constraint on referred_id prevents double-counting)
  const { error: refError } = await supabase
    .from('referrals')
    .insert({ referrer_id: referrer.id, referred_id: user.id })

  if (refError) {
    console.log('[Referral] Failed to record referral:', refError.message)
    return false
  }

  console.log('[Referral] Referral recorded successfully')

  // Credit the referrer (+10 CR)
  const { error: referrerTxError } = await supabase.from('credits_transactions').insert({
    user_id: referrer.id,
    amount: 10,
    type: 'bonus',
    description: 'Referral bonus — a neighbor joined with your link',
  })
  if (referrerTxError) {
    console.log('[Referral] Failed to create referrer credit transaction:', referrerTxError.message)
    return false
  }

  const { error: referrerCreditError } = await supabase.rpc('increment_credits', { user_id: referrer.id, amount: 10 })
  if (referrerCreditError) {
    console.log('[Referral] Failed to increment referrer credits:', referrerCreditError.message)
    return false
  }

  console.log('[Referral] Credited referrer +10 credits')

  // Credit the new user (+10 CR welcome referral bonus, on top of signup bonus)
  const { error: userTxError } = await supabase.from('credits_transactions').insert({
    user_id: user.id,
    amount: 10,
    type: 'bonus',
    description: 'Joined via referral — welcome bonus',
  })
  if (userTxError) {
    console.log('[Referral] Failed to create user credit transaction:', userTxError.message)
    return false
  }

  const { error: userCreditError } = await supabase.rpc('increment_credits', { user_id: user.id, amount: 10 })
  if (userCreditError) {
    console.log('[Referral] Failed to increment user credits:', userCreditError.message)
    return false
  }

  console.log('[Referral] Credited new user +10 credits')

  const { error: profileError } = await supabase.from('profiles').update({ referred_by: referrer.id }).eq('id', user.id)
  if (profileError) {
    console.log('[Referral] Failed to update profile with referred_by:', profileError.message)
    return false
  }

  console.log('[Referral] Updated profile with referred_by')

  // Mark referral as credited
  const { error: creditError } = await supabase
    .from('referrals')
    .update({ credited_at: new Date().toISOString() })
    .eq('referred_id', user.id)
  if (creditError) {
    console.log('[Referral] Failed to mark referral as credited:', creditError.message)
    return false
  }

  console.log('[Referral] Referral processing completed successfully')
  return true
}