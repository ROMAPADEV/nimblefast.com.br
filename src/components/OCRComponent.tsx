/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { createWorker } from 'tesseract.js' // Importa o Tesseract.js
import { Box, Button, Typography, CircularProgress } from '@mui/material'

const OCRComponent: React.FC = () => {
  const [image, setImage] = useState<File | null>(null) // Armazena o arquivo de imagem
  const [ocrText, setOcrText] = useState<string | null>(null) // Armazena o texto extraído
  const [loading, setLoading] = useState(false) // Indica se está processando
  const [progress, setProgress] = useState(0) // Armazena o progresso
  const [imagePreview, setImagePreview] = useState<string | null>(null) // Armazena a pré-visualização da imagem

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
      setOcrText(null) // Reseta o texto OCR anterior
    }
  }

  // Função que realiza o OCR com Tesseract.js
  const processImageWithOCR = async () => {
    if (image) {
      setLoading(true)
      const worker = createWorker() // Cria o worker do Tesseract
      try {
        await (await worker).load()
        await (
          await worker
        ).getImage // Carrega o idioma (inglês no exemplo, pode mudar para 'por')
        await (await worker).reinitialize('eng')

        const base64Image = await toBase64(image) // Converte imagem para Base64
        const { data } = await (await worker).recognize(base64Image) // Realiza o OCR
        setOcrText(data.text) // Define o texto extraído
      } catch (error) {
        console.error('Erro no processamento OCR:', error)
      } finally {
        setLoading(false)
        await (await worker).terminate() // Finaliza o worker
      }
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="h5" gutterBottom>
        Carregue uma imagem para realizar OCR
      </Typography>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
        />
      )}
      {image && (
        <Button
          variant="contained"
          color="primary"
          onClick={processImageWithOCR}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Processar Imagem'}
        </Button>
      )}

      {ocrText && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Texto Extraído:</strong> {ocrText}
        </Typography>
      )}

      {loading && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Processando...
        </Typography>
      )}
    </Box>
  )
}

export default OCRComponent
