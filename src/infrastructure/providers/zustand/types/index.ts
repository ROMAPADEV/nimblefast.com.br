export interface ColorModeState {
  colorMode: 'light' | 'dark'
  toggleColorMode: () => void
}

export interface DrawerState {
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

export interface Wallet {
  id: number
  walletId: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  wallets: Wallet[]
  config: {
    id: number
    usersId: number
    walletsIdSelected: number
  }
}

export interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  walletSelected?: Wallet | null
  setWalletSelected: (wallet: Wallet | null) => void
  logout: () => void
}

export interface ChangeLanguage {
  language: string
  changeLanguage: (x: string) => void
}
