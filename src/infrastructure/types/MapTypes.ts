/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LatLng {
  lat: number
  lng: number
}

export interface LatLngWithAddress extends LatLng {
  number?: string
  street?: string
  id: number
  address?: string
  cep?: string
  state?: string
  city?: string
  postalCode?: string
}

export interface PkgsToMotoboy {
  addresses: LatLngWithAddress[]
}

export interface MapaProps {
  addresses: LatLng[]
  baseLocation: LatLng | null
  onConfirmSelection: (selectedAddresses: LatLngWithAddress[]) => void
  setAddresses: React.Dispatch<React.SetStateAction<LatLng[]>>
  directions: google.maps.DirectionsResult | null
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const workerSrc: any
}
