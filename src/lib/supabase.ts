import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_CUSTOM_URL_KEY = 'dme_supabase_custom_url';
const STORAGE_CUSTOM_KEY_KEY = 'dme_supabase_custom_anon_key';

// Credenciais oficiais do projeto Supabase configurado
export const DEFAULT_SUPABASE_URL = 'https://nskjaoiqmedioycuffjo.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_nycdEXW0nBueKQDHGPFDHA_PIVvKsMJ';

export interface SupabaseConfigInfo {
  url: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'default' | 'none';
}

export interface TesteConexaoResult {
  sucesso: boolean;
  mensagem: string;
  precisaMigration?: boolean;
  detalhe?: any;
}

/**
 * Retorna as credenciais configuradas (priorizando variáveis de ambiente,
 * com fallback para chaves salvas localmente pelo operador ou credenciais padrão do projeto).
 */
export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'env' | 'custom' | 'default' | 'none' } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // 1. Verifica se as variáveis de ambiente foram configuradas e não são placeholders
  if (envUrl && envKey && !envUrl.includes('your-project-id') && !envKey.includes('your-anon-public-key')) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  // 2. Verifica se o operador inseriu chaves customizadas pela interface
  try {
    const customUrl = (localStorage.getItem(STORAGE_CUSTOM_URL_KEY) || '').trim();
    const customKey = (localStorage.getItem(STORAGE_CUSTOM_KEY_KEY) || '').trim();
    if (customUrl && customKey) {
      return { url: customUrl, anonKey: customKey, source: 'custom' };
    }
  } catch (e) {
    console.warn('Erro ao ler credenciais do localStorage:', e);
  }

  // 3. Credenciais padrão fornecidas para o projeto
  if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, source: 'default' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

let cachedClient: SupabaseClient | null = null;
let cachedCredentialsHash = '';

/**
 * Obtém ou instancia o cliente Supabase.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, source } = getSupabaseCredentials();

  if (source === 'none' || !url || !anonKey) {
    return null;
  }

  const hash = `${url}_${anonKey}`;
  if (cachedClient && cachedCredentialsHash === hash) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedCredentialsHash = hash;
    return cachedClient;
  } catch (error) {
    console.error('Erro ao inicializar cliente Supabase:', error);
    return null;
  }
}

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Obtém o cliente com privilégios administrativos para gestão de contas e auth do sistema.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const { url } = getSupabaseCredentials();
  const secKey = (import.meta.env.VITE_SUPABASE_SECRET_KEY || '').trim();
  if (!url || !secKey) return null;

  if (cachedAdminClient) return cachedAdminClient;

  try {
    cachedAdminClient = createClient(url, secKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return cachedAdminClient;
  } catch (error) {
    console.error('Erro ao inicializar cliente administrativo Supabase:', error);
    return null;
  }
}

/**
 * Salva credenciais customizadas informadas pelo operador
 */
export function saveCustomSupabaseCredentials(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_CUSTOM_KEY_KEY, anonKey.trim());
    cachedClient = null;
    cachedCredentialsHash = '';
  } catch (e) {
    console.error('Erro ao salvar credenciais customizadas:', e);
  }
}

/**
 * Remove credenciais customizadas
 */
export function clearCustomSupabaseCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    localStorage.removeItem(STORAGE_CUSTOM_KEY_KEY);
    cachedClient = null;
    cachedCredentialsHash = '';
  } catch (e) {
    console.error('Erro ao limpar credenciais customizadas:', e);
  }
}

/**
 * Testa a conexão em tempo real com o banco de dados Supabase
 */
export async function testarConexaoSupabase(): Promise<TesteConexaoResult> {
  const client = getSupabaseClient();
  const { url, source } = getSupabaseCredentials();

  if (!client || source === 'none' || !url) {
    return {
      sucesso: false,
      mensagem: 'Credenciais do Supabase não configuradas.',
    };
  }

  try {
    // 1. Testa a autenticação / disponibilidade da API do projeto
    try {
      const authRes = await client.auth.getSession();
      if (authRes.error && !authRes.error.message?.includes('Auth session missing')) {
        return {
          sucesso: false,
          mensagem: `Falha na autenticação do projeto Supabase: ${authRes.error.message}`,
          detalhe: authRes.error,
        };
      }
    } catch (authErr) {
      console.warn('Verificação de sessão gerou aviso:', authErr);
    }

    // 2. Consulta tabela de indivíduos para testar schema do banco
    const res = await client
      .from('individuos_monitorados')
      .select('id')
      .limit(1);

    if (res.error) {
      // Se a tabela ainda não foi criada no banco (PGRST205 / 42P01 / schema cache)
      if (
        res.error.code === 'PGRST205' ||
        res.error.code === '42P01' ||
        res.error.message?.toLowerCase().includes('schema cache') ||
        res.error.message?.toLowerCase().includes('does not exist')
      ) {
        return {
          sucesso: false,
          precisaMigration: true,
          mensagem: 'Projeto Supabase conectado com sucesso! As tabelas da DME ainda não foram criadas no banco de dados. Execute a Migration SQL no painel.',
          detalhe: res.error,
        };
      }

      return {
        sucesso: false,
        mensagem: `Erro na consulta ao Supabase: ${res.error.message} (Código: ${res.error.code})`,
        detalhe: res.error,
      };
    }

    // Tabela existe e respondeu
    const { count } = await client
      .from('individuos_monitorados')
      .select('id', { count: 'exact', head: true });

    return {
      sucesso: true,
      mensagem: `Conexão estabelecida com sucesso! (${count !== null && count !== undefined ? `${count} indivíduos no banco` : 'Banco acessível e sincronizado'})`,
    };
  } catch (err: any) {
    return {
      sucesso: false,
      mensagem: `Falha na requisição ao Supabase: ${err.message || String(err)}`,
      detalhe: err,
    };
  }
}
