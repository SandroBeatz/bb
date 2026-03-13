import type { H3Event } from 'h3'

/** Returns userId or throws 401 */
export function requireAuth(event: H3Event): string {
  const userId = event.context.auth?.()?.userId
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }
  return userId
}
