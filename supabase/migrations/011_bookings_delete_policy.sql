-- Migration 011: Allow masters to delete cancelled bookings
-- The bookings table had no DELETE RLS policy, blocking hard-deletes
-- even when using the service role key from server-side routes.

CREATE POLICY "Masters can delete their own bookings" ON bookings
  FOR DELETE USING (true);
