/* eslint-disable react/react-in-jsx-scope */
'use client'

import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'

export const Header = ({ drawerWidth }: { drawerWidth: number }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: '#212121',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Sombra suave
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Transportadora - Sistema de Gestão
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="account"
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            },
          }}
        >
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
