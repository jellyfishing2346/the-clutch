'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { TaskMap } from '@/components/map/TaskMap'
import { TaskCard } from '@/components/tasks/TaskCard'
import { fetchNearbyTasks } from '@/lib/api/tasks'
import { fetchCreditsBalance } from '@/lib/api/credits'
import { createClient } from '@/lib/supabase/client'
import type { Task } from 'shared'

export default function AppHomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    fetchNearbyTasks()
      .then(data => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false))
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) fetchCreditsBalance(user.id).then(setCredits).catch(console.error)
    })
  }, [])

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.payment_type === filter || t.category === filter)

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-96 md:shrink-0 flex flex-col bg-white border-r border-gray-100 overflow-hidden">
        {/* Credits banner */}
        <div className="px-4 py-3 gradient-brand text-white text-sm flex items-center justify-between">
          <span className="font-medium">
            ◈ {credits !== null ? credits : <span className="opacity-60">—</span>} credits
          </span>
          <Link href="/credits" className="text-white/80 hover:text-white text-xs underline">Earn more</Link>
        </div>

        {/* Filter chips */}
        <div className="px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { value: 'all', label: 'All tasks' },
            { value: 'credits', label: '◈ Credits' },
            { value: 'cash', label: '$ Cash' },
            { value: 'simple_help', label: '🤝 Simple' },
            { value: 'tech_help', label: '💻 Tech' },
            { value: 'moving', label: '🏠 Moving' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f.value
                  ? 'bg-clutch-600 text-white border-clutch-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-clutch-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <>
              <div className="h-5 w-28 bg-gray-100 rounded animate-pulse mb-2" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-gray-900">{filtered.length} tasks nearby</h2>
                <span className="text-xs text-gray-400">NYC</span>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400">No tasks found.</p>
                  <Link href="/tasks/new" className="text-xs text-clutch-600 hover:underline mt-1 inline-block">
                    Post the first one →
                  </Link>
                </div>
              ) : (
                filtered.map(task => (
                  <div
                    key={task.id}
                    className={`transition-all ${selectedTask?.id === task.id ? 'ring-2 ring-clutch-400 rounded-2xl' : ''}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <TaskCard task={task} compact />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative hidden md:block">
        <TaskMap
          tasks={filtered}
          onTaskSelect={setSelectedTask}
          selectedTaskId={selectedTask?.id}
          height="100%"
        />

        {selectedTask && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 z-10">
            <div className="card p-4 shadow-xl animate-slide-up">
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
                aria-label="Close"
              >×</button>
              <TaskCard task={selectedTask} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile map notice */}
      <div className="md:hidden px-4 py-2">
        <div className="bg-clutch-50 rounded-xl p-3 text-center text-sm text-clutch-600">
          🗺️ Map view available on desktop
        </div>
      </div>
    </div>
  )
}
