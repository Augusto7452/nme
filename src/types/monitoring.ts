export type PerfilTipo = 'MONITORADO_GERAL' | 'AGRESSOR' | 'VITIMA_PROTEGIDA';

export type StatusMonitoramento = 
  | 'ATIVO' 
  | 'DESLIGADO' 
  | 'FORAGIDO' 
  | 'SUSPENSO' 
  | 'RECAPTURA_PENDENTE';

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export type MotivoEntrada = 
  | 'INSTALACAO_INICIAL'
  | 'MEDIDA_PROTETIVA_CONCEDIDA'
  | 'RETORNO_RECAPTURA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'SUBSTITUICAO_EQUIPAMENTO'
  | 'OUTRO';

export type MotivoSaida = 
  | 'EXTINCAO_PENA'
  | 'REVOGACAO_MEDIDA'
  | 'FUGA_ROMPIMENTO'
  | 'TRANSFERENCIA_SAIDA'
  | 'RECOLHIMENTO_FECHADO'
  | 'DESLIGAMENTO_VOLUNTARIO_VITIMA'
  | 'OBITO'
  | 'OUTRO';

export type FaixaEtaria = '18_24' | '25_34' | '35_49' | '50_64' | '65_MAIS';

export interface MovimentacaoRegistro {
  id: string;
  individuoId: string;
  tipo: TipoMovimentacao;
  dataHora: string; // ISO string
  motivo: MotivoEntrada | MotivoSaida;
  motivoDetalhado: string;
  responsavelOperacional: string;
  numeroOficioOuMandado?: string;
  observacoes?: string;
}

export interface RegistroFuga {
  id: string;
  individuoId: string;
  dataHoraFuga: string; // ISO string
  localFuga: string; // Endereço, bairro, ponto de referência
  coordenadasAproximadas?: string;
  circunstancias: string; // Ex: Rompimento de cinta, perda deliberada de sinal, fuga de domicílio
  statusFuga: 'FORAGIDO' | 'RECAPTURADO' | 'EM_DILIGENCIA';
  dataRecaptura?: string;
  mandadoPrisaoNumero?: string;
  orgaoComunicado: string[]; // Ex: PM, Polícia Civil, DEIC, Vara de Execuções Penais
  observacoes?: string;
}

export interface IndividuoMonitorado {
  id: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string; // YYYY-MM-DD
  genero: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  fotoUrl: string; // base64 or URL
  perfil: PerfilTipo;
  status: StatusMonitoramento;
  
  // Dados Jurídicos
  numeroProcesso: string;
  varaJudicial: string;
  comarca: string;
  tipoPenal: string; // Ex: Art. 121 (Homicídio), Art. 129 § 9º (Violência Doméstica), Art. 33 (Tráfico)
  resumoTipificacao?: string;

  // Equipamento / Monitoramento
  numeroTornozeleiraOuReceptor?: string;
  imeiDispositivo?: string;
  raioExclusaoMetros?: number; // Para agressores (ex: 500m)
  individuoVinculadoId?: string; // Se for agressor vinculado a vítima, ou vítima vinculada ao agressor
  nomeIndividuoVinculado?: string;

  // Datas Principais
  dataPrimeiraEntrada: string; // ISO string
  dataUltimaSaida?: string; // ISO string se aplicável
  
  // Movimentações e Fugas
  movimentacoes: MovimentacaoRegistro[];
  fugas: RegistroFuga[];

  // Informações Adicionais
  enderecoResidencial: string;
  cidade: string;
  estado: string;
  telefoneContato: string;
  contatoEmergencia?: string;
  observacoesGerais?: string;
}

export interface FiltrosMonitoramento {
  termoBusca: string;
  perfil: 'TODOS' | PerfilTipo;
  status: 'TODOS' | StatusMonitoramento;
  faixaEtaria: 'TODOS' | FaixaEtaria;
  tipoPenal: string;
  dataInicio?: string;
  dataFim?: string;
}
