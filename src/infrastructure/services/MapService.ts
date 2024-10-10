import { LatLng } from '../types/MapTypes'

export const calculateOptimizedRoute = (
  addresses: LatLng[],
  baseLocation: LatLng | null,
  setDirections: (result: google.maps.DirectionsResult | null) => void,
) => {
  if (!baseLocation || addresses.length < 1) {
    return
  }

  const directionsService = new google.maps.DirectionsService()

  const origin = baseLocation
  const destination = addresses[addresses.length - 1] // Último endereço de entrega

  const waypoints = addresses.slice(0, -1).map((address) => ({
    location: new google.maps.LatLng(address.lat, address.lng),
    stopover: true,
  }))

  const request: google.maps.DirectionsRequest = {
    origin: new google.maps.LatLng(origin.lat, origin.lng),
    destination: new google.maps.LatLng(destination.lat, destination.lng),
    waypoints,
    travelMode: google.maps.TravelMode.DRIVING,
    optimizeWaypoints: true, // Otimiza os pontos de parada
  }

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK && result) {
      setDirections(result) // Atualiza o estado das direções
    } else {
      console.error('Erro ao calcular a rota:', status)
    }
  })
}
