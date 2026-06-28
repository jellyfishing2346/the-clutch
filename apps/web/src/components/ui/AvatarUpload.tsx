'use client'

import { useRef, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { uploadProfileImage } from '@/lib/api/images'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  currentSrc: string | null
  name: string
  onUploaded: (url: string) => void
}

const MAX_SIZE_MB = 5

export function AvatarUpload({ currentSrc, name, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`)
      return
    }

    setPreviewSrc(URL.createObjectURL(file))
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const url = await uploadProfileImage(user.id, file)
      if (url) {
        onUploaded(url)
      } else {
        setError('Upload failed. Please try again.')
        setPreviewSrc(null)
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
      setPreviewSrc(null)
    }

    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group rounded-full"
        aria-label="Change profile photo"
      >
        <Avatar src={previewSrc ?? currentSrc ?? undefined} name={name} size="xl" />
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-opacity">
            {uploading ? '◌' : 'Change'}
          </span>
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <span className="animate-spin text-white text-lg">◌</span>
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}