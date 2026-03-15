import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Merge an offline profile (UUID-based) into a Clerk profile (user_xxx).
 * Re-points all references and deletes the old profile.
 */
export async function mergeOfflineProfile(
  supabase: SupabaseClient,
  offlineId: string,
  clerkId: string,
): Promise<void> {
  // Re-point bookings
  await supabase.from('bookings').update({ client_id: clerkId }).eq('client_id', offlineId)

  // Re-point reviews
  await supabase.from('reviews').update({ client_id: clerkId }).eq('client_id', offlineId)

  // Re-point master_clients (handle unique constraint: if link already exists, just delete old one)
  const { data: existingLinks } = await supabase
    .from('master_clients')
    .select('master_id')
    .eq('client_id', offlineId)

  for (const link of existingLinks ?? []) {
    // Try to update; if the (master_id, clerkId) pair already exists, delete the offline link
    const { error } = await supabase
      .from('master_clients')
      .update({ client_id: clerkId, invitation_status: 'accepted' })
      .eq('master_id', link.master_id)
      .eq('client_id', offlineId)

    if (error?.code === '23505') {
      // Unique violation — link already exists, just delete the offline one
      await supabase
        .from('master_clients')
        .delete()
        .eq('master_id', link.master_id)
        .eq('client_id', offlineId)
    }
  }

  // Delete the old offline profile
  await supabase.from('profiles').delete().eq('id', offlineId)
}
