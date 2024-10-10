'use client'

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
import axios from 'axios'
import { getLatLngFromAddress } from 'src/infrastructure/utils'
import { api } from 'src/adapters'

interface ManualAddressModalProps {
  open: boolean
  handleClose: () => void
  clientId: number
}

export const ManualAddressModal: React.FC<ManualAddressModalProps> = ({
  open,
  handleClose,
  clientId,
}) => {
  const [postalCode, setPostalCode] = useState('')
  const [street, setStreet] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [number, setNumber] = useState('')
  const [lat, setLat] = useState<string>('')
  const [lng, setLng] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const fetchAddress = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      const { logradouro, bairro, localidade, uf } = response.data

      setStreet(logradouro)
      setNeighborhood(bairro)
      setCity(localidade)
      setState(uf)
    } catch (error) {
      console.error('Erro ao buscar endereço:', error)
    }
  }

  const handlePostalCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value
    setPostalCode(value)

    if (value.length === 8) {
      fetchAddress(value)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const coordinates = await getLatLngFromAddress(
        `${street}, ${city}, ${state}`,
      )

      if (coordinates && coordinates.lat && coordinates.lng) {
        const addressData = {
          street,
          neighborhood,
          city,
          state,
          postalCode,
          number,
          lat: String(coordinates.lat),
          lng: String(coordinates.lng),
          quantity: 1,
          value: 28.0,
          clientsId: clientId,
        }

        await api.post('/packages', addressData)
        setSnackbarMessage('Endereço cadastrado com sucesso!')
        setSnackbarOpen(true)
        handleClose()
      } else {
        throw new Error('Erro ao obter coordenadas')
      }
    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error)
      setSnackbarMessage('Erro ao cadastrar endereço. Tente novamente.')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastrar Endereço Manualmente</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="CEP"
            value={postalCode}
            onChange={handlePostalCodeChange}
            fullWidth
          />
          <TextField
            label="Rua"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            fullWidth
          />
          <TextField
            label="Bairro"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            fullWidth
          />
          <TextField
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            fullWidth
          />
          <TextField
            label="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
            fullWidth
          />
          <TextField
            label="Número"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
          />
          <TextField
            label="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            fullWidth
            disabled
          />
          <TextField
            label="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            fullWidth
            disabled
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
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}
