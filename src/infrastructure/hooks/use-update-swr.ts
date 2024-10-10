/* eslint-disable @typescript-eslint/no-explicit-any */
import nextSWRMutation from 'swr/mutation'
import { api, exibirError } from 'src/adapters'

interface Response {
  update: <T, R>(x: T) => Promise<R>
  error: unknown
}

interface Options {
  showError: boolean
}

export function useUpdateSWR<T>(pathKey: string, options?: Options): Response {
  const { trigger, error } = nextSWRMutation<T>(pathKey, api.put as any)

  if (options && options.showError && error) {
    exibirError(error)
  }

  return { update: trigger, error }
}
