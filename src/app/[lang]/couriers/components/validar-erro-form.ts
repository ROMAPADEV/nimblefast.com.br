import * as Yup from 'yup'
import { Dictionary } from 'src/infrastructure/providers'

export function validarForm(dict: Dictionary) {
  return Yup.object().shape({
    name: Yup.string().required(dict.validation.isRequired),
    whatsapp: Yup.string()
      .required(dict.validation.isRequired)
      .matches(/^\d+$/, 'Whatsapp inválido'),
  })
}
