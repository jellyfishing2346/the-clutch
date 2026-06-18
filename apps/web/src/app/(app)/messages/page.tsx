'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { fetchConversations } from '@/lib/api/messages'
import { formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Conversation } from 'shared'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
    fetchConversations()
      .then(setConversations)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
      <p className="text-gray-500 text-sm mb-6">Conversations with helpers and task posters.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 card animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="font-semibold text-gray-900 mb-1">No messages yet</p>
          <p className="text-sm text-gray-500 mb-4">Accept a helper on one of your tasks to start a conversation.</p>
          <Link href="/tasks" className="btn-primary text-sm py-2 px-5 inline-flex">Browse tasks</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => {
            const other = conv.participants?.find(p => p.id !== currentUserId)
            const lastMsg = conv.last_message
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="card p-4 flex items-center gap-3 hover:border-clutch-200 transition-colors"
              >
                <Avatar src={other?.avatar_url ?? null} name={other?.name ?? '?'} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 text-sm truncate">{other?.name ?? 'Unknown'}</span>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(lastMsg.created_at)}</span>
                    )}
                  </div>
                  {conv.task && (
                    <div className="text-xs text-clutch-600 font-medium truncate">re: {conv.task.title}</div>
                  )}
                  {lastMsg ? (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.content}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-0.5">No messages yet — say hi!</p>
                  )}
                </div>
                <span className="text-gray-300 shrink-0">→</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
