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
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { usePDFJS } from 'src/infrastructure/hooks'
import axios from 'axios'
import CloudUpload from '@mui/icons-material/CloudUpload'
import LocationOn from '@mui/icons-material/LocationOn'
import { Address, Config } from 'src/infrastructure/types'
import { api, exibirError } from 'src/adapters'

interface ProcessPDFModalProps {
  open: boolean
  onClose: () => void
  clientId: number
  configs: Config[]
}

export const ProcessPDFModal: React.FC<ProcessPDFModalProps> = ({
  open,
  onClose,
  clientId,
  configs,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingCoordinates, setLoadingCoordinates] = useState<boolean>(false)
  const [snackbarMessage, setSnackbarMessage] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string

  const getCoordinates = async (address: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`,
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

  // Normaliza e limpa o texto extraído
  const normalizeText = (text: string): string => {
    console.log('Normalizando texto:', text)
    return text
      .replace(/\s+/g, ' ') // Reduzir múltiplos espaços
      .replace(/[^a-zA-Z0-9À-ÿ\s,.:/-]/g, '') // Remover caracteres especiais
      .replace(/\b(\d{5})(\d{3})\b/g, '$1-$2') // Formatar CEP com hífen
      .replace(/(CEP:\s*\d{5}-\d{3})/g, '\n$1') // Coloca cada CEP em uma nova linha
      .replace(/(Endereço:\s*[^\n]+)/g, '\n$1') // Coloca Endereço em nova linha
      .replace(/(Bairro:\s*[^\n]+)/g, '\n$1') // Coloca Bairro em nova linha
      .replace(/Complemento:\s*[^\n]*/, '') // Remover complemento se estiver vazio
      .replace(/Destinatario:\s*[^\n]*/, '') // Remove o campo "Destinatario"
      .replace(/REMETENTE:\s*[^\n]*/, '') // Remove o campo "REMETENTE"
      .replace(/DECLARAÇÃO DE CONTEÚDO/g, '') // Remove "DECLARAÇÃO DE CONTEÚDO"
      .replace(/Código de Rastreamento:\s*[^\n]*/, '') // Remove o campo de código de rastreamento
      .trim() // Remover espaços nas extremidades
  }

  const extractAddresses = (text: string): Address[] => {
    const addressList: Address[] = []
    const lines = text.split('\n')

    const cepRegex = /\bCEP:\s*(\d{5}-\d{3})\b/g
    const enderecoRegex = /Endereço:\s*(.*?)(?=\sEndereço:|$)/g
    const bairroRegex = /Bairro:\s*(.*?)(?=\sBairro:|$)/g

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
    }
    let id = 1

    lines.forEach((line) => {
      const normalizedLine = normalizeText(line)

      // Verificar se a linha contém CEP
      const cepMatch = cepRegex.exec(normalizedLine)
      if (cepMatch) {
        const exists = addressList.some(
          (address) =>
            address.postalCode === cepMatch[1] &&
            address.street === currentAddress.street,
        )

        if (!exists && currentAddress.postalCode && currentAddress.street) {
          addressList.push({ ...currentAddress })
          currentAddress = {
            id: ++id,
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
          }
        }
        currentAddress.postalCode = cepMatch[1]
      }

      // Verificar se a linha contém Endereço
      const enderecoMatch = enderecoRegex.exec(normalizedLine)
      if (enderecoMatch) {
        // Aqui, extraímos o número do endereço
        const enderecoCompleto = enderecoMatch[1].replace(/^Endereço:\s*/, '')
        const enderecoParts = enderecoCompleto.split(' ')
        const possibleNumber = enderecoParts.pop() // Obtém a última parte do endereço

        if (!isNaN(Number(possibleNumber))) {
          currentAddress.number = possibleNumber // Atribui o número se for válido
          currentAddress.street = enderecoParts.join(' ') // O restante é a rua
        } else {
          currentAddress.street = enderecoCompleto // Se não houver número, atribui o endereço completo
          currentAddress.number = '' // Define o número como vazio
        }
        console.log('Found street:', currentAddress.street)
        console.log('Found number:', currentAddress.number)
      }

      // // Verificar se a linha contém Complemento
      // const complementoMatch = complementoRegex.exec(normalizedLine)
      // if (complementoMatch) {
      //   currentAddress.complemento = complementoMatch[1].replace(
      //     /^Complemento:\s*/,
      //     '',
      //   ) // Remover prefixo 'Complemento:'
      // }

      // Verificar se a linha contém Bairro
      const bairroMatch = bairroRegex.exec(normalizedLine)
      if (bairroMatch) {
        currentAddress.neighborhood = bairroMatch[1].replace(/^Bairro:\s*/, '') // Remover prefixo 'Bairro:'
      }
    })

    // Adicionar o último bloco se houver dados completos (CEP e Endereço)
    if (
      currentAddress.postalCode &&
      currentAddress.street &&
      !addressList.some(
        (address) =>
          address.postalCode === currentAddress.postalCode &&
          address.street === currentAddress.street,
      )
    ) {
      addressList.push(currentAddress)
    }

    return addressList
  }

  usePDFJS(
    async (pdfjs) => {
      if (!selectedFile) return

      const fileReader = new FileReader()
      fileReader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer)

        try {
          const pdf = await pdfjs.getDocument(typedarray).promise
          let extractedText = ''

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()

            extractedText +=
              textContent.items.map((item: any) => item.str).join(' ') + '\n'
          }

          console.log('Texto extraído (antes da normalização):', extractedText)

          const normalizedText = normalizeText(extractedText)
          const foundAddresses = extractAddresses(normalizedText)
          setAddresses(foundAddresses)

          console.log('Endereços extraídos:', foundAddresses)
        } catch (error) {
          console.error('Erro ao processar o PDF:', error)
        }
      }

      fileReader.readAsArrayBuffer(selectedFile)
    },
    [selectedFile],
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setFileName(file.name)
    } else {
      alert('Por favor, selecione um arquivo PDF válido.')
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
            {/* Adicionada verificação para garantir que configs está definido */}
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
    { field: 'complement', headerName: 'Complemento', width: 200 },
    { field: 'lat', headerName: 'Latitude', width: 150 },
    { field: 'lng', headerName: 'Longitude', width: 150 },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="process-pdf-modal-title"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 4,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1E1E1E' : '#f4f6f8', // Cor de fundo clara
          maxWidth: 1500,
          maxHeight: 1000,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{ color: '#3f51b5', fontWeight: 'bold' }}
        >
          Processar Endereços Pdf
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />} // Ícone de upload
            component="label"
            sx={{
              padding: '10px 20px',
              backgroundColor: '#3f51b5',
              '&:hover': { backgroundColor: '#000616ab' },
            }}
          >
            Escolher Arquivo
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <Typography variant="body1" sx={{ marginLeft: 2, color: '#757575' }}>
            {fileName || 'Nenhum arquivo selecionado'}
          </Typography>
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
          <Typography variant="body1" align="center" sx={{ color: '#757575' }}>
            Nenhum endereço extraído ainda.
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
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
          <Button
            variant="outlined"
            color="secondary"
            sx={{ marginLeft: 2 }}
            onClick={onClose}
          >
            Fechar
          </Button>
        </Box>

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
      </Box>
    </Modal>
  )
}
