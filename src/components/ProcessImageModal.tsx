'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { createWorker } from 'tesseract.js' // Importa o Tesseract.js
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  LinearProgress,
} from '@mui/material'
import axios from 'axios'
import { api } from 'src/adapters'
import { useParams } from 'next/navigation'

interface ProcessImageModalProps {
  open: boolean
  onClose: () => void
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export const ProcessImageModal: React.FC<ProcessImageModalProps> = ({
  open,
  onClose,
}) => {
  const params = useParams()
  const clientId = params.clientId
  const [image, setImage] = useState<File | null>(null) // Armazena o arquivo de imagem
  // const [ocrText, setOcrText] = useState<string | null>(null); // Armazena o texto extraído
  const [loading, setLoading] = useState(false) // Indica se está processando
  const [progress, setProgress] = useState(0) // Armazena o progresso
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [cep, setCep] = useState<string | null>(null) // Armazena o CEP extraído
  const [street, setStreet] = useState<string | null>(null) // Armazena o nome da rua
  const [number, setNumber] = useState<string | null>(null) // Armazena o número extraído
  const [neighborhood, setNeighborhood] = useState<string | null>(null) // Armazena o bairro extraído // Armazena a pré-visualização da imagem
  const [latitude, setLatitude] = useState<number | null>(null) // Armazena a latitude
  const [longitude, setLongitude] = useState<number | null>(null)
  const [city, setCity] = useState<string>('') // Armazena a cidade extraída do endereço pelo Google
  const [state, setState] = useState<string>('') // Armazena o estado extraído do endereço pelo Google

  useEffect(() => {
    // Quando o endereço completo estiver pronto, buscar as coordenadas
    if (street && number && cep && neighborhood) {
      const fullAddress = `${street} ${number}, ${neighborhood}, ${cep}`
      fetchCoordinates(fullAddress)
    }
  }, [street, number, cep, neighborhood])

  // Função para converter imagem para base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Função para lidar com o upload de imagem
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setImage(file)
      const preview = await toBase64(file) // Define a pré-visualização da imagem
      setImagePreview(preview) // Atualiza a pré-visualização
      resetExtractedData() // Reseta os dados extraídos
    }
  }

  // Função para resetar as informações extraídas
  // Função para resetar as informações extraídas
  const resetExtractedData = () => {
    setCep(null)
    setStreet(null)
    setNumber(null)
    setNeighborhood(null)
    setLatitude(null)
    setLongitude(null)
  }

  // Função para extrair CEP, endereço, número e bairro usando regex
  const extractInfo = (text: string) => {
    const cepRegex = /CEP:\s*(\d{5}-\d{3}|\d{8}|\d{5})/i
    const streetRegex = /Endere[cg]o:\s*([\w\s]+?)\s+\d+/i // Captura a rua até antes do número
    const numberRegex = /Endere[cg]o:.*?\s(\d+)/i
    const neighborhoodRegex = /Bairro:\s*([\w\s]+)/i
    const cepMatch = text.match(cepRegex)
    const streetMatch = text.match(streetRegex)
    const numberMatch = text.match(numberRegex)
    const neighborhoodMatch = text.match(neighborhoodRegex)

    if (cepMatch) {
      setCep(cepMatch[1])
      console.log('CEP extraído:', cepMatch[1]) // Log do CEP extraído
    }
    if (streetMatch) {
      setStreet(streetMatch[1])
      console.log('Rua extraída:', streetMatch[1]) // Log da rua extraída
    }
    if (numberMatch) {
      setNumber(numberMatch[1])
      console.log('Número extraído:', numberMatch[1]) // Log do número extraído
    }
    if (neighborhoodMatch) {
      setNeighborhood(neighborhoodMatch[1])
      console.log('Bairro extraído:', neighborhoodMatch[1]) // Log do bairro extraído
    }
  }

  const fetchCoordinates = async (fullAddress: string) => {
    try {
      console.log('Consultando Google Geocoding API com endereço:', fullAddress) // Log do endereço

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`,
      )

      console.log('Resposta da API do Google:', response.data) // Log da resposta completa da API

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0]
        const location = result.geometry.location
        const addressComponents = result.address_components

        setLatitude(location.lat)
        setLongitude(location.lng)
        console.log('Lat:', location.lat, 'Lng:', location.lng)

        const cityComponent = addressComponents.find((comp: any) =>
          comp.types.includes('administrative_area_level_2'),
        )
        const stateComponent = addressComponents.find((comp: any) =>
          comp.types.includes('administrative_area_level_1'),
        )

        if (cityComponent) setCity(cityComponent.long_name)
        if (stateComponent) setState(stateComponent.long_name)
      } else {
        console.error('Nenhum resultado encontrado na API do Google.')
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
    }
  }

  const saveAddressToDatabase = async () => {
    try {
      const addressData = {
        street,
        neighborhood,
        number,
        city,
        state,
        postalCode: cep,
        lat: latitude?.toString(),
        lng: longitude?.toString(),
        quantity: 1,
        value: 12.99, // Exemplo de valor
        clientsId: Number(clientId), // Pegando o clientsId da URL
      }

      // Exibe no console os dados que serão enviados ao backend
      console.log('Dados enviados para o backend:', addressData)

      const response = await api.post('/packages', addressData)

      console.log('Resposta do backend:', response.data)
      console.log('Endereço salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar endereço no banco de dados:', error)
    }
  }
  // Função que realiza o OCR com Tesseract.js
  const processImageWithOCR = async () => {
    if (image) {
      setLoading(true)
      setProgress(10)
      const worker = createWorker() // Cria o worker do Tesseract
      try {
        await (await worker).load()
        setProgress(30)
        await (
          await worker
        ).getImage
        setProgress(50) // Carrega o idioma (inglês no exemplo, pode mudar para 'por')
        await (await worker).reinitialize('eng')
        setProgress(70)

        const base64Image = await toBase64(image) // Converte imagem para Base64
        const { data } = await (await worker).recognize(base64Image)

        console.log('Texto completo extraido:', data.text)
        setProgress(90) // Realiza o OCR

        extractInfo(data.text)

        if (street && cep && neighborhood) {
          const fullAddress = `${street} ${number}, ${neighborhood}, ${cep}`
          await fetchCoordinates(fullAddress) // Buscar coordenadas
        }

        setProgress(100)
      } catch (error) {
        console.error('Erro no processamento OCR:', error)
      } finally {
        setLoading(false)
        await (await worker).terminate() // Finaliza o worker
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Capturar Endereço via Câmera</DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ) : (
            <Typography variant="body1">
              Tire uma foto ou faça upload do recibo com o endereço.
            </Typography>
          )}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="upload-photo"
            type="file"
            capture="environment" // Abre a câmera no celular
            onChange={handleImageChange}
          />
          <label htmlFor="upload-photo">
            <Button
              variant="contained"
              color="primary"
              component="span"
              sx={{ mt: 2 }}
            >
              Tirar Foto
            </Button>
          </label>

          {loading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2">Processando imagem...</Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          {cep || street || number || neighborhood ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Informações Extraídas:</Typography>
              {cep && (
                <Typography>
                  <strong>CEP:</strong> {cep}
                </Typography>
              )}
              {street && number && (
                <Typography>
                  <strong>Endereço:</strong> {street}, {number}
                </Typography>
              )}
              {neighborhood && (
                <Typography>
                  <strong>Bairro:</strong> {neighborhood}
                </Typography>
              )}
              {latitude && longitude && (
                <Typography>
                  <strong>Coordenadas:</strong> {latitude}, {longitude}
                </Typography>
              )}
              {city && state && (
                <Typography>
                  <strong>Cidade/Estado:</strong> {city}, {state}
                </Typography>
              )}
              <Button
                variant="contained"
                color="success"
                onClick={saveAddressToDatabase}
                disabled={!latitude || !longitude}
                sx={{ mt: 2 }}
              >
                Salvar Coordenadas
              </Button>
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={processImageWithOCR}
          color="primary"
          disabled={loading || !image}
        >
          {loading ? <CircularProgress size={24} /> : 'Processar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
