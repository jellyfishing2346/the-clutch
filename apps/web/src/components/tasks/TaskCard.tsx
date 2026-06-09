'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { PaymentBadge } from '@/components/ui/PaymentBadge'
import { formatRelativeTime } from '@/lib/utils'
import { TASK_CATEGORIES } from 'shared'
import type { Task } from 'shared'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const category = TASK_CATEGORIES[task.category]

  return (
    <Link href={`/tasks/${task.id}`} className="block">
      <article className="card p-4 hover:border-clutch-200 cursor-pointer animate-fade-in">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {task.creator && (
              <Avatar src={task.creator.avatar_url} name={task.creator.name} size="sm" />
            )}
            <div className="min-w-0">
              <div className="text-xs text-gray-500 truncate">{task.creator?.name}</div>
              <div className="text-xs text-gray-400">{task.neighborhood}</div>
            </div>
          </div>
          <PaymentBadge
            type={task.payment_type}
            amount={task.payment_amount}
            credits={task.credits_amount}
          />
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-gray-900 mb-1.5 leading-snug ${compact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}`}>
          {task.title}
        </h3>

        {!compact && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm">{category.icon}</span>
            <span className="text-xs text-gray-500">{category.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrustBadge level={task.required_trust_level} size="sm" showLabel={false} />
            <span className="text-xs text-gray-400">{formatRelativeTime(task.created_at)}</span>
          </div>
        </div>

        {task.applicant_count > 0 && (
          <div className="mt-2 text-xs text-clutch-600 font-medium">
            {task.applicant_count} {task.applicant_count === 1 ? 'person' : 'people'} offered to help
          </div>
        )}
      </article>
    </Link>
  )
}
