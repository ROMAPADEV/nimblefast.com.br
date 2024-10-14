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

const libraries: ('places' | 'geometry' | 'drawing')[] = [
  'places',
  'geometry',
  'drawing',
]

const FALLBACK_LOCATION = {
  id: 999999999999,
  lat: -23.652834,
  lng: -46.53266,
  address: 'Depósito Central',
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
    number | null
  >(null) // Índices dos marcadores prioritários (em vermelho)
  const [collapseOpen, setCollapseOpen] = useState<boolean[]>([]) // Controla o estado de colapso dos endereços
  const [deliveryStatus, setDeliveryStatus] = useState<{
    [key: number]: 'entregue' | 'nao_entregue'
  }>({}) // Status de entrega por endereço
  const [distancesTimes, setDistancesTimes] = useState<
    { distance: string; duration: string }[]
  >([]) // Distâncias e tempos calculados para cada endereço
  const [sortBy, setSortBy] = useState<'proximity' | 'urgency'>('proximity') // Critério de ordenação
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'entregue' | 'nao_entregue'
  >('all')

  const searchParams = useSearchParams()
  const totalDeliveries = addresses.length
  const completedDeliveries = Object.values(deliveryStatus).filter(
    (status) => status === 'entregue',
  ).length
  const progress = (completedDeliveries / totalDeliveries) * 100

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

    const addressesParam = searchParams.get('addresses')
    if (addressesParam) {
      const parsedAddresses = JSON.parse(
        decodeURIComponent(addressesParam),
      ) as LatLngWithAddress[]
      setAddresses(parsedAddresses || [])
      setCollapseOpen(Array(parsedAddresses.length).fill(false)) // Inicializa o estado de colapso
    }
  }, [searchParams, currentLocation, isLoaded])

  // Definindo a função createSquareMarkerIcon
  const createSquareMarkerIcon = useCallback(
    (number: number, color: string = '#4285F4') => {
      if (!isLoaded || !window.google) return undefined // Verifique se o Google Maps foi carregado
      return {
        path: `M 12,2 C 6.48,2 2,6.48 2,12 C 2,19 12,24 12,24 C 12,24 22,19 22,12 C 22,6.48 17.52,2 12,2 z`, // Cria um quadrado de 30x30 px
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
      location: { lat: address.lat, lng: address.lng },
      stopover: true,
    }))

    const request = {
      origin: currentLocation, // Ponto de partida é a localização atual
      destination: {
        lat: addresses[addresses.length - 1].lat,
        lng: addresses[addresses.length - 1].lng,
      }, // Último ponto é o destino final
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING, // Modo de viagem: carro ou motocicleta
      optimizeWaypoints: true, // Otimiza a rota para encontrar a melhor sequência
      drivingOptions: {
        departureTime: new Date(), // Considera o tempo de partida como o horário atual
        trafficModel: google.maps.TrafficModel.BEST_GUESS, // Considera o trânsito ao calcular a rota
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

        setDistancesTimes(newDistancesTimes) // Atualiza o estado com distâncias e tempos
      } else {
        console.error('Erro ao calcular a rota:', status)
      }
    })
  }, [addresses, currentLocation, isLoaded])

  const openGoogleMaps = () => {
    if (!currentLocation || addresses.length === 0) return

    const origin = `${currentLocation.lat},${currentLocation.lng}`
    const destination = `${addresses[addresses.length - 1].lat},${addresses[addresses.length - 1].lng}`
    const waypoints = addresses
      .slice(0, -1)
      .map((address) => `${address.lat},${address.lng}`)
      .join('|')

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving&layer=traffic`
    window.open(mapsUrl, '_blank')
  }

  // Abre ou fecha o colapso para um endereço
  const toggleCollapse = (index: number) => {
    setCollapseOpen((prev) => {
      const newState = [...prev]
      newState[index] = !newState[index]
      return newState
    })
  }

  const sortAddresses = useCallback(() => {
    if (sortBy === 'proximity') {
      return [...addresses].sort((a, b) => {
        const aIndex = addresses.indexOf(a)
        const bIndex = addresses.indexOf(b)
        return (
          distancesTimes[aIndex]?.distance.localeCompare(
            distancesTimes[bIndex]?.distance,
          ) || 0
        )
      })
    } else if (sortBy === 'urgency') {
      return [...addresses].sort((a, b) => {
        const aPriority = priorityMarkers.includes(addresses.indexOf(a)) ? 1 : 0
        const bPriority = priorityMarkers.includes(addresses.indexOf(b)) ? 1 : 0
        return bPriority - aPriority
      })
    }
    return addresses
  }, [addresses, distancesTimes, sortBy, priorityMarkers])

  const filterAddresses = useCallback(() => {
    if (filterStatus === 'all') return sortAddresses()
    return sortAddresses().filter(
      (address, index) => deliveryStatus[index] === filterStatus,
    )
  }, [sortAddresses, filterStatus, deliveryStatus])

  // Marca o status de entrega
  const markDeliveryStatus = (
    index: number,
    status: 'entregue' | 'nao_entregue',
  ) => {
    setDeliveryStatus((prev) => ({
      ...prev,
      [index]: status,
    }))
  }

  const handleMarkerClick = (address: LatLngWithAddress, index: number) => {
    setSelectedAddress(address)
    setSelectedAddressIndex(index)
    setOpenModal(true)
  }

  // Função para marcar o endereço como prioridade e apenas ajustar a prioridade
  const markAsPriority = (index: number) => {
    setPriorityMarkers((prevPriorityMarkers) => {
      // Remove qualquer marcador anterior e define o novo índice como prioridade
      const updatedPriorityMarkers = [...prevPriorityMarkers]
      if (!updatedPriorityMarkers.includes(index)) {
        updatedPriorityMarkers.push(index)
      }
      return updatedPriorityMarkers
    })

    setOpenModal(false) // Fecha o modal após marcar a prioridade
  }

  return (
    isLoaded && (
      <MapaBase
        center={currentLocation || FALLBACK_LOCATION}
        mapOptions={mapOptions}
        libraries={libraries}
      >
        {/* Barra de progresso  */}
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
            {completedDeliveries} de {totalDeliveries} entregas concluídas
          </Typography>
        </Box>

        {addresses.map((address, index) => (
          <Marker
            key={index}
            position={{ lat: address.lat, lng: address.lng }}
            title={address.address}
            icon={createSquareMarkerIcon(
              1,
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

        <Modal
          open={openAddressModal}
          onClose={() => setOpenAddressModal(false)}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              width: '80%',
              maxHeight: '80vh',
              overflowY: 'auto',
              borderRadius: '8px',
              boxShadow: 24,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              style={{ color: '#333' }}
            >
              Lista de Entregas
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>
                      <strong>Endereço</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Distância</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Tempo Estimado</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Status de Entrega</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addresses.map((address, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }, // Adiciona uma cor diferente para as linhas ímpares
                        '&:hover': { backgroundColor: '#f0f0f0' }, // Efeito de hover nas linhas
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {address.address}
                      </TableCell>
                      <TableCell align="center">
                        {distancesTimes[index]?.distance || 'Calculando...'}
                      </TableCell>
                      <TableCell align="center">
                        {distancesTimes[index]?.duration || 'Calculando...'}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <IconButton
                            color={
                              deliveryStatus[index] === 'entregue'
                                ? 'success'
                                : 'default'
                            }
                            onClick={() =>
                              markDeliveryStatus(index, 'entregue')
                            }
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              marginRight: 1,
                            }}
                          >
                            <CheckCircle sx={{ fontSize: '24px' }} />
                            <Typography variant="caption">Entregue</Typography>
                          </IconButton>

                          <IconButton
                            color={
                              deliveryStatus[index] === 'nao_entregue'
                                ? 'error'
                                : 'default'
                            }
                            onClick={() =>
                              markDeliveryStatus(index, 'nao_entregue')
                            }
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              marginLeft: 1,
                            }}
                          >
                            <Cancel sx={{ fontSize: '24px' }} />
                            <Typography variant="caption">
                              Não Entregue
                            </Typography>
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Modal>

        {/* Botão "Iniciar Rota" */}
        {/* <Fab
          color="secondary"
          aria-label="start-route"
          sx={{ position: 'fixed', bottom: '70px', right: '5px' }}
          onClick={openGoogleMaps} // Abre a rota otimizada no aplicativo de mapas
        >
          <DirectionsCar />
        </Fab> */}

        {/* Botão "Calcular Rota Otimizada" */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Button variant="contained" color="primary" onClick={calculateRoute}>
            Calcular Rota Otimizada
          </Button>
        </Box>

        {/* Modal de endereço selecionado */}
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
                  {/* Exibindo o endereço e o número */}
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

                {/* Botões de Ação com Ícones */}
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

                  {/* Navegar pelo Google Maps e Waze */}
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
