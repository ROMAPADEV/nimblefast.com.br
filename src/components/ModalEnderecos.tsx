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
import { LatLngWithAddress, Motoboy } from 'src/infrastructure/types'
import { type Locale } from 'src/infrastructure/providers'
import moment from 'moment'
import * as XLSX from 'xlsx'
import { api, exibirError } from 'src/adapters'

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
  { field: 'number', headerName: 'Número', width: 100 },
  { field: 'cep', headerName: 'CEP', width: 150 },
  { field: 'city', headerName: 'Cidade', width: 150 },
  { field: 'state', headerName: 'Estado', width: 150 },
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
  console.log('Endereços recebidos:', addresses)
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
      if (!motoboyId) {
        alert('Por favor, selecione um motoboy.')
        return
      }
      if (selectedAddresses.length === 0) {
        alert('Por favor, selecione pelo menos um endereço.')
        return
      }

      const packagesIds = selectedAddresses.map((item) => item.id)

      const params = {
        packagesIds,
      }

      setLoad(true)
      await api.patch(`/packages/motoboy-in-packages/${motoboyId}`, params)

      const motoca = motoboys.find((mt) => mt.id === motoboyId)

      const rotaUrl = `${window.location.origin}/${lang}/rota/${motoboyId}`
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

  const handleDownloadExcel = async () => {
    const data = selectedAddresses.map((addr) => {
      const addressData = {
        'Address Line 1': addr.street,
        'Address Line 2': addr.number || '',
        City: addr.city || 'Desconhecido',
        State: addr.state || 'Desconhecido',
        'Zip/Postal Code': addr.postalCode || 'Desconhecido', // Usando o CEP diretamente
      }
      console.log('Dados do endereço:', addressData) // Log dos dados do endereço antes de exportar
      return addressData
    })

    console.log('Dados finais da planilha:', data) // Log dos dados finais que serão exportados

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Endereços')
    XLSX.writeFile(workbook, `enderecos_${moment().format('YYYYMMDD')}.xlsx`)

    console.log('Planilha criada e baixada com sucesso!')
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
              address: addr.street,
              number: addr.number,
              city: addr.city,
              state: addr.state,
              lat: addr.lat,
              lng: addr.lng,
              cep: addr.postalCode,
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
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <LoadingButton
            loading={load}
            variant="contained"
            color="primary"
            onClick={handleSendRoute}
            disabled={!motoboyId}
          >
            Enviar Rota
          </LoadingButton>
          <LoadingButton
            variant="outlined"
            color="secondary"
            onClick={handleDownloadExcel}
            disabled={selectedAddresses.length === 0}
          >
            Baixar Planilha
          </LoadingButton>
        </Box>
      </Box>
    </Modal>
  )
}
