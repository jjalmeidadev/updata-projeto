# Data Dictionary - Banco de Dados Equiem

**Data de criação:** 27 de março de 2026  
**Versão:** 1.0  
**Schema:** `equiem`  
**Banco:** PostgreSQL 13+

---

## Índice

1. [Tabelas de Configuração](#tabelas-de-configuração)
2. [Tabelas de Hierarquia & Espaço](#tabelas-de-hierarquia--espaço)
3. [Tabelas de Usuário & Autenticação](#tabelas-de-usuário--autenticação)
4. [Tabelas de Recurso](#tabelas-de-recurso)
5. [Tabelas de Booking](#tabelas-de-booking)
6. [Tabelas de Processamento (Onboarding)](#tabelas-de-processamento-onboarding)
7. [Tabelas de Jobs Assíncronos](#tabelas-de-jobs-assíncronos)
8. [ENUMS](#enums)
9. [Índices & Performance](#índices--performance)
10. [Estratégia de Versionamento](#estratégia-de-versionamento)

---

## Tabelas de Configuração

### `company`

Representa uma empresa cadastrada no sistema.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único da empresa |
| domain | VARCHAR(255) | ✘ | - | Domínio de email (ex: `empresa.com`) |
| name | VARCHAR(255) | ✘ | - | Nome da empresa |
| status | customer_status_enum | ✘ | 'ACTIVE' | Status da conta (`ACTIVE`, `INACTIVE`, `SUSPENDED`) |
| metadata | JSONB | ✔ | NULL | Metadados customizados |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- UNIQUE: `domain`
- FK: Nenhuma (tabela raiz)

**Índices:**
- `idx_company_domain` (para login por domínio)
- `idx_company_status` (para filtros de ativação)

**Exemplo:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "domain": "empresa.com",
  "name": "Empresa XYZ",
  "status": "ACTIVE",
  "metadata": { "phone": "+55 11 98765-4321", "industry": "Tech" },
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-27T15:30:00Z"
}
```

---

### `customer`

Cliente específico dentro de uma empresa (ex: filial, regional).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do cliente |
| company_id | UUID | ✘ | - | ID da empresa (FK) |
| name | VARCHAR(255) | ✘ | - | Nome do cliente |
| status | customer_status_enum | ✘ | 'ACTIVE' | Status (`ACTIVE`, `INACTIVE`) |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `company_id` → `company.id` (ON DELETE CASCADE)

**Índices:**
- `idx_customer_company_id` (para listar clientes por empresa)

---

### `role`

Tipo de permissão no sistema (ex: Admin, User, Manager).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do role |
| name | VARCHAR(100) | ✘ | - | Nome do role (ex: `ADMIN`, `USER`) |
| scope | role_scope_enum | ✘ | - | Escopo (`SYSTEM`, `CUSTOMER`, `SITE`) |
| permissions | JSONB | ✔ | NULL | Array de permissões (ex: `["read:user", "write:booking"]`) |

**Restrições:**
- PRIMARY KEY: `id`
- UNIQUE: `name`

---

### `group`

Agrupamento de usuários para fins organizacionais.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do grupo |
| name | VARCHAR(255) | ✘ | - | Nome do grupo (ex: `Equipe Comercial`) |
| company_id | UUID | ✘ | - | ID da empresa (FK) |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `company_id` → `company.id` (ON DELETE CASCADE)

---

### `interest`

Centro de interesse ou interesse do usuário (ex: esportes, networking).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do interesse |
| name | VARCHAR(100) | ✘ | - | Nome do interesse |

---

### `apartment`

Apartamento ou unidade (ex: sala de reunião, workspace).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| name | VARCHAR(100) | ✘ | - | Nome do imóvel |
| space_id | UUID | ✘ | - | ID do espaço onde está (FK) |
| capacity | INTEGER | ✔ | NULL | Capacidade de pessoas |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `space_id` → `space.id` (ON DELETE CASCADE)

---

## Tabelas de Hierarquia & Espaço

### `site`

Local físico (ex: conjunto de edifícios em um bairro).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do site |
| customer_id | UUID | ✘ | - | ID do cliente (FK) |
| name | VARCHAR(255) | ✘ | - | Nome do site |
| type | site_type_enum | ✘ | - | Tipo (`OFFICE`, `RESIDENTIAL`, `COMMERCIAL`) |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `customer_id` → `customer.id` (ON DELETE CASCADE)

**Índices:**
- `idx_site_customer_id` (para listar sites por cliente)

---

### `building`

Edifício dentro de um site.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do edifício |
| site_id | UUID | ✘ | - | ID do site (FK) |
| name | VARCHAR(100) | ✘ | - | Nome do edifício |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `site_id` → `site.id` (ON DELETE CASCADE)

---

### `space`

Espaço dentro de um edifício (ex: andar, departamento).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do espaço |
| building_id | UUID | ✘ | - | ID do edifício (FK) |
| name | VARCHAR(100) | ✘ | - | Nome do espaço |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `building_id` → `building.id` (ON DELETE CASCADE)

---

### `level`

Nível de hierarquia personalizado.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| space_id | UUID | ✘ | - | ID do espaço (FK) |
| name | VARCHAR(100) | ✘ | - | Nome do nível |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `space_id` → `space.id` (ON DELETE CASCADE)

---

## Tabelas de Usuário & Autenticação

### `user`

Usuário do sistema.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do usuário |
| auth0_id | VARCHAR(255) | ✔ | NULL | ID externo Auth0 para autenticação |
| email | VARCHAR(255) | ✘ | - | Email do usuário |
| name | VARCHAR(255) | ✘ | - | Nome completo |
| type | user_type_enum | ✘ | 'USER' | Tipo (`USER`, `ADMIN`, `SYSTEM`) |
| status | user_status_enum | ✘ | 'PENDING' | Status (`PENDING`, `ACTIVE`, `INACTIVE`) |
| company_id | UUID | ✔ | NULL | ID da empresa (FK, pode ser NULL para admins) |
| approval_status | user_approval_enum | ✘ | 'PENDING' | Aprovação (`PENDING`, `APPROVED`, `REJECTED`) |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- UNIQUE: `email`, `auth0_id`
- FK: `company_id` → `company.id` (ON DELETE SET NULL)

**Índices:**
- `idx_user_email` (para login)
- `idx_user_company_id` (para filtros por empresa)
- `idx_user_status` (para filtros de status)

---

### `site_profile`

Perfil de usuário específico por site (rôles e permissões locais).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| user_id | UUID | ✘ | - | ID do usuário (FK) |
| site_id | UUID | ✘ | - | ID do site (FK) |
| role_id | UUID | ✘ | - | ID do role (FK) |

**Restrições:**
- PRIMARY KEY: `id`
- UNIQUE: `(user_id, site_id)` (usuário tem um role por site)
- FK: `user_id` → `user.id` (ON DELETE CASCADE)
- FK: `site_id` → `site.id` (ON DELETE CASCADE)
- FK: `role_id` → `role.id` (ON DELETE CASCADE)

---

### `user_role`

Relação many-to-many: usuário pode ter múltiplos roles.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| user_id | UUID | ✘ | - | ID do usuário (FK) |
| role_id | UUID | ✘ | - | ID do role (FK) |

**Restrições:**
- PRIMARY KEY: `(user_id, role_id)`
- FK: `user_id` → `user.id` (ON DELETE CASCADE)
- FK: `role_id` → `role.id` (ON DELETE CASCADE)

---

## Tabelas de Recurso

### `bookable_resource`

Recurso que pode ser reservado (ex: sala de reunião, parking).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| site_id | UUID | ✘ | - | ID do site (FK) |
| name | VARCHAR(255) | ✘ | - | Nome do recurso |
| type | VARCHAR(100) | ✘ | - | Tipo (ex: `MEETING_ROOM`, `PARKING`) |
| capacity | INTEGER | ✔ | NULL | Capacidade (pessoas ou unidades) |
| status | resource_status_enum | ✘ | 'ACTIVE' | Status (`ACTIVE`, `INACTIVE`, `MAINTENANCE`) |
| metadata | JSONB | ✔ | NULL | Equipamentos, amenidades, etc. |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `site_id` → `site.id` (ON DELETE CASCADE)

**Índices:**
- `idx_resource_site_id` (para listar recursos por site)
- `idx_resource_status` (para filtros de disponibilidade)

---

## Tabelas de Booking

### `booking`

Reserva de um recurso por um usuário em um período.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único da reserva |
| user_id | UUID | ✘ | - | ID do usuário (FK) |
| resource_id | UUID | ✘ | - | ID do recurso (FK) |
| start_date | TIMESTAMP | ✘ | - | Início da reserva |
| end_date | TIMESTAMP | ✘ | - | Fim da reserva |
| status | booking_status_enum | ✘ | 'CONFIRMED' | Status (`PENDING`, `CONFIRMED`, `CANCELLED`) |
| notes | TEXT | ✔ | NULL | Observações adicionais |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `user_id` → `user.id` (ON DELETE CASCADE)
- FK: `resource_id` → `bookable_resource.id` (ON DELETE CASCADE)
- CHECK: `end_date > start_date`

**Índices:**
- `idx_booking_user_id` (para listar reservas do usuário)
- `idx_booking_resource_id` (para listar reservas do recurso)
- `idx_booking_status` (para filtros de status)
- `idx_booking_start_date` (para calendários)

---

## Tabelas de Processamento (Onboarding)

Estas tabelas gerenciam o pipeline de importação de usuários via CSV/XLSX.

### `onboarding_batch`

Lote de arquivo enviado para processamento.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único do lote |
| trace_id | VARCHAR(36) | ✘ | - | ID correlacional da requisição (para rastreamento) |
| company_id | UUID | ✘ | - | ID da empresa que enviou (FK) |
| source | VARCHAR(50) | ✘ | - | Origem (`COMMON`, `EQUIEM`) |
| file_name | VARCHAR(255) | ✘ | - | Nome original do arquivo |
| s3_key | VARCHAR(500) | ✘ | - | Caminho no S3 |
| status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) |
| total_rows | INTEGER | ✔ | NULL | Total de linhas lidas |
| valid_rows | INTEGER | ✔ | NULL | Linhas válidas após processamento |
| invalid_rows | INTEGER | ✔ | NULL | Linhas com erro |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |
| completed_at | TIMESTAMP | ✔ | NULL | Data de conclusão do processamento |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `company_id` → `company.id` (ON DELETE CASCADE)
- UNIQUE: `trace_id` (cada requisição tem um trace único)
- NOT NULL: `trace_id`, `company_id`, `source`, `file_name`, `s3_key`, `status`

**Índices:**
- `idx_onboarding_batch_trace_id` (para rastreamento)
- `idx_onboarding_batch_status` (para filtros de processamento)
- `idx_onboarding_batch_company_id` (para listar lotes por empresa)
- `idx_onboarding_batch_created_at` (para histórico)

**Exemplo:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "trace_id": "req-2026-03-27-001-abc123",
  "company_id": "550e8400-e29b-41d4-a716-446655440000",
  "source": "COMMON",
  "file_name": "usuarios_margo.csv",
  "s3_key": "uploads/2026/03/27/usuarios_margo.csv",
  "status": "PROCESSING",
  "total_rows": 150,
  "valid_rows": 145,
  "invalid_rows": 5,
  "created_at": "2026-03-27T10:00:00Z",
  "updated_at": "2026-03-27T10:05:30Z",
  "completed_at": null
}
```

---

### `onboarding_payload`

Linha individual do arquivo (um usuário a ser criado).

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| batch_id | UUID | ✘ | - | ID do lote (FK) |
| row_number | INTEGER | ✘ | - | Número da linha no arquivo original |
| entity_type | VARCHAR(50) | ✘ | - | Tipo (`USER`, `RESOURCE`, etc.) |
| raw_data | JSONB | ✘ | - | Dados brutos da linha (antes de mapear) |
| is_valid | BOOLEAN | ✘ | true | Linha passou validação |
| validation_errors | JSONB | ✔ | NULL | Array de erros encontrados |
| validation_severity | VARCHAR(20) | ✔ | NULL | `critical`, `minor`, `none` |
| validation_score | NUMERIC(5,2) | ✔ | 100 | Score de validação (0-100%) |
| processed | BOOLEAN | ✘ | false | Linha foi processada para DB |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE CASCADE)
- UNIQUE: `(batch_id, row_number)` (cada linha é única no lote)
- NOT NULL: `batch_id`, `row_number`, `entity_type`, `raw_data`

**Índices:**
- `idx_onboarding_payload_batch_id` (para listar payloads por lote)
- `idx_onboarding_payload_entity_type` (para filtros de tipo)
- `idx_onboarding_payload_is_valid` (para processados vs com erro)

**Exemplo com erro:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "batch_id": "660e8400-e29b-41d4-a716-446655440001",
  "row_number": 42,
  "entity_type": "USER",
  "raw_data": {
    "email": "joao@empresa.com",
    "name": "João Silva",
    "type": "USER",
    "company_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "is_valid": true,
  "validation_errors": [
    {
      "field": "email",
      "message": "Email em domínio não autorizado",
      "severity": "warning"
    }
  ],
  "validation_severity": "minor",
  "validation_score": 85.5,
  "processed": false,
  "created_at": "2026-03-27T10:00:15Z",
  "updated_at": "2026-03-27T10:00:15Z"
}
```

---

### `onboarding_mapping`

Mapeamento final entre dado importado e usuário criado.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| payload_id | UUID | ✘ | - | ID do payload (FK) |
| entity_type | VARCHAR(50) | ✘ | - | Tipo da entidade criada |
| internal_id | UUID | ✔ | NULL | ID interno gerado (ex: user.id) |
| external_id | VARCHAR(255) | ✔ | NULL | ID externo (ex: Equiem person_id) |
| mapping_status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `MAPPED`, `FAILED`) |
| error_message | TEXT | ✔ | NULL | Mensagem de erro se falhou |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `payload_id` → `onboarding_payload.id` (ON DELETE CASCADE)
- UNIQUE: `payload_id` (cada payload mapeia para 1 entidade)

**Índices:**
- `idx_onboarding_mapping_payload_id` (para listar mapeamentos)
- `idx_onboarding_mapping_internal_id` (para validar duplicatas)
- `idx_onboarding_mapping_entity_external` (para sincronização com Equiem)

---

## Tabelas de Jobs Assíncronos

Estas tabelas rastreiam processamento de lotes e chunks para SQS.

### `processing_job`

Job de processamento de um lote inteiro.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| batch_id | UUID | ✘ | - | ID do lote (FK) |
| job_type | VARCHAR(50) | ✘ | - | Tipo (`STAGE_1_UPLOAD`, `STAGE_2_CHUNK`) |
| status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`) |
| message_id | VARCHAR(255) | ✔ | NULL | ID da mensagem no SQS |
| error_message | TEXT | ✔ | NULL | Erro se falhou |
| retry_count | INTEGER | ✘ | 0 | Número de tentativas |
| max_retries | INTEGER | ✘ | 3 | Máximo de tentativas |
| started_at | TIMESTAMP | ✔ | NULL | Início do processamento |
| completed_at | TIMESTAMP | ✔ | NULL | Fim do processamento |
| created_at | TIMESTAMP | ✘ | NOW() | Data de criação |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE CASCADE)

**Índices:**
- `idx_processing_job_batch_id` (para listar jobs por lote)
- `idx_processing_job_status` (para filtros de status)

---

### `processing_chunk`

Chunk (fatia) de processamento dentro de um job Stage 2.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| batch_id | UUID | ✘ | - | ID do lote (FK) |
| chunk_index | INTEGER | ✘ | - | Índice do chunk (0, 1, 2, ...) |
| offset | INTEGER | ✘ | - | Posição inicial no payload |
| size | INTEGER | ✘ | - | Tamanho do chunk (quantidade de registros) |
| status | VARCHAR(50) | ✘ | 'PENDING' | Status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`) |
| retries | INTEGER | ✘ | 0 | Número de tentativas |
| error | TEXT | ✔ | NULL | Mensagem de erro |
| started_at | TIMESTAMP | ✔ | NULL | Início do processamento |
| finished_at | TIMESTAMP | ✔ | NULL | Fim do processamento |
| updated_at | TIMESTAMP | ✘ | NOW() | Data de última atualização |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE CASCADE)
- UNIQUE: `(batch_id, chunk_index)` (um chunk por índice por lote)

**Índices:**
- `idx_processing_chunk_batch_status` (para filtros por lote/status)
- `idx_processing_chunk_status` (para job scheduler)

**Exemplo:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "batch_id": "660e8400-e29b-41d4-a716-446655440001",
  "chunk_index": 0,
  "offset": 0,
  "size": 50,
  "status": "COMPLETED",
  "retries": 1,
  "error": null,
  "started_at": "2026-03-27T10:00:20Z",
  "finished_at": "2026-03-27T10:00:45Z",
  "updated_at": "2026-03-27T10:00:45Z"
}
```

---

### `processing_log`

Log detalhado de cada operação durante processamento.

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | ✘ | uuid_v4() | ID único |
| trace_id | VARCHAR(36) | ✘ | - | ID correlacional (de onboarding_batch) |
| batch_id | UUID | ✔ | NULL | ID do lote (FK) |
| level | VARCHAR(20) | ✘ | - | Nível (`DEBUG`, `INFO`, `WARN`, `ERROR`) |
| message | TEXT | ✘ | - | Mensagem de log |
| context | JSONB | ✔ | NULL | Contexto adicional (ex: valores testados) |
| created_at | TIMESTAMP | ✘ | NOW() | Data do log |

**Restrições:**
- PRIMARY KEY: `id`
- FK: `batch_id` → `onboarding_batch.id` (ON DELETE SET NULL)

**Índices:**
- `idx_processing_log_trace_id` (para auditar uma requisição)
- `idx_processing_log_batch_id` (para logs por lote)

**Exemplo:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "trace_id": "req-2026-03-27-001-abc123",
  "batch_id": "660e8400-e29b-41d4-a716-446655440001",
  "level": "WARN",
  "message": "Parser encontrou 5 linhas com erro. Retornando array vazio para fallback.",
  "context": {
    "fileName": "usuarios_margo.csv",
    "errorType": "MalformedCSV",
    "linhasComErro": [1, 3, 7]
  },
  "created_at": "2026-03-27T10:00:16Z"
}
```

---

## ENUMS

Tipos de dados enumerados no banco.

### `customer_status_enum`
```
'ACTIVE'    → Cliente está ativo
'INACTIVE'  → Cliente desativado
'SUSPENDED' → Cliente suspenso por falta de pagamento
```

### `site_type_enum`
```
'OFFICE'      → Escritório comercial
'RESIDENTIAL' → Residencial
'COMMERCIAL'  → Comercial misto
```

### `ownership_type_enum`
```
'OWNED'   → Propriedade própria
'LEASED'  → Imóvel alugado
'SHARED'  → Imóvel compartilhado
```

### `user_status_enum`
```
'PENDING'  → Aguardando aprovação
'ACTIVE'   → Usuário ativo no sistema
'INACTIVE' → Usuário desativado
```

### `user_type_enum`
```
'USER'   → Usuário comum
'ADMIN'  → Administrador
'SYSTEM' → Sistema/robô
```

### `booking_status_enum`
```
'PENDING'    → Aguardando confirmação
'CONFIRMED'  → Confirmada
'CANCELLED'  → Cancelada
```

### `resource_status_enum`
```
'ACTIVE'       → Recurso disponível
'INACTIVE'     → Recurso desativado
'MAINTENANCE'  → Em manutenção
```

### `user_approval_enum`
```
'PENDING'   → Aguardando aprovação
'APPROVED'  → Aprovado
'REJECTED'  → Rejeitado
```

### `role_scope_enum`
```
'SYSTEM'   → Válido em todo o sistema
'CUSTOMER' → Válido para um cliente
'SITE'     → Válido para um site específico
```

---

## Índices & Performance

### Índices de Busca Frequente

| Índice | Tabela | Coluna(s) | Caso de Uso |
|--------|--------|-----------|------------|
| `idx_company_domain` | company | domain | Login por domínio de email |
| `idx_user_email` | user | email | Busca de usuário por email |
| `idx_user_company_id` | user | company_id | Listar usuários da empresa |
| `idx_site_customer_id` | site | customer_id | Listar sites de um cliente |
| `idx_resource_site_id` | bookable_resource | site_id | Listar recursos de um site |
| `idx_resource_status` | bookable_resource | status | Filtrar recursos ativos |
| `idx_booking_user_id` | booking | user_id | Histórico de reservas do usuário |
| `idx_booking_resource_id` | booking | resource_id | Verificar disponibilidade |
| `idx_booking_start_date` | booking | start_date | Calendário de reservas |

### Índices de Processamento (Onboarding)

| Índice | Tabela | Coluna(s) | Propósito |
|--------|--------|-----------|-----------|
| `idx_onboarding_batch_trace_id` | onboarding_batch | trace_id | Rastreamento correlacional |
| `idx_onboarding_batch_status` | onboarding_batch | status | Job scheduler (achar PENDING) |
| `idx_onboarding_batch_created_at` | onboarding_batch | created_at | Histórico de uploads |
| `idx_onboarding_payload_batch_id` | onboarding_payload | batch_id | Listar payloads de um lote |
| `idx_onboarding_payload_is_valid` | onboarding_payload | is_valid | Retentativas (re-processar inválidos) |
| `idx_onboarding_mapping_internal_id` | onboarding_mapping | internal_id | Validar duplicatas |
| `idx_onboarding_mapping_entity_external` | onboarding_mapping | external_id | Sincronização com Equiem |
| `idx_processing_job_status` | processing_job | status | Worker polling |
| `idx_processing_chunk_batch_status` | processing_chunk | batch_id, status | Monitorar chunks em paralelo |
| `idx_processing_chunk_status` | processing_chunk | status | Encontrar chunks para processar |

### Dicas de Performance

1. **Sempre usar trace_id em queries** de auditoria para correlacionar fluxo completo
   ```sql
   SELECT * FROM equiem.processing_log WHERE trace_id = 'req-2026-03-27-001-abc123';
   ```

2. **Batching em processamento paralelo**
   ```sql
   SELECT * FROM equiem.processing_chunk 
   WHERE status = 'PENDING' AND batch_id = $1 
   ORDER BY chunk_index 
   LIMIT 3;
   ```

3. **Archive históricos antigos** (chunks completed há > 30 dias) para manter índices ágeis

4. **Monitor de tamanho de JSONB** em `onboarding_payload.raw_data` e `onboarding_payload.validation_errors` (pode crescer rapidamente em lotes grandes)

---

## Estratégia de Versionamento

### Script Naming Convention

```
01_create_database.sql    → Criação inicial do schema
02_initial_data.sql       → Dados de bootstrap (roles, grupos básicos)
03_rollback.sql           → Script de reversão (completo)
04_migration_V2.sql       → (Futuro) Mudanças na V2
...
```

### Changelog

Manter arquivo `database-modif.md` com histórico:

```markdown
## Sprint 3 (27 de março de 2026)

- ✅ Added: `processing_chunk` table para paralelização de chunks
- ✅ Added: 13 indices de performance
- ✅ Modified: `onboarding_batch` com NOT NULL constraints (source, status, trace_id, file_name, s3_key)
- ✅ Modified: `onboarding_payload` com UNIQUE(batch_id, row_number)
- ✅ Created: `03_rollback.sql` para reverter todas as mudanças

## Sprint 4 (Previsto)

- TODO: Arquivar chunks completados (partition strategy)
- TODO: Add column `company_id` a tabelas de análise para multi-tenancy
```

### Rollback Procedure

Em caso de erro em produção:
1. Backup do banco atual: `pg_dump -d equiem > backup-2026-03-27.sql`
2. Executar rollback: `psql -d equiem -f 03_rollback.sql`
3. Restaurar dados (se necessário): Recover de backup anterior
4. Comunicar cause root ao time

---

**Documento criado:** 27 de março de 2026  
**Próxima revisão:** Ao fim de cada Sprint  
**Responsável:** Tech Lead / Database Owner
