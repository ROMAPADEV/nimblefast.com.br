export function removeMaskMoney(real: string) {
  return parseFloat(real.replace(/[^0-9,]/g, '').replace(',', '.'))
}
