'use client'

import { useState } from 'react'
import { FormControl, Link, Typography, Box, Grid, Paper } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { setCookie } from 'cookies-next'
import { useFormik } from 'formik'
import { useRouter } from 'next/navigation'
import { getDictionaryUseClient } from 'src/infrastructure/providers/intl/dictionaries/dictionary-use-client'
import Image from 'next/image'
import { type Locale } from 'src/infrastructure/providers'
import { api, exibirError } from 'src/adapters'
import { Signin } from 'src/infrastructure/types'
import { Input } from 'src/components'
import { validarFormSignin } from './validar-erro-form'

interface Props {
  params: {
    lang: Locale
  }
}

export default function Auth({ params }: Props) {
  const { lang } = params
  const dict = getDictionaryUseClient(lang)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const formik = useFormik<Signin>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validarFormSignin(dict),
    onSubmit: async (params: Signin) => {
      console.log('Iniciando login com os dados:', params) // Log para ver os dados do formulário
      try {
        setLoading(true)

        const response = await api.post('/auth/signin', params)
        console.log('Resposta da API:', response) // Log para ver a resposta da API

        const {
          data: { token, user }, // Supondo que a API também retorne os dados do usuário
        } = response

        console.log('Token recebido:', token) // Verificando o token recebido
        console.log('Usuário recebido:', user) // Verificando os dados do usuário

        setCookie('token', token)
        setCookie('refreshtoken', token)
        setCookie('NEXT_LOCALE', lang)

        // Salvando os dados do usuário, se necessário
        setCookie('user', JSON.stringify(user))

        router.replace(`/${lang}/`)
      } catch (error) {
        console.error('Erro ao fazer login:', error) // Log do erro
        exibirError(error)
        setError('Erro ao fazer login. Verifique seus dados.')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ height: '100vh', position: 'relative' }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundImage: 'url(/images/curves.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Paper
        elevation={10}
        sx={{
          maxWidth: 1000,
          width: '100%',
          display: 'flex',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#fff',
            p: 5,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'black',
                mt: 2,
                fontSize: '1.5rem',
              }}
            >
              Bem vindo a
            </Typography>
            <Image
              src="/images/NimbleLogo.png"
              alt="Nimble Logo"
              width={150}
              height={150}
            />
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ mb: 3, color: 'gray' }}
            >
              Acesse seu painel e gerencie suas entregas com rapidez e
              eficiência.
            </Typography>

            {error && (
              <Typography
                variant="body2"
                color="error"
                align="center"
                sx={{ mb: 2 }}
              >
                {error}
              </Typography>
            )}

            <form onSubmit={formik.handleSubmit}>
              <FormControl fullWidth variant="outlined">
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
              </FormControl>

              <FormControl fullWidth variant="outlined">
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
              </FormControl>

              <LoadingButton
                type="submit"
                fullWidth
                loading={loading}
                variant="contained"
                sx={{
                  background: 'linear-gradient(to right, #6A5ACD, #483D8B)',
                  color: '#fff',
                  padding: '10px',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  '&:hover': {
                    background: '#483D8B',
                  },
                  mt: 2,
                }}
              >
                Faça login
              </LoadingButton>
            </form>

            <Box display="flex" justifyContent="flex-end" sx={{ my: 2 }}>
              <Link href="#" variant="body2" color="primary">
                Não tem uma conta? Crie aqui
              </Link>
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          xs={false}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Image
              src="/images/mervii-rider2.svg"
              width={500}
              height={500}
              alt="Mervii Rider Logo"
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </Box>
        </Grid>
      </Paper>
    </Grid>
  )
}
