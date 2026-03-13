import type { Context } from 'grammy'

export async function handleStart(ctx: Context) {
  await ctx.reply(
    '👋 Welcome to BeautyBook!\n\n'
    + 'Use /bookings to view your upcoming appointments.',
  )
}
