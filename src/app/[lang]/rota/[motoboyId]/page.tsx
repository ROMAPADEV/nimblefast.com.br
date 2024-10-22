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
  Fab,
  Typography,
  LinearProgress,
  Backdrop,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { List as ListIcon } from '@mui/icons-material'
import { api } from 'src/adapters'
import moment from 'moment'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

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
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

const MAX_WAYPOINTS = 25
const LOT_SIZE = MAX_WAYPOINTS - 1

const RotaMotoboy: React.FC = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })

  const [addresses, setAddresses] = useState<LatLngWithAddress[]>([])
  const [currentLocation, setCurrentLocation] =
    useState<LatLngWithAddress | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>(
    [],
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState(false)
  const [selectedAddress, setSelectedAddress] =
    useState<LatLngWithAddress | null>(null)
  const [deliveryStatus, setDeliveryStatus] = useState<{
    [key: number]: 'entregue' | 'nao_entregue'
  }>({})
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [optimizedOrder, setOptimizedOrder] = useState<number[]>([])

  const searchParams = useSearchParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Verifica se a localização atual já é a mesma antes de fazer o update
          if (
            currentLocation?.lat !== latitude ||
            currentLocation?.lng !== longitude
          ) {
            setCurrentLocation({
              id: 999999999999,
              lat: latitude,
              lng: longitude,
              address: 'Localização Atual',
            })
          }
        },
        (error) => {
          console.error('Erro ao obter a localização:', error)
          // Verifique se o fallback não foi chamado anteriormente para evitar setState desnecessário
          if (!currentLocation) {
            setCurrentLocation(FALLBACK_LOCATION)
          }
        },
      )
    }

    // Só busca os pacotes se ainda não tivermos carregado endereços
    if (addresses.length === 0 && currentLocation) {
      const fetchPackages = async () => {
        try {
          setLoading(true)
          const response = await api.get(`/packages`)
          const data = response.data

          const today = moment().format('YYYY-MM-DD')
          const todayPackages = data.find(
            (dayData: any) => dayData.day === today,
          )

          if (todayPackages && addresses.length === 0) {
            setAddresses(todayPackages.items)
          }
        } catch (error) {
          console.error('Erro ao carregar pacotes:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchPackages()
    }
  }, [currentLocation, addresses.length])

  const splitIntoBatches = (
    addresses: LatLngWithAddress[],
    batchSize: number,
  ) => {
    const batches: LatLngWithAddress[][] = []
    for (let i = 0; i < addresses.length; i += batchSize) {
      batches.push(addresses.slice(i, i + batchSize))
    }
    return batches
  }

  const processBatch = useCallback(
    (
      batch: LatLngWithAddress[],
      index: number,
    ): Promise<google.maps.DirectionsResult> => {
      return new Promise((resolve, reject) => {
        const directionsService = new google.maps.DirectionsService()

        const waypoints = batch.slice(0, -1).map((address) => ({
          location: {
            lat: Number(address.lat),
            lng: Number(address.lng),
          },
          stopover: true,
        }))

        const request: google.maps.DirectionsRequest = {
          origin:
            index === 0
              ? currentLocation
              : { lat: Number(batch[0].lat), lng: Number(batch[0].lng) },
          destination: {
            lat: Number(batch[batch.length - 1].lat),
            lng: Number(batch[batch.length - 1].lng),
          },
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        }

        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result)
          } else {
            console.error('Erro ao calcular a rota:', status)
            reject(new Error('Erro ao calcular a rota'))
          }
        })
      })
    },
    [currentLocation], // Dependência do useCallback
  )

  const calculateDistance = (
    origin: LatLngWithAddress,
    destination: LatLngWithAddress,
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180
    const R = 6371 // Raio da Terra em km
    const dLat = toRad(destination.lat - origin.lat)
    const dLon = toRad(destination.lng - origin.lng)
    const lat1 = toRad(origin.lat)
    const lat2 = toRad(destination.lat)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distância em km
    return distance
  }

  const calculateOptimizedOrder = useCallback(() => {
    if (!currentLocation || addresses.length === 0) return

    setLoading(true)

    const sortedAddresses = [...addresses].sort((a, b) => {
      const distanceA = calculateDistance(currentLocation, a)
      const distanceB = calculateDistance(currentLocation, b)
      return distanceA - distanceB
    })
    setAddresses(sortedAddresses)
    calculateRoutesInBatches(sortedAddresses)
  }, [currentLocation, addresses])

  const calculateRoute = useCallback(
    (optimizedAddresses: LatLngWithAddress[]) => {
      if (!currentLocation || optimizedAddresses.length === 0) return

      const directionsService = new google.maps.DirectionsService()
      const waypoints = optimizedAddresses.slice(1).map((address) => ({
        location: { lat: Number(address.lat), lng: Number(address.lng) },
        stopover: true,
      }))

      const request: google.maps.DirectionsRequest = {
        origin: {
          lat: Number(currentLocation.lat),
          lng: Number(currentLocation.lng),
        },
        destination: {
          lat: Number(optimizedAddresses[optimizedAddresses.length - 1].lat),
          lng: Number(optimizedAddresses[optimizedAddresses.length - 1].lng),
        },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      }

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections([result])
          console.log('Rota calculada:', result)
        } else {
          console.error('Erro ao calcular a rota:', status)
        }
      })
    },
    [currentLocation],
  )

  const handleCalculateOptimizedRoute = () => {
    calculateOptimizedOrder()
  }

  const calculateRoutesInBatches = useCallback(
    async (optimizedAddresses: LatLngWithAddress[]) => {
      if (!currentLocation || !isLoaded || optimizedAddresses.length === 0)
        return

      const batches = splitIntoBatches(optimizedAddresses, LOT_SIZE)

      try {
        setLoading(true)
        const allResults: google.maps.DirectionsResult[] = []
        let combinedOrder: number[] = []

        for (let i = 0; i < batches.length; i++) {
          const result = await processBatch(batches[i], i)
          allResults.push(result)

          if (result.routes[0].waypoint_order) {
            combinedOrder = [
              ...combinedOrder,
              ...result.routes[0].waypoint_order,
            ]
          }
        }

        setDirections(allResults) // Renderiza as rotas calculadas
        setOptimizedOrder(combinedOrder) // Define a ordem otimizada
      } catch (error) {
        console.error('Erro ao calcular as rotas em lotes:', error)
      } finally {
        setLoading(false)
      }
    },
    [currentLocation, isLoaded, processBatch],
  )

  const markDeliveryStatus = (
    index: number,
    status: 'entregue' | 'nao_entregue',
  ) => {
    setDeliveryStatus((prev) => ({ ...prev, [index]: status }))
    const completedDeliveries = Object.values(deliveryStatus).filter(
      (s) => s === 'entregue',
    ).length
    setProgress((completedDeliveries / addresses.length) * 100)
  }

  const createSquareMarkerIcon = useCallback(
    (number: number, color: string = '#4285F4') => {
      if (!isLoaded || !window.google) return undefined
      return {
        path: `M 12,2 C 6.48,2 2,6.48 2,12 C 2,19 12,24 12,24 C 12,24 22,19 22,12 C 22,6.48 17.52,2 12,2 z`,
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

  const handleMarkerClick = (index: number) => {
    setSelectedAddress(addresses[index])
    setCurrentIndex(index)
    setOpenModal(true)
  }

  const markAsDelivered = () => {
    if (currentIndex === null || !selectedAddress) return

    updatePackageStatus(selectedAddress.id, 'done')

    setDeliveryStatus((prev) => ({ ...prev, [currentIndex]: 'entregue' }))
    setOpenModal(false)

    // Avança para o próximo endereço
    const nextIndex = currentIndex + 1
    if (nextIndex < addresses.length) {
      setSelectedAddress(addresses[nextIndex])
      setCurrentIndex(nextIndex)
      setOpenModal(true)
    }

    const completedDeliveries =
      Object.values(deliveryStatus).filter((status) => status === 'entregue')
        .length + 1
    setProgress((completedDeliveries / addresses.length) * 100)
  }

  const markAsNotDelivered = () => {
    if (currentIndex === null || !selectedAddress) return

    // Atualiza o status no banco de dados
    updatePackageStatus(selectedAddress.id, 'returned')

    // Atualiza o status local
    setDeliveryStatus((prev) => ({ ...prev, [currentIndex]: 'nao_entregue' }))
    setOpenModal(false)

    // Avança para o próximo endereço
    const nextIndex = currentIndex + 1
    if (nextIndex < addresses.length) {
      setSelectedAddress(addresses[nextIndex])
      setCurrentIndex(nextIndex)
      setOpenModal(true)
    }

    const completedDeliveries =
      Object.values(deliveryStatus).filter((status) => status === 'entregue')
        .length + 1
    setProgress((completedDeliveries / addresses.length) * 100)
  }

  // Função para abrir o Google Maps
  const openGoogleMaps = () => {
    if (!selectedAddress) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedAddress.lat},${selectedAddress.lng}`
    window.open(url, '_blank')
  }

  const updatePackageStatus = async (
    id: number,
    status: 'done' | 'returned',
  ) => {
    try {
      await api.patch(`/packages/${id}/status`, { status })
      console.log(`Pacote ${id} atualizado com sucesso!`)
    } catch (error) {
      console.error(`Erro ao atualizar o pacote ${id}:`, error)
    }
  }

  // Função para abrir o Waze
  const openWaze = () => {
    if (!selectedAddress) return
    const url = `https://waze.com/ul?ll=${selectedAddress.lat},${selectedAddress.lng}&navigate=yes`
    window.open(url, '_blank')
  }

  const columns: GridColDef[] = [
    { field: 'field', headerName: 'Campo', flex: 1 },
    { field: 'detail', headerName: 'Detalhe', flex: 2 },
  ]

  const rows = [
    { id: 1, field: 'Rua', detail: selectedAddress?.street },
    { id: 2, field: 'Número', detail: selectedAddress?.number },
  ]

  return (
    isLoaded && (
      <>
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
              onClick={() => handleMarkerClick(index)}
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
            />
          ))}

          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
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

          {directions.map((direction, index) => (
            <DirectionsRenderer
              key={index}
              directions={direction}
              options={{ suppressMarkers: true }}
            />
          ))}

          {/* Botão "Calcular Rota Otimizada" */}
          <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCalculateOptimizedRoute}
            >
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
                maxWidth: isMobile ? '90vw' : '500px',
                maxHeight: '90vh',
                borderRadius: '12px',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 'bold', textAlign: 'center' }}
              >
                Detalhes do Endereço
              </Typography>

              <Box sx={{ height: 200 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  disableColumnMenu
                  hideFooterPagination
                  hideFooter
                  sx={{
                    fontSize: '0.9rem',
                    border: 'none',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={markAsDelivered}
                  sx={{
                    flex: 1,
                    padding: '5px 10px',
                    fontSize: '0.5rem',
                    minWidth: 'auto',
                    backgroundColor: '#4CAF50', // Verde mais moderno
                    '&:hover': {
                      backgroundColor: '#388E3C',
                    },
                  }}
                >
                  Entregue
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={markAsNotDelivered}
                  sx={{
                    flex: 1,
                    padding: '5px 10px',
                    fontSize: '0.5rem',
                    minWidth: 'auto',
                    backgroundColor: '#F44336', // Vermelho mais moderno
                    '&:hover': {
                      backgroundColor: '#D32F2F',
                    },
                  }}
                >
                  Não Entregue
                </Button>
              </Box>

              {/* Texto "Navegar com:" */}
              <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
                Navegar com:
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'space-between',
                  mt: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DirectionsIcon />}
                  onClick={openGoogleMaps}
                  sx={{
                    flex: 1,
                    padding: '10px 16px', // Ajuste do padding para botões mais compactos
                    fontSize: '0.5rem', // Tamanho menor da fonte
                    minWidth: 'auto', // Impede que os botões fiquem largos demais
                  }}
                >
                  Maps
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DirectionsIcon />}
                  onClick={openWaze}
                  sx={{
                    flex: 1,
                    padding: '10px 16px', // Ajuste do padding para botões mais compactos
                    fontSize: '0.5rem', // Tamanho menor da fonte
                    minWidth: 'auto', // Impede que os botões fiquem largos demais
                  }}
                >
                  Waze
                </Button>
              </Box>
            </Box>
          </Modal>
        </MapaBase>

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    )
  )
}

export default RotaMotoboy
