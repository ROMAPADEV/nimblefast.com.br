import React, { createContext, useContext, useState } from 'react'
import { LatLngWithAddress } from 'src/infrastructure/types/MapTypes'

// Criar o tipo para o contexto
interface AddressContextType {
  selectedAddresses: LatLngWithAddress[]
  setSelectedAddresses: React.Dispatch<
    React.SetStateAction<LatLngWithAddress[]>
  >
}

// Criar o contexto
const AddressContext = createContext<AddressContextType | undefined>(undefined)

// Hook para usar o contexto de endereços
export const useAddressContext = () => {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error(
      'useAddressContext deve ser usado dentro de um AddressProvider',
    )
  }
  return context
}

// Criar o Provider para os endereços
export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedAddresses, setSelectedAddresses] = useState<
    LatLngWithAddress[]
  >([])

  return (
    <AddressContext.Provider
      value={{ selectedAddresses, setSelectedAddresses }}
    >
      {children}
    </AddressContext.Provider>
  )
}
