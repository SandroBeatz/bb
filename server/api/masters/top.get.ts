export default defineEventHandler(async (event) => {
  const supabase = useServerSupabase()
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 8, 20)

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      username,
      avatar_url,
      master_profiles (
        city,
        specializations,
        rating,
        subscription_tier
      )
    `)
    .eq('role', 'master')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  type MasterRow = NonNullable<typeof data>[number]

  return (data ?? [])
    .filter((m: MasterRow) => ((m.master_profiles as Array<unknown> | null)?.length ?? 0) > 0)
    .sort((a: MasterRow, b: MasterRow) => {
      const rA = (a.master_profiles as Array<{ rating: number }>)?.[0]?.rating ?? 0
      const rB = (b.master_profiles as Array<{ rating: number }>)?.[0]?.rating ?? 0
      return rB - rA
    })
    .slice(0, limit)
})
