export const enUS = {
  language: 'Language',
  languages: {
    'en-US': 'English US',
    'es-ES': 'Spanish ES',
    'pt-BR': 'Portuguese BR',
  },
  atencao: 'Warning',
  confirmButtonText: 'Yes, exclude',
  cancelButtonText: 'To go back',
  deleteItem: 'This item will be removed permanently',
  itemDelted: 'Item deleted',
  mesageCreate: 'Created successfully',
  gridEmpty: 'Data not found',
  validation: {
    minChar: (n: number) => `Minimum ${n} characters`,
    maxChar: (n: number) => `Maximum ${n} characters`,
    isRequired: 'This field is required',
    fullNameRequired: 'First and last name is required',
    nameInvalid: 'Invalid name',
    emailInvalid: 'Invalid E-mail',
    senhasIguais: 'Passwords must be the same',
    userCreated: 'User registered successfully',
  },
  pages: {
    btnAdd: 'Add',
    save: 'Save',
    close: 'Close',
    home: {
      btnApply: 'Apply',
      formSetup: {
        title: 'Setup',
      },
      form: {
        title: 'Add item',
        billingCycle: 'Billing cycle',
        input: {
          name: 'Name or service',
          value: 'Value',
          category: 'Category',
          valueBase: 'Base value',
          init: 'Start date',
          end: 'Closing date',
          dateIsBefore:
            'Closing date cannot be less than or equal to start date',
        },
      },
      mesgUpdate: (id: number) => `User ${id} updated successfully`,
      mesgDelete: (id: number) => `User ${id} deleted successfully`,
    },
    category: {
      title: 'Categories',
      search: 'Search',
      form: {
        title: 'Category registration',
        input: {
          name: 'Name',
        },
      },
      columns: {
        name: 'Name',
        options: 'Options',
      },
    },
    auth: {
      logout: {
        title: 'Redirecting',
      },
      signin: 'Sign in',
      signup: 'Sign Up',
      register: 'Register',
      createAccount: "Don't have an account? Sign Up",
      password: 'Password',
      confirmeSenha: 'Confirm Password',
      name: 'First and last name',
    },
    dashboard: {
      title: {
        perCategory: 'By category',
        perUser: 'By user',
        perWeek: 'By week',
      },
    },
  },
  drawerMenu: {
    home: 'Expenses',
    category: 'Categories',
  },
  header: {
    title: 'Spend wisely',
    logout: 'Logout',
  },
  errorsApi: {
    fieldRequired: (field: string) => `The "${field}" field is mandatory`,
    tokenNotfound: 'Invalid session token',
    userAlreadyExists: 'User already exists',
    invalidCredential: 'Invalid email or password',
    itemAlreadyExists: 'The item already exists',
    itemVinculado: 'The item is linked to a record',
  },
}
