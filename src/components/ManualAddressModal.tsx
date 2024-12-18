import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { api } from 'src/adapters';

interface ManualAddressModalProps {
  open: boolean;
  handleClose: () => void;
  clientId: number;
  isGoogleApiLoaded: boolean;
}

export const ManualAddressModal: React.FC<ManualAddressModalProps> = ({
  open,
  handleClose,
  clientId,
  isGoogleApiLoaded,
}) => {
  const [postalCode, setPostalCode] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [number, setNumber] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [inputValue, setInputValue] = useState(''); // Valor do campo de entrada


  // Função para buscar sugestões de autocomplete
  const fetchSuggestions = async (input: string) => {
    if (!isGoogleApiLoaded || !input) return;

    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input, componentRestrictions: { country: 'br' } },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    fetchSuggestions(value); // Atualiza as sugestões ao mudar o valor do input
  };

  const handleSelect = async (placeId: string) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results) {
        const result = results[0];
        setStreet(result.address_components.find((c) => c.types.includes('route'))?.long_name || '');
        setNumber(result.address_components.find((c) => c.types.includes('street_number'))?.long_name || '');
        setNeighborhood(result.address_components.find((c) => c.types.includes('sublocality'))?.long_name || '');
        setCity(result.address_components.find((c) => c.types.includes('administrative_area_level_2'))?.long_name || '');
        setState(result.address_components.find((c) => c.types.includes('administrative_area_level_1'))?.short_name || '');
        setPostalCode(result.address_components.find((c) => c.types.includes('postal_code'))?.long_name || '');
        setLat(result.geometry.location.lat().toString());
        setLng(result.geometry.location.lng().toString());
      }
    });
    setSuggestions([]); // Limpa as sugestões após a seleção
  };

  // Função para enviar o endereço para a API
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const addressData = {
        street,
        neighborhood,
        city,
        state,
        postalCode,
        number: number || 'S/N',
        lat: String(lat),
        lng: String(lng),
        value: 1,
        quantity: 1,
        clientsId: clientId,
      };

      await api.post('/packages', addressData);
      setSnackbarMessage('Endereço cadastrado com sucesso!');
      setSnackbarOpen(true);
      handleClose();
    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error);
      setSnackbarMessage('Erro ao cadastrar endereço. Tente novamente.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Função para reconhecimento de voz
  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition as SpeechRecognitionConstructor;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Reconhecimento de voz iniciado');
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      console.log('Resultado de voz:', speechResult);

      setInputValue(speechResult);
      fetchSuggestions(speechResult); // Gera sugestões a partir do resultado de voz
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
    };

    recognition.onend = () => {
      console.log('Reconhecimento de voz finalizado');
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastrar Endereço Manualmente</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex">
            <TextField
              label="Digite o endereço"
              value={inputValue}
              onChange={handleInputChange}
              fullWidth
            />
            <IconButton
              onClick={startRecognition}
              color={isRecording ? 'secondary' : 'primary'}
            >
              <MicIcon />
            </IconButton>
          </Box>
          {suggestions.length > 0 && (
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: '40px',
                position: 'absolute',
                zIndex: 999,
                backgroundColor: '#fff',
                maxHeight: '150px',
                overflowY: 'auto',
                width: '100%',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {suggestions.map((suggestion) => (
                <Box
                  key={suggestion.place_id}
                  sx={{
                    padding: '10px',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                  onClick={() => handleSelect(suggestion.place_id)}
                >
                  {suggestion.description}
                </Box>
              ))}
            </Box>
          )}

          <TextField label="CEP" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} fullWidth />
          <TextField label="Rua" value={street} fullWidth disabled />
          <TextField label="Número" value={number} onChange={(e) => setNumber(e.target.value)} fullWidth helperText="Se o endereço não possui número, deixe vazio ou insira 'S/N" />
          <TextField label="Bairro" value={neighborhood} fullWidth disabled />
          <TextField label="Cidade" value={city} fullWidth disabled />
          <TextField label="Estado" value={state} fullWidth disabled />
          <TextField label="Latitude" value={lat} fullWidth disabled />
          <TextField label="Longitude" value={lng} fullWidth disabled />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
