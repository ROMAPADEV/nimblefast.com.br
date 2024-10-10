import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material'
import { api } from 'src/adapters'
import { Motoboy } from 'src/infrastructure/types/Client' // Certifique-se de usar o caminho correto para a tipagem

interface MotoboyEditModalProps {
  open: boolean
  handleClose: () => void
  motoboy: Motoboy | null
  onMotoboyUpdated: () => void
}

export const MotoboyEditModal: React.FC<MotoboyEditModalProps> = ({
  open,
  handleClose,
  motoboy,
  onMotoboyUpdated,
}) => {
  const [name, setName] = useState(motoboy?.name || '')
  const [whatsapp, setWhatssapp] = useState(motoboy?.whatsapp || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (motoboy) {
      setName(motoboy.name)
      setWhatssapp(motoboy.whatsapp)
    }
  }, [motoboy])

  const handleSave = async () => {
    if (!motoboy) return

    setLoading(true)
    try {
      await api.put(`/motoboys/${motoboy.id}`, { name, whatsapp })
      onMotoboyUpdated()
      handleClose()
    } catch (error) {
      console.error('Erro ao atualizar motoboy:', error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Editar Motoboy</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nome do Motoboy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatssapp(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSave} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
