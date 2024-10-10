import { api, exibirError } from 'src/adapters'

interface Options {
  showError: boolean
}

export function useDelete(options?: Options) {
  async function deletar(url: string) {
    try {
      await api.del(url)
    } catch (error) {
      if (options && options.showError) {
        exibirError(error)
        throw error
      }
    }
  }

  return { deletar }
}
