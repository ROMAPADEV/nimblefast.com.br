/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { ReactElement, useEffect } from 'react'
import { AppProvider } from '@toolpad/core/AppProvider'
import { ProviderLayout } from 'src/components'
import { type Locale } from 'src/infrastructure/providers/index'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PersonIcon from '@mui/icons-material/Person'
import { useAppTheme } from 'src/infrastructure/hooks'
import type { Session, Router, Navigation } from '@toolpad/core'
import MapIcon from '@mui/icons-material/Map'
import { getCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
// import { useAuth } from 'src/infrastructure/providers/index'

interface Props {
  children: ReactElement
  params: { lang: Locale }
}

export default function RootLayout({ children, params }: Props) {
  const getNavigation = (lang: string): Navigation => [
    {
      kind: 'header',
      title: 'Gestão Flex',
    },
    {
      segment: `${lang}/dashboard`,
      title: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      kind: 'divider',
    },
    {
      segment: `${lang}/clients`,
      title: 'Clientes',
      icon: <PersonIcon />,
    },
    {
      segment: `${lang}/couriers`,
      title: 'Motoboys',
      icon: <LocalShippingIcon />,
    },
    {
      segment: `${lang}/maps`,
      title: 'Mapa',
      icon: <MapIcon />,
    },
  ]

  const theme = useAppTheme(params.lang)
  const router = useRouter()

  const [session, setSession] = React.useState<Session | null>({
    user: {
      name: 'Usuario',
      email: 'example@gmail.com',
      image: 'https://avatars.githubusercontent.com/u/19550456',
    },
  })

  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({
          user: {
            name: 'Usuario',
            email: 'Usuario@example.com',
            image: 'https://avatars.githubusercontent.com/u/19550456',
          },
        })
      },
      signOut: () => {
        router.push(`/${params.lang}/auth/logout`)
      },
    }
  }, [router, params.lang])

  return (
    <html lang={params.lang}>
      <body>
        <AppProvider
          session={session}
          authentication={authentication}
          navigation={getNavigation(params.lang)}
          branding={{ title: 'NimbleFast' }}
          theme={theme}
        >
          <ProviderLayout locale={params.lang}>{children}</ProviderLayout>
        </AppProvider>
      </body>
    </html>
  )
}
