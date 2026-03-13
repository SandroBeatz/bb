import type { Context } from 'grammy'

export async function handleBookings(ctx: Context) {
  await ctx.reply('📅 Your upcoming bookings will appear here once you connect your account.')
}
