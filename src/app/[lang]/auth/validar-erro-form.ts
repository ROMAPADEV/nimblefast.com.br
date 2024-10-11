import * as Yup from 'yup'
import { Dictionary } from 'src/infrastructure/providers'

export function validarFormSignin(dict: Dictionary) {
  return Yup.object().shape({
    email: Yup.string()
      .email(dict.validation.emailInvalid)
      .required(dict.validation.isRequired),
    password: Yup.string().required(dict.validation.isRequired),
  })
}

export function validarFormSignup(dict: Dictionary) {
  return Yup.object().shape({
    name: Yup.string()
      .required(dict.validation.isRequired)
      .matches(/^[A-Za-zÀ-ÿ\s]+$/, dict.validation.nameInvalid)
      .test('has-full-name', dict.validation.fullNameRequired, (value) => {
        return value ? value.trim().split(' ').length >= 2 : false
      }),
    email: Yup.string()
      .email(dict.validation.emailInvalid)
      .required(dict.validation.isRequired),
    password: Yup.string().required(dict.validation.isRequired),
    password2: Yup.string()
      .min(8, dict.validation.minChar(8))
      .oneOf([Yup.ref('password'), null], dict.validation.senhasIguais)
      .required(dict.validation.isRequired),
  })
}
