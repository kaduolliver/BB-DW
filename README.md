# BB Digital Week - Backend (API)

Bem-vindo ao repositório do **Backend** da plataforma **BB Digital Week**. Esta API RESTful foi desenvolvida para fornecer toda a lógica de negócios, autenticação e acesso a dados para a aplicação web de gerenciamento do evento.

## 🚀 Tecnologias e Stack

- **Linguagem**: Python 3
- **Framework Web**: Flask
- **Banco de Dados**: PostgreSQL
- **ORM**: SQLAlchemy / Flask-SQLAlchemy
- **Autenticação**: Flask-JWT-Extended (Tokens JWT)
- **Criptografia**: bcrypt
- **Infraestrutura**: Docker & Docker Compose

## 📁 Estrutura do Projeto (Backend)

O código da API encontra-se no diretório `server/`. A orquestração dos serviços é feita pelo Docker na raiz do projeto.

```text
BB-DW/
├── docker-compose.yml   # Orquestração do banco de dados, API e Client
├── server/
│   ├── app/             # Módulos, rotas e modelos da API Flask
│   ├── tests/           # Testes automatizados
│   ├── run.py           # Ponto de entrada da aplicação
│   ├── requirements.txt # Dependências do Python
│   └── Dockerfile       # Configuração do container da API
└── ...
```

## 🛠️ Como Executar com Docker (Recomendado)

A maneira mais simples de rodar a API e o banco de dados é utilizando o Docker Compose, que já configura o PostgreSQL e inicializa o servidor Flask.

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Passo a passo

1. **Clone o repositório e acesse a pasta:**
   ```bash
   git clone https://github.com/seu-usuario/bb-dw.git
   cd bb-dw
   ```

2. **Configure as variáveis de ambiente:**
   Acesse a pasta `server/` (ou a raiz se aplicável) e crie um arquivo `.env` usando o `.env.example` como base:
   ```bash
   cp server/.env.example server/.env
   ```

3. **Suba os containers:**
   Na raiz do projeto (`BB-DW/`), execute:
   ```bash
   docker-compose up -d --build
   ```
   
   Isso irá iniciar:
   - Um container com o **PostgreSQL** na porta `5432`
   - O servidor **Flask (API)** na porta configurada (geralmente `6000`)
   - O client (React) caso esteja configurado no Docker Compose

A API estará acessível em: `http://localhost:6000`

## 💻 Como Executar Localmente (Sem Docker)

Caso prefira rodar a API localmente sem o container (apenas usando o Docker para o banco de dados ou um banco local):

1. Suba apenas o banco de dados (na raiz do projeto):
   ```bash
   docker-compose up -d db
   ```
2. Acesse a pasta do servidor:
   ```bash
   cd server
   ```
3. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   ```
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
5. Execute a API:
   ```bash
   python run.py
   # ou
   flask run --port=6000
   ```

## 🔐 Autenticação

A API utiliza tokens JWT para proteger rotas sensíveis. O endpoint de login retorna um token que deve ser enviado no cabeçalho das requisições subsequentes:
`Authorization: Bearer <seu_token_jwt>`

## 📄 Licença
Projeto desenvolvido no contexto acadêmico/Residência Porto Digital para gerenciamento e organização do evento BB Digital Week.
