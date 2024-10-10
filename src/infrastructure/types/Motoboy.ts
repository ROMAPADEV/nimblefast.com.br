export interface Motoboy {
  id: number
  name: string
  whatsapp: string
  companiesId: number
  createdAt: string
  updatedAt: string
}

export interface MotoboyCreate {
  name: string
  whatsapp: string
}
