-- 1. Tabela de Usuários
CREATE TABLE usuarios (
    usuarioId INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senhaHash VARCHAR(255) NOT NULL,
    ativo BIT NOT NULL DEFAULT 1,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 2. Tabela Cadastral de Produtos
CREATE TABLE produtos (
    codigo VARCHAR(20) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    ativo BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NULL,
    createdBy INT NOT NULL,
    CONSTRAINT fkProdutosCreatedBy FOREIGN KEY (createdBy) REFERENCES usuarios(usuarioId)
);
GO

-- 3. Tabela Cadastral de Colaboradores
CREATE TABLE colaboradores (
    colaboradorId INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ativo BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NULL,
    createdBy INT NOT NULL,
    CONSTRAINT fkColaboradoresCreatedBy FOREIGN KEY (createdBy) REFERENCES usuarios(usuarioId)
);
GO

-- 4. Tabela de Empacotamentos
CREATE TABLE empacotamentos (
    empacotamentoId INT IDENTITY(1,1) PRIMARY KEY,
    data DATE NOT NULL,
    produtoCod VARCHAR(20) NOT NULL,
    colaboradorId INT NOT NULL,

    cx1 INT NOT NULL DEFAULT 0, cx1Tipo VARCHAR(50) NOT NULL,
    cx2 INT NOT NULL DEFAULT 0, cx2Tipo VARCHAR(50) NOT NULL,
    cx3 INT NOT NULL DEFAULT 0, cx3Tipo VARCHAR(50) NOT NULL,
    cx4 INT NOT NULL DEFAULT 0, cx4Tipo VARCHAR(50) NOT NULL,
    cx5 INT NOT NULL DEFAULT 0, cx5Tipo VARCHAR(50) NOT NULL,
    cx6 INT NOT NULL DEFAULT 0, cx6Tipo VARCHAR(50) NOT NULL,
    cx7 INT NOT NULL DEFAULT 0, cx7Tipo VARCHAR(50) NOT NULL,
    cx8 INT NOT NULL DEFAULT 0, cx8Tipo VARCHAR(50) NOT NULL,

    uni INT NOT NULL DEFAULT 0,
    totalKg DECIMAL(10,2) NULL,
    meta DECIMAL(10,2) NULL,

    horaInicio TIME NULL,
    horaFim TIME NULL,

    observacao VARCHAR(MAX) NULL,

    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NULL,
    createdBy INT NOT NULL,

    CONSTRAINT fkEmpacotamentosProduto FOREIGN KEY (produtoCod) REFERENCES produtos(codigo)
        ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT fkEmpacotamentosColaborador FOREIGN KEY (colaboradorId) REFERENCES colaboradores(colaboradorId)
        ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT fkEmpacotamentosCreatedBy FOREIGN KEY (createdBy) REFERENCES usuarios(usuarioId)
);
GO

-- Índices úteis para os filtros do relatório
CREATE INDEX ixEmpacotamentosData ON empacotamentos (data DESC);
CREATE INDEX ixEmpacotamentosColaborador ON empacotamentos (colaboradorId, data);
CREATE INDEX ixEmpacotamentosProduto ON empacotamentos (produtoCod, data);
GO
