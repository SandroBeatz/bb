export default defineEventHandler(async (event) => {
  const { userId } = useAuth()

  if (!userId?.value) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const body = await readBody<{ role: string }>(event)

  if (!body?.role || !['master', 'client'].includes(body.role)) {
    throw createError({ statusCode: 400, message: 'Invalid role. Must be "master" or "client".' })
  }

  const supabase = useServerSupabase()

  // Update role only (preserves full_name set by the Clerk webhook)
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({ role: body.role })
    .eq('id', userId.value)
    .select()
    .maybeSingle()

  if (updateError) {
    throw createError({ statusCode: 500, message: updateError.message })
  }

  // Profile didn't exist yet (webhook hasn't fired) — create it with the selected role
  if (!updated) {
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId.value, role: body.role, full_name: '' })
      .select()
      .single()

    if (insertError) {
      throw createError({ statusCode: 500, message: insertError.message })
    }

    return inserted
  }

  return updated
})
