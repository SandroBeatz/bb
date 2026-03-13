import type { Context } from 'grammy'

export async function sendNotification(ctx: Context, message: string) {
  await ctx.reply(message)
}
