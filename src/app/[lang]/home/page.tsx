'use client'

import { Box } from '@mui/material'
import DashboardChart from 'src/components/DashboardChart'

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}
    >
      <DashboardChart />
    </Box>
  )
}
