const errorMap: Record<string, { status: number; message: string }> = {
  // Authentication Errors
  INVALID_CREDENTIALS: {
    status: 401,
    message: "Email ou senha inválidos.",
  },
  INVALID_TOKEN: {
    status: 401,
    message: "Token inválido ou expirado.",
  },
  TOKEN_EXPIRED: {
    status: 401,
    message: "Token expirado. Faça login novamente.",
  },
  INVALID_REFRESH_TOKEN: {
    status: 401,
    message: "Refresh token inválido ou expirado.",
  },
  UNAUTHORIZED: {
    status: 401,
    message: "Token de autenticação não fornecido.",
  },
  FORBIDDEN: {
    status: 403,
    message: "Acesso negado. Você não tem permissão para esta operação.",
  },

  // Authentication - Email/Password
  EMAIL_ALREADY_IN_USE: {
    status: 400,
    message: "Este email já está registrado.",
  },

  // User/Client Errors
  CLIENT_ALREADY_EXISTS: {
    status: 400,
    message: "Já existe um cliente com esse email.",
  },
  CLIENT_NOT_FOUND: {
    status: 404,
    message: "Cliente não encontrado.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "Usuário não encontrado.",
  },

  // Worker Errors
  WORKER_ALREADY_EXISTS: {
    status: 400,
    message: "Já existe um funcionário com esse email.",
  },
  WORKER_NOT_FOUND: {
    status: 404,
    message: "Funcionário não encontrado.",
  },
  WORKER_INACTIVE: {
    status: 403,
    message: "Funcionário inativo.",
  },
  ORDER_NOT_FOUND: {
    status: 404,
    message: "Pedido não encontrado.",
  },
  ORDER_ALREADY_CANCELLED: {
    status: 400,
    message: "O pedido já foi cancelado.",
  },
  INVALID_STATUS: {
    status: 400,
    message: "Status inválido.",
  },
  INVALID_STATUS_TRANSITION: {
    status: 400,
    message: "Transição de status inválida.",
  },
  PRODUCT_NOT_FOUND: {
    status: 404,
    message: "Produto não encontrado.",
  },
  PRODUCT_INACTIVE: {
    status: 400,
    message: "Produto inativo.",
  },

  // Profile Errors
  PROFILE_NOT_FOUND: {
    status: 404,
    message: "Perfil não encontrado.",
  },

  // Password Reset Errors
  INVALID_RESET_CODE: {
    status: 400,
    message: "Código de reset inválido.",
  },
  EXPIRED_CODE: {
    status: 400,
    message: "Código de reset expirado.",
  },
  CODE_ALREADY_USED: {
    status: 400,
    message: "Código de reset já utilizado.",
  },
  INVALID_CODE: {
    status: 400,
    message: "Código de reset inválido.",
  },
  EXPIRED_RESET_CODE: {
    status: 400,
    message: "Código de reset expirado.",
  },
  PASSWORD_MISMATCH: {
    status: 400,
    message: "As senhas não conferem.",
  },

  // Validation Errors
  INVALID_EMAIL: {
    status: 400,
    message: "Email inválido.",
  },
  INVALID_PASSWORD: {
    status: 400,
    message: "Senha deve ter no mínimo 6 caracteres.",
  },
  INVALID_PHONE: {
    status: 400,
    message: "Telefone inválido.",
  },
  INVALID_ROLE: {
    status: 400,
    message:
      "Função/papel inválido. Valores permitidos: barista, caixa, gerente, atendente",
  },
  INVALID_SALARY: {
    status: 400,
    message: "Salário deve ser um número positivo.",
  },
  INVALID_REQUEST: {
    status: 400,
    message: "Requisição inválida. Verifique os parâmetros enviados.",
  },
  INVALID_FILE_TYPE: {
    status: 400,
    message: "Arquivo inválido. Envie uma imagem.",
  },
  LIMIT_FILE_SIZE: {
    status: 400,
    message: "Arquivo muito grande. O limite é 5MB.",
  },
  MISSING_REQUIRED_FIELDS: {
    status: 400,
    message: "Campos obrigatórios não fornecidos.",
  },
  UPDATE_REQUIRES_FIELDS: {
    status: 400,
    message: "Pelo menos um campo deve ser fornecido para atualização.",
  },

  PASSWORD_RESET_CODE_EXPIRED: {
    status: 400,
    message: "Código de reset expirado.",
  },

  // Database/Configuration Errors
  NOT_FOUND: {
    status: 404,
    message: "Recurso não encontrado.",
  },
  INTERNAL_ERROR: {
    status: 500,
    message: "Erro interno do servidor. Tente novamente mais tarde.",
  },
  BAD_REQUEST: {
    status: 400,
    message: "Solicitação inválida.",
  },
  DATABASE_CONNECTION_ERROR: {
    status: 500,
    message: "Erro de configuração do banco de dados.",
  },
};

export default errorMap;
