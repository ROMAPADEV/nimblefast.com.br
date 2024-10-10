/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { type Locale } from 'src/infrastructure/providers'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import HomeIcon from '@mui/icons-material/Home'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Delete from '@mui/icons-material/Delete'
import { Edit } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { api, exibirError } from 'src/adapters'
import { AlertReact } from 'src/components'
import { maskPhone } from 'src/infrastructure/utils'
import { Motoboy } from 'src/infrastructure/types'
import { ModalCreateOrUpdate } from './components/ModalCreateOrUpdate' // Modal para criar motoboy

interface Props {
  params: {
    lang: Locale
  }
}

export default function Couriers({ params }: Props) {
  const { lang } = params

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchTerm, setSearchTerm] = useState('')
  const [motoboys, setMotoboys] = useState<Motoboy[]>([])
  const [motoboy, setMotoboy] = useState<Motoboy>()
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => {
    setMotoboy(undefined)
    setOpenModal(false)
  }

  const getMotoboys = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/motoboys')
      setMotoboys(data)
    } catch (error) {
      exibirError(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    getMotoboys()
  }, [])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filteredMotoboys = motoboys.filter(
    (motoboy) =>
      motoboy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motoboy.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  async function deleteMotoboy(id: number) {
    try {
      await api.del(`/motoboys/${id}`)
      getMotoboys()
    } catch (error) {
      exibirError(error)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome do Motoboy',
      flex: 1,
      renderCell: ({ row: { name } }) => (
        <Typography sx={{ height: '100%' }} display="flex" alignItems="center">
          {name}
        </Typography>
      ),
    },
    {
      field: 'whatsapp',
      headerName: 'WhatsApp',
      flex: 1,
      renderCell: ({ row: { whatsapp } }) => (
        <Typography sx={{ height: '100%' }} display="flex" alignItems="center">
          {maskPhone(whatsapp)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 1,
      renderCell: ({ row }) => (
        <Box>
          <Tooltip title="Configurar Motoboy">
            <IconButton
              aria-label="Configurar"
              onClick={() => {
                setMotoboy(row)
                setOpenModal(true)
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="right">
            <IconButton
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
                  preConfirm: () => deleteMotoboy(row.id),
                })
              }}
              color="error"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box
      sx={{
        padding: isMobile ? 2 : 3,
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
          <Typography color="text.primary">Motoboys</Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          Catálogo de Motoboys
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
            placeholder="Pesquisar motoboy por nome"
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
          Novo Motoboy
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredMotoboys}
            columns={columns}
            sx={{
              boxShadow: 2,
              border: 2,
              borderColor: theme.palette.divider,
              '& .MuiDataGrid-cell:hover': {
                color: theme.palette.primary.main,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: theme.palette.background.default,
              },
            }}
          />
        </Box>
      )}

      <ModalCreateOrUpdate
        open={openModal}
        lang={lang}
        motoboy={motoboy}
        handleClose={handleCloseModal}
        updateList={getMotoboys}
      />
    </Box>
  )
}
