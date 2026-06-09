'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">⚡</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6">
        An unexpected error occurred. Your data is safe.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/home" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  )
}
