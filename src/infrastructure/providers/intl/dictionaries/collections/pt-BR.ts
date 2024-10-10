export const ptBr = {
  language: 'Idioma',
  languages: {
    'en-US': 'Inglês nos EUA',
    'es-ES': 'Espanhol Es',
    'pt-BR': 'Português BR',
  },
  atencao: 'Atenção',
  confirmButtonText: 'Sim, excluir',
  cancelButtonText: 'Voltar',
  deleteItem: 'Esse item será removido permanentemente',
  itemDelted: 'Item removido',
  mesageCreate: 'Criado com sucesso',
  gridEmpty: 'Dados não encontrado',
  validation: {
    minChar: (n: number) => `Mínimo de ${n} caracteres`,
    maxChar: (n: number) => `Máximo de ${n} caracteres`,
    isRequired: 'Esse campo é obrigatório',
    fullNameRequired: 'Nome e sobrenome são obrigatórios',
    nameInvalid: 'Nome inválido',
    emailInvalid: 'E-mail inválido',
    senhasIguais: 'As senhas precisam ser iguais',
    userCreated: 'Usuário cadastrado com sucesso',
  },
  pages: {
    btnAdd: 'Adicionar',
    save: 'Salvar',
    close: 'Fechar',
    home: {
      btnApply: 'Aplicar',
      formSetup: {
        title: 'Configuração',
      },
      form: {
        title: 'Adicionar item',
        billingCycle: 'Ciclo de faturamento',
        input: {
          name: 'Nome ou serviço',
          value: 'Valor',
          category: 'Categoria',
          valueBase: 'Valor base',
          init: 'Data de nício',
          end: 'Data de fechamento',
          dateIsBefore:
            'A data de encerramento não pode ser menor ou igual à data de início',
        },
      },
      mesgUpdate: (id: number) => `Usuário ${id} atualizado com sucesso`,
      mesgDelete: (id: number) => `Usuário ${id} removido com sucesso`,
    },
    category: {
      title: 'Categorias',
      search: 'Pesquisar',
      form: {
        title: 'Cadastro de categoria',
        input: {
          name: 'Nome',
        },
      },
      columns: {
        name: 'Nome',
        options: 'Opções',
      },
    },
    auth: {
      logout: {
        title: 'Redirecionando',
      },
      signin: 'Entrar',
      signup: 'Inscrever-se',
      register: 'Cadastrar',
      createAccount: 'Não tem uma conta? Inscreva-se',
      password: 'Senha',
      confirmeSenha: 'Confirme a Senha',
      name: 'Nome e sobrenome',
    },
    dashboard: {
      title: {
        perCategory: 'Por categoria',
        perUser: 'Por usuário',
        perWeek: 'Por semana',
      },
    },
  },
  drawerMenu: {
    home: 'Despesas',
    category: 'Categorias',
  },
  header: {
    title: 'Nimble Fast',
    logout: 'Sair',
  },
  errorsApi: {
    fieldRequired: (field: string) => `O campo "${field}" é obrigatório`,
    tokenNotfound: 'Token de sessão inválida',
    userAlreadyExists: 'Usuário já existe',
    invalidCredential: 'Email ou senha inválidos',
    itemAlreadyExists: 'O item já existe',
    itemVinculado: 'O item está vinculado a um registro',
  },
}
