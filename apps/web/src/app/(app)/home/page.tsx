'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TaskMap } from '@/components/map/TaskMap'
import { TaskCard } from '@/components/tasks/TaskCard'
import { MOCK_TASKS, MOCK_USERS } from '@/lib/mock-data'
import type { Task } from 'shared'

const ME = MOCK_USERS[0]

export default function AppHomePage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? MOCK_TASKS
    : MOCK_TASKS.filter(t => t.payment_type === filter || t.category === filter)

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-96 md:shrink-0 flex flex-col bg-white border-r border-gray-100 overflow-hidden">
        {/* Credits banner */}
        <div className="px-4 py-3 gradient-brand text-white text-sm flex items-center justify-between">
          <span className="font-medium">◈ {ME.credits_balance} credits</span>
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
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">{filtered.length} tasks nearby</h2>
            <span className="text-xs text-gray-400">Manhattan & Queens</span>
          </div>
          {filtered.map(task => (
            <div
              key={task.id}
              className={`transition-all ${selectedTask?.id === task.id ? 'ring-2 ring-clutch-400 rounded-2xl' : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              <TaskCard task={task} compact />
            </div>
          ))}
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
