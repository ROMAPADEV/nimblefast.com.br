/* eslint-disable react/react-in-jsx-scope */
'use client'

import { useState, useRef, useEffect } from 'react'
import { Box, Button, Typography, CircularProgress } from '@mui/material'
import Tesseract from 'tesseract.js'

export default function CameraCapture() {
  const [loading, setLoading] = useState(false)
  const [detectedText, setDetectedText] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Função para abrir a câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setVideoStream(stream)
      setIsCameraOpen(true)
      setErrorMessage(null) // Reseta qualquer erro anterior
    } catch (err) {
      console.error('Erro ao abrir a câmera:', err)
      setErrorMessage('Erro ao abrir a câmera. Verifique as permissões.')
    }
  }

  // Função para capturar um frame da câmera
  const captureFrame = async () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const imageData = canvas.toDataURL('image/jpeg')
      setLoading(true)

      // Usando Tesseract.js para reconhecer texto na imagem capturada
      Tesseract.recognize(imageData, 'eng', {
        // Log de progresso
      })
        .then(({ data: { text } }) => {
          setDetectedText(text)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Erro ao processar OCR:', err)
          setLoading(false)
        })
    }
  }

  // Efeito para ajustar o vídeo da câmera quando a stream mudar
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream
    }
  }, [videoStream])

  // Função para parar a câmera
  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
      setIsCameraOpen(false)
    }
  }

  return (
    <Box sx={{ textAlign: 'center', padding: 4 }}>
      {!isCameraOpen ? (
        <Button variant="contained" onClick={startCamera}>
          Abrir Câmera
        </Button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: 'auto' }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={captureFrame}
          >
            Capturar Imagem
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ marginTop: 2 }}
            onClick={stopCamera}
          >
            Fechar Câmera
          </Button>
        </>
      )}

      {loading && <CircularProgress sx={{ marginTop: 2 }} />}

      {!loading && detectedText && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Texto Detectado: {detectedText || 'Nenhum texto detectado'}
        </Typography>
      )}

      {errorMessage && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  )
}
