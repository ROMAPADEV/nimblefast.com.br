'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  CircularProgress,
  useTheme,
  Breadcrumbs,
  Link,
  Button,
  Tooltip,
  useMediaQuery,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import moment from 'moment'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import HomeIcon from '@mui/icons-material/Home'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  ProcessImageModal,
  ProcessPDFModal,
  ManualAddressModal,
} from 'src/components'
import { useParams } from 'next/navigation'
import { api } from 'src/adapters'
import { Client, Config, PackageData } from 'src/infrastructure/types'
import { TableAddress } from './components/TableAddress'
import { Libraries, useLoadScript } from '@react-google-maps/api'

const libraries: Libraries = ['places']

export default function AddressPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { clientId } = useParams()
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [packages, setPackages] = useState<PackageData[]>([])
  const [configs, setConfigs] = useState<Config[]>([])
  const [client, setClient] = useState<Client>()
  const [openProcessModal, setOpenProcessModal] = useState(false)
  const [openPDFModal, setOpenPDFModal] = useState(false)
  const [openManualAddressModal, setOpenManualAddressModal] = useState(false)

  const getAddressesByClientsId = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/packages/${clientId}`)
      setPackages(data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar endereços:', error)
      setLoading(false)
    }
  }, [clientId])

  const getClientConfigurations = useCallback(async () => {
    try {
      setLoading(true)
      const [{ data: clientData }, { data: config }] = await Promise.all([
        await api.get(`/clients/${clientId}`),
        await api.get(`/config/${clientId}`),
      ])
      setClient(clientData)
      setConfigs(config)
    } catch (error) {
      console.error('Erro ao buscar configurações do cliente:', error)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (clientId) {
      getAddressesByClientsId()
      getClientConfigurations()
    }
  }, [clientId, getAddressesByClientsId, getClientConfigurations])

  const handleRowClick = (day: string) => {
    setExpandedRow(expandedRow === day ? null : day)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="primary" />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        padding: isMobile ? 1 : 3,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ marginBottom: isMobile ? 1 : 2, alignItems: 'center' }}>
        <Breadcrumbs separator={<NavigateNextIcon />} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            <HomeIcon sx={{ mr: 0.5, fontSize: isMobile ? 14 : 16 }} />
          </Link>
          <Typography color="text.primary">
            Pacotes do cliente
          </Typography>
          <Typography variant={isMobile ? 'h5' : 'h4'}>{client?.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: isMobile ? 1 : 2,
          marginBottom: isMobile ? 2 : 4,
        }}
      >
        <Tooltip title="Cadastrar Endereço Manualmente">
          <Button
            variant="contained"
            color="primary"
            startIcon={!isMobile && <AddIcon  />}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              ':hover': { backgroundColor: '#2a75e0' },
            }}
            onClick={() => setOpenManualAddressModal(true)} // Abre o modal ao clicar
          >
            {isMobile ? 'Manual' : 'Cadastrar Endereço Manualmente'}
          </Button>
        </Tooltip>

        <Tooltip title="Upload de Imagens">
          <Button
            variant="contained"
            color="secondary"
            startIcon={!isMobile && <CloudUploadIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              ':hover': { backgroundColor: '#a62ca8' },
            }}
            onClick={() => setOpenPDFModal(true)}
          >
           {isMobile ? 'Upload' : 'Upload de Imagens'}
          </Button>
        </Tooltip>

        <Tooltip title="Bipar">
          <Button
            variant="contained"
            color="success"
            startIcon={!isMobile && <QrCodeScannerIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
              ':hover': { backgroundColor: '#43a047' },
            }}
            onClick={() => setOpenProcessModal(true)}
          >
            {isMobile ? 'Bipar' : 'Bipar'}
          </Button>
        </Tooltip>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
  <TableContainer>
    <Table>
      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
        <TableRow>
          <TableCell />
          <TableCell>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Pacotes separados por dia
            </Typography>
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {packages.map((pkg) => (
          <React.Fragment key={pkg.day}>
            <TableRow hover>
              <TableCell>
                <IconButton onClick={() => handleRowClick(pkg.day)}>
                  {expandedRow === pkg.day ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </IconButton>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#424242' }}
                >
                  {moment(pkg.day).format('DD/MM/YYYY')}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} sx={{ padding: 0 }}>
                <Collapse
                  in={expandedRow === pkg.day}
                  timeout="auto"
                  unmountOnExit
                >
                  <Box
                    sx={{
                      padding: 2,
                      backgroundColor: '#fafafa',
                      borderRadius: 2,
                      margin: 2,
                    }}
                  >
                    <TableAddress
                      packages={pkg.items}
                      updateList={getAddressesByClientsId}
                    />
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

      <ManualAddressModal
        open={openManualAddressModal}
        handleClose={() => {
          getAddressesByClientsId()
          setOpenManualAddressModal(false)
        }}
        clientId={Number(clientId)}
        isGoogleApiLoaded={isLoaded}
      />

      <ProcessImageModal
        open={openProcessModal}
        onClose={() => {
          getAddressesByClientsId()
          setOpenProcessModal(false)
        } }
        clientId={Number(clientId)}
        configs={configs}
        isLoaded={isLoaded}     />
      
      <ProcessPDFModal
        open={openPDFModal}
        onClose={() => {
          getAddressesByClientsId()
          setOpenPDFModal(false)
        }}
        clientId={Number(clientId)}
        configs={configs} 
        isLoaded={isLoaded}      />
    </Box>
  )
}
