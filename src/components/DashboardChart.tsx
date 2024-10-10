/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { api } from 'src/adapters'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const DashboardChart = () => {
  const [clientsData, setClientsData] = useState<number>(0)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients')
        setClientsData(response.data.length) // Pega o total de clientes
      } catch (error) {
        console.error('Erro ao buscar dados dos clientes:', error)
      }
    }

    fetchClients()
  }, [])

  const data = {
    labels: ['Clientes'],
    datasets: [
      {
        label: 'Total de Clientes',
        data: [clientsData], // Quantidade total de clientes
        backgroundColor: ['rgba(75, 192, 192, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Quantidade Total de Clientes',
      },
    },
  }

  return (
    <Card sx={{ maxWidth: 600, width: '100%', padding: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Total de Clientes
        </Typography>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  )
}

export default DashboardChart
