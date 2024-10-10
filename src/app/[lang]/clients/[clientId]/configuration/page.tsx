import React from 'react'
import ConfigurationForm from './configurationForm'

export default function ConfigurationPage() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Configurações de Entrega</h1>
      <ConfigurationForm />
    </div>
  )
}
