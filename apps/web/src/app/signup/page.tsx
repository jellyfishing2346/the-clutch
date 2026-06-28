'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BOROUGHS, NEIGHBORHOODS } from 'shared'
import { createClient } from '@/lib/supabase/client'
import { processReferral } from '@/lib/api/referrals'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationPending, setConfirmationPending] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setRefCode(ref)
  }, [searchParams])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    borough: '',
    neighborhood: '',
  })

  const neighborhoods = form.borough
    ? NEIGHBORHOODS[form.borough as keyof typeof NEIGHBORHOODS] ?? []
    : []

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)

    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 800))
      router.push('/home')
      return
    }

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          borough: form.borough,
          neighborhood: form.neighborhood,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Store referral code for later processing if email confirmation is required
    if (refCode) {
      console.log('[Signup] Referral code present:', refCode)
      if (data.session) {
        // Process immediately if session exists (no email confirmation required)
        console.log('[Signup] Session exists, processing referral immediately')
        await processReferral(refCode).catch(() => {})
      } else {
        // Store for post-login processing if email confirmation is required
        console.log('[Signup] No session (email confirmation required), storing referral for later')
        localStorage.setItem('pending_referral', refCode)
      }
    }

    if (data.session) {
      router.push('/home')
    } else {
      setConfirmationPending(true)
    }
  }

  if (confirmationPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clutch-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-2">
            We sent a confirmation link to <strong>{form.email}</strong>.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Click the link in that email to activate your account, then come back to sign in.
          </p>
          <Link href="/login" className="btn-primary inline-flex">
            Go to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clutch-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="logo-frame text-3xl">clutch</Link>
          <p className="text-gray-500 mt-2">Join your neighborhood network.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'gradient-brand' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
                <div>
                  <label htmlFor="name" className="label">Full name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="input"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Where are you based?</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    This helps us show you nearby tasks. You get{' '}
                    <span className="font-semibold text-clutch-600">20 free credits</span> to start!
                  </p>
                </div>
                <div>
                  <label htmlFor="borough" className="label">Borough</label>
                  <select
                    id="borough"
                    className="input"
                    value={form.borough}
                    onChange={e => update('borough', e.target.value)}
                    required
                  >
                    <option value="">Select borough...</option>
                    {BOROUGHS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {neighborhoods.length > 0 && (
                  <div>
                    <label htmlFor="neighborhood" className="label">Neighborhood</label>
                    <select
                      id="neighborhood"
                      className="input"
                      value={form.neighborhood}
                      onChange={e => update('neighborhood', e.target.value)}
                      required
                    >
                      <option value="">Select neighborhood...</option>
                      {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                )}
                <div className="bg-clutch-50 rounded-xl p-4 text-sm text-clutch-700">
                  <span className="font-semibold">◈ 20 free credits</span> will be added to your account — use them to post your first task!
                </div>
              </>
            )}

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
              {loading
                ? <><span className="animate-spin inline-block">◌</span> Creating account...</>
                : step === 1 ? 'Continue →' : 'Join clutch →'
              }
            </button>
          </form>

          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-clutch-600 font-medium hover:underline">Sign in</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up, you agree to keep your community safe and treat all neighbors with respect.
        </p>
      </div>
    </div>
  )
}
