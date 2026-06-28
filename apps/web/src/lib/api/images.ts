import { createClient } from '@/lib/supabase/client'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export async function uploadProfileImage(userId: string, file: File): Promise<string | null> {
  if (IS_DEMO) return null

  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.error('Profile image upload error:', error)
    throw new Error('Failed to upload image')
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path)

  // Update profile with new image URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ image_url: publicUrl })
    .eq('id', userId)

  if (updateError) {
    console.error('Profile image URL update error:', updateError)
    // Try to clean up the uploaded file
    await supabase.storage.from('avatars').remove([data.path])
    throw new Error('Failed to update profile')
  }

  return publicUrl
}

export async function uploadTaskImage(taskId: string, file: File): Promise<string | null> {
  if (IS_DEMO) return null

  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${taskId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('task-images')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.error('Task image upload error:', error)
    throw new Error('Failed to upload image')
  }

  const { data: { publicUrl } } = supabase.storage
    .from('task-images')
    .getPublicUrl(data.path)

  // Update task with new image URL
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ image_url: publicUrl })
    .eq('id', taskId)

  if (updateError) {
    console.error('Task image URL update error:', updateError)
    // Try to clean up the uploaded file
    await supabase.storage.from('task-images').remove([data.path])
    throw new Error('Failed to update task')
  }

  return publicUrl
}

export async function deleteProfileImage(userId: string): Promise<boolean> {
  if (IS_DEMO) return true

  const supabase = createClient()

  // Get current image URL
  const { data: profile } = await supabase
    .from('profiles')
    .select('image_url')
    .eq('id', userId)
    .single()

  if (!profile?.image_url) return true

  // Extract path from URL
  const url = new URL(profile.image_url)
  const pathParts = url.pathname.split('/avatars/')
  if (pathParts.length < 2) return true

  const path = pathParts[1]

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from('avatars')
    .remove([path])

  if (deleteError) {
    console.error('Profile image deletion error:', deleteError)
    return false
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ image_url: null })
    .eq('id', userId)

  return !updateError
}

export async function deleteTaskImage(taskId: string): Promise<boolean> {
  if (IS_DEMO) return true

  const supabase = createClient()

  // Get current image URL
  const { data: task } = await supabase
    .from('tasks')
    .select('image_url')
    .eq('id', taskId)
    .single()

  if (!task?.image_url) return true

  // Extract path from URL
  const url = new URL(task.image_url)
  const pathParts = url.pathname.split('/task-images/')
  if (pathParts.length < 2) return true

  const path = pathParts[1]

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from('task-images')
    .remove([path])

  if (deleteError) {
    console.error('Task image deletion error:', deleteError)
    return false
  }

  // Update task
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ image_url: null })
    .eq('id', taskId)

  return !updateError
}
