'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
} from '@mui/material'
import { api, exibirError } from 'src/adapters'

interface PriceModalProps {
  open: boolean
  handleClose: () => void
  onPriceConfigured: () => void
  clientId: string | null
}

export const PriceModal: React.FC<PriceModalProps> = ({
  open,
  handleClose,
  onPriceConfigured,
  clientId,
}) => {
  const [name, setName] = useState('')
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleConfigurePrice = async () => {
    if (!clientId) {
      console.error('Client ID não disponível')
      return
    }

    setLoading(true)

    try {
      const priceData = {
        name,
        value: parseFloat(value.replace('R$ ', '').replace(',', '.')),
        clientsId: parseInt(clientId),
      }

      await api.post('/config', priceData)

      setName('')
      setValue('')
      onPriceConfigured()
      handleClose()
    } catch (error) {
      exibirError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configurar Preço</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nome da Configuração"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Valor (R$)"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleConfigurePrice}
          color="primary"
          disabled={loading || !name || !value}
        >
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
