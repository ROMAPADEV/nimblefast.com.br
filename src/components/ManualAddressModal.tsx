import React, { useState, useEffect } from 'react'
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
  IconButton,
} from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete'
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
  const [isRecording, setIsRecording] = useState(false)

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'br' },
    },
    debounce: 300,
  })

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API is not supported in this browser.')
    }
  }, [])

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado neste navegador.')
      return
    }

    const SpeechRecognition =
      window.webkitSpeechRecognition as SpeechRecognitionConstructor

    const recognition = new SpeechRecognition()

    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('Reconhecimento de voz iniciado')
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      console.log('Resultado de voz:', speechResult)

      setValue(speechResult)
    }

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error)
    }

    recognition.onend = () => {
      console.log('Reconhecimento de voz finalizado')
      setIsRecording(false)
    }

    recognition.start()
  }

  const handleSelect = async (address: string) => {
    setValue(address, false)
    clearSuggestions()

    try {
      const results = await getGeocode({ address })
      const { lat, lng } = await getLatLng(results[0])

      setStreet(
        results[0].address_components.find((c) => c.types.includes('route'))
          ?.long_name || '',
      )
      setNumber(
        results[0].address_components.find((c) =>
          c.types.includes('street_number'),
        )?.long_name || '',
      )
      setNeighborhood(
        results[0].address_components.find((c) =>
          c.types.includes('sublocality'),
        )?.long_name || '',
      )
      setCity(
        results[0].address_components.find((c) =>
          c.types.includes('administrative_area_level_2'),
        )?.long_name || '',
      )
      setState(
        results[0].address_components.find((c) =>
          c.types.includes('administrative_area_level_1'),
        )?.short_name || '',
      )
      setPostalCode(
        results[0].address_components.find((c) =>
          c.types.includes('postal_code'),
        )?.long_name || '',
      )

      setLat(lat.toString())
      setLng(lng.toString())
    } catch (error) {
      console.error('Error: ', error)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const addressData = {
        street,
        neighborhood,
        city,
        state,
        postalCode,
        number,
        lat: String(lat),
        lng: String(lng),
        quantity: 1,
        value: 28.0,
        clientsId: clientId,
      }

      await api.post('/packages', addressData)
      setSnackbarMessage('Endereço cadastrado com sucesso!')
      setSnackbarOpen(true)
      handleClose()
    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error)
      setSnackbarMessage('Erro ao cadastrar endereço. Tente novamente.')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return <CircularProgress />
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastrar Endereço Manualmente</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center">
            <TextField
              label="Digite o endereço"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!ready}
              fullWidth
            />
            <IconButton
              onClick={startRecognition}
              color={isRecording ? 'secondary' : 'primary'}
            >
              <MicIcon />
            </IconButton>
          </Box>
          {status === 'OK' && (
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: '8px',
                position: 'absolute',
                zIndex: 999,
                backgroundColor: '#fff',
                maxHeight: '150px',
                overflowY: 'auto',
                width: '100%',
              }}
            >
              {data.map((suggestion) => (
                <Box
                  key={suggestion.place_id}
                  sx={{
                    padding: '10px',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                  onClick={() => handleSelect(suggestion.description)}
                >
                  {suggestion.description}
                </Box>
              ))}
            </Box>
          )}

          <TextField label="CEP" value={postalCode} fullWidth disabled />
          <TextField label="Rua" value={street} fullWidth disabled />
          <TextField label="Número" value={number} fullWidth disabled />
          <TextField label="Bairro" value={neighborhood} fullWidth disabled />
          <TextField label="Cidade" value={city} fullWidth disabled />
          <TextField label="Estado" value={state} fullWidth disabled />
          <TextField label="Latitude" value={lat} fullWidth disabled />
          <TextField label="Longitude" value={lng} fullWidth disabled />
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
