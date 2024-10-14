export interface Package {
  id: number
  quantity: number
  value: string
  street: string
  neighborhood: string
  number: string
  city: string
  state: string
  postalCode: string
  lat: string
  lng: string
  companiesId: number
  motoboysId: number | null
  clientsId: number
  createdAt: string
  updatedAt: string
}
export interface PackageData {
  day: string
  items: Package[]
}
