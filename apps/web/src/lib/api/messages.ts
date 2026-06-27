import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message, UserProfile } from 'shared'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function fetchConversations(): Promise<Conversation[]> {
  if (IS_DEMO) return []
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('conversations')
    .select('*, task:tasks(id, title, status), last_message:messages(id, content, created_at, sender_id)')
    .contains('participant_ids', [user.id])
    .order('created_at', { ascending: false })
    .order('created_at', { foreignTable: 'last_message', ascending: false })
    .limit(1, { foreignTable: 'last_message' })

  if (error || !data) return []

  // participant_ids is a plain UUID[] column (no real FK), so participants
  // have to be resolved with a separate profiles lookup rather than an embed.
  const otherIds = Array.from(new Set(
    data.flatMap(c => (c.participant_ids as string[]).filter(pid => pid !== user.id))
  ))

  const { data: profiles } = otherIds.length
    ? await supabase.from('profiles').select('*').in('id', otherIds)
    : { data: [] as UserProfile[] }

  return data.map(c => ({
    ...c,
    participant_ids: c.participant_ids as string[],
    last_message: Array.isArray(c.last_message) ? (c.last_message[0] ?? null) : c.last_message,
    participants: (c.participant_ids as string[])
      .map(pid => profiles?.find(p => p.id === pid))
      .filter((p): p is UserProfile => !!p),
  })) as Conversation[]
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (IS_DEMO) return []
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(id, name, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return []
  return data as Message[]
}

export async function sendMessage(conversationId: string, content: string): Promise<boolean> {
  if (IS_DEMO) return false
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, content })

  return !error
}

export async function fetchConversationById(id: string): Promise<Conversation | null> {
  if (IS_DEMO) return null
  const supabase = createClient()

  const { data: conv, error } = await supabase
    .from('conversations')
    .select('*, task:tasks(id, title, status, creator_id)')
    .eq('id', id)
    .single()

  if (error || !conv) return null

  const { data: participants } = await supabase
    .from('profiles')
    .select('*')
    .in('id', conv.participant_ids)

  return { ...conv, participant_ids: conv.participant_ids as string[], participants: participants ?? [] } as Conversation
}