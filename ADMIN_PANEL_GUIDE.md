# 🛡️ Painel Admin - CallX

## 📋 Visão Geral

O Painel Admin é uma interface administrativa completa e segura para gerenciar usuários, tokens e monitorar o sistema CallX. Acesso restrito apenas a administradores autorizados.

## 🔐 Acesso

### URL
```
http://localhost:10000/admin
```

### Credenciais Autorizadas
Apenas os seguintes emails podem acessar o painel admin:
- `tavinmktdigital@gmail.com`
- `teste2@gmail.com`
- `teste90@gmail.com`

### Credenciais Padrão
```
Email: teste2@gmail.com
Senha: (senha definida no registro)

Email: teste90@gmail.com
Senha: Teste90!
```

## 🚀 Funcionalidades

### 1. **Dashboard Principal**
- **Estatísticas em Tempo Real:**
  - Total de usuários
  - Total de tokens no sistema
  - Total de reuniões criadas
- **Interface moderna e responsiva**
- **Atualização automática de dados**

### 2. **Gerenciamento de Usuários**

#### 📊 Listagem Completa
- Nome e avatar do usuário
- Email e ID único
- Status (Ativo/Banido/Admin)
- Quantidade de tokens
- Número de reuniões criadas
- Data de registro

#### 🔍 Filtros Avançados
- **Busca por texto:** Nome ou email
- **Filtro por status:** Ativos, Banidos, Administradores
- **Filtro por tokens:** Sem tokens, 1-10, 11-50, 51+

#### ⚙️ Ações por Usuário
- **Gerenciar Tokens:** Adicionar, remover ou definir quantidade
- **Banir/Desbanir:** Controlar acesso dos usuários
- **Excluir Conta:** Remoção permanente com limpeza de dados

### 3. **Gerenciamento de Tokens**

#### 💰 Operações Disponíveis
- **Adicionar Tokens:** Incrementar saldo
- **Remover Tokens:** Decrementar saldo (mínimo 0)
- **Definir Tokens:** Estabelecer quantidade específica

#### 📝 Interface Intuitiva
- Modal com informações do usuário
- Campo numérico para quantidade
- Botões de ação claros
- Confirmação visual

### 4. **Controle de Acesso**

#### 🚫 Sistema de Banimento
- **Banir usuário:** Impede acesso ao sistema
- **Desbanir usuário:** Restaura acesso
- **Proteção:** Administradores não podem ser banidos

#### 🗑️ Exclusão de Contas
- **Exclusão completa:** Usuário + todos os dados relacionados
- **Limpeza automática:** Reuniões, vídeos, dados financeiros
- **Confirmação obrigatória:** Modal de segurança

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5:** Estrutura semântica
- **CSS3:** Design moderno com Flexbox e Grid
- **JavaScript ES6+:** Funcionalidades interativas
- **Font Awesome:** Ícones profissionais

### Backend
- **Node.js:** Runtime JavaScript
- **Express.js:** Framework web
- **MongoDB:** Banco de dados
- **JWT:** Autenticação segura

### Segurança
- **Autenticação obrigatória**
- **Verificação de privilégios admin**
- **Validação de dados**
- **Sanitização de inputs**

## 📁 Estrutura de Arquivos

```
admin/
├── index.html          # Página principal
├── css/
│   └── admin.css       # Estilos do painel
└── js/
    └── admin.js        # Lógica JavaScript

routes/
└── admin.js            # Rotas da API admin

models/
└── User.js             # Modelo com campos admin
```

## 🔧 Configuração

### 1. **Criar Usuário Admin**
```bash
node create-admin-user.js
```

### 2. **Iniciar Servidor**
```bash
node server-render.js
```

### 3. **Acessar Painel**
```
http://localhost:10000/admin
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de administrador

### Usuários
- `GET /api/admin/users` - Listar todos os usuários
- `GET /api/admin/users/:id` - Detalhes de usuário específico
- `PUT /api/admin/:id/tokens` - Gerenciar tokens
- `PUT /api/admin/:id/ban` - Banir/desbanir usuário
- `DELETE /api/admin/:id` - Excluir usuário

### Estatísticas
- `GET /api/admin/stats` - Estatísticas gerais do sistema

## 🎨 Design System

### Cores
- **Primária:** `#4f46e5` (Indigo)
- **Sucesso:** `#10b981` (Green)
- **Perigo:** `#ef4444` (Red)
- **Aviso:** `#f59e0b` (Yellow)

### Componentes
- **Cards:** Bordas arredondadas, sombras suaves
- **Botões:** Estados hover, loading, disabled
- **Modais:** Backdrop blur, animações suaves
- **Tabelas:** Hover effects, responsivas

### Responsividade
- **Desktop:** Layout completo
- **Tablet:** Adaptação de colunas
- **Mobile:** Stack vertical, botões maiores

## 🔒 Segurança

### Autenticação
- JWT tokens com expiração
- Verificação de privilégios admin
- Logout automático

### Validação
- Sanitização de inputs
- Validação de tipos de dados
- Proteção contra SQL injection

### Autorização
- Middleware `requireAdmin`
- Verificação de emails autorizados
- Proteção de rotas sensíveis

## 📈 Monitoramento

### Logs
- Acesso ao painel
- Ações administrativas
- Erros e exceções

### Métricas
- Usuários ativos/banidos
- Distribuição de tokens
- Uso do sistema

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. **Acesso Negado**
- Verificar se o email está na lista de autorizados
- Confirmar se o usuário tem `isAdmin: true`
- Verificar se o token JWT é válido

#### 2. **Erro de Conexão**
- Verificar se o MongoDB está rodando
- Confirmar variáveis de ambiente
- Verificar logs do servidor

#### 3. **Interface Não Carrega**
- Verificar se os arquivos estáticos estão sendo servidos
- Confirmar rotas no servidor
- Verificar console do navegador

### Logs Úteis
```bash
# Verificar se o admin foi criado
node create-admin-user.js

# Testar API
curl http://localhost:10000/api/test

# Verificar logs do servidor
tail -f server-render.js
```

## 🔄 Atualizações

### Versão Atual
- **v1.0.0:** Painel admin completo
- **Data:** 15/08/2025
- **Funcionalidades:** Todas implementadas

### Próximas Versões
- [ ] Relatórios avançados
- [ ] Exportação de dados
- [ ] Notificações em tempo real
- [ ] Backup automático

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o painel admin:
- **Email:** tavinmktdigital@gmail.com
- **Documentação:** Este arquivo
- **Issues:** Repositório do projeto

---

**Desenvolvido por:** Otávio Henrique - Visionários Academy  
**Versão:** 1.0.0  
**Data:** 15/08/2025
