import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  ColorModeState,
  DrawerState,
  AuthState,
  User,
  ChangeLanguage,
} from './types'

export const useColorMode = create<ColorModeState>()(
  persist(
    (set) => ({
      colorMode: 'light',
      toggleColorMode: () => {
        set(({ colorMode }) => ({
          colorMode: colorMode === 'light' ? 'dark' : 'light',
        }))
      },
    }),
    {
      name: 'color-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        colorMode: state.colorMode,
      }),
    },
  ),
)

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User | null) => {
        set({ user })
      },
      logout: () => {
        set({
          user: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const useDrawer = create<DrawerState>((set) => ({
  open: false,
  closeDrawer: () => {
    set({ open: false })
  },
  openDrawer: () => {
    set({ open: true })
  },
}))

export const useChangeLanguage = create<ChangeLanguage>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      changeLanguage: (language) => {
        set({ language })
      },
    }),
    {
      name: 'change-language',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
