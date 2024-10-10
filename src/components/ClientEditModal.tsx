// src/components/ClientEditModal.tsx

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from '@mui/material'
import { Client } from '../infrastructure/types/Client' // Usando o tipo Client

interface ClientEditModalProps {
  open: boolean
  handleClose: () => void
  client: Client | null
  onClientUpdated: () => void
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({
  open,
  handleClose,
  client,
  onClientUpdated,
}) => {
  const [name, setName] = useState('')
  const [companiesId, setCompaniesId] = useState('')

  useEffect(() => {
    if (client) {
      setName(client.name)
      setCompaniesId(client.companiesId.toString())
    }
  }, [client])

  const handleSave = async () => {
    // Aqui você implementa a lógica de edição do cliente (API call, etc.)
    await onClientUpdated()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Cliente</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="ID da Empresa"
          value={companiesId}
          onChange={(e) => setCompaniesId(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
