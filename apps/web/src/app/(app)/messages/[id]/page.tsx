'use client'

import { useState, useEffect, use, useRef } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { fetchMessages, sendMessage } from '@/lib/api/messages'
import { formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Message } from 'shared'

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [taskTitle, setTaskTitle] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null))

    // Fetch conversation metadata + messages
   supabase.from('conversations').select('task_id, task:tasks(title)').eq('id', id).single()
  .then(({ data }) => {
    if (data?.task_id) setTaskId(data.task_id)
    const taskData = data?.task as unknown as { title: string } | { title: string }[] | null | undefined
    const task = Array.isArray(taskData) ? taskData[0] : taskData
    if (task?.title) setTaskTitle(task.title)
  })

    fetchMessages(id).then(setMessages).finally(() => setLoading(false))

    // Subscribe to new messages in real time
    const channel = supabase
      .channel(`conv-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        payload => {
          const msg = payload.new as Message
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: id,
      sender_id: currentUserId ?? '',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])
    await sendMessage(id, content)
    setSending(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link href="/messages" className="text-gray-400 hover:text-gray-600 text-sm">←</Link>
        <div className="flex-1 min-w-0">
          {taskTitle && taskId ? (
            <Link href={`/tasks/${taskId}`} className="text-sm font-semibold text-clutch-600 hover:underline truncate block">
              📋 {taskTitle}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-gray-900">Conversation</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className={`h-10 rounded-2xl bg-gray-100 animate-pulse w-2/3 ${i % 2 === 0 ? 'ml-auto' : ''}`} />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <Avatar src={msg.sender?.avatar_url ?? null} name={msg.sender?.name ?? '?'} size="xs" />
                )}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-clutch-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400">{formatRelativeTime(msg.created_at)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-gray-100 shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 input py-2.5 text-sm"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
