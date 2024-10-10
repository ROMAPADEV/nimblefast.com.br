import { LatLngWithAddress } from './'
export interface Config {
  id: number
  name: string
  value: string
  createdAt: string
}
export interface Client {
  id: string
  name: string
  companiesId: number
  createdAt: string
  updatedAt: string
  configurations: Config[]
}

export interface Motoboy {
  id: string
  name: string
  whatsapp: string
  createdAt: string
  updatedAt: string
}

export interface PolygonPath {
  lat: number
  lng: number
}

export interface MapaBaseProps {
  children: React.ReactNode
  center: LatLngWithAddress
  libraries?: ('places' | 'geometry' | 'drawing')[]
  mapOptions?: google.maps.MapOptions
}
