'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchCreditsBalance, fetchTransactions } from '@/lib/api/credits'
import { formatRelativeTime } from '@/lib/utils'
import { CREDITS_CONFIG } from 'shared'
import type { CreditsTransaction } from 'shared'

const HOW_TO_EARN = [
  { icon: '🤝', action: 'Help with a free task', amount: `+${CREDITS_CONFIG.earnPerHelpTask}` },
  { icon: '⭐', action: 'Receive a 5-star review', amount: '+5' },
  { icon: '🎁', action: 'Welcome bonus (one time)', amount: `+${CREDITS_CONFIG.bonusOnboarding}` },
]

const HOW_TO_SPEND = [
  { icon: '🤝', action: 'Simple task (carrying, errands)', amount: `-${CREDITS_CONFIG.simpleTaskCost}` },
  { icon: '🔧', action: 'Moderate task (cleaning, tech)', amount: `-${CREDITS_CONFIG.moderateTaskCost}` },
  { icon: '⚡', action: 'Skilled task (repairs, tutoring)', amount: `-${CREDITS_CONFIG.skilledTaskCost}` },
]

export default function CreditsPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<CreditsTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      Promise.all([
        fetchCreditsBalance(user.id),
        fetchTransactions(user.id),
      ]).then(([bal, txns]) => {
        setBalance(bal)
        setTransactions([...txns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        setLoading(false)
      })
    })
  }, [])

  const now = new Date()
  const thisMonthTxns = transactions.filter(tx => {
    const d = new Date(tx.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const earnedThisMonth = thisMonthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const spentThisMonth = thisMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Credits</h1>
      <p className="text-gray-500 text-sm mb-6">Your community currency — earned by helping, spent to get help.</p>

      {/* Balance card */}
      <div className="gradient-brand rounded-3xl p-8 text-white text-center mb-6 shadow-lg">
        <div className="text-6xl font-bold mb-1">
          {loading ? <span className="animate-pulse">—</span> : balance ?? 0}
        </div>
        <div className="text-clutch-100 text-sm font-medium">Clutch Credits</div>
        <div className="mt-4 flex justify-center gap-4 text-xs text-white/80">
          <span>↑ Earned this month: {earnedThisMonth} CR</span>
          <span>↓ Spent this month: {spentThisMonth} CR</span>
        </div>
      </div>

      {/* Earn / Spend grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-green-500">↑</span> Ways to earn
          </h2>
          <div className="space-y-3">
            {HOW_TO_EARN.map(item => (
              <div key={item.action} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-gray-600">{item.action}</span>
                </div>
                <span className="font-semibold text-green-600">{item.amount} CR</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-clutch-500">↓</span> Ways to spend
          </h2>
          <div className="space-y-3">
            {HOW_TO_SPEND.map(item => (
              <div key={item.action} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-gray-600">{item.action}</span>
                </div>
                <span className="font-semibold text-clutch-600">{item.amount} CR</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Transaction history</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet.</p>
        ) : (
          <div className="space-y-1">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    tx.type === 'earned' || tx.type === 'bonus'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {tx.type === 'earned' ? '↑' : tx.type === 'bonus' ? '★' : '↓'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                    <div className="text-xs text-gray-400">{formatRelativeTime(tx.created_at)}</div>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} CR
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6 bg-clutch-50 rounded-2xl p-5 text-center">
        <div className="text-2xl mb-2">🤝</div>
        <p className="font-semibold text-clutch-800 mb-1">Want more credits?</p>
        <p className="text-sm text-clutch-600 mb-3">Help a neighbor with a free task and earn 10 credits instantly.</p>
        <Link href="/tasks?filter=free" className="btn-primary text-sm py-2 px-5 inline-flex">
          Find free tasks to help with
        </Link>
      </div>
    </div>
  )
}
