import pino from 'pino'
import pretty from 'pino-pretty'

const { NEXT_PUBLIC_LEVEL_LOGGER } = process.env

const stream = pretty({
  colorize: true,
})

export const logger = pino({ level: NEXT_PUBLIC_LEVEL_LOGGER }, stream)
