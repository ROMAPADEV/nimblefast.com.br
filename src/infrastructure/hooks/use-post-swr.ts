/* eslint-disable @typescript-eslint/no-explicit-any */
import nextSWRMutation from 'swr/mutation'
import { api, exibirError } from 'src/adapters'

interface Response {
  create: <T, R>(x: T) => Promise<R>
  error: unknown
}

interface Options {
  showError: boolean
}

export function usePostSWR<T>(pathKey: string, options?: Options): Response {
  const { trigger, error } = nextSWRMutation<T>(pathKey, api.post as any)

  if (options && options.showError && error) {
    exibirError(error)
  }

  return { create: trigger, error }
}
