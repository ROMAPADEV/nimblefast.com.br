/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { Box, CircularProgress } from '@mui/material'
import { MapaBaseProps } from 'src/infrastructure/types/Client'

const mapContainerStyle = {
  height: '100vh',
  width: '100%',
}

export const MapaBase: React.FC<MapaBaseProps> = ({
  children,
  center,
  libraries = ['places', 'geometry'],
  mapOptions,
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  return (
    <div>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          options={{
            fullscreenControl: true,
            panControl: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            scaleControl: true,
            gestureHandling: 'greedy',
            rotateControl: true,
            ...mapOptions,
          }}
        >
          {children}
        </GoogleMap>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      )}
    </div>
  )
}
