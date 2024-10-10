/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import dayjs from 'dayjs'
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { FormikProps } from 'formik'
import { getLanguage, formatDate } from 'src/infrastructure/utils'
import { Locale } from 'src/infrastructure/providers/intl'

type DataForm = any

interface Props {
  formik: FormikProps<DataForm>
  minDate?: Date
  maxDate?: Date
  lang: Locale
  name: string
  disableFuture: boolean
  defaultDate?: Date
  disabled?: boolean
}

export function InputDate({
  formik,
  name,
  disableFuture,
  minDate,
  maxDate,
  lang,
  defaultDate,
  disabled,
}: Props) {
  dayjs.locale(getLanguage(lang))

  const defaultValue = dayjs(defaultDate || undefined)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer
        sx={{ padding: 0, width: '100%' }}
        components={['DatePicker', 'DateTimePicker', 'TimePicker']}
      >
        <DemoItem>
          <DatePicker
            defaultValue={defaultValue}
            disableFuture={disableFuture}
            disabled={disabled || false}
            views={['month', 'day']}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
            onChange={(i) =>
              formik.setFieldValue(
                name,
                formatDate(
                  i.toDate().toLocaleString().split(',')[0],
                  'dd/MM/yyyy',
                  'yyyy-MM-dd',
                ),
              )
            }
            name="data"
          />
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  )
}
