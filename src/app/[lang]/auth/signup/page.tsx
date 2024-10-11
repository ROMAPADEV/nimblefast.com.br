'use client'

import { useState } from 'react'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { getDictionaryUseClient } from 'src/infrastructure/providers/intl/dictionaries/dictionary-use-client'
import { type Locale } from 'src/infrastructure/providers'
import { LoadingButton } from '@mui/lab'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'
import { useFormik } from 'formik'
import { Input } from 'src/components'
import { api, exibirError } from 'src/adapters'
import { Signup } from 'src/infrastructure/types'
import { validarFormSignup } from '../validar-erro-form'

interface Props {
  params: {
    lang: Locale
  }
}

export default function Page({ params }: Props) {
  const { lang } = params
  const dict = getDictionaryUseClient(lang)

  const [laoding, setLoading] = useState(false)

  const router = useRouter()

  const formik = useFormik<Signup>({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: validarFormSignup(dict),
    onSubmit: async (data: Signup) => {
      try {
        setLoading(true)

        const params = {
          type: 'admin',
          companyName: 'Default',
          ...data,
        }

        await api.post('/auth/signup', params)

        toast.success(dict.validation.userCreated)
        router.replace(`/${lang}/auth`)
      } catch (error) {
        exibirError(error)
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Container component="main" maxWidth="xs">
      <Box ml={1} component="h1" color="#aaa">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            {dict.pages.auth.signup}
          </Typography>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 1, width: '100%' }}
          >
            <Input
              formik={formik}
              margin="normal"
              fullWidth
              label={dict.pages.auth.name}
              name="name"
              autoFocus
              maxRows={100}
            />
            <Input
              formik={formik}
              margin="normal"
              fullWidth
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              maxRows={150}
            />
            <Input
              formik={formik}
              margin="normal"
              fullWidth
              name="password"
              label={dict.pages.auth.password}
              type="password"
              autoComplete="current-password"
              maxRows={200}
            />
            <Input
              formik={formik}
              margin="normal"
              fullWidth
              name="password2"
              label={dict.pages.auth.confirmeSenha}
              type="password"
              autoComplete="current-password"
              maxRows={200}
            />
            <LoadingButton
              type="submit"
              fullWidth
              loading={laoding}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {dict.pages.auth.register}
            </LoadingButton>
            <Grid display="flex" justifyContent="center">
              <Grid item>
                <Link href={`/${lang}/auth`} variant="body2">
                  {dict.pages.auth.signin}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
