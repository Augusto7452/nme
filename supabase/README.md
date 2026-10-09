# Instruções de Migrações e Integração com Supabase
### DME · Divisão de Monitoramento Eletrônico

Este diretório contém os scripts SQL e arquivos de configuração para implantação do banco de dados relacional oficial no **Supabase**.

---

## 📁 Arquivos de Migração

1. **`migrations/20251008000001_initial_dme_schema.sql`**
   - Criação das tabelas centrais:
     - `individuos_monitorados` (Apenados, agressores e vítimas)
     - `movimentacoes` (Histórico de entradas e saídas de tornozeleiras)
     - `fugas` (Ocorrências de evasão, rompimento e diligências de recaptura)
     - `usuarios_operadores` (Inspetores, policiais penais e analistas)
     - `auditoria_logs` (Registro de conformidade e auditoria)
   - Índices de busca por CPF, status, perfil e processo.
   - Triggers automáticos para o campo `updated_at`.
   - Políticas de **Row Level Security (RLS)** habilitadas para leitura e escrita autenticada / operacional.

2. **`migrations/20251008000002_seed_initial_data.sql`**
   - Popula os registros de teste e operadores padrão da DME.

---

## 🚀 Como Aplicar as Migrações no Supabase

### Opção 1: Diretamente pelo Painel Web do Supabase (Mais Rápido)
1. Acesse o seu projeto em [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. No menu lateral esquerdo, clique em **SQL Editor** (ícone de terminal `>_`).
3. Clique em **+ New query**.
4. Copie o conteúdo de `migrations/20251008000001_initial_dme_schema.sql` e cole no editor.
5. Clique no botão **Run** (ou pressione `Ctrl + Enter`).
6. Em seguida, cole e execute o arquivo `migrations/20251008000002_seed_initial_data.sql`.

### Opção 2: Pelo Supabase CLI (Linha de Comando)
Se você já possui o Supabase CLI instalado:
```bash
# Vincular o projeto ao seu repositório remoto
supabase link --project-ref seu-project-id

# Aplicar todas as migrações locais no banco remoto
supabase db push
```

---

## 🔑 Variáveis de Ambiente no Aplicativo

No seu arquivo `.env` (ou no painel de segredos do ambiente), defina:

```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-publica-anon"
```

A aplicação detecta automaticamente as chaves e sincroniza em tempo real! Se as variáveis não estiverem configuradas, o sistema mantém operação em cache local com a opção de conectar a qualquer momento através do botão **Supabase** no cabeçalho do sistema.
