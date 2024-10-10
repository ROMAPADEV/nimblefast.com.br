/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Collapse,
  Alert,
  InputBase,
  Breadcrumbs,
  Link,
} from '@mui/material'

import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import SettingsIcon from '@mui/icons-material/Settings'
import { useRouter } from 'next/navigation'
import { api, exibirError } from 'src/adapters'
import { ClientModal, ClientEditModal, AlertReact } from 'src/components'
import { PriceModal } from './components/PriceModal'
import { type Locale } from 'src/infrastructure/providers'
import { Client } from 'src/infrastructure/types'
import { TableConfig } from './components/TableConfig'

interface Props {
  params: {
    lang: Locale
  }
}

export default function ClientsPage({ params }: Props) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [openModal, setOpenModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openPriceModal, setOpenPriceModal] = useState(false) // Estado para o PriceModal
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning',
  })
  const router = useRouter()

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client)
    setOpenEditModal(true)
  }
  const handleCloseEditModal = () => {
    setOpenEditModal(false)
    setSelectedClient(null)
  }

  const handleOpenPriceModal = (client: Client) => {
    setSelectedClient(client)
    setOpenPriceModal(true)
  }

  const handleClosePriceModal = () => {
    setOpenPriceModal(false)
    setSelectedClient(null)
  }

  const getClients = async () => {
    try {
      const response = await api.get('/clients')
      setClients(response.data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  useEffect(() => {
    getClients()
  }, [])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev)
      if (newExpandedRows.has(id)) {
        newExpandedRows.delete(id)
      } else {
        newExpandedRows.add(id)
      }
      return newExpandedRows
    })
  }

  const handleSnackbarClose = () => {
    setSnackbarMessage((prevState) => ({ ...prevState, open: false }))
  }

  const handleClientAdded = () => {
    getClients()
    setSnackbarMessage({
      open: true,
      message: 'Cliente criado com sucesso!',
      severity: 'success',
    })
  }

  const handleClientUpdated = () => {
    getClients()
    setSnackbarMessage({
      open: true,
      message: 'Cliente atualizado com sucesso!',
      severity: 'success',
    })
  }

  const handlePriceConfigured = () => {
    getClients()
    setSnackbarMessage({
      open: true,
      message: 'Preço configurado com sucesso!',
      severity: 'success',
    })
  }

  const filteredClients = clients.filter(
    (client: {
      name: string
      companiesId: { toString: () => string | unknown[] }
    }) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companiesId.toString().includes(searchTerm),
  )

  async function disableClient(id: string) {
    try {
      await api.del(`/clients/${id}`)
      getClients()
    } catch (error) {
      exibirError(error)
    }
  }

  return (
    <Box
      sx={{
        padding: 3,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon />} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Home
          </Link>
          <Typography color="text.primary">Clientes</Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          Meus Clientes
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            padding: '0 8px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            width: '20%',
          }}
        >
          <SearchIcon sx={{ color: theme.palette.text.secondary }} />
          <InputBase
            placeholder="Pesquisar cliente por nome"
            sx={{ marginLeft: 1, width: '100%' }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
          onClick={handleOpenModal}
        >
          Novo cliente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Expandir</TableCell>
              <TableCell>Nome do Cliente</TableCell>
              <TableCell>Data de Cadastro</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client: Client) => (
              <React.Fragment key={client.id}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => toggleRowExpansion(client.id)}>
                      {expandedRows.has(client.id) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>
                    {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver Detalhes">
                      <IconButton
                        aria-label="Ver"
                        sx={{ marginRight: 1 }}
                        color="primary"
                        onClick={() =>
                          router.push(
                            `/${params.lang}/clients/${client.id}/addresses`,
                          )
                        }
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar Cliente">
                      <IconButton
                        aria-label="Editar"
                        color="default"
                        onClick={() => handleOpenEditModal(client)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Configurar Preço">
                      <IconButton
                        aria-label="Configurar Preço"
                        color="primary"
                        onClick={() => handleOpenPriceModal(client)}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir Cliente">
                      <IconButton
                        aria-label="Excluir"
                        color="error"
                        onClick={() => {
                          AlertReact.confirmation({
                            titulo: 'Atenção',
                            texto: 'Esse item será removido permanentemente',
                            showCloseButton: true,
                            confirmButtonColor: '#e02d1b',
                            confirmButtonText: 'Sim, excluir',
                            showCancelButton: true,
                            cancelButtonColor: '#858796',
                            cancelButtonText: 'Voltar',
                            showLoaderOnConfirm: true,
                            preConfirm: () => disableClient(client.id),
                          })
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                  >
                    <Collapse
                      in={expandedRows.has(client.id)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box margin={2}>
                        <Typography variant="h6">
                          Tabela de configurações
                        </Typography>
                        {client?.configurations?.length > 0 ? (
                          <TableConfig
                            configs={client.configurations}
                            updateConfigs={() => getClients()}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Nenhuma configuração cadastrada.
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Edição de Cliente */}
      <ClientEditModal
        open={openEditModal}
        handleClose={handleCloseEditModal}
        client={selectedClient}
        onClientUpdated={handleClientUpdated}
      />

      <PriceModal
        open={openPriceModal}
        handleClose={handleClosePriceModal}
        onPriceConfigured={handlePriceConfigured}
        clientId={selectedClient?.id || null}
      />

      <ClientModal
        open={openModal}
        handleClose={handleCloseModal}
        onClientAdded={handleClientAdded}
      />

      <Snackbar
        open={snackbarMessage.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage.severity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
