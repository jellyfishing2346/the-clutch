'use client'

import { cn } from '@/lib/utils'
import { getPaymentLabel } from '@/lib/utils'
import type { PaymentType } from 'shared'

interface PaymentBadgeProps {
  type: PaymentType
  amount: number | null
  credits: number | null
  className?: string
}

const STYLES: Record<PaymentType, string> = {
  cash: 'bg-green-50 text-green-700 border-green-200',
  credits: 'bg-clutch-50 text-clutch-700 border-clutch-200',
  exchange: 'bg-amber-50 text-amber-700 border-amber-200',
  free: 'bg-gray-50 text-gray-600 border-gray-200',
}

const ICONS: Record<PaymentType, string> = {
  cash: '$',
  credits: 'CR',
  exchange: '⇄',
  free: '♥',
}

export function PaymentBadge({ type, amount, credits, className }: PaymentBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold',
        STYLES[type],
        className
      )}
    >
      <span>{ICONS[type]}</span>
      {getPaymentLabel(type, amount, credits)}
    </span>
  )
}
