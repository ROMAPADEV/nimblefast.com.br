/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'

export const getLatLngFromAddress = async (address: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string, // Substitua pela sua chave API do Google Maps
        },
      },
    )

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location
      return { lat, lng }
    } else {
      throw new Error('Endereço não encontrado')
    }
  } catch (error) {
    console.error('Erro ao obter coordenadas:', error)
    return null
  }
}
