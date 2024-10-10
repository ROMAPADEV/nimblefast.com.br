'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import { api } from 'src/adapters'

interface ClientModalProps {
  open: boolean
  handleClose: () => void
  onClientAdded: () => void // Callback para atualizar a lista de clientes após o cadastro
}

export const ClientModal: React.FC<ClientModalProps> = ({
  open,
  handleClose,
  onClientAdded,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning',
  })

  const handleSubmit = async () => {
    if (!name || !email || !address) {
      setSnackbarMessage({
        open: true,
        message: 'Todos os campos são obrigatórios.',
        severity: 'warning',
      })
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/clients', {
        name,
        email,
        address,
      })

      setSnackbarMessage({
        open: true,
        message: 'Cliente cadastrado com sucesso!',
        severity: 'success',
      })

      setLoading(false)
      setName('')
      setEmail('')
      setAddress('')
      onClientAdded()
      handleClose()
    } catch (error) {
      setSnackbarMessage({
        open: true,
        message: 'Erro ao cadastrar cliente. Tente novamente.',
        severity: 'error',
      })
      setLoading(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarMessage((prevState) => ({ ...prevState, open: false }))
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nome do Cliente"
              value={name}
              onChange={(e: {
                target: { value: React.SetStateAction<string> }
              }) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="E-mail do Cliente"
              value={email}
              onChange={(e: {
                target: { value: React.SetStateAction<string> }
              }) => setEmail(e.target.value)}
              fullWidth
              helperText="Formato: example@gmail.com"
            />

            <TextField
              label="Endereço do Cliente"
              value={address}
              onChange={(e: {
                target: { value: React.SetStateAction<string> }
              }) => setAddress(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarMessage.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage.severity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage.message}
        </Alert>
      </Snackbar>
    </>
  )
}
