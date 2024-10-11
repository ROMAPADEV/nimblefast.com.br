'use client'

import 'react-toastify/dist/ReactToastify.css'
import { ReactElement } from 'react'
import { usePathname } from 'src/navigation'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { CssBaseline } from '@mui/material'
import { NextIntlClientProvider } from 'next-intl'
import { ToastContainer } from 'react-toastify'
import { useDateFnsLocale } from 'src/infrastructure/hooks'
import { DashboardLayout } from '@toolpad/core/DashboardLayout'
import { type Locale } from 'src/infrastructure/providers/index'

interface Props {
  children: ReactElement
  locale: Locale
}

interface PropsSwitchLayout {
  children: ReactElement
}

const routes = ['/auth', '/auth/logout', '/auth/signup', '/rota']

function SwitchLayout({ children }: PropsSwitchLayout) {
  const pathname = usePathname()

  switch (true) {
    case pathname.startsWith('/rota'):
      return <>{children}</>

    case routes.includes(pathname):
      return <>{children}</>

    default:
      return <DashboardLayout>{children}</DashboardLayout>
  }
}

export function ProviderLayout({ children, locale }: Props) {
  const dateFnsLocale = useDateFnsLocale(locale)

  return (
    <NextIntlClientProvider locale={locale}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={dateFnsLocale}
      >
        <CssBaseline />
        <SwitchLayout>{children}</SwitchLayout>
        <ToastContainer />
      </LocalizationProvider>
    </NextIntlClientProvider>
  )
}
