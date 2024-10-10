import invariant from 'invariant'

export const getInputById = (id: string): HTMLInputElement => {
  const input = document.getElementById(id)
  invariant(
    input instanceof HTMLInputElement,
    `Input ${id} não encontrado no documento`,
  )
  return input
}

export default getInputById
