/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { FormikProps } from 'formik'

type DataForm = any

export interface Option {
  value: number | string
  label: string
}

interface InputProps extends React.ComponentProps<any> {
  name: string
  label: string
  items: Option[]
  formik: FormikProps<DataForm>
}

export const InputSelect: React.FC<InputProps> = ({
  formik,
  name,
  items,
  ...props
}: InputProps) => {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>{props.label}</InputLabel>
        <Select
          {...props}
          id={name}
          style={{ width: '100%' }}
          defaultValue={props.defaultValue}
          onChange={(e) => {
            formik.handleChange({ target: { value: e.target.value, name } })
          }}
          error={!!formik.errors[name]}
        >
          {items.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
