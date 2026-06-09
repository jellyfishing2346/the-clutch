'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const SIZES = {
  xs: { container: 'h-6 w-6', text: 'text-xs' },
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-14 w-14', text: 'text-base' },
  xl: { container: 'h-20 w-20', text: 'text-xl' },
}

export function Avatar({ src, name, size = 'md', className, priority }: AvatarProps) {
  const { container, text } = SIZES[size]
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', container, className)}>
        <Image src={src} alt={name} fill className="object-cover" unoptimized priority={priority} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex-shrink-0 flex items-center justify-center font-semibold gradient-brand text-white',
        container, text, className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
