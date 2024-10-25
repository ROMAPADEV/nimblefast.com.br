'use client'

/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
  IconButton,
  LinearProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import axios from 'axios'
import CloudUpload from '@mui/icons-material/CloudUpload'
import LocationOn from '@mui/icons-material/LocationOn'
import { Address, Config } from 'src/infrastructure/types'
import { api, exibirError } from 'src/adapters'
import Tesseract from 'tesseract.js'

interface ProcessImageModalProps {
  open: boolean
  onClose: () => void
  clientId: number
  configs: Config[]
}

export const ProcessImageModal: React.FC<ProcessImageModalProps> = ({
  open,
  onClose,
  clientId,
  configs,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingCoordinates, setLoadingCoordinates] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [snackbarMessage, setSnackbarMessage] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string

  const getCoordinates = async (address: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${GOOGLE_API_KEY}`,
      )
      const location = response.data.results[0]?.geometry.location
      const addressComponents = response.data.results[0]?.address_components

      const cityComponent = addressComponents?.find(
        (comp: any) =>
          comp.types.includes('locality') ||
          comp.types.includes('administrative_area_level_2'),
      )
      const stateComponent = addressComponents?.find((comp: any) =>
        comp.types.includes('administrative_area_level_1'),
      )

      const city = cityComponent?.long_name || ''
      const state = stateComponent?.short_name || ''

      return {
        lat: location?.lat || '',
        long: location?.lng || '',
        city,
        state,
      }
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error)
      return { lat: '', long: '', city: '', state: '' }
    }
  }

  const handleGetCoordinates = async () => {
    try {
      setLoadingCoordinates(true)

      const updatedAddresses = await Promise.all(
        addresses.map(async (address) => {
          const fullAddress = `${address.street}, ${address.neighborhood}, ${address.postalCode}`

          const coords = await getCoordinates(fullAddress)

          const configSelected = configs.find(
            (config) => config.name === address.tipo,
          )

          if (coords.lat && coords.long && configSelected) {
            const addressData = {
              street: address.street || '',
              neighborhood: address.neighborhood || '',
              city: coords.city || '',
              state: coords.state || '',
              postalCode: address.postalCode || '',
              number: address.number || '',
              lat: String(coords.lat),
              lng: String(coords.long),
              quantity: 1,
              value: Number(configSelected.value),
              clientsId: clientId,
            }

            await api.post('/packages', addressData)

            setSnackbarMessage({
              open: true,
              message: 'Endereços salvos com sucesso!',
              severity: 'success',
            })
          }

          return { ...address, lat: coords.lat, long: coords.long }
        }),
      )

      setAddresses(updatedAddresses)
      onClose()
    } catch (error) {
      exibirError(error)
    } finally {
      setLoadingCoordinates(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarMessage({ ...snackbarMessage, open: false })
  }

  const handleSelectChange = (id: number, value: string) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address.id === id ? { ...address, tipo: value } : address,
      ),
    )
  }

  const setDefaultTypeForAddresses = (addresses: Address[]) => {
    return addresses.map((address) => {
      if (!address.tipo && configs.length > 0) {
        address.tipo = configs[0].name
      }
      return address
    })
  }

  const renderProgressBar = () => (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 10,
        background: 'linear-gradient(to right, #3f51b5, #2196f3)',
        borderRadius: '5px',
      }}
    />
  )

  const normalizeText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^a-zA-Z0-9À-ÿ\s,.:/-]/g, '')
      .replace(/\b(\d{5})(\d{3})\b/g, '$1-$2')
      .replace(/(CEP:\s*\d{5}-\d{3})/g, '\n$1')
      .replace(/(Endereço:\s*[^\n]+)/g, '\n$1')
      .replace(/(Bairro:\s*[^\n]+)/g, '\n$1')
      .replace(/Run\b/g, 'Rua')
      .replace(/([A-Za-z]+)o\b/g, '$1ão')
      .trim()
  }

  const extractAddresses = (text: string): Address[] => {
    const addressList: Address[] = []
    const lines = text.split('\n')

    const cepRegex = /\bCEP:\s*(\d{5}-\d{3})\b/g
    const enderecoRegex = /Endereço:\s*(.*?)(?=\sEndereço:|$)/g
    const bairroRegex = /Bairro:\s*([^\n]+)/g

    let currentAddress: Address = {
      id: 1,
      postalCode: '',
      street: '',
      neighborhood: '',
      city: '',
      lat: 0,
      lng: 0,
      string: '',
      state: '',
      number: '',
      tipo: '',
      complemento: '',
    }
    let id = 1

    lines.forEach((line) => {
      const normalizedLine = normalizeText(line)

      const cepMatch = cepRegex.exec(normalizedLine)
      if (cepMatch) {
        currentAddress.postalCode = cepMatch[1]
      }

      const enderecoMatch = enderecoRegex.exec(normalizedLine)
      if (enderecoMatch) {
        const enderecoCompleto = enderecoMatch[1].replace(/^Endereço:\s*/, '')
        const enderecoParts = enderecoCompleto.split(' ')
        const possibleNumber = enderecoParts.pop()

        if (!isNaN(Number(possibleNumber))) {
          currentAddress.number = possibleNumber
          currentAddress.street = enderecoParts.join(' ')
        } else {
          currentAddress.street = enderecoCompleto
          currentAddress.number = ''
        }
      }

      const bairroMatch = bairroRegex.exec(text)
      if (bairroMatch) {
        currentAddress.neighborhood = bairroMatch[1].replace(':', '').trim()
      }

      if (currentAddress.postalCode && currentAddress.street) {
        addressList.push({ ...currentAddress, id: id++ })

        currentAddress = {
          id,
          postalCode: '',
          street: '',
          neighborhood: '',
          city: '',
          lat: 0,
          lng: 0,
          string: '',
          state: '',
          number: '',
          tipo: '',
          complemento: '',
        }
      }
    })

    return addressList
  }

  const processImage = async (file: File) => {
    try {
      const processedImage = file

      Tesseract.recognize(processedImage, 'eng+por', {})
        .then(({ data }) => {
          const extractedText = data.text

          if (!extractedText || extractedText.trim() === '') {
            console.error('Nenhum texto foi extraído.')
            return
          }

          let foundAddresses = extractAddresses(extractedText).map(
            (address) => ({
              ...address,
              id: generateUniqueId(),
            }),
          )

          foundAddresses = setDefaultTypeForAddresses(foundAddresses)

          foundAddresses.forEach((address) => {})

          if (foundAddresses.length > 0) {
            const addressesWithId = foundAddresses.map((address) => ({
              ...address,
              id: generateUniqueId(),
            }))

            // Atualiza o estado com os endereços extraídos
            setAddresses((prevAddresses) => [
              ...prevAddresses,
              ...addressesWithId,
            ])
          } else {
            console.warn('Nenhum endereço foi extraído da imagem.')
          }
        })
        .catch((error) => {
          console.error('Erro ao reconhecer a imagem no Tesseract:', error)
        })
    } catch (error) {
      console.error('Erro ao processar a imagem:', error)
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
      await processImage(file)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 180,
      renderCell: (params) => (
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={params.row.tipo || ''}
            label="Tipo"
            onChange={(e) => handleSelectChange(params.row.id, e.target.value)}
          >
            {(configs && configs.length > 0 ? configs : []).map((config) => (
              <MenuItem key={config.id} value={config.name}>
                {config.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    { field: 'postalCode', headerName: 'CEP', width: 130 },
    { field: 'street', headerName: 'Endereço', width: 250 },
    { field: 'number', headerName: 'Número', width: 120 },
    { field: 'neighborhood', headerName: 'Bairro', width: 150 },
    { field: 'lat', headerName: 'Latitude', width: 150 },
    { field: 'lng', headerName: 'Longitude', width: 150 },
  ]

  const generateUniqueId = (() => {
    let counter = 1
    return () => counter++
  })()

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="process-image-modal">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1E1E1E' : '#f4f6f8',
          borderRadius: 4,
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
          maxWidth: '80vw',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {progress > 0 && progress < 100 && (
          <Box sx={{ marginBottom: 2 }}>{renderProgressBar()}</Box>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#757575',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" align="center" sx={{ color: '#3f51b5' }}>
          Faça upload ou tire uma foto
        </Typography>
        <Divider sx={{ marginBottom: 4 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 3,
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {selectedFile && !imagePreview ? (
            <CircularProgress size={40} />
          ) : imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '400px', // Limita a altura da imagem
                objectFit: 'contain',
              }}
            />
          ) : (
            <Typography variant="body1">Nenhuma imagem selecionada.</Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            component="label"
          >
            Escolher Arquivo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        {addresses.length > 0 ? (
          <Box sx={{ height: 500, width: '100%', marginTop: 2 }}>
            <DataGrid
              rows={addresses}
              columns={columns}
              pageSizeOptions={[5]}
            />
          </Box>
        ) : (
          <Typography variant="body1" align="center">
            Nenhum endereço extraído ainda.
          </Typography>
        )}

        {addresses.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<LocationOn />}
              onClick={handleGetCoordinates}
              disabled={loadingCoordinates}
            >
              {loadingCoordinates ? (
                <CircularProgress size={24} />
              ) : (
                'Salvar Coordenadas'
              )}
            </Button>
          </Box>
        )}

        <Snackbar
          open={snackbarMessage.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarMessage.severity}
          >
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  )
}
