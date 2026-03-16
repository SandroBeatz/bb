export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const body = await readBody<{ name: string; phone: string; notes?: string }>(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, message: 'name is required' })
  }
  if (!body?.phone?.trim()) {
    throw createError({ statusCode: 400, message: 'phone is required' })
  }

  const supabase = useServerSupabase()
  const phone = body.phone.trim()

  // Upsert client — UNIQUE(master_id, phone) guarantees dedup
  const { data: client, error } = await supabase
    .from('clients')
    .upsert(
      {
        master_id: masterId,
        phone,
        name: body.name.trim(),
        notes: body.notes?.trim() || null,
      },
      { onConflict: 'master_id,phone' },
    )
    .select('id, name, phone, notes, created_at')
    .single()

  if (error) {
    console.error('[clients] insert error:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return {
    ...client,
    visit_count: 0,
    last_visit: null,
    total_amount: 0,
  }
})
