/* eslint-disable react/react-in-jsx-scope */
'use client' // Marca este componente como Client Component

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddAddressForm({
  params,
}: {
  params: { clientId: string }
}) {
  const { clientId } = params
  const router = useRouter()

  const [formData, setFormData] = useState({
    cep: '',
    endereco: '',
    categoria: 'Shopee',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulação de envio dos dados para a API
    const response = await fetch('/api/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        ...formData,
      }),
    })

    if (response.ok) {
      // Após o cadastro, redireciona de volta para a lista de endereços
      router.push(`/clients/${clientId}/addresses`)
    } else {
      alert('Erro ao cadastrar o endereço')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Cadastrar Endereço</h2>

      {/* Campo de CEP */}
      <div className="mb-4">
        <label className="block text-gray-700">CEP:</label>
        <input
          type="text"
          name="cep"
          value={formData.cep}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-2"
          required
        />
      </div>

      {/* Campo de Endereço */}
      <div className="mb-4">
        <label className="block text-gray-700">Endereço:</label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-2"
          required
        />
      </div>

      {/* Seleção de Categoria */}
      <div className="mb-4">
        <label className="block text-gray-700">Categoria:</label>
        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-2"
        >
          <option value="Shopee">Shopee</option>
          <option value="Normal">Normal</option>
          <option value="Extremo">Extremo</option>
        </select>
      </div>

      {/* Botão de Submeter */}
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-400"
      >
        Cadastrar Endereço
      </button>
    </form>
  )
}
