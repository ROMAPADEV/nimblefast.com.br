'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadAddressForm({
  params,
}: {
  params: { clientId: string }
}) {
  const { clientId } = params
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulação de envio do arquivo de imagem para a API
    const formData = new FormData()
    formData.append('file', file as File)
    formData.append('clientId', clientId)

    const response = await fetch('/api/addresses/upload', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      router.push(`/clients/${clientId}/addresses`)
    } else {
      alert('Erro ao cadastrar o endereço via upload de imagem')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        Upload de Imagem para Capturar Endereço
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700">Upload de Imagem:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded mt-2"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-400"
      >
        Enviar Imagem e Cadastrar Endereço
      </button>
    </form>
  )
}
