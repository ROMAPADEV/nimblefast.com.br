import { PolygonPath } from 'src/infrastructure/types'

export interface ColorModeState {
  colorMode: 'light' | 'dark'
  toggleColorMode: () => void
}

export interface DrawerState {
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

export interface User {
  id: number
  name: string
  email: string
  image?: string
}

export interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export interface ChangeLanguage {
  language: string
  changeLanguage: (x: string) => void
}

export interface PolygonState {
  polygons: PolygonPath[][]
  date: Date | null
  setPolygon: (polygon: PolygonPath[]) => void
  clearPolygon: () => void
  setDate: (date: Date) => void
}
