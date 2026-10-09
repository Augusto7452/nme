import { getSupabaseClient } from '../lib/supabase';
import { IndividuoMonitorado, MovimentacaoRegistro, RegistroFuga } from '../types/monitoring';

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
