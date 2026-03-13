export default defineEventHandler(async (event) => {
  const body = await readBody<{ init_data: string }>(event)

  if (!body?.init_data) {
    throw createError({ statusCode: 400, message: 'init_data is required' })
  }

  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken

  if (!botToken) {
    throw createError({ statusCode: 500, message: 'Bot token not configured' })
  }

  const isValid = validateTelegramInitData(body.init_data, botToken)

  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Invalid Telegram init data' })
  }

  return { valid: true }
})
