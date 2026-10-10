import { getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase';
import { IndividuoMonitorado, MovimentacaoRegistro, RegistroFuga, UsuarioOperador } from '../types/monitoring';

// Interface do banco de dados (snake_case)
interface IndividuoDB {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  genero: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  foto_url?: string;
  perfil: 'MONITORADO_GERAL' | 'AGRESSOR' | 'VITIMA_PROTEGIDA';
  status: 'ATIVO' | 'DESLIGADO' | 'FORAGIDO' | 'SUSPENSO' | 'RECAPTURA_PENDENTE';
  numero_processo: string;
  vara_judicial: string;
  comarca: string;
  tipo_penal: string;
  resumo_tipificacao?: string;
  numero_tornozeleira_ou_receptor?: string;
  imei_dispositivo?: string;
  raio_exclusao_metros?: number;
  individuo_vinculado_id?: string;
  nome_individuo_vinculado?: string;
  data_primeira_entrada: string;
  data_ultima_saida?: string;
  endereco_residencial?: string;
  cidade: string;
  estado: string;
  telefone_contato?: string;
  contato_emergencia?: string;
  observacoes_gerais?: string;
}

interface MovimentacaoDB {
  id: string;
  individuo_id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  data_hora: string;
  motivo: string;
  motivo_detalhado: string;
  responsavel_operacional: string;
  numero_oficio_ou_mandado?: string;
  observacoes?: string;
}

interface FugaDB {
  id: string;
  individuo_id: string;
  data_hora_fuga: string;
  local_fuga: string;
  coordenadas_aproximadas?: string;
  circunstancias: string;
  status_fuga: 'FORAGIDO' | 'RECAPTURADO' | 'EM_DILIGENCIA';
  data_recaptura?: string;
  mandado_prisao_numero?: string;
  orgao_comunicado?: string[];
  observacoes?: string;
}

/**
 * Converte registro do banco Supabase para o formato da aplicação
 */
function converterParaApp(
  indDb: IndividuoDB,
  movsDb: MovimentacaoDB[],
  fugasDb: FugaDB[]
): IndividuoMonitorado {
  return {
    id: indDb.id,
    nomeCompleto: indDb.nome_completo,
    cpf: indDb.cpf,
    dataNascimento: indDb.data_nascimento,
    genero: indDb.genero,
    fotoUrl: indDb.foto_url || '',
    perfil: indDb.perfil,
    status: indDb.status,
    numeroProcesso: indDb.numero_processo,
    varaJudicial: indDb.vara_judicial,
    comarca: indDb.comarca,
    tipoPenal: indDb.tipo_penal,
    resumoTipificacao: indDb.resumo_tipificacao || undefined,
    numeroTornozeleiraOuReceptor: indDb.numero_tornozeleira_ou_receptor || undefined,
    imeiDispositivo: indDb.imei_dispositivo || undefined,
    raioExclusaoMetros: indDb.raio_exclusao_metros ?? undefined,
    individuoVinculadoId: indDb.individuo_vinculado_id || undefined,
    nomeIndividuoVinculado: indDb.nome_individuo_vinculado || undefined,
    dataPrimeiraEntrada: indDb.data_primeira_entrada,
    dataUltimaSaida: indDb.data_ultima_saida || undefined,
    enderecoResidencial: indDb.endereco_residencial || '',
    cidade: indDb.cidade || 'São Paulo',
    estado: indDb.estado || 'SP',
    telefoneContato: indDb.telefone_contato || '',
    contatoEmergencia: indDb.contato_emergencia || undefined,
    observacoesGerais: indDb.observacoes_gerais || undefined,
    movimentacoes: movsDb.map((m) => ({
      id: m.id,
      individuoId: m.individuo_id,
      tipo: m.tipo,
      dataHora: m.data_hora,
      motivo: m.motivo as any,
      motivoDetalhado: m.motivo_detalhado,
      responsavelOperacional: m.responsavel_operacional,
      numeroOficioOuMandado: m.numero_oficio_ou_mandado || undefined,
      observacoes: m.observacoes || undefined,
    })),
    fugas: fugasDb.map((f) => ({
      id: f.id,
      individuoId: f.individuo_id,
      dataHoraFuga: f.data_hora_fuga,
      localFuga: f.local_fuga,
      coordenadasAproximadas: f.coordenadas_aproximadas || undefined,
      circunstancias: f.circunstancias,
      statusFuga: f.status_fuga,
      dataRecaptura: f.data_recaptura || undefined,
      mandadoPrisaoNumero: f.mandado_prisao_numero || undefined,
      orgaoComunicado: f.orgao_comunicado || [],
      observacoes: f.observacoes || undefined,
    })),
  };
}

/**
 * Converte registro do app para o formato snake_case do banco de dados
 */
function converterParaDB(ind: IndividuoMonitorado): IndividuoDB {
  return {
    id: ind.id,
    nome_completo: ind.nomeCompleto,
    cpf: ind.cpf,
    data_nascimento: ind.dataNascimento,
    genero: ind.genero,
    foto_url: ind.fotoUrl,
    perfil: ind.perfil,
    status: ind.status,
    numero_processo: ind.numeroProcesso,
    vara_judicial: ind.varaJudicial,
    comarca: ind.comarca,
    tipo_penal: ind.tipoPenal,
    resumo_tipificacao: ind.resumoTipificacao,
    numero_tornozeleira_ou_receptor: ind.numeroTornozeleiraOuReceptor,
    imei_dispositivo: ind.imeiDispositivo,
    raio_exclusao_metros: ind.raioExclusaoMetros,
    individuo_vinculado_id: ind.individuoVinculadoId || undefined,
    nome_individuo_vinculado: ind.nomeIndividuoVinculado,
    data_primeira_entrada: ind.dataPrimeiraEntrada,
    data_ultima_saida: ind.dataUltimaSaida,
    endereco_residencial: ind.enderecoResidencial,
    cidade: ind.cidade,
    estado: ind.estado,
    telefone_contato: ind.telefoneContato,
    contato_emergencia: ind.contatoEmergencia,
    observacoes_gerais: ind.observacoesGerais,
  };
}

/**
 * Carrega a lista completa de indivíduos monitorados do Supabase
 */
export async function carregarIndividuosDoSupabase(): Promise<{
  sucesso: boolean;
  dados?: IndividuoMonitorado[];
  erro?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { sucesso: false, erro: 'Supabase não configurado' };
  }

  try {
    const [indRes, movRes, fugasRes] = await Promise.all([
      client.from('individuos_monitorados').select('*').order('data_primeira_entrada', { ascending: false }),
      client.from('movimentacoes').select('*').order('data_hora', { ascending: false }),
      client.from('fugas').select('*').order('data_hora_fuga', { ascending: false }),
    ]);

    if (indRes.error) {
      return { sucesso: false, erro: indRes.error.message };
    }

    const indRows: IndividuoDB[] = indRes.data || [];
    const movRows: MovimentacaoDB[] = movRes.data || [];
    const fugaRows: FugaDB[] = fugasRes.data || [];

    const resultado: IndividuoMonitorado[] = indRows.map((ind) => {
      const movs = movRows.filter((m) => m.individuo_id === ind.id);
      const fugas = fugaRows.filter((f) => f.individuo_id === ind.id);
      return converterParaApp(ind, movs, fugas);
    });

    return { sucesso: true, dados: resultado };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Cria ou atualiza um indivíduo monitorado no Supabase
 */
export async function salvarIndividuoNoSupabase(individuo: IndividuoMonitorado): Promise<{ sucesso: boolean; erro?: string }> {
  const client = getSupabaseClient();
  if (!client) return { sucesso: false, erro: 'Supabase não configurado' };

  try {
    const payload = converterParaDB(individuo);
    const { error } = await client.from('individuos_monitorados').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao salvar indivíduo no Supabase:', error);
      return { sucesso: false, erro: error.message };
    }
    return { sucesso: true };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Exclui um indivíduo no Supabase (cascata nas movimentações e fugas)
 */
export async function excluirIndividuoNoSupabase(individuoId: string): Promise<{ sucesso: boolean; erro?: string }> {
  const client = getSupabaseClient();
  if (!client) return { sucesso: false, erro: 'Supabase não configurado' };

  try {
    const { error } = await client.from('individuos_monitorados').delete().eq('id', individuoId);
    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Salva um novo registro de movimentação no Supabase
 */
export async function salvarMovimentacaoNoSupabase(mov: MovimentacaoRegistro): Promise<{ sucesso: boolean; erro?: string }> {
  const client = getSupabaseClient();
  if (!client) return { sucesso: false, erro: 'Supabase não configurado' };

  try {
    const payload: MovimentacaoDB = {
      id: mov.id,
      individuo_id: mov.individuoId,
      tipo: mov.tipo,
      data_hora: mov.dataHora,
      motivo: mov.motivo,
      motivo_detalhado: mov.motivoDetalhado,
      responsavel_operacional: mov.responsavelOperacional,
      numero_oficio_ou_mandado: mov.numeroOficioOuMandado,
      observacoes: mov.observacoes,
    };

    const { error } = await client.from('movimentacoes').upsert(payload, { onConflict: 'id' });
    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Salva ou atualiza um registro de fuga no Supabase
 */
export async function salvarFugaNoSupabase(fuga: RegistroFuga): Promise<{ sucesso: boolean; erro?: string }> {
  const client = getSupabaseClient();
  if (!client) return { sucesso: false, erro: 'Supabase não configurado' };

  try {
    const payload: FugaDB = {
      id: fuga.id,
      individuo_id: fuga.individuoId,
      data_hora_fuga: fuga.dataHoraFuga,
      local_fuga: fuga.localFuga,
      coordenadas_aproximadas: fuga.coordenadasAproximadas,
      circunstancias: fuga.circunstancias,
      status_fuga: fuga.statusFuga,
      data_recaptura: fuga.dataRecaptura,
      mandado_prisao_numero: fuga.mandadoPrisaoNumero,
      orgao_comunicado: fuga.orgaoComunicado,
      observacoes: fuga.observacoes,
    };

    const { error } = await client.from('fugas').upsert(payload, { onConflict: 'id' });
    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Envia todos os dados locais para o Supabase (Sincronização em Massa / Carga Inicial)
 */
export async function exportarTudoParaSupabase(individuos: IndividuoMonitorado[]): Promise<{
  sucesso: boolean;
  totalIndividuos: number;
  totalMovimentacoes: number;
  totalFugas: number;
  erro?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { sucesso: false, totalIndividuos: 0, totalMovimentacoes: 0, totalFugas: 0, erro: 'Supabase não configurado' };

  try {
    // 1. Inserir ou atualizar indivíduos
    const indPayloads = individuos.map(converterParaDB);
    const { error: indErr } = await client.from('individuos_monitorados').upsert(indPayloads, { onConflict: 'id' });
    if (indErr) throw indErr;

    // 2. Inserir movimentações
    const todasMovs: MovimentacaoDB[] = [];
    individuos.forEach((ind) => {
      ind.movimentacoes.forEach((m) => {
        todasMovs.push({
          id: m.id,
          individuo_id: ind.id,
          tipo: m.tipo,
          data_hora: m.dataHora,
          motivo: m.motivo,
          motivo_detalhado: m.motivoDetalhado,
          responsavel_operacional: m.responsavelOperacional,
          numero_oficio_ou_mandado: m.numeroOficioOuMandado,
          observacoes: m.observacoes,
        });
      });
    });

    if (todasMovs.length > 0) {
      const { error: movErr } = await client.from('movimentacoes').upsert(todasMovs, { onConflict: 'id' });
      if (movErr) throw movErr;
    }

    // 3. Inserir fugas
    const todasFugas: FugaDB[] = [];
    individuos.forEach((ind) => {
      ind.fugas.forEach((f) => {
        todasFugas.push({
          id: f.id,
          individuo_id: ind.id,
          data_hora_fuga: f.dataHoraFuga,
          local_fuga: f.localFuga,
          coordenadas_aproximadas: f.coordenadasAproximadas,
          circunstancias: f.circunstancias,
          status_fuga: f.statusFuga,
          data_recaptura: f.dataRecaptura,
          mandado_prisao_numero: f.mandadoPrisaoNumero,
          orgao_comunicado: f.orgaoComunicado,
          observacoes: f.observacoes,
        });
      });
    });

    if (todasFugas.length > 0) {
      const { error: fugasErr } = await client.from('fugas').upsert(todasFugas, { onConflict: 'id' });
      if (fugasErr) throw fugasErr;
    }

    return {
      sucesso: true,
      totalIndividuos: indPayloads.length,
      totalMovimentacoes: todasMovs.length,
      totalFugas: todasFugas.length,
    };
  } catch (err: any) {
    return {
      sucesso: false,
      totalIndividuos: 0,
      totalMovimentacoes: 0,
      totalFugas: 0,
      erro: err.message || String(err),
    };
  }
}

export interface UsuarioOperadorDB {
  id: string;
  nome: string;
  matricula: string;
  cargo: string;
  perfil_acesso: 'ADMIN' | 'SUPERVISOR' | 'OPERADOR_PLANTAO' | 'AGENTE_CAMPO';
  lotacao: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Busca a lista de operadores cadastrados no banco Supabase
 */
export async function buscarOperadoresDoSupabase(): Promise<{
  sucesso: boolean;
  operadores?: UsuarioOperador[];
  erro?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { sucesso: false, erro: 'Supabase não configurado' };

  try {
    const { data, error } = await client
      .from('usuarios_operadores')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      return { sucesso: false, erro: error.message };
    }

    const operadores: UsuarioOperador[] = (data || []).map((row: UsuarioOperadorDB) => ({
      id: row.id,
      nome: row.nome,
      matricula: row.matricula,
      cargo: row.cargo,
      perfilAcesso: row.perfil_acesso,
      lotacao: row.lotacao,
      email: row.email,
      horarioLogin: '',
    }));

    return { sucesso: true, operadores };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Autentica um operador utilizando sua senha individual registrada no Supabase.
 * Sem senha padrão: valida a senha exclusiva do operador contra o Supabase Auth.
 */
export async function autenticarOperadorNoSupabase(
  identificador: string,
  senha?: string,
  lotacaoInformada?: string
): Promise<{
  sucesso: boolean;
  usuario?: UsuarioOperador;
  mensagem: string;
  latenciaMs?: number;
}> {
  const inicio = performance.now();
  const client = getSupabaseClient();
  const adminClient = getSupabaseAdminClient();

  if (!client) {
    return {
      sucesso: false,
      mensagem: 'Sistema Supabase não configurado ou desconectado.',
    };
  }

  const termo = identificador.trim();
  const pass = (senha || '').trim();

  if (!termo) {
    return {
      sucesso: false,
      mensagem: 'Informe sua matrícula institucional ou e-mail de acesso.',
    };
  }

  if (!pass) {
    return {
      sucesso: false,
      mensagem: 'Informe sua senha individual de segurança.',
    };
  }

  try {
    // 1. Identificar o e-mail cadastrado
    let targetEmail = termo.toLowerCase();
    let opData: UsuarioOperadorDB | null = null;

    if (!termo.includes('@')) {
      // Buscar pelo campo matrícula na tabela usuarios_operadores
      const { data } = await client
        .from('usuarios_operadores')
        .select('*')
        .ilike('matricula', termo)
        .maybeSingle();

      if (data) {
        opData = data as UsuarioOperadorDB;
        targetEmail = data.email?.trim().toLowerCase() || `${termo.toLowerCase()}@dme.seguranca.gov.br`;
      } else {
        targetEmail = `${termo.toLowerCase()}@dme.seguranca.gov.br`;
      }
    } else {
      const { data } = await client
        .from('usuarios_operadores')
        .select('*')
        .ilike('email', targetEmail)
        .maybeSingle();
      if (data) {
        opData = data as UsuarioOperadorDB;
      }
    }

    // 2. Autenticação criptográfica no Supabase Auth
    let authRes = await client.auth.signInWithPassword({
      email: targetEmail,
      password: pass,
    });

    // Se o erro for de email não confirmado, auto-confirmar pelo admin
    if (authRes.error && authRes.error.message.toLowerCase().includes('email not confirmed') && adminClient) {
      try {
        const { data: listU } = await adminClient.auth.admin.listUsers();
        const found = listU?.users?.find((u) => u.email?.toLowerCase() === targetEmail);
        if (found) {
          await adminClient.auth.admin.updateUserById(found.id, { email_confirm: true });
          authRes = await client.auth.signInWithPassword({
            email: targetEmail,
            password: pass,
          });
        }
      } catch (e) {
        console.warn('Erro ao auto-confirmar:', e);
      }
    }

    const latenciaMs = Math.round(performance.now() - inicio);

    if (authRes.error) {
      // Se não autenticou no Auth, verificar se existe na tabela usuarios_operadores sem senha definida no Auth
      if (opData) {
        return {
          sucesso: false,
          mensagem: 'Senha incorreta para esta credencial. Caso tenha esquecido ou ainda não tenha cadastrado sua senha individual, utilize a aba "Cadastrar Novo Operador".',
          latenciaMs,
        };
      }

      return {
        sucesso: false,
        mensagem: 'Credenciais inválidas. Verifique os dados digitados ou realize seu cadastro.',
        latenciaMs,
      };
    }

    if (!authRes.data?.user) {
      return {
        sucesso: false,
        mensagem: 'Não foi possível validar o usuário.',
        latenciaMs,
      };
    }

    // 3. Montar perfil do operador autenticado
    const meta = authRes.data.user.user_metadata || {};
    const usuarioLogado: UsuarioOperador = {
      id: opData?.id || authRes.data.user.id,
      nome: opData?.nome || meta.nome || 'Operador DME',
      matricula: opData?.matricula || meta.matricula || termo.toUpperCase(),
      cargo: opData?.cargo || meta.cargo || 'Policial Penal / Operador',
      perfilAcesso: (opData?.perfil_acesso as any) || meta.perfil_acesso || 'OPERADOR_PLANTAO',
      lotacao: lotacaoInformada || opData?.lotacao || meta.lotacao || 'Central de Monitoramento DME 24h',
      email: opData?.email || authRes.data.user.email,
      horarioLogin: new Date().toISOString(),
    };

    return {
      sucesso: true,
      usuario: usuarioLogado,
      mensagem: `Autenticado com sucesso! Bem-vindo(a), ${usuarioLogado.nome}.`,
      latenciaMs,
    };
  } catch (err: any) {
    return {
      sucesso: false,
      mensagem: `Falha na autenticação: ${err.message || String(err)}`,
      latenciaMs: Math.round(performance.now() - inicio),
    };
  }
}

/**
 * Cadastra um novo operador diretamente no banco de dados e no Supabase Auth com sua senha individual.
 * Sem senha padrão: a senha definida pelo usuário é gravada com segurança no banco.
 */
export async function cadastrarOperadorNoSupabase(operador: {
  nome: string;
  matricula: string;
  cargo: string;
  perfilAcesso: 'ADMIN' | 'SUPERVISOR' | 'OPERADOR_PLANTAO' | 'AGENTE_CAMPO';
  lotacao: string;
  email: string;
  senha: string;
}): Promise<{ sucesso: boolean; operador?: UsuarioOperador; erro?: string }> {
  const client = getSupabaseClient();
  const adminClient = getSupabaseAdminClient();
  if (!client) return { sucesso: false, erro: 'Supabase não configurado ou desconectado.' };

  const nome = operador.nome.trim();
  const matricula = operador.matricula.trim().toUpperCase();
  const email = operador.email.trim().toLowerCase();
  const cargo = operador.cargo.trim();
  const perfilAcesso = operador.perfilAcesso;
  const lotacao = operador.lotacao.trim();
  const senha = operador.senha.trim();

  if (!nome || !matricula || !email || !senha) {
    return { sucesso: false, erro: 'Nome, matrícula, e-mail e senha individual são obrigatórios.' };
  }

  if (senha.length < 6) {
    return { sucesso: false, erro: 'A senha de segurança deve conter no mínimo 6 caracteres.' };
  }

  try {
    // 1. Gravar/Atualizar credencial individual no Supabase Auth
    if (adminClient) {
      const { data: listU } = await adminClient.auth.admin.listUsers();
      const existingUser = listU?.users?.find((u) => u.email?.toLowerCase() === email);

      if (existingUser) {
        const { error: updErr } = await adminClient.auth.admin.updateUserById(existingUser.id, {
          password: senha,
          email_confirm: true,
          user_metadata: { nome, matricula, cargo, perfil_acesso: perfilAcesso, lotacao },
        });
        if (updErr) {
          return { sucesso: false, erro: `Falha ao atualizar credencial no banco: ${updErr.message}` };
        }
      } else {
        const { error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password: senha,
          email_confirm: true,
          user_metadata: { nome, matricula, cargo, perfil_acesso: perfilAcesso, lotacao },
        });
        if (createErr) {
          return { sucesso: false, erro: `Falha ao registrar autenticação no banco: ${createErr.message}` };
        }
      }
    } else {
      const { error: signErr } = await client.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome, matricula, cargo, perfil_acesso: perfilAcesso, lotacao },
        },
      });
      if (signErr) {
        return { sucesso: false, erro: signErr.message };
      }
    }

    // 2. Gravar/Atualizar perfil na tabela usuarios_operadores
    const { data: existingRow } = await client
      .from('usuarios_operadores')
      .select('id')
      .or(`matricula.ilike.${matricula},email.ilike.${email}`)
      .maybeSingle();

    const recordId = existingRow?.id || `usr-${Date.now().toString().slice(-6)}`;

    const payload: Partial<UsuarioOperadorDB> = {
      id: recordId,
      nome,
      matricula,
      cargo,
      perfil_acesso: perfilAcesso,
      lotacao,
      email,
      updated_at: new Date().toISOString(),
    };

    if (existingRow) {
      const { error: errUpd } = await client.from('usuarios_operadores').update(payload).eq('id', existingRow.id);
      if (errUpd) return { sucesso: false, erro: errUpd.message };
    } else {
      const { error: errIns } = await client.from('usuarios_operadores').insert(payload);
      if (errIns) return { sucesso: false, erro: errIns.message };
    }

    const novoOp: UsuarioOperador = {
      id: recordId,
      nome,
      matricula,
      cargo,
      perfilAcesso,
      lotacao,
      email,
      horarioLogin: new Date().toISOString(),
    };

    return { sucesso: true, operador: novoOp };
  } catch (err: any) {
    return { sucesso: false, erro: err.message || String(err) };
  }
}

/**
 * Diagnóstico completo do banco Supabase para a tela de login
 */
export async function testarDiagnosticoCompletoSupabase(): Promise<{
  conectado: boolean;
  latenciaMs: number;
  url: string;
  tabelas: {
    usuarios_operadores: { status: 'ok' | 'erro'; total: number; mensagem?: string };
    individuos_monitorados: { status: 'ok' | 'erro'; total: number; mensagem?: string };
    movimentacoes: { status: 'ok' | 'erro'; total: number; mensagem?: string };
    fugas: { status: 'ok' | 'erro'; total: number; mensagem?: string };
  };
  operadoresAmostra: UsuarioOperador[];
  mensagemGeral: string;
}> {
  const { url } = getSupabaseClient() ? { url: 'https://nskjaoiqmedioycuffjo.supabase.co' } : { url: '' };
  const client = getSupabaseClient();

  const padraoResultado = {
    conectado: false,
    latenciaMs: 0,
    url: url || 'Não configurado',
    tabelas: {
      usuarios_operadores: { status: 'erro' as const, total: 0, mensagem: 'Não consultado' },
      individuos_monitorados: { status: 'erro' as const, total: 0, mensagem: 'Não consultado' },
      movimentacoes: { status: 'erro' as const, total: 0, mensagem: 'Não consultado' },
      fugas: { status: 'erro' as const, total: 0, mensagem: 'Não consultado' },
    },
    operadoresAmostra: [] as UsuarioOperador[],
    mensagemGeral: 'Cliente Supabase não inicializado',
  };

  if (!client) return padraoResultado;

  const t0 = performance.now();

  try {
    const [opsRes, indRes, movRes, fugasRes] = await Promise.all([
      client.from('usuarios_operadores').select('*'),
      client.from('individuos_monitorados').select('id', { count: 'exact', head: true }),
      client.from('movimentacoes').select('id', { count: 'exact', head: true }),
      client.from('fugas').select('id', { count: 'exact', head: true }),
    ]);

    const latenciaMs = Math.round(performance.now() - t0);

    const amostraOperadores: UsuarioOperador[] = (opsRes.data || []).map((row: any) => ({
      id: row.id,
      nome: row.nome,
      matricula: row.matricula,
      cargo: row.cargo,
      perfilAcesso: row.perfil_acesso,
      lotacao: row.lotacao,
      email: row.email,
      horarioLogin: '',
    }));

    const todasTabelasOk = !opsRes.error && !indRes.error && !movRes.error && !fugasRes.error;

    return {
      conectado: true,
      latenciaMs,
      url,
      tabelas: {
        usuarios_operadores: {
          status: opsRes.error ? 'erro' : 'ok',
          total: opsRes.data?.length ?? 0,
          mensagem: opsRes.error?.message,
        },
        individuos_monitorados: {
          status: indRes.error ? 'erro' : 'ok',
          total: indRes.count ?? 0,
          mensagem: indRes.error?.message,
        },
        movimentacoes: {
          status: movRes.error ? 'erro' : 'ok',
          total: movRes.count ?? 0,
          mensagem: movRes.error?.message,
        },
        fugas: {
          status: fugasRes.error ? 'erro' : 'ok',
          total: fugasRes.count ?? 0,
          mensagem: fugasRes.error?.message,
        },
      },
      operadoresAmostra: amostraOperadores,
      mensagemGeral: todasTabelasOk
        ? `Banco de dados 100% operacional! Respondendo em ${latenciaMs}ms com todas as 4 tabelas ativas.`
        : 'Conexão com Supabase ativa, mas algumas tabelas reportaram alertas.',
    };
  } catch (e: any) {
    return {
      ...padraoResultado,
      latenciaMs: Math.round(performance.now() - t0),
      mensagemGeral: `Erro ao consultar o banco de dados: ${e.message || String(e)}`,
    };
  }
}

