import { useMemo } from 'react'
import { Nunito } from 'next/font/google'
import { createTheme, type Theme } from '@mui/material'
// import {
//   enUS as coreEnUS,
//   esES as coreES,
//   ptBR as corePtBR,
// } from '@mui/material/locale'
// import {
//   enUS as dataGridEnUS,
//   esES as dataGridES,
//   ptBR as dataGridPtBR,
// } from '@mui/x-data-grid'
// import {
//   enUS as datePickerEnUS,
//   esES as datePickerES,
//   ptBR as datePickerPtBR,
// } from '@mui/x-date-pickers'
import { type Locale } from 'src/infrastructure/providers'
import { useColorMode } from '../providers/zustand/store'
import { primaryColorDark, primaryColorLight } from '../utils'

const nunito = Nunito({ display: 'swap', subsets: ['latin'] })

export function useAppTheme(locale: Locale) {
  console.log(locale)
  const { colorMode } = useColorMode()

  const theme = useMemo<Theme>(() => {
    // let coreLocale = corePtBR
    // let dataGridLocale = dataGridPtBR
    // let datePickerLocale = datePickerPtBR

    // switch (locale) {
    //   case 'en-US':
    //     coreLocale = coreEnUS
    //     dataGridLocale = dataGridEnUS
    //     datePickerLocale = datePickerEnUS
    //     break
    //   case 'es-ES':
    //     coreLocale = coreES
    //     dataGridLocale = dataGridES
    //     datePickerLocale = datePickerES
    //     break
    // }

    return createTheme(
      {
        // cssVariables: {
        //   colorSchemeSelector: 'data-toolpad-color-scheme',
        // },
        // colorSchemes: { light: true, dark: true },
        // defaultColorScheme: 'light',
        // breakpoints: {
        //   values: {
        //     xs: 0,
        //     sm: 600,
        //     md: 600,
        //     lg: 1200,
        //     xl: 1536,
        //   },
        // },
        palette: {
          mode: colorMode,
          primary: {
            main: colorMode === 'light' ? primaryColorLight : primaryColorDark,
          },
        },
        typography: {
          fontSize: 12,
          allVariants: {
            fontFamily: nunito.style.fontFamily,
          },
        },
        components: {
          MuiTooltip: {
            defaultProps: {
              PopperProps: {
                disablePortal: true,
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiSwitch: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiSelect: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiButton: {
            defaultProps: {
              size: 'small',
              variant: 'contained',
            },
          },
          MuiIconButton: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiChip: {
            defaultProps: {
              size: 'small',
              sx: {
                fontFamily: 'Nunito',
                fontSize: 10,
                p: 0,
              },
            },
          },
        },
      },
      // dataGridLocale,
      // datePickerLocale,
      // coreLocale,
    )
  }, [colorMode])

  return theme
}
