export default defineEventHandler(async (event) => {
  const itemId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!itemId) {
    throw createError({ statusCode: 400, message: 'Portfolio item ID is required' })
  }

  const supabase = useServerSupabase()

  // Fetch item to get the storage path before deleting
  const { data: item, error: fetchError } = await supabase
    .from('portfolio_items')
    .select('image_url')
    .eq('id', itemId)
    .eq('master_id', masterId)
    .single()

  if (fetchError || !item) {
    throw createError({ statusCode: 404, message: 'Portfolio item not found' })
  }

  // Delete the DB record
  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId)
    .eq('master_id', masterId)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Best-effort: remove file from storage
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const publicBase = `${supabaseUrl}/storage/v1/object/public/portfolio/`
    if (item.image_url.startsWith(publicBase)) {
      const storagePath = item.image_url.slice(publicBase.length)
      await supabase.storage.from('portfolio').remove([storagePath])
    }
  } catch {
    // Ignore storage cleanup errors — record is already deleted
  }

  return { success: true }
})
