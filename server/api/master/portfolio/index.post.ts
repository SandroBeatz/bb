const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const ALLOWED_TYPES = Object.keys(MIME_TO_EXT)
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_PHOTOS = 20

export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  // Check current count before uploading
  const supabase = useServerSupabase()
  const { count, error: countError } = await supabase
    .from('portfolio_items')
    .select('id', { count: 'exact', head: true })
    .eq('master_id', masterId)

  if (countError) {
    throw createError({ statusCode: 500, message: countError.message })
  }

  if ((count ?? 0) >= MAX_PHOTOS) {
    throw createError({
      statusCode: 422,
      message: `Portfolio limit reached (max ${MAX_PHOTOS} photos)`,
    })
  }

  const formData = await readFormData(event)
  const file = formData.get('file')
  const caption = formData.get('caption')?.toString() ?? null
  const serviceTag = formData.get('service_tag')?.toString() ?? null

  if (!file || typeof file === 'string') {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  const blob = file as Blob
  const contentType = blob.type || 'image/jpeg'

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw createError({ statusCode: 400, message: 'Invalid file type. Allowed: JPEG, PNG, WebP' })
  }

  if (blob.size > MAX_SIZE_BYTES) {
    throw createError({ statusCode: 400, message: 'File too large (max 5 MB)' })
  }

  const ext = MIME_TO_EXT[contentType]
  const filename = `${masterId}/${Date.now()}.${ext}`

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const anonKey = config.public.supabaseAnonKey

  const buffer = await blob.arrayBuffer()

  const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/portfolio/${filename}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body: buffer,
  })

  if (!uploadResponse.ok) {
    const body = await uploadResponse.text()
    console.error('[portfolio upload] error:', uploadResponse.status, body)
    throw createError({ statusCode: 500, message: `Upload failed: ${body}` })
  }

  const imageUrl = `${supabaseUrl}/storage/v1/object/public/portfolio/${filename}`

  // Determine next sort_order
  const { data: lastItem } = await supabase
    .from('portfolio_items')
    .select('sort_order')
    .eq('master_id', masterId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (lastItem?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      master_id: masterId,
      image_url: imageUrl,
      caption,
      service_tag: serviceTag,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
