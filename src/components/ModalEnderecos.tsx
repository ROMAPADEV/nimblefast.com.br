'use client'

import React, { useState } from 'react'
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import { api, exibirError } from 'src/adapters'
import { LatLngWithAddress, Motoboy } from 'src/infrastructure/types'
import { type Locale } from 'src/infrastructure/providers'
import moment from 'moment'

interface ModalEnderecosProps {
  open: boolean
  lang: Locale
  handleClose: () => void
  addresses: LatLngWithAddress[]
  motoboys: Motoboy[]
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

const columns: GridColDef[] = [
  { field: 'address', headerName: 'Endereço', width: 300 },
  { field: 'number', headerName: 'Número', width: 100 }, // Coluna para número
  { field: 'lat', headerName: 'Latitude', width: 150 },
  { field: 'lng', headerName: 'Longitude', width: 150 },
]

export const ModalEnderecos: React.FC<ModalEnderecosProps> = ({
  open,
  lang,
  handleClose,
  addresses,
  motoboys,
}) => {
  const [motoboyId, setMotoboyId] = useState<number | undefined>()
  const [selectedAddresses, setSelectedAddresses] = useState<
    LatLngWithAddress[]
  >([])
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  })
  const [load, setLoad] = useState(false)

  const handleMotoboyChange = (event: SelectChangeEvent<string>) => {
    setMotoboyId(Number(event.target.value))
  }

  const handleSendRoute = async () => {
    try {
      if (selectedAddresses.length === 0) {
        alert('Por favor, selecione pelo menos um endereço.')
        return
      }

      const params = {
        packagesIds: selectedAddresses.map((item) => item.id),
      }

      setLoad(true)
      await api.patch(`/packages/motoboy-in-packages/${motoboyId}`, params)

      const motoca = motoboys.find((mt) => mt.id === motoboyId)

      const queryString = `?addresses=${encodeURIComponent(JSON.stringify(selectedAddresses))}`
      const rotaUrl = `${window.location.origin}/${lang}/rota/${motoboyId}${queryString}`

      const today = moment().format('DD/MM/YYYY')
      const numeroMotoboy = `+${motoca.whatsapp}`
      const mensagemWhatsApp = `Olá, ${motoca.name} \n Aqui está sua rota do dia ${today}: ${rotaUrl}`
      const linkWhatsApp = `https://wa.me/${numeroMotoboy}?text=${encodeURIComponent(mensagemWhatsApp)}`

      window.open(linkWhatsApp, '_blank')
      handleClose()
    } catch (error) {
      exibirError(error)
    } finally {
      setLoad(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Endereços selecionados
        </Typography>
        <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
          <InputLabel id="motoboy-select-label">Escolher Motoboy</InputLabel>
          <Select
            labelId="motoboy-select-label"
            id="motoboy-select"
            value={String(motoboyId)}
            label="Escolher Motoboy"
            onChange={handleMotoboyChange}
          >
            {motoboys.map((motoboy, index) => (
              <MenuItem key={index} value={motoboy.id}>
                {motoboy.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={addresses.map((addr, index) => ({
              id: index,
              address: addr.street, // Usando o campo street para o endereço
              number: addr.number, // Usando o campo number diretamente do JSON
              lat: addr.lat,
              lng: addr.lng,
            }))}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5]}
            checkboxSelection
            onRowSelectionModelChange={(
              newSelectionModel: GridRowSelectionModel,
            ) => {
              const selectedRows = addresses.filter((_, index) =>
                newSelectionModel.includes(index),
              )
              setSelectedAddresses(selectedRows)
            }}
          />
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            loading={load}
            variant="contained"
            color="primary"
            onClick={handleSendRoute}
            disabled={!motoboyId}
          >
            Enviar Rota
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  )
}
