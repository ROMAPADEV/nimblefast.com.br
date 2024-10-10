/* eslint-disable @typescript-eslint/no-explicit-any */
import nextSWR, { SWRConfiguration, BareFetcher } from 'swr'
import { AxiosRequestConfig } from 'axios'
import { api, exibirError } from 'src/adapters'

type Response<T> = {
  data: NonNullable<T>
  loading: boolean
  mutate: () => void
  error: unknown
}

interface Options {
  showError?: boolean
}

export function useGetSWR<T>(
  pathKey: string,
  config?: AxiosRequestConfig & Options,
): Response<T> {
  const { data, error, mutate } = nextSWR<T>(
    pathKey,
    (): any =>
      api.get(pathKey, config) as SWRConfiguration<T, any, BareFetcher<T>>,
  )

  if (config && config.showError && error) {
    exibirError(error)
  }

  return { data, mutate, loading: !error && !data, error }
}
