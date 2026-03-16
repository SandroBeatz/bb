import { Webhook } from 'svix'

interface ClerkUserData {
  id: string
  first_name: string | null
  last_name: string | null
  image_url: string | null
  email_addresses: Array<{ email_address: string }>
  phone_numbers: Array<{ phone_number: string }>
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserData
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const webhookSecret = config.clerkWebhookSecret

  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      message: 'Webhook secret not configured',
    })
  }

  const svixId = getHeader(event, 'svix-id')
  const svixTimestamp = getHeader(event, 'svix-timestamp')
  const svixSignature = getHeader(event, 'svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw createError({ statusCode: 400, message: 'Missing svix headers' })
  }

  const body = await readRawBody(event)

  if (!body) {
    throw createError({ statusCode: 400, message: 'Missing request body' })
  }

  let evt: ClerkWebhookEvent
  try {
    const wh = new Webhook(webhookSecret)
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    throw createError({
      statusCode: 400,
      message: 'Invalid webhook signature',
    })
  }

  const supabase = useServerSupabase()

  if (evt.type === 'user.created') {
    const { id, first_name, last_name, image_url, email_addresses, phone_numbers } = evt.data
    const fullName = [first_name, last_name].filter(Boolean).join(' ')
    const email = email_addresses?.[0]?.email_address ?? null
    const phone = phone_numbers?.[0]?.phone_number
      ? normalizePhone(phone_numbers[0].phone_number)
      : null

    // Check if an offline profile exists with matching phone or email — merge if so
    let offlineId: string | null = null
    if (phone) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .not('id', 'like', 'user_%')
        .maybeSingle()
      if (data) offlineId = data.id
    }
    if (!offlineId && email) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .not('id', 'like', 'user_%')
        .maybeSingle()
      if (data) offlineId = data.id
    }

    // Create the Clerk profile
    const { error } = await supabase.from('profiles').upsert(
      {
        id,
        full_name: fullName || '',
        avatar_url: image_url || null,
        phone,
        email,
      },
      { onConflict: 'id' },
    )

    if (error) {
      console.error('[clerk webhook] Error creating profile:', error.message)
      throw createError({ statusCode: 500, message: 'Failed to create profile' })
    }

    // Merge offline profile if found
    if (offlineId) {
      try {
        await mergeOfflineProfile(supabase, offlineId, id)
        console.log(`[clerk webhook] Merged offline profile ${offlineId} → ${id}`)
      } catch (mergeErr) {
        console.error('[clerk webhook] Merge error:', mergeErr)
      }
    }
  }

  if (evt.type === 'user.updated') {
    const { id, first_name, last_name, image_url } = evt.data
    const fullName = [first_name, last_name].filter(Boolean).join(' ')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || '',
        avatar_url: image_url || null,
      })
      .eq('id', id)

    if (error) {
      console.error('[clerk webhook] Error updating profile:', error.message)
      throw createError({
        statusCode: 500,
        message: 'Failed to update profile',
      })
    }
  }

  return { success: true }
})
