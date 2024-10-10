import React from 'react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { Box, CircularProgress } from '@mui/material'
import { useAddressContext } from './context/AddressesContext' // Importar o contexto

const libraries: ('places' | 'drawing' | 'geometry' | 'marker')[] = [
  'places',
  'drawing',
  'geometry',
  'marker',
]
const mapContainerStyle = {
  height: '100vh',
  width: '100%',
}

const mapOptions = {
  fullscreenControl: true,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  rotateControl: true,
}

const BASE_LOCATION = {
  lat: -23.55052,
  lng: -46.633308,
}

const OutroMapa: React.FC = () => {
  const { selectedAddresses } = useAddressContext() // Usar os endereços selecionados

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  return (
    <div>
      <div id="map" style={mapContainerStyle}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={BASE_LOCATION}
            zoom={12}
            options={mapOptions}
          >
            <Marker
              position={BASE_LOCATION}
              label={{
                text: 'São Paulo',
                color: 'black',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            />
            {/* Renderizando os endereços selecionados do contexto */}
            {selectedAddresses.length > 0 &&
              selectedAddresses.map((addr, index) => (
                <Marker
                  key={`selected-address-${index}-${addr.lat}-${addr.lng}`}
                  position={{ lat: addr.lat, lng: addr.lng }}
                  onClick={() =>
                    console.log(`Endereço selecionado: ${addr.address}`)
                  }
                />
              ))}
          </GoogleMap>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        )}
      </div>
    </div>
  )
}

export default OutroMapa
