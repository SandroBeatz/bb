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

  const buffer = await blob.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(filename, buffer, { contentType, upsert: false })

  if (uploadError) {
    console.error('[portfolio upload] error:', uploadError)
    throw createError({ statusCode: 500, message: `Upload failed: ${uploadError.message}` })
  }

  const { data: publicUrlData } = supabase.storage.from('portfolio').getPublicUrl(filename)
  const imageUrl = publicUrlData.publicUrl

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
