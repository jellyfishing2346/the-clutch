'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { fetchNearbyTasks } from '@/lib/api/tasks'
import { TASK_CATEGORIES } from 'shared'
import type { Task, TaskCategory, PaymentType } from 'shared'

type SortOrder = 'newest' | 'highest_pay'

const BOROUGH_FILTERS = ['All boroughs', 'Manhattan', 'Queens', 'Brooklyn', 'Bronx', 'Staten Island']

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentType | 'all'>('all')
  const [boroughFilter, setBoroughFilter] = useState('All boroughs')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  useEffect(() => {
    fetchNearbyTasks()
      .then(data => setAllTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = allTasks.filter(task => {
    const matchesSearch = !search || task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    const matchesPayment = paymentFilter === 'all' || task.payment_type === paymentFilter
    const matchesBorough = boroughFilter === 'All boroughs' || task.borough === boroughFilter
    return matchesSearch && matchesCategory && matchesPayment && matchesBorough
  })

  const tasks = [...filtered].sort((a, b) => {
    if (sortOrder === 'highest_pay') {
      const aVal = a.payment_amount ?? a.credits_amount ?? 0
      const bVal = b.payment_amount ?? b.credits_amount ?? 0
      return bVal - aVal
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const hasActiveFilters = search || categoryFilter !== 'all' || paymentFilter !== 'all' || boroughFilter !== 'All boroughs'

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
        <select
          className="input py-2 px-3 text-sm w-auto"
          value={boroughFilter}
          onChange={e => setBoroughFilter(e.target.value)}
          aria-label="Filter by borough"
        >
          {BOROUGH_FILTERS.map(b => <option key={b}>{b}</option>)}
        </select>

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

        <div className="flex gap-2 overflow-x-auto pb-1">
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
          {(Object.entries(TASK_CATEGORIES) as [TaskCategory, typeof TASK_CATEGORIES[TaskCategory]][]).map(([key, cat]) => (
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

      {/* Results header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {loading
            ? <span className="inline-block h-4 w-24 bg-gray-100 rounded animate-pulse" />
            : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`
          }
        </span>
        <select
          className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 bg-white"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as SortOrder)}
          aria-label="Sort tasks"
        >
          <option value="newest">Newest first</option>
          <option value="highest_pay">Highest pay</option>
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{hasActiveFilters ? '🔍' : '✨'}</div>
          <p className="text-gray-500 font-medium">
            {hasActiveFilters ? 'No tasks match your filters.' : 'No open tasks right now.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Be the first to post something!'}
          </p>
          <Link href="/tasks/new" className="btn-primary mt-5 inline-flex">
            Post a task
          </Link>
        </div>
      )}
    </div>
  )
}
