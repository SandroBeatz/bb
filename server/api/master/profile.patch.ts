import { z } from 'zod'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const workDaySchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  })
  .nullable()

const bodySchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Username must be lowercase letters, digits, underscores or hyphens')
    .optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  specializations: z.array(z.string().min(1).max(100)).max(20).optional(),
  contacts: z
    .object({
      telegram: z.string().max(100).optional(),
      whatsapp: z.string().max(50).optional(),
      instagram: z.string().max(100).optional(),
      phone: z.string().max(30).optional(),
    })
    .optional(),
  work_hours: z.record(z.enum(DAYS), workDaySchema).optional(),
})

export default defineEventHandler(async (event) => {
  const profile = await requireMaster(event)

  const rawBody = await readBody(event)
  const parsed = bodySchema.safeParse(rawBody)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.errors.map((e) => e.message).join(', '),
    })
  }

  const { full_name, username, avatar_url, bio, city, specializations, contacts, work_hours } =
    parsed.data

  const supabase = useServerSupabase()

  // Validate username uniqueness if changed
  if (username && username !== profile.username) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', profile.id)
      .maybeSingle()

    if (existing) {
      throw createError({ statusCode: 409, message: 'Username already taken' })
    }
  }

  // Update profiles table
  const profileUpdates: Record<string, unknown> = {}
  if (full_name !== undefined) profileUpdates.full_name = full_name
  if (username !== undefined) profileUpdates.username = username
  if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', profile.id)

    if (profileError) {
      throw createError({ statusCode: 500, message: profileError.message })
    }
  }

  // Update master_profiles table
  const masterUpdates: Record<string, unknown> = {}
  if (bio !== undefined) masterUpdates.bio = bio
  if (city !== undefined) masterUpdates.city = city
  if (specializations !== undefined) masterUpdates.specializations = specializations
  if (contacts !== undefined) masterUpdates.contacts = contacts
  if (work_hours !== undefined) masterUpdates.work_hours = work_hours

  if (Object.keys(masterUpdates).length > 0) {
    const { error: masterError } = await supabase
      .from('master_profiles')
      .upsert({ id: profile.id, ...masterUpdates })

    if (masterError) {
      throw createError({ statusCode: 500, message: masterError.message })
    }
  }

  // Return updated data
  const { data, error } = await supabase
    .from('profiles')
    .select('*, master_profiles(*)')
    .eq('id', profile.id)
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
