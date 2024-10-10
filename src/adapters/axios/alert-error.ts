import { toast } from 'react-toastify'
import get from 'lodash/get'

interface ErrorCatch {
  response?: {
    data?: {
      message: string
    }
  }
  message?: string
}

export function exibirError(e: unknown): void {
  const error = e as ErrorCatch
  const message = 'Algo deu errado, tente novamente mais tarde'

  if (error?.response?.data?.message) {
    toast.error(get(error, 'response.data.message', message), { toastId: 1 })

    return
  }

  if (error?.response?.data?.message) {
    toast.error(get(error, 'response.data.message', message), { toastId: 2 })

    return
  }

  if (error?.message) {
    toast.error(get(error, 'message', message), { toastId: 3 })

    return
  }

  toast.error(get(error, 'response.data.message', message), { toastId: 4 })
}
