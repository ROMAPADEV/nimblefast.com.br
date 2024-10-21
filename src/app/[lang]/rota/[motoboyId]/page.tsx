/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Marker,
  Libraries,
  DirectionsRenderer,
  useLoadScript,
} from '@react-google-maps/api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DirectionsIcon from '@mui/icons-material/Directions'
import { MapaBase } from 'src/components'
import { useSearchParams } from 'next/navigation'
import { LatLngWithAddress } from 'src/infrastructure/types/MapTypes'
import {
  Modal,
  Box,
  Button,
  IconButton,
  Fab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  List as ListIcon,
  DirectionsCar,
} from '@mui/icons-material'
import { api } from 'src/adapters'
import moment from 'moment'

const libraries: ('places' | 'geometry' | 'drawing')[] = [
  'places',
  'geometry',
  'drawing',
]

const FALLBACK_LOCATION = {
  id: 999999999999,
  lat: -23.652834,
  lng: -46.53266,
  address: 'Depósito',
}

const mapOptions = {
  fullscreenControl: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: true,
  draggable: true,
  scrollwheel: true,
  disableDoubleClickZoom: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }], // Esconder rótulos de POIs
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }], // Esconder locais comerciais
    },
  ],
}

const RotaMotoboy: React.FC = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  const [addresses, setAddresses] = useState<LatLngWithAddress[]>([]) // Endereços selecionados
  const [currentLocation, setCurrentLocation] = useState<{
    id: number
    lat: number
    lng: number
  } | null>(null) // Localização atual
  const [directions, setDirections] = useState<any>(null)
  const [openModal, setOpenModal] = useState(false) // Controla a exibição da modal
  const [openAddressModal, setOpenAddressModal] = useState(false) // Controla o modal de endereços
  const [selectedAddress, setSelectedAddress] =
    useState<LatLngWithAddress | null>(null) // Endereço selecionado no clique
  const [priorityMarkers, setPriorityMarkers] = useState<number[]>([])
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    null | number
  >(null) // Índices dos marcadores prioritários (em vermelho)
  const [collapseOpen, setCollapseOpen] = useState<boolean[]>([]) // Controla o estado de colapso dos endereços
  const [deliveryStatus, setDeliveryStatus] = useState<{
    [key: number]: 'entregue' | 'nao_entregue'
  }>({}) // Status de entrega por endereço
  const [distancesTimes, setDistancesTimes] = useState<
    { distance: string; duration: string }[]
  >([]) // Distâncias e tempos calculados para cada endereço
  const [progress, setProgress] = useState<number>(0)

  const searchParams = useSearchParams()

  useEffect(() => {
    if (navigator.geolocation && !currentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({
            id: 999999999999,
            lat: latitude,
            lng: longitude,
          })
        },
        (error) => {
          console.error('Erro ao obter a localização:', error)
          setCurrentLocation(FALLBACK_LOCATION)
        },
      )
    }

    // Chamar a API para obter os pacotes do motoboy e exibir
    const fetchPackages = async () => {
      try {
        const response = await api.get(`/packages`) // Chamada para API
        const data = response.data

        // Filtrar pacotes pelo dia atual
        const today = moment().format('YYYY-MM-DD')
        const todayPackages = data.find((dayData: any) => dayData.day === today)

        if (todayPackages) {
          setAddresses(todayPackages.items) // Carregar os endereços do dia
          setCollapseOpen(Array(todayPackages.items.length).fill(false)) // Inicializa o estado de colapso
        }
      } catch (error) {
        console.error('Erro ao carregar pacotes:', error)
      }
    }

    fetchPackages()
  }, [currentLocation, isLoaded])

  const updatePackageStatus = async (
    packageId: number,
    status: 'done' | 'returned',
  ) => {
    try {
      const data = { status }
      const response = await api.patch(`/packages/${packageId}/status`, data)
    } catch (error: any) {
      if (error.response) {
        console.error(
          'Erro ao atualizar status do pacote:',
          error.response.data,
        )
      } else {
        console.error('Erro ao atualizar status do pacote:', error)
      }
    }
  }

  // Definindo a função createSquareMarkerIcon
  const createSquareMarkerIcon = useCallback(
    (number: number, color: string = '#4285F4') => {
      if (!isLoaded || !window.google) return undefined // Verifica se o Google Maps foi carregado
      return {
        path: `M 12,2 C 6.48,2 2,6.48 2,12 C 2,19 12,24 12,24 C 12,24 22,19 22,12 C 22,6.48 17.52,2 12,2 z`, // Cria um ícone de marcador
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 1.5,
        labelOrigin: new google.maps.Point(12, 9),
        scale: 1,
      }
    },
    [isLoaded],
  )

  // Função para calcular a rota com otimização e capturar distância e tempo
  const calculateRoute = useCallback(() => {
    if (
      !currentLocation ||
      !isLoaded ||
      !window.google ||
      addresses.length === 0
    )
      return

    const directionsService = new google.maps.DirectionsService()

    const waypoints = addresses.slice(0, -1).map((address) => ({
      location: {
        lat: Number(address.lat),
        lng: Number(address.lng),
      },
      stopover: true,
    }))

    const request = {
      origin: {
        lat: Number(currentLocation.lat),
        lng: Number(currentLocation.lng),
      }, // Ponto de partida
      destination: {
        lat: Number(addresses[addresses.length - 1].lat),
        lng: Number(addresses[addresses.length - 1].lng),
      }, // Último ponto é o destino final
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING, // Modo de viagem
      optimizeWaypoints: true, // Otimiza a rota
      drivingOptions: {
        departureTime: new Date(), // Horário de partida
        trafficModel: google.maps.TrafficModel.BEST_GUESS, // Considera o trânsito
      },
    }

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        setDirections(result) // Armazena a rota gerada

        const waypointsOrder = result?.routes[0].waypoint_order
        const optimizedAddresses = waypointsOrder?.map(
          (index: number) => addresses[index],
        )

        optimizedAddresses?.push(addresses[addresses.length - 1])
        setAddresses(optimizedAddresses)

        // Extrair as distâncias e durações de cada waypoint
        const newDistancesTimes = result.routes[0].legs.map((leg: any) => ({
          distance: leg.distance.text,
          duration: leg.duration.text,
        }))

        setDistancesTimes(newDistancesTimes) // Atualiza distâncias e tempos
      } else {
        console.error('Erro ao calcular a rota:', status)
      }
    })
  }, [addresses, currentLocation, isLoaded])

  const handleMarkerClick = (address: LatLngWithAddress, index: number) => {
    setSelectedAddress(address)
    setSelectedAddressIndex(index)
    setOpenModal(true)
  }

  const markDeliveryStatus = (
    index: number,
    status: 'entregue' | 'nao_entregue',
  ) => {
    const updatedStatus = status === 'entregue' ? 'done' : 'returned'
    const packageId = addresses[index].id // Pegando apenas o ID do pacote

    updatePackageStatus(packageId, updatedStatus) // Chamando o novo endpoint

    // Atualizando o estado local
    setDeliveryStatus((prev) => ({
      ...prev,
      [index]: status,
    }))

    const completedDeliveries = Object.values(deliveryStatus).filter(
      (status) => status === 'entregue',
    ).length
    setProgress((completedDeliveries / addresses.length) * 100)
  }

  return (
    isLoaded && (
      <MapaBase
        center={currentLocation || FALLBACK_LOCATION}
        mapOptions={mapOptions}
        libraries={libraries}
      >
        {/* Barra de progresso */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            zIndex: 10,
          }}
        >
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            {
              Object.values(deliveryStatus).filter(
                (status) => status === 'entregue',
              ).length
            }{' '}
            de {addresses.length} entregas concluídas
          </Typography>
        </Box>

        {addresses.map((address, index) => (
          <Marker
            key={index}
            position={{ lat: Number(address.lat), lng: Number(address.lng) }}
            title={address.street}
            icon={createSquareMarkerIcon(
              index + 1,
              deliveryStatus[index] === 'entregue' ? 'green' : 'red',
            )}
            label={{
              text:
                deliveryStatus[index] === 'entregue'
                  ? '✔'
                  : (index + 1).toString(),
              color: deliveryStatus[index] === 'entregue' ? 'green' : 'white',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
            onClick={() => handleMarkerClick(address, index)}
          />
        ))}

        {currentLocation && window.google && (
          <Marker
            position={currentLocation}
            title="Sua localização"
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            }}
          />
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
          />
        )}

        {/* Botão-ícone para abrir a lista de endereços */}
        <Fab
          color="primary"
          aria-label="list"
          sx={{ position: 'fixed', bottom: '140px', right: '5px' }}
          onClick={() => setOpenAddressModal(true)}
        >
          <ListIcon />
        </Fab>

        {/* Botão "Calcular Rota Otimizada" */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Button variant="contained" color="primary" onClick={calculateRoute}>
            Calcular Rota Otimizada
          </Button>
        </Box>

        {/* Modal de endereço selecionado */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              width: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Endereço Selecionado
            </Typography>

            {selectedAddressIndex !== null && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1" gutterBottom>
                    {selectedAddress?.street}, Nº {selectedAddress?.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Distância:{' '}
                    {distancesTimes[selectedAddressIndex]?.distance ||
                      'Calculando...'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Tempo estimado:{' '}
                    {distancesTimes[selectedAddressIndex]?.duration ||
                      'Calculando...'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    marginTop: 3,
                    width: '100%',
                  }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => {
                      markDeliveryStatus(selectedAddressIndex, 'entregue')
                      setOpenModal(false)
                    }}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    Marcar como Entregue
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      markDeliveryStatus(selectedAddressIndex, 'nao_entregue')
                      setOpenModal(false)
                    }}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    Marcar como Não Entregue
                  </Button>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 2,
                      marginTop: 3,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DirectionsIcon />}
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedAddress?.street} ${selectedAddress?.number},${selectedAddress?.lat},${selectedAddress?.lng}&travelmode=driving`
                        window.open(googleMapsUrl, '_blank')
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      Navegar pelo Google Maps
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DirectionsIcon />}
                      onClick={() => {
                        if (currentLocation && selectedAddress) {
                          const wazeUrl = `https://waze.com/ul?ll=${selectedAddress?.lat},${selectedAddress?.lng}&navigate=yes&from=${currentLocation?.lat},${currentLocation?.lng}`
                          window.open(wazeUrl, '_blank')
                        } else {
                          console.error(
                            'Localização atual ou endereço selecionado não disponível.',
                          )
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      Navegar pelo Waze
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </MapaBase>
    )
  )
}

export default RotaMotoboy
