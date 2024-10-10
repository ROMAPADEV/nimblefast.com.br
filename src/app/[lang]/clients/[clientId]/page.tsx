/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/react-in-jsx-scope */
'use client'

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState } from 'react'

interface ClientData {
  id: string
  name: string
}

const ClientId = ({ clientId }: any) => {
  const [clientData, setClientData] = useState<ClientData | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClientData() {
      setClientData({ id: clientId, name: `Cliente ${clientId}` })
      setLoading(false)
    }

    loadClientData()
  }, [clientId])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 3 }} className="min-h-screen bg-gray-100">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
          Detalhes do {clientData.name}
        </Typography>
      </Box>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Endereços
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px' }}>
                  Endeo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f1f1f1',
                    cursor: 'pointer',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                <TableCell
                  sx={{ padding: '16px', fontSize: '0.975rem', color: '#333' }}
                >
                  Nenhum endereço cadastrado
                </TableCell>
                <TableCell sx={{ textAlign: 'center', padding: '16px' }}>
                  {/* Se houver outra ação, ela pode ser colocada aqui */}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default ClientId
