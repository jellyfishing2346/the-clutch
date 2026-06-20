'use client'

import { useState } from 'react'
import { submitReview } from '@/lib/api/reviews'

interface ReviewFormProps {
  taskId: string
  revieweeId: string
  revieweeName: string
  onSubmitted: () => void
}

export function ReviewForm({ taskId, revieweeId, revieweeName, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setError('')
    const ok = await submitReview(taskId, revieweeId, rating, comment)
    if (ok) {
      onSubmitted()
    } else {
      setError('Failed to submit review. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-3">Rate {revieweeName}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl leading-none"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-200'}>★</span>
            </button>
          ))}
        </div>
        <textarea
          className="input min-h-[80px] resize-none"
          placeholder={`How was your experience with ${revieweeName}?`}
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
        />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <><span className="animate-spin inline-block">◌</span> Submitting...</> : 'Submit review'}
        </button>
      </form>
    </div>
  )
}
