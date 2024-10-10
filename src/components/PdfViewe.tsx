/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { usePDFJS } from 'src/infrastructure/hooks' // Ajuste o caminho conforme necessário

const PdfUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Callback para processamento do PDF
  usePDFJS(
    async (pdfjs) => {
      if (!selectedFile) return

      const fileReader = new FileReader()
      fileReader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer)

        try {
          // Carrega o PDF e extrai o texto
          const pdf = await pdfjs.getDocument(typedarray).promise
          let extractedText = ''
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()
            extractedText += textContent.items
              .map((item: any) => item.str)
              .join(' ')
          }

          // Exibe o texto extraído no console
          console.log('Texto extraído do PDF:', extractedText)
        } catch (error) {
          console.error('Erro ao processar o PDF:', error)
        }
      }

      fileReader.readAsArrayBuffer(selectedFile)
    },
    [selectedFile],
  ) // Adicionei selectedFile como dependência para garantir que a extração ocorra após o upload

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Por favor, selecione um arquivo PDF válido.')
    }
  }

  return (
    <div>
      <h2>Upload de PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
    </div>
  )
}

export default PdfUploader
