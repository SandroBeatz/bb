import { Bot, webhookCallback } from 'grammy'
import { handleBookings } from './handlers/bookings'
import { handleStart } from './handlers/start'

const token = process.env.NUXT_TELEGRAM_BOT_TOKEN

if (!token) {
  throw new Error('NUXT_TELEGRAM_BOT_TOKEN is not set')
}

export const bot = new Bot(token)

bot.command('start', handleStart)
bot.command('bookings', handleBookings)

export const handleUpdate = webhookCallback(bot, 'std/http')
