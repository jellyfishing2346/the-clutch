'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from 'shared'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export function useRealtimeTasks(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newCount, setNewCount] = useState(0)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  useEffect(() => {
    if (IS_DEMO) return

    const supabase = createClient()
    channelRef.current = supabase
      .channel('tasks-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const task = payload.new as Task
          setTasks(prev => {
            if (prev.some(t => t.id === task.id)) return prev
            return [task, ...prev]
          })
          setNewCount(n => n + 1)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          const updated = payload.new as Task
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        }
      )
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  function dismissNewCount() {
    setNewCount(0)
  }

  return { tasks, newCount, dismissNewCount }
}
