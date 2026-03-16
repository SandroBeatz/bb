import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const body = await readBody<{ full_name: string; phone?: string; email?: string }>(event)

  if (!body?.full_name?.trim()) {
    throw createError({ statusCode: 400, message: 'full_name is required' })
  }

  const supabase = useServerSupabase()
  const phone = body.phone?.trim() ? normalizePhone(body.phone.trim()) : null
  const email = body.email?.trim()?.toLowerCase() || null

  let clientId: string | null = null

  // Try to find existing profile by phone
  if (phone) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle()

    if (existing) clientId = existing.id
  }

  // Try to find by email if no phone match
  if (!clientId && email) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (existing) clientId = existing.id
  }

  // Create new offline profile if no match
  if (!clientId) {
    clientId = randomUUID()
    const insertData: Record<string, string> = {
      id: clientId,
      role: 'client',
      full_name: body.full_name.trim(),
    }
    if (phone) insertData.phone = phone
    if (email) insertData.email = email

    const { error: profileError } = await supabase.from('profiles').insert(insertData)

    if (profileError) {
      console.error('[clients] profile insert error:', profileError)
      throw createError({ statusCode: 500, message: profileError.message })
    }
  }

  // Create master-client link
  const { error: linkError } = await supabase
    .from('master_clients')
    .upsert({ master_id: masterId, client_id: clientId }, { onConflict: 'master_id,client_id' })

  if (linkError) {
    console.error('[clients] master_clients upsert error:', linkError)
    throw createError({ statusCode: 500, message: linkError.message })
  }

  // Fetch full client data
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, email')
    .eq('id', clientId)
    .single()

  return {
    id: profile?.id ?? clientId,
    full_name: profile?.full_name ?? body.full_name.trim(),
    avatar_url: profile?.avatar_url ?? null,
    phone: profile?.phone ?? phone,
    email: profile?.email ?? email,
    display_name: null,
    notes: null,
    invitation_status: 'none',
    added_at: new Date().toISOString(),
    visit_count: 0,
    last_visit: null,
    total_amount: 0,
  }
})
