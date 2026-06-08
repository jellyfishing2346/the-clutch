import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TrustLevel, TaskCategory, PaymentType } from 'shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCredits(amount: number) {
  return `${amount} CR`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatRelativeTime(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

export function getTrustBadgeClass(level: TrustLevel) {
  const map: Record<TrustLevel, string> = {
    new: 'badge-new',
    established: 'badge-established',
    trusted: 'badge-trusted',
    verified: 'badge-verified',
  }
  return map[level]
}

export function getTrustLabel(level: TrustLevel) {
  const map: Record<TrustLevel, string> = {
    new: 'New Member',
    established: 'Established',
    trusted: 'Trusted',
    verified: 'ID Verified',
  }
  return map[level]
}

export function getPaymentLabel(type: PaymentType, amount: number | null, credits: number | null) {
  switch (type) {
    case 'cash': return amount ? formatCurrency(amount) : 'Cash (negotiable)'
    case 'credits': return credits ? formatCredits(credits) : 'Credits'
    case 'exchange': return 'Exchange / Trade'
    case 'free': return 'Free / Volunteer'
  }
}

export function getCategoryColor(category: TaskCategory): string {
  const map: Partial<Record<TaskCategory, string>> = {
    simple_help: '#6355f5',
    errands: '#8b5cf6',
    delivery: '#a855f7',
    moving: '#3b82f6',
    cleaning: '#06b6d4',
    cooking: '#f59e0b',
    pet_care: '#10b981',
    tech_help: '#6366f1',
    repairs: '#ef4444',
    tutoring: '#ec4899',
    other: '#94a3b8',
    skilled: '#f97316',
  }
  return map[category] ?? '#94a3b8'
}

export function distanceInMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3959
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
