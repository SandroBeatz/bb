export default defineEventHandler(async (event) => {
  // Auth enforced via Clerk — Supabase Storage runs under anon key
  const profile = await requireMaster(event)

  const formData = await readFormData(event)
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  const blob = file as Blob

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const contentType = blob.type || 'image/jpeg'
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw createError({ statusCode: 400, message: 'Invalid file type' })
  }

  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  const ext = MIME_TO_EXT[contentType] ?? 'jpg'
  const filename = `${profile.id}.${ext}`

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const anonKey = config.public.supabaseAnonKey

  const buffer = await blob.arrayBuffer()

  const response = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${filename}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[avatar upload] error:', response.status, body)
    throw createError({ statusCode: 500, message: `Upload failed: ${body}` })
  }

  return { url: `${supabaseUrl}/storage/v1/object/public/avatars/${filename}` }
})
