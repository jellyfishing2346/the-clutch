'use client'

import { cn } from '@/lib/utils'
import type { TrustLevel } from 'shared'
import { TRUST_LEVELS } from 'shared'

interface TrustBadgeProps {
  level: TrustLevel
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const ICONS: Record<TrustLevel, string> = {
  new: '○',
  established: '◆',
  trusted: '★',
  verified: '✓',
}

const STYLES: Record<TrustLevel, string> = {
  new: 'bg-gray-100 text-gray-600 border-gray-200',
  established: 'bg-blue-50 text-blue-700 border-blue-200',
  trusted: 'bg-purple-50 text-purple-700 border-purple-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
}

export function TrustBadge({ level, showLabel = true, size = 'md', className }: TrustBadgeProps) {
  const info = TRUST_LEVELS[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        STYLES[level],
        className
      )}
      title={info.description}
      aria-label={`Trust level: ${info.label}`}
    >
      <span aria-hidden="true">{ICONS[level]}</span>
      {showLabel && info.label}
    </span>
  )
}
