import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  LinearProgress,
  Divider,
  TextField,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { Address, Config } from 'src/infrastructure/types';
import { api } from 'src/adapters';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { LoadingButton } from '@mui/lab';


interface ProcessImageModalProps {
  open: boolean
  onClose: () => void
  clientId: number
  configs: Config[]
  isLoaded: boolean
}

export const ProcessImageModal: React.FC<ProcessImageModalProps> = ({ 
  open,
  onClose, 
  clientId, 
  configs,
  isLoaded,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [loadingCoordinates, setLoadingCoordinates] = useState<boolean>(false)
  const [snackbarMessage, setSnackbarMessage] = useState({ open: false,
    message: '',
    severity: 'success' as 'success' | 'error', })
  const [addressData, setAddressData] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>(null);

  const GOOGLE_CLOUD_VISION_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
  const GOOGLE_GEOCODING_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fetchCoordinates = async (rowData: any) => {
    const { street, number, neighborhood, city, state, postalCode } = rowData;
    const addressString = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${postalCode}`;
  
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addressString
        )}&key=${GOOGLE_GEOCODING_API_KEY}`
      );
  
      console.log('Geocode API Response:', response.data); // Log completo da resposta da API
  
      const location = response.data.results[0]?.geometry.location;
      const addressComponents = response.data.results[0]?.address_components;
  
      if (location && addressComponents) {
        // Encontra a cidade
        const cityComponent = addressComponents.find((component: any) =>
          component.types.includes('administrative_area_level_2')
        );
        const city = cityComponent ? cityComponent.long_name : '';
        console.log('Extracted City:', city); // Log da cidade
  
        // Encontra o estado
        const stateComponent = addressComponents.find((component: any) =>
          component.types.includes('administrative_area_level_1')
        );
        const state = stateComponent ? stateComponent.short_name : '';
        console.log('Extracted State:', state); // Log do estado
  
        const updatedData = addressData.map((address) =>
          address.id === rowData.id
            ? { ...address, lat: location.lat, lng: location.lng, city, state }
            : address
        );
        setAddressData(updatedData);
        setSnackbarMessage({
          open: true,
          message: 'Coordenadas e dados de cidade/estado obtidos com sucesso!',
          severity: 'success',
        });
      } else {
        throw new Error('Localização não encontrada');
      }
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
      setSnackbarMessage({
        open: true,
        message: 'Erro ao obter coordenadas.',
        severity: 'error',
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setLoading(true);
      
      for (const file of files) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string); // Define a pré-visualização da última imagem carregada
        reader.readAsDataURL(file);
        
        await handleProcessImage(file); // Processa cada imagem individualmente
      }
      
      setLoading(false);
    }
  };


  const handleProcessImage = async (file: File) => {
    if (!file  || !GOOGLE_CLOUD_VISION_API_KEY) return;

    setLoading(true);
    try {
      const base64Image = await convertFileToBase64(file);
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          requests: [
            {
              image: { content: base64Image.split(',')[1] },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }
      );

      const textAnnotations = response.data.responses[0].textAnnotations;
      const detectedText = textAnnotations[0]?.description || 'Nenhum texto detectado.';
      
      console.log("texto", detectedText)
      // Identificar o tipo de etiqueta e usar o método de extração adequado
      const extractedData = extractDataByType(detectedText);

      
      setAddressData((prevAddressData) => [...prevAddressData, extractedData])
      setSnackbarMessage({ open: true, message: 'Texto extraído com sucesso! Confira os detalhes na tabela abaixo.', severity: 'success' });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setSnackbarMessage({ open: true, message: 'Erro ao processar a imagem. Verifique o formato ou tente novamente mais tarde.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Função para identificar o tipo de etiqueta e escolher o método de extração
  const extractDataByType = (text: string) => {
    if (text.includes('SHOPEE')) {
      return extractShopeeDetails(text);
    } else {
      return extractGenericDetails(text);
    }
  };

  // Método de extração para etiquetas genéricas
  const extractGenericDetails = (text: string) => {
    const addressDetails = {
      id: Date.now(),
      postalCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      destinatario: ''
    };

    // Regex genérica para capturar dados de destinatário
    const cepRegex = /CEP:\s*(\d{5}-\d{3}|\d{8})/i;
    const cepMatch = cepRegex.exec(text);
    if (cepMatch) {
      addressDetails.postalCode = cepMatch[1].replace('-', '');
    }

    const enderecoRegex = /Endereço:\s*(.+?)\s+(\d+)/i;
    const enderecoMatch = enderecoRegex.exec(text);
    if (enderecoMatch) {
      addressDetails.street = enderecoMatch[1].trim();
      addressDetails.number = enderecoMatch[2].trim();
    }

    const bairroRegex = /Bairro:\s*([^\n]+)/i;
    const bairroMatch = bairroRegex.exec(text);
    if (bairroMatch) {
      addressDetails.neighborhood = bairroMatch[1].trim();
    }

    const destinatarioRegex = /Destinatario:\s*([^\n]+)/i;
    const destinatarioMatch = destinatarioRegex.exec(text);
    if (destinatarioMatch) {
      addressDetails.destinatario = destinatarioMatch[1].trim();
    }

    const cidadeEstadoRegex = /\b([A-Za-z\s]+?),\s*([A-Za-z]{2})\b/i;
    const cidadeEstadoMatch = cidadeEstadoRegex.exec(text);
    if (cidadeEstadoMatch) {
      addressDetails.city = cidadeEstadoMatch[1].trim();
      addressDetails.state = cidadeEstadoMatch[2].trim();
    }

    return addressDetails;
  };

  const handleDeleteAddress = (id: number) => {
    setAddressData((prev) => prev.filter((adress) => adress.id !== id))
    setSnackbarMessage({ open: true, message: 'Endereço excluído com sucesso.', severity: 'success' })
  }

  const handleEditAddress = (rowData: any) => {
    setEditRowData(rowData);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setAddressData((prev) =>
      prev.map((address) => (address.id === editRowData.id ? editRowData : address))
    );
    setEditModalOpen(false);
    setSnackbarMessage({ open: true, message: 'Endereço atualizado com sucesso!', severity: 'success' });
  };

  // Método de extração para etiquetas da Shopee
  const extractShopeeDetails = (text: string) => {
    const addressDetails = {
      id: Date.now(),
      postalCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      destinatario: '',
      pedido: '',
      remetente: '',
      dataEntrega: '',
    };
  
    // Regex específico para cada campo
    const destinatarioRegex = /DESTINATARIO\s*([^\n]+)/i;
    const addressRegex = /([^\n,]+),\s*(\d+)([^\n,]*)?,/i;
    const bairroRegex = /Bairro:\s*([^\n]+)/i;
    const cepRegex = /CEP:\s*(\d{5}-\d{3})/i;
  
    // Destinatário
    const destinatarioMatch = destinatarioRegex.exec(text);
    if (destinatarioMatch) {
      addressDetails.destinatario = destinatarioMatch[1].trim();
    }
  
    // Endereço, Número e Complemento
    const addressMatch = addressRegex.exec(text);
    if (addressMatch) {
      addressDetails.street = addressMatch[1].trim(); // Nome da rua
      addressDetails.number = addressMatch[2].trim(); // Número
      addressDetails.complement = addressMatch[3] ? addressMatch[3].trim() : ''; // Complemento, se existir
    }
  
    // Bairro
    const bairroMatch = bairroRegex.exec(text);
    if (bairroMatch) {
      addressDetails.neighborhood = bairroMatch[1].trim();
    }
  
    // CEP
    const cepMatch = cepRegex.exec(text);
    if (cepMatch) {
      addressDetails.postalCode = cepMatch[1].replace('-', '');
    }
  
    return addressDetails;
  };

  const handleSnackbarClose = () => {
    setSnackbarMessage({ ...snackbarMessage, open: false });
  };

  const handleSelectChange = (value: string, id: number) => {
    setAddressData((prevData) =>
    prevData.map((address) =>
    address.id === id ? {...address, tipo: value } : address
  )
)}

const handleSaveAddresses = async () => {
  setSaving(true);
  try {
    for (const address of addressData) {
      const config = configs.find((config) => config.name === address.tipo);
      const value = config ? Number(config.value) : 0;

      const formattedAddress = {
        street: address.street || 'Endereço não especificado',
        neighborhood: address.neighborhood || 'Bairro não especificado',
        number: address.number || 'S/N',
        city: address.city || 'Cidade não especificada',
        state: address.state || 'Estado não especificado',
        postalCode: address.postalCode || '00000-000',
        lat: String(address.lat),
        lng: String(address.lng),
        quantity: 1,
        value,
        clientsId: clientId,
      };

      await api.post('/packages', formattedAddress);
    }

    setSnackbarMessage({
      open: true,
      message: 'Endereços salvos com sucesso!',
      severity: 'success',
    });
    onClose();
  } catch (error) {
    console.error('Erro ao salvar endereços:', error);
    setSnackbarMessage({
      open: true,
      message: 'Erro ao salvar endereços.',
      severity: 'error',
    });
  } finally {
    setSaving(false);
  }
};


  const columns: GridColDef[] = [
    {
      field: 'tipo',
      headerName: 'Preço',
      width: 180,
      renderCell: (params) => (
        <FormControl fullWidth>
          <InputLabel>Preço</InputLabel>
          <Select
            value={params.row.tipo || ''}
            label="Preço"
            onChange={(e) => handleSelectChange(e.target.value, params.row.id)}
            >
              {(configs && configs.length > 0 ? configs : []).map((config) => (
                <MenuItem key={config.id} value={config.name}>
                  {config.name}
                </MenuItem>
              ))}
            </Select>
        </FormControl>
      ),
    },
    { field: 'postalCode', headerName: 'CEP', width: 130 },
    { field: 'street', headerName: 'Endereço', width: 200 },
    { field: 'number', headerName: 'Número', width: 100 },
    { field: 'neighborhood', headerName: 'Bairro', width: 150 },
    { field: 'complement', headerName: 'Complemento', width: 200 },
    { field: 'city', headerName: 'Cidade', width: 150 },
    { field: 'state', headerName: 'Estado', width: 150 },
    { field: 'lat', headerName: 'Latitude', width: 150 },
    { field: 'lng', headerName: 'Longitude', width: 150 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      renderCell: (params) => (
        <>
           <IconButton color="primary" onClick={() => handleEditAddress(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteAddress(params.row.id)}>
            <DeleteIcon />
          </IconButton>
          <IconButton color="info" onClick={() => fetchCoordinates(params.row)}>
            <LocationOnIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <>
       <Modal open={open} onClose={onClose} aria-labelledby="process-image-modal">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: isMobile ? 2 : 4,
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1E1E1E' : '#f4f6f8'),
          borderRadius: 4,
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
          maxWidth: isMobile ? '90%' : '60%',
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? '85vh' : 'auto',
          maxHeight: '90vh',
          overflowY: 'hidden',
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#757575',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: '#3f51b5',
            fontWeight: 600,
            marginBottom: isMobile ? 1 : 2,
          }}
        >
          Faça upload das suas imagens para começar!
        </Typography>
        <Divider sx={{ marginBottom: isMobile ? 2 : 3 }} />

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: 'auto',
                  maxHeight: isMobile ? 150 : 200,
                  marginBottom: isMobile ? 16 : 20,
                  borderRadius: '8px',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              component="label"
              sx={{
                padding: '8px 16px',
                backgroundColor: '#3f51b5',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0px 3px 8px rgba(63, 81, 181, 0.3)',
                marginBottom: 2,
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Escolher Imagem
              <input type="file" accept="image/*" hidden multiple onChange={handleFileChange} />
            </Button>
          </>
        )}

        <Box 
          sx={{ height: isMobile ? '40vh' : 300, width: '100%', marginTop: 4 }}>
          <DataGrid rows={addressData} columns={columns} pageSizeOptions={[5]} />
        </Box>

        <Box  
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 2,
            position: 'sticky',
            bottom: 0,
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1E1E1E' : '#f4f6f8'),
            padding: 2,
          }}>
          <LoadingButton
            variant="contained"
            color="success"
            onClick={handleSaveAddresses}
            loading={saving}
            sx={{
              width: isMobile ? '100%' : 'auto',
              fontWeight: 'bold',
              borderRadius: 3,
              backgroundColor: '#4caf50',
              ':hover': { backgroundColor: '#43a047' },
            }}
          >
            Salvar Endereços
          </LoadingButton>
        </Box>
      </Box>
    </Modal>

    <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} aria-labelledby="edit-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Editar Endereço
          </Typography>
          <TextField
            fullWidth
            label="CEP"
            value={editRowData?.postalCode || ''}
            onChange={(e) => setEditRowData({ ...editRowData, postalCode: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Endereço"
            value={editRowData?.street || ''}
            onChange={(e) => setEditRowData({ ...editRowData, street: e.target.value })}
            margin="normal"
          />
          <TextField
          fullWidth
          label="Número"
          value={editRowData?.number || ''}
          onChange={(e) => setEditRowData({ ...editRowData, number: e.target.value })}
          margin="normal"
          />
          <TextField
          fullWidth
          label="Bairro"
          value={editRowData?.neighborhood || ''}
          onChange={(e) => setEditRowData({ ...editRowData, neighborhood: e.target.value })}
          margin="normal"
          />
          <TextField
          fullWidth
          label="Cidade"
          value={editRowData?.city || ''}
          onChange={(e) => setEditRowData({ ...editRowData, city: e.target.value })}
          margin="normal"
          />
        <TextField
          fullWidth
          label="Estado"
          value={editRowData?.state || ''}
          onChange={(e) => setEditRowData({ ...editRowData, state: e.target.value })}
          margin="normal"
          />
        <TextField
          fullWidth
          label="Complemento"
          value={editRowData?.complement || ''}
          onChange={(e) => setEditRowData({ ...editRowData, complement: e.target.value })}
          margin="normal"
        />
          {/* Add other fields as needed */}
          <Button variant="contained" color="primary" onClick={handleSaveEdit} fullWidth>
            Salvar
          </Button>
        </Box>
      </Modal>

      <Snackbar open={snackbarMessage.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarMessage.severity}>
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
    </>
    
  );
};
