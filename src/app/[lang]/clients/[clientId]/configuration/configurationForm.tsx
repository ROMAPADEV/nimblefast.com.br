'use client'

import React, { useState } from 'react'

export default function ConfigurationForm() {
  const [config, setConfig] = useState({
    shopee: 13,
    normal: 8,
    extremo: 15,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Enviar dados para API
  }

  return (
    <form className="bg-white p-6 rounded-lg shadow-lg" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Configurações de Entrega</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Valor Shopee:</label>
        <input
          type="number"
          value={config.shopee}
          onChange={(e) =>
            setConfig({ ...config, shopee: Number(e.target.value) })
          }
          className="w-full p-2 border border-gray-300 rounded mt-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Valor Normal:</label>
        <input
          type="number"
          value={config.normal}
          onChange={(e) =>
            setConfig({ ...config, normal: Number(e.target.value) })
          }
          className="w-full p-2 border border-gray-300 rounded mt-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Valor Extremo:</label>
        <input
          type="number"
          value={config.extremo}
          onChange={(e) =>
            setConfig({ ...config, extremo: Number(e.target.value) })
          }
          className="w-full p-2 border border-gray-300 rounded mt-2"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-400"
      >
        Salvar Configurações
      </button>
    </form>
  )
}
