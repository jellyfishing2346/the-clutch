'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { processReferral } from '@/lib/api/referrals'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 600))
      router.push('/home')
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        setError('Your email address hasn\'t been confirmed yet. Check your inbox for the confirmation link we sent when you signed up.')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    // Process pending referral if user signed up with a referral link but required email confirmation
    const pendingReferral = localStorage.getItem('pending_referral')
    if (pendingReferral) {
      await processReferral(pendingReferral).catch(() => {})
      localStorage.removeItem('pending_referral')
    }

    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clutch-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="logo-frame text-3xl">clutch</Link>
          <p className="text-gray-500 mt-2">Welcome back, neighbor.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center"
              disabled={loading}
            >
              {loading ? <><span className="animate-spin inline-block">◌</span> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-clutch-600 font-medium hover:underline">
              Sign up free
            </Link>
          </div>

          {IS_DEMO && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <button
                onClick={() => router.push('/home')}
                className="text-xs text-gray-400 hover:text-clutch-500 transition-colors"
              >
                Demo mode: skip login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
