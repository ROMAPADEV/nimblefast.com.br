/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Marker,
  Polygon,
  DrawingManager,
  useLoadScript,
} from '@react-google-maps/api'
import { MapaBase, ModalEnderecos } from 'src/components'
import { api, exibirError } from 'src/adapters'
import type {
  LatLngWithAddress,
  PolygonPath,
  Motoboy,
  Address,
} from 'src/infrastructure/types'
import { CircularProgress } from '@mui/material'
import { type Locale } from 'src/infrastructure/providers'

const BASE_LOCATION: LatLngWithAddress = {
  id: 9999999999999,
  lat: -23.652834,
  lng: -46.53266,
  address: 'Depósito Central',
}

interface Props {
  params: {
    lang: Locale
  }
}

const Maps = ({ params }: Props) => {
  const { lang } = params

  const [addresses, setAddresses] = useState<LatLngWithAddress[]>([])
  const [polygons, setPolygons] = useState<PolygonPath[][]>([])
  const [selectedAddresses, setSelectedAddresses] = useState<
    LatLngWithAddress[]
  >([])
  const [motoboys, setMotoboys] = useState<Motoboy[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['drawing', 'geometry'],
  })

  const getAddressesAndMotoboys = useCallback(async () => {
    try {
      const [{ data: addressResponse }, { data: motoboyResponse }] =
        await Promise.all([api.get('/addresses'), api.get('/motoboys')])

      const addressData = addressResponse.map((addr: Address) => ({
        ...addr,
        address: addr.street,
      }))

      setAddresses(addressData)
      setMotoboys(motoboyResponse)
    } catch (error) {
      exibirError(error)
    }
  }, [])

  const handleAddressSelected = (polygon: google.maps.Polygon) => {
    const polygonPath = polygon
      .getPath()
      .getArray()
      .map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }))

    polygon.setOptions({
      fillColor: 'red',
      strokeColor: 'red',
    })

    setPolygons((prevPolygons) => [...prevPolygons, polygonPath])

    const markersInsidePolygon = addresses.filter((address) => {
      const latLng = new google.maps.LatLng(address.lat, address.lng)
      return google.maps.geometry.poly.containsLocation(latLng, polygon)
    })

    setSelectedAddresses(markersInsidePolygon)
    setIsModalOpen(true)
  }

  const baseMarker = useMemo(
    () => (
      <Marker
        icon={{
          path: 0.0, // google.maps.SymbolPath.CIRCLE
          scale: 10,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        }}
        title="Localização do Depósito"
        draggable={true}
        position={{ lat: BASE_LOCATION.lat, lng: BASE_LOCATION.lng }}
      />
    ),
    [],
  )

  useEffect(() => {
    if (isLoaded) {
      getAddressesAndMotoboys()
    }
  }, [isLoaded, getAddressesAndMotoboys])

  if (!isLoaded) {
    return <CircularProgress />
  }

  console.log('address fora', addresses)

  return (
    <MapaBase center={BASE_LOCATION} libraries={['drawing', 'geometry']}>
      {baseMarker}

      {addresses.map((addr, index) => (
        <Marker key={index} position={{ lat: addr.lat, lng: addr.lng }} />
      ))}

      {polygons.map((path, index) => (
        <Polygon
          key={index}
          paths={path}
          options={{ fillColor: 'red', strokeColor: 'red' }}
        />
      ))}

      {addresses.length && (
        <DrawingManager
          onPolygonComplete={handleAddressSelected}
          options={{
            drawingControl: true,
            drawingControlOptions: {
              drawingModes: ['polygon'] as google.maps.drawing.OverlayType[],
              position: window.google.maps.ControlPosition.TOP_CENTER,
            },
          }}
        />
      )}

      <ModalEnderecos
        open={isModalOpen}
        lang={lang}
        handleClose={() => setIsModalOpen(false)}
        addresses={selectedAddresses}
        motoboys={motoboys}
      />
    </MapaBase>
  )
}

export default Maps
