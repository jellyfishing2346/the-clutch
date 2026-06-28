'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, type Notification } from '@/lib/api/notifications'
import { formatRelativeTime } from '@/lib/utils'

const NOTIFICATION_ICONS: Record<string, string> = {
  new_application: '👋',
  application_accepted: '✅',
  application_rejected: '❌',
  new_message: '💬',
  task_completed: '✨',
  new_review: '⭐',
  referral_bonus: '🎁',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ]).then(([notifs, count]) => {
      setNotifications(notifs)
      setUnreadCount(count)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  async function handleMarkAsRead(id: string) {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  function getNotificationLink(notification: Notification): string {
    const data = notification.data ?? {}
    switch (notification.type) {
      case 'new_application':
      case 'application_accepted':
      case 'application_rejected':
      case 'task_completed':
        return typeof data.task_id === 'string' ? `/tasks/${data.task_id}` : '/tasks'
      case 'new_message':
        return typeof data.conversation_id === 'string' ? `/messages/${data.conversation_id}` : '/messages'
      case 'new_review':
        return typeof data.task_id === 'string' ? `/tasks/${data.task_id}` : '/tasks'
      default:
        return '/tasks'
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-clutch-600 hover:text-clutch-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">We'll let you know when something happens.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              className={`block p-4 rounded-xl border transition-colors ${
                notification.read
                  ? 'bg-white border-gray-100 hover:border-gray-200'
                  : 'bg-clutch-50 border-clutch-200 hover:border-clutch-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">
                  {NOTIFICATION_ICONS[notification.type] || '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-clutch-600 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(notification.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
