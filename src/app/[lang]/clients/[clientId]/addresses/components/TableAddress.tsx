import React from 'react'
import {
  Box,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@mui/material'
import Delete from '@mui/icons-material/Delete'
import { Package } from 'src/infrastructure/types'
import { AlertReact } from 'src/components'
import { api, exibirError } from 'src/adapters'

interface Props {
  packages: Package[]
  updateList: () => void
}

export function TableAddress({ packages, updateList }: Props) {
  async function deletePackage(packagesId: number) {
    try {
      await api.del(`/packages/${packagesId}`)
      updateList()
    } catch (error) {
      exibirError(error)
    }
  }

  return (
    <Table>
      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
        <TableRow>
          <TableCell>CEP</TableCell>
          <TableCell>Rua</TableCell>
          <TableCell>Número</TableCell>
          <TableCell>Bairro</TableCell>
          <TableCell>Cidade</TableCell>
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {packages.map((pkg) => (
          <TableRow key={pkg.id}>
            <TableCell>{pkg.postalCode}</TableCell>
            <TableCell>{pkg.street}</TableCell>
            <TableCell>{pkg.number}</TableCell>
            <TableCell>{pkg.neighborhood}</TableCell>
            <TableCell>{pkg.city}</TableCell>
            <TableCell>
              <Box>
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
                        preConfirm: () => deletePackage(pkg.id),
                      })
                    }}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
