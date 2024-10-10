export const esES = {
  language: 'Idioma',
  languages: {
    'en-US': 'Inglés US',
    'es-ES': 'Español ES',
    'pt-BR': 'portugués BR',
  },
  atencao: 'Atención',
  confirmButtonText: 'Si, eliminar',
  cancelButtonText: 'Para volver',
  deleteItem: 'Este artículo será removido permanentemente',
  itemDelted: 'Elemento eliminado',
  mesageCreate: 'Creado exitosamente',
  gridEmpty: 'Datos no encontrados',
  validation: {
    minChar: (n: number) => `Mínimo ${n} caracteres`,
    maxChar: (n: number) => `Máximo ${n} caracteres`,
    isRequired: 'Este campo es obligatorio',
    fullNameRequired: 'Se requiere nombre y apellido',
    nameInvalid: 'Nombre no válido',
    emailInvalid: 'Correo electrónico no válido',
    senhasIguais: 'Las contraseñas deben ser las mismas.',
    userCreated: 'Usuario registrado exitosamente',
  },
  pages: {
    btnAdd: 'Agregar usuario',
    save: 'Ahorrar',
    close: 'Cerrar',
    home: {
      btnApply: 'Aplicar',
      formSetup: {
        title: 'Configuración',
      },
      form: {
        title: 'Añadir artículo',
        billingCycle: 'Ciclo de facturación',
        input: {
          name: 'Nombre o servicio',
          value: 'Valor',
          category: 'Categoría',
          valueBase: 'Valor base',
          init: 'Fecha de inicio',
          end: 'Fecha de cierre',
          dateIsBefore:
            'La fecha de cierre no puede ser menor o igual a la fecha de inicio',
        },
      },
      mesgUpdate: (id: number) => `Usuario ${id} actualizado exitosamente`,
      mesgDelete: (id: number) => `Usuario ${id} eliminado exitosamente`,
    },
    category: {
      title: 'Categorías',
      search: 'Buscar',
      form: {
        title: 'Registro de categoría',
        input: {
          name: 'Nombre',
        },
      },
      columns: {
        name: 'Nombre',
        options: 'Opciones',
      },
    },
    auth: {
      logout: {
        title: 'Redireccionando',
      },
      signin: 'Iniciar sesión',
      signup: 'Inscribirse',
      register: 'Registro',
      createAccount: '¿No tienes una cuenta? Regístrate',
      password: 'Contraseña',
      confirmeSenha: 'Confirme la Contraseña',
      name: 'Nombre y apellido',
    },
    dashboard: {
      title: {
        perCategory: 'Por categoría',
        perUser: 'Por usuario',
        perWeek: 'Por semana',
      },
    },
  },
  drawerMenu: {
    home: 'Gastos',
    category: 'Categorías',
  },
  header: {
    title: 'Gasta bien',
    logout: 'Sair',
  },
  errorsApi: {
    fieldRequired: (field: string) => `El campo "${field}" es obligatorio`,
    tokenNotfound: 'Token de sesión no válido',
    userAlreadyExists: 'El usuario ya existe',
    invalidCredential: 'Correo electrónico o contraseña no válidos',
    itemAlreadyExists: 'El artículo ya existe.',
    itemVinculado: 'El artículo está vinculado a un registro.',
  },
}
