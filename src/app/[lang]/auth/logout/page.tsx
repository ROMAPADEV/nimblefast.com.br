'use client'

import { useEffect } from 'react'
import { Box } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { getDictionaryUseClient } from 'src/infrastructure/providers/intl/dictionaries/dictionary-use-client'
import { deleteCookie } from 'cookies-next'
import { useRouter } from 'src/navigation'
import { type Locale, useAuth } from 'src/infrastructure/providers'

interface Props {
  params: {
    lang: Locale
  }
}

export default function Logout({ params }: Props) {
  const dict = getDictionaryUseClient(params.lang)

  const { logout } = useAuth()
  const navigate = useRouter()

  useEffect(() => {
    deleteCookie('token')
    deleteCookie('refreshtoken')
    deleteCookie('NEXT_LOCALE')
    logout()
    navigate.push('/auth')
  }, [logout, navigate])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
      <Typography mt={3}>{dict.pages.auth.logout.title}</Typography>
    </Box>
  )
}
