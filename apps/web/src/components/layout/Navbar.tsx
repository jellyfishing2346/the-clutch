'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { fetchProfile } from '@/lib/api/users'
import { MOCK_USERS } from '@/lib/mock-data'
import type { UserProfile } from 'shared'

const NAV_ITEMS = [
  { href: '/home', label: 'Map', icon: '🗺️' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/tasks/new', label: 'Post', icon: '＋', highlight: true },
  { href: '/credits', label: 'Credits', icon: '◈' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export function Navbar() {
  const pathname = usePathname()
  const [me, setMe] = useState<UserProfile>(MOCK_USERS[0])
  const [userId, setUserId] = useState<string>('u1')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      fetchProfile(user.id).then(profile => {
        if (profile) setMe(profile)
      })
    })
  }, [])

  const profileHref = `/profile/${userId}`

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur border-b border-gray-100 px-6 items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-gradient">Clutch</span>
          <span className="text-xs font-normal text-gray-400 mt-0.5">NYC</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.filter(i => i.href !== '/tasks/new').map(item => {
            const href = item.href === '/profile' ? profileHref : item.href
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-clutch-50 text-clutch-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/tasks/new" className="btn-primary text-sm py-2 px-5">
            + Post a Task
          </Link>
          <Link href={profileHref}>
            <Avatar src={me.avatar_url} name={me.name} size="sm" />
          </Link>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2 py-1 safe-area-bottom">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(item => {
            const href = item.href === '/profile' ? profileHref : item.href
            const isActive = pathname === href || pathname.startsWith(href + '/')
            if (item.highlight) {
              return (
                <Link key={item.href} href={href} className="flex flex-col items-center gap-0.5 -mt-5">
                  <span className="gradient-brand text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    +
                  </span>
                </Link>
              )
            }
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  isActive ? 'text-clutch-600' : 'text-gray-400'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
