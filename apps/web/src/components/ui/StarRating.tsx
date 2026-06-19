'use client'

import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarRating({ rating, count, size = 'md', className }: StarRatingProps) {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  if (rating === 0 && (count === undefined || count === 0)) {
    return (
      <span className={cn('inline-flex items-center text-gray-400', sizes[size], className)}>
        No ratings yet
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1', sizes[size], className)}>
      <span className="text-amber-400" aria-hidden="true">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-gray-400">({count})</span>
      )}
    </span>
  )
}
