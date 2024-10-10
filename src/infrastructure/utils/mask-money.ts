export function maskMoney(value = 0) {
  return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}
