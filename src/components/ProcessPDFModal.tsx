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
import { usePDFJS } from 'src/infrastructure/hooks'
import axios from 'axios'
import CloudUpload from '@mui/icons-material/CloudUpload'
import LocationOn from '@mui/icons-material/LocationOn'
import { Address, Config } from 'src/infrastructure/types'
import { api, exibirError } from 'src/adapters'
import Tesseract from 'tesseract.js'

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
      .replace(/\s*NO\b/g, '')
      .replace(/\s*\/\s*$/, '')
      .replace(/Complemento:\s*[^\n]*/, '')
      .replace(/Destinatario:\s*[^\n]*/, '')
      .replace(/REMETENTE:\s*[^\n]*/, '')
      .replace(/DECLARAÇÃO DE CONTEÚDO/g, '')
      .replace(/Código de Rastreamento:\s*[^\n]*/, '')
      .trim()
  }

  const extractShopeeData = (text: string): Address[] => {
    const addressList: Address[] = []
    console.log('SHOOPPE AGORA', addressList)

    const cepRegex = /CEP:\s*(\d{5}-\d{3})/g
    const enderecoRegex =
      /(Rua|Avenida|Travessa|Alameda)\s*([^\n,]+),\s*(\d+)\b(?!\s*[:A-Za-z])/g

    const bairroRegex = /Bairro:\s*([^|&\n]+)/g
    // const destinatarioRegex = /DESTINATÁRIO\s*:\s*([^\n]+)/g

    let currentAddress: Address = {
      id: 1,
      postalCode: '',
      street: '',
      neighborhood: '',
      city: 'São Paulo',
      lat: 0,
      lng: 0,
      string: '',
      state: 'SP',
      number: '',
      tipo: 'Shopee',
      complemento: '',
    }
    let id = 1

    const cepMatch = cepRegex.exec(text)
    const enderecoMatch = enderecoRegex.exec(text)
    const bairroMatch = bairroRegex.exec(text)
    // const destinatarioMatch = destinatarioRegex.exec(text)

    if (cepMatch) currentAddress.postalCode = cepMatch[1]
    if (enderecoMatch) {
      currentAddress.street = `${enderecoMatch[1]} ${enderecoMatch[2]}`.trim()
      currentAddress.number = enderecoMatch[3]
    }
    if (bairroMatch) {
      currentAddress.neighborhood = bairroMatch[1].replace(':', '').trim()
    }
    // if (destinatarioMatch) currentAddress.string = destinatarioMatch[1]

    if (currentAddress.postalCode && currentAddress.street) {
      currentAddress.id = id++
      addressList.push(currentAddress)
    }

    return addressList
  }

  const extractNewTypeAddresses = async (text: string): Promise<Address[]> => {
    const addressList: Address[] = []
    const lines = text.split('\n')

    const cepRegex = /\bCEP:\s*(\d{5}-\d{3})\b/gi
    const enderecoRegex = /End:\s*(.*?),?\s*(N[ºo]?\s*\d+)\s*[^\d\s]?/gi // Inclui suporte para "Nº"
    const cidadeRegex = /Cidade:\s*(.*?)-\s*(\w{2})/gi // Captura cidade e estado
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
      complemento: '', // Novo campo para complemento
      tipo: '',
    }
    let id = 1

    for (const line of lines) {
      const normalizedLine = normalizeText(line)

      // Captura o CEP
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
            complemento: '',
            tipo: '',
          }
        }
        currentAddress.postalCode = cepMatch[1]
      }

      // Captura o Endereço e Número
      const enderecoMatch = enderecoRegex.exec(normalizedLine)
      if (enderecoMatch) {
        const enderecoCompleto = enderecoMatch[1].replace(/^End:\s*/, '')
        currentAddress.street = enderecoCompleto.trim()
        currentAddress.number = enderecoMatch[2].replace(/^N[ºo]?\s*/, '') // Remove "Nº" ou "No"
      }

      // Captura a Cidade e Estado
      const cidadeMatch = cidadeRegex.exec(normalizedLine)
      if (cidadeMatch) {
        currentAddress.city = cidadeMatch[1].trim()
        currentAddress.state = cidadeMatch[2].trim() // Captura o estado (por exemplo: SP)
      }

      // Captura o Bairro
      const bairroMatch = bairroRegex.exec(normalizedLine)
      if (bairroMatch) {
        currentAddress.neighborhood = bairroMatch[1]
          .replace(/^Bairro:\s*/, '')
          .trim() // Remove prefixo 'Bairro:'
      }
    }

    // Se não encontrou o bairro, consulta a API do ViaCEP
    if (!currentAddress.neighborhood && currentAddress.postalCode) {
      console.log('Consultando ViaCEP para o CEP:', currentAddress.postalCode)
      const addressFromViaCEP = await fetchAddressFromViaCEP(
        currentAddress.postalCode,
      )
      if (addressFromViaCEP && addressFromViaCEP.bairro) {
        currentAddress.neighborhood = addressFromViaCEP.bairro
        console.log('Bairro obtido via ViaCEP:', addressFromViaCEP.bairro)
      } else {
        console.log('Bairro não encontrado via ViaCEP.')
      }
    }

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

  const fetchAddressFromViaCEP = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      return response.data
    } catch (error) {
      console.error('Erro ao consultar a API do ViaCEP:', error)
      return null
    }
  }

  const extractAddresses = async (text: string): Promise<Address[]> => {
    if (text.includes('SHOPEE') || text.includes('DANFE SIMPLIFICADO')) {
      return extractShopeeData(text)
    } else if (text.includes('End:')) {
      return await extractNewTypeAddresses(text)
    }

    const addressList: Address[] = []
    const lines = text.split('\n')

    const cepRegex = /\bCEP:\s*(\d{5}-\d{3})\b/g
    const enderecoRegex = /Endereço:\s*(.*?),?\s*(\d+)\s*[^\d\s]?/g

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
      complemento: '', // Novo campo para complemento
      tipo: '',
    }
    let id = 1

    lines.forEach((line) => {
      const normalizedLine = normalizeText(line)

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
            complemento: '',
            tipo: '',
          }
        }
        currentAddress.postalCode = cepMatch[1]
      }

      const enderecoMatch = enderecoRegex.exec(normalizedLine)
      if (enderecoMatch) {
        const enderecoCompleto = enderecoMatch[1].replace(/^Endereço:\s*/, '')
        currentAddress.street = enderecoCompleto.trim()
        currentAddress.number = enderecoMatch[2] // Captura apenas o número
        if (enderecoMatch[3]) {
          currentAddress.complemento = enderecoMatch[3] // Captura o complemento, se houver
        }
      }

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

  const cleanExtractedText = (text: string) => {
    // Remove caracteres especiais e mantém letras, números e pontuação básica
    let cleanedText = text
      .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único espaço
      .replace(/[^\w\s,.:;-]/g, '') // Remove caracteres especiais indesejados
      .replace(/(CEP:\s*\d{5}-\d{3})/g, '\n$1') // Quebra de linha antes de CEP
      .replace(/(Endereço:\s*[^\n]+)/g, '\n$1') // Quebra de linha antes de Endereço
      .replace(/(Bairro:\s*[^\n]+)/g, '\n$1') // Quebra de linha antes de Bairro
      .replace(/(Complemento:\s*[^\n]+)/g, '\n$1') // Quebra de linha antes de Complemento
      .replace(/(Destinatario:\s*[^\n]+)/g, '\n$1') // Quebra de linha antes de Destinatário
      .replace(/\s*,\s*/g, ', ') // Formatação de vírgulas
      .trim() // Remove espaços extras no início e no fim

    // Filtrar apenas as linhas que contêm palavras-chave importantes
    const keywords = [
      'CEP',
      'Endereço',
      'Bairro',
      'Complemento',
      'Destinatario',
    ]
    cleanedText = cleanedText
      .split('\n')
      .filter((line) => keywords.some((keyword) => line.includes(keyword)))
      .join('\n')

    return cleanedText
  }

  const processImage = async (file: File) => {
    try {
      const { data } = await Tesseract.recognize(file, 'por', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100))
          }
        },
      })

      const extractedText = data.text
      console.log('Texto extraído e limpo:', extractedText)
      let foundAddresses = (await extractAddresses(extractedText)).map(
        (address) => ({
          ...address,
          id: generateUniqueId(), // Atribui um ID único para cada endereço
        }),
      )

      foundAddresses = setDefaultTypeForAddresses(foundAddresses)

      setAddresses((prevAddresses) => {
        const newAddresses = foundAddresses.filter((newAddress) => {
          const normalize = (str: string) => str.trim().toLowerCase()
          return !prevAddresses.some((existingAddress) => {
            return (
              normalize(existingAddress.postalCode) ===
                normalize(newAddress.postalCode) &&
              normalize(existingAddress.street) ===
                normalize(newAddress.street) &&
              normalize(existingAddress.number) ===
                normalize(newAddress.number) &&
              normalize(existingAddress.neighborhood) ===
                normalize(newAddress.neighborhood)
            )
          })
        })

        return [...prevAddresses, ...newAddresses]
      })
    } catch (error) {
      console.error('Erro ao processar a imagem:', error)
    }
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

          const normalizedText = normalizeText(extractedText)
          const foundAddresses = extractAddresses(normalizedText)
          setAddresses(await foundAddresses)
        } catch (error) {
          console.error('Erro ao processar o PDF:', error)
        }
      }

      fileReader.readAsArrayBuffer(selectedFile)
    },
    [selectedFile],
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files // Pega todos os arquivos selecionados
    if (files && files.length > 0) {
      const fileList = Array.from(files) // Converte para um array para facilitar a manipulação
      let fileNames = '' // Variável para armazenar todos os nomes dos arquivos

      fileList.forEach((file) => {
        const fileType = file.type

        if (fileType === 'application/pdf') {
          // Lógica para processar PDF
          setSelectedFile(file) // Processa o arquivo PDF
          fileNames += `${file.name}, ` // Adiciona o nome do arquivo à lista
        } else if (fileType.startsWith('image/')) {
          // Lógica para processar imagem
          processImage(file) // Processa o arquivo de imagem
          fileNames += `${file.name}, ` // Adiciona o nome do arquivo à lista
        } else {
          alert('Por favor, selecione um arquivo PDF ou imagem válida.')
        }
      })

      // Remove a vírgula extra no final e atualiza os nomes dos arquivos
      setFileName(fileNames.slice(0, -2))
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

  const generateUniqueId = (() => {
    let counter = 1
    return () => counter++
  })()

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
          padding: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1E1E1E' : '#f4f6f8',
          borderRadius: 4,
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
          maxWidth: 1200,
          width: '90%',
          maxHeight: '90vh',
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
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: '#3f51b5',
            fontWeight: 600,
            marginBottom: 2, // Evita a quebra de linha
          }}
        >
          Faça upload dos arquivos
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />} // Ícone de upload
            component="label"
            sx={{
              padding: '10px 24px',
              backgroundColor: '#3f51b5',
              '&:hover': { backgroundColor: '#000616ab' },
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '14px',
              boxShadow: '0px 2px 8px rgba(63, 81, 181, 0.2)',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
          >
            Escolher Arquivos
            <input
              type="file"
              accept="application/pdf, image/*"
              hidden
              multiple
              onChange={handleFileChange}
            />
          </Button>
          <Typography
            variant="body1"
            sx={{ color: '#757575', fontSize: '14px' }}
          >
            {fileName}
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

        {addresses.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              marginTop: 4,
            }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<LocationOn />}
              sx={{
                padding: '12px 24px',
                backgroundColor: '#4caf50',
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
              onClick={handleGetCoordinates}
              disabled={loadingCoordinates}
            >
              {loadingCoordinates ? (
                <CircularProgress size={24} sx={{ color: '#ffffff' }} />
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
            sx={{ width: '100%' }}
          >
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  )
}
