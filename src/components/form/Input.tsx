/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  FormEventHandler,
} from 'react'
import {
  Box,
  TextField,
  LinearProgress,
  IconButton,
  type StandardTextFieldProps,
} from '@mui/material'
import { FormikProps } from 'formik'
import { RemoveRedEye, VisibilityOff } from '@mui/icons-material'
import { type Mask, setMask } from './set-mask'

type DataForm = any

interface InputProps extends StandardTextFieldProps {
  name: string
  formik: FormikProps<DataForm>
  className?: string
  onInput?: FormEventHandler
  mask?: Mask
}

export const Input: React.FC<InputProps> = ({
  name,
  formik,
  onInput,
  mask,
  ...props
}) => {
  const [showProgress, setShowProgress] = useState(false)
  const [totalChar, setTotalChar] = useState(
    String(props?.defaultValue || '').length,
  )
  const [showPass, setShowPass] = useState(false)

  const inputRef = useRef(null)

  const length = totalChar / (Number(props.maxRows) / 100) || 0

  const getType = () => {
    if (props.type === 'password') {
      return showPass === false ? 'password' : 'text'
    }

    return props.type
  }

  useEffect(() => {
    setMask(name, mask)
  }, [name, mask])

  return (
    <>
      <Box style={{ width: '100%' }}>
        <TextField
          inputRef={inputRef}
          style={{ width: '100%' }}
          {...props}
          id={name}
          type={getType()}
          onChange={formik.handleChange}
          onFocus={() => setShowProgress(true)}
          onBlur={() => setShowProgress(false)}
          onInput={(e: ChangeEvent<HTMLInputElement>) => {
            setTotalChar(e.target.value.length)
            if (onInput) {
              onInput(e)
            }
          }}
          inputProps={{ maxLength: props.maxRows }}
          InputProps={{
            endAdornment:
              props.type === 'password' ? (
                <IconButton
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="icon"
                >
                  {showPass ? <VisibilityOff /> : <RemoveRedEye />}
                </IconButton>
              ) : null,
          }}
          error={!!formik.errors[name]}
          helperText={<>{formik.errors[name]}</>}
        />
      </Box>

      {showProgress ? (
        <LinearProgress
          style={{ marginBlock: 2 }}
          variant="determinate"
          value={length}
        />
      ) : null}
    </>
  )
}
