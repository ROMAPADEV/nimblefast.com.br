import { logger } from 'src/infrastructure/logger'

interface CustomError {
  message: string
}

export function response(err: unknown) {
  const error = err as CustomError

  logger.error(error)

  return new Response(JSON.stringify({ message: error?.message }), {
    status: 401,
  })
}
