'use client'

import { useState, useEffect } from 'react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { MOCK_TASKS } from '@/lib/mock-data'
import { fetchNearbyTasks } from '@/lib/api/tasks'
import { TASK_CATEGORIES } from 'shared'
import type { Task, TaskCategory, PaymentType } from 'shared'

const BOROUGH_FILTERS = ['All boroughs', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx']

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>(MOCK_TASKS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentType | 'all'>('all')
  const [boroughFilter, setBoroughFilter] = useState('All boroughs')

  useEffect(() => {
    fetchNearbyTasks().then(data => setAllTasks(data))
  }, [])

  const tasks = allTasks.filter(task => {
    const matchesSearch = !search || task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    const matchesPayment = paymentFilter === 'all' || task.payment_type === paymentFilter
    const matchesBorough = boroughFilter === 'All boroughs' || task.borough === boroughFilter
    return matchesSearch && matchesCategory && matchesPayment && matchesBorough
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Tasks</h1>
        <p className="text-gray-500 text-sm">Find ways to help neighbors and earn credits.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="search"
          className="input pl-10"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Borough */}
        <select
          className="input py-2 px-3 text-sm w-auto"
          value={boroughFilter}
          onChange={e => setBoroughFilter(e.target.value)}
          aria-label="Filter by borough"
        >
          {BOROUGH_FILTERS.map(b => <option key={b}>{b}</option>)}
        </select>

        {/* Payment */}
        <select
          className="input py-2 px-3 text-sm w-auto"
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value as PaymentType | 'all')}
          aria-label="Filter by payment"
        >
          <option value="all">Any payment</option>
          <option value="cash">$ Cash</option>
          <option value="credits">◈ Credits</option>
          <option value="exchange">Exchange</option>
          <option value="free">Free</option>
        </select>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === 'all'
                ? 'bg-clutch-600 text-white border-clutch-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-clutch-300'
            }`}
          >
            All
          </button>
          {(Object.entries(TASK_CATEGORIES) as [TaskCategory, typeof TASK_CATEGORIES[TaskCategory]][]).slice(0, 6).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                categoryFilter === key
                  ? 'bg-clutch-600 text-white border-clutch-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-clutch-300'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
        </span>
        <select className="text-xs text-gray-500 border-none bg-transparent" aria-label="Sort tasks">
          <option>Newest first</option>
          <option>Closest first</option>
          <option>Highest pay</option>
        </select>
      </div>

      {tasks.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">No tasks match your filters.</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
