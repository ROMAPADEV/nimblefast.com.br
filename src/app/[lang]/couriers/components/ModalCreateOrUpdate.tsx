'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress,
  Box,
} from '@mui/material'
import { useFormik } from 'formik'
import { getDictionaryUseClient } from 'src/infrastructure/providers/intl/dictionaries/dictionary-use-client'
import { type Locale } from 'src/infrastructure/providers'
import { Input } from 'src/components'
import { api, exibirError } from 'src/adapters'
import { MotoboyCreate, Motoboy } from 'src/infrastructure/types'
import { validarForm } from './validar-erro-form'

interface Props {
  open: boolean
  lang: Locale
  motoboy?: Motoboy
  handleClose: () => void
  updateList: () => void
}

export const ModalCreateOrUpdate: React.FC<Props> = ({
  open,
  lang,
  motoboy,
  handleClose,
  updateList,
}) => {
  const [loading, setLoading] = useState(false)

  const dict = getDictionaryUseClient(lang)

  const formik = useFormik<MotoboyCreate>({
    initialValues: {
      name: '',
      whatsapp: '',
    },
    validationSchema: validarForm(dict),
    onSubmit: async (params: MotoboyCreate) => {
      try {
        setLoading(true)

        if (motoboy?.id) {
          await api.patch(`/motoboys/${motoboy?.id}`, params)
        } else {
          await api.post('/motoboys', params)
        }

        updateList()
        handleClose()
      } catch (error) {
        exibirError(error)
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastrar Novo Motoboy</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Input
              formik={formik}
              fullWidth
              label="Nome"
              name="name"
              autoComplete="name"
              autoFocus
              defaultValue={motoboy?.name}
              maxRows={80}
            />
            <Input
              id="whatsapp"
              key="whatsapp"
              type="tel"
              formik={formik}
              label="WhatsApp"
              name="whatsapp"
              maxRows={13}
              defaultValue={motoboy?.whatsapp}
              // mask="phone"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : motoboy?.id ? (
              'Atualizar'
            ) : (
              'Cadastrar'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
