export interface Address {
  number: string
  id: number
  city: string
  lat: number
  lng: number
  neighborhood: string
  string: string
  postalCode: string
  state: string
  street: string
  tipo: string
  complemento?: string
}

export interface AddressComponent {
  types: string[];
  long_name: string;
  short_name: string;
}