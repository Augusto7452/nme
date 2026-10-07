import { FaixaEtaria, PerfilTipo, StatusMonitoramento } from '../types/monitoring';

export function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return Math.max(0, idade);
}

export function obterFaixaEtaria(idade: number): FaixaEtaria {
  if (idade < 25) return '18_24';
  if (idade < 35) return '25_34';
  if (idade < 50) return '35_49';
  if (idade < 65) return '50_64';
  return '65_MAIS';
}

export function rotuloFaixaEtaria(faixa: FaixaEtaria): string {
  switch (faixa) {
    case '18_24':
      return '18 a 24 anos';
    case '25_34':
      return '25 a 34 anos';
    case '35_49':
      return '35 a 49 anos';
    case '50_64':
      return '50 a 64 anos';
    case '65_MAIS':
      return '65 anos ou mais';
    default:
      return 'Não informado';
  }
}

export function formatarDataHora(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const data = new Date(isoString);
    if (isNaN(data.getTime())) return isoString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(data);
  } catch {
    return isoString;
  }
}

export function formatarData(dataString?: string): string {
  if (!dataString) return '—';
  try {
    // If format is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(data);
  } catch {
    return dataString;
  }
}

export function formatarCPF(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatarProcessoCNJ(processo: string): string {
  const limpo = processo.replace(/\D/g, '');
  if (limpo.length === 20) {
    // 0000000-00.0000.8.00.0000
    return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9, 13)}.${limpo.slice(13, 14)}.${limpo.slice(14, 16)}.${limpo.slice(16, 20)}`;
  }
  return processo;
}

export function rotuloPerfil(perfil: PerfilTipo): string {
  switch (perfil) {
    case 'MONITORADO_GERAL':
      return 'Monitorado Geral';
    case 'AGRESSOR':
      return 'Agressor (Maria da Penha)';
    case 'VITIMA_PROTEGIDA':
      return 'Vítima Protegida';
  }
}

export function rotuloStatus(status: StatusMonitoramento): string {
  switch (status) {
    case 'ATIVO':
      return 'Ativo no Sistema';
    case 'DESLIGADO':
      return 'Desligado / Concluído';
    case 'FORAGIDO':
      return 'Foragido / Evasão';
    case 'SUSPENSO':
      return 'Suspenso';
    case 'RECAPTURA_PENDENTE':
      return 'Recaptura Pendente';
  }
}

export const TIPOS_PENAIS_COMUNS = [
  'Art. 121 - Homicídio',
  'Art. 129, § 9º - Lesão Corporal (Violência Doméstica)',
  'Art. 147 - Ameaça (Violência Doméstica / Geral)',
  'Art. 155 - Furto',
  'Art. 157 - Roubo Qualificado / Simples',
  'Art. 33 - Tráfico Ilícito de Entorpecentes',
  'Art. 217-A - Estupro de Vulnerável',
  'Art. 24-A (Lei 11.340) - Descumprimento de Medida Protetiva',
  'Art. 16 (Lei 10.826) - Porte Ilegal de Arma de Fogo',
  'Art. 180 - Receptação',
  'Art. 288 - Associação Criminosa',
  'Medida Cautelar Diversa da Prisão (Art. 319 CPP)',
];
