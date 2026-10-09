import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Shield, User, FileText, MapPin, Calendar, Clock, AlertCircle, Edit3 } from 'lucide-react';
import { IndividuoMonitorado, PerfilTipo, MotivoEntrada, StatusMonitoramento } from '../types/monitoring';
import { calcularIdade, obterFaixaEtaria, rotuloFaixaEtaria, TIPOS_PENAIS_COMUNS } from '../utils/ageUtils';

interface CadastrarIndividuoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (novoOuAtualizado: IndividuoMonitorado) => void;
  individuosExistentes: IndividuoMonitorado[];
  individuoParaEditar?: IndividuoMonitorado | null;
}

export const CadastrarIndividuoModal: React.FC<CadastrarIndividuoModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  individuosExistentes,
  individuoParaEditar,
}) => {
  const agora = new Date();
  const dataHojeStr = agora.toISOString().split('T')[0];
  const horaAgoraStr = agora.toTimeString().slice(0, 5);

  const isEdicao = !!individuoParaEditar;

  // Form State
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('1995-05-15');
  const [genero, setGenero] = useState<'MASCULINO' | 'FEMININO' | 'OUTRO'>('MASCULINO');
  const [perfil, setPerfil] = useState<PerfilTipo>('MONITORADO_GERAL');
  const [status, setStatus] = useState<StatusMonitoramento>('ATIVO');
  const [fotoUrl, setFotoUrl] = useState('');

  // Dados Jurídicos
  const [tipoPenalSelect, setTipoPenalSelect] = useState('Art. 129, § 9º - Lesão Corporal (Violência Doméstica)');
  const [tipoPenalCustom, setTipoPenalCustom] = useState('');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [varaJudicial, setVaraJudicial] = useState('Vara Criminal');
  const [comarca, setComarca] = useState('Comarca Central');
  const [resumoTipificacao, setResumoTipificacao] = useState('');

  // Equipamento
  const [numeroTornozeleira, setNumeroTornozeleira] = useState('');
  const [imeiDispositivo, setImeiDispositivo] = useState('');
  const [raioExclusao, setRaioExclusao] = useState(500);
  const [individuoVinculadoId, setIndividuoVinculadoId] = useState('');

  // Entrada Inicial (usado em novo cadastro)
  const [dataEntrada, setDataEntrada] = useState(dataHojeStr);
  const [horaEntrada, setHoraEntrada] = useState(horaAgoraStr);
  const [motivoEntrada, setMotivoEntrada] = useState<MotivoEntrada>('INSTALACAO_INICIAL');
  const [responsavelOperacional, setResponsavelOperacional] = useState('Agente Policial Penal');
  const [numeroOficio, setNumeroOficio] = useState('');

  // Endereço e Contatos
  const [enderecoResidencial, setEnderecoResidencial] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [observacoesGerais, setObservacoesGerais] = useState('');

  // Sincronizar quando abrir ou quando mudar individuoParaEditar
  useEffect(() => {
    if (individuoParaEditar) {
      setNomeCompleto(individuoParaEditar.nomeCompleto || '');
      setCpf(individuoParaEditar.cpf || '');
      setDataNascimento(individuoParaEditar.dataNascimento || '1995-05-15');
      setGenero(individuoParaEditar.genero || 'MASCULINO');
      setPerfil(individuoParaEditar.perfil || 'MONITORADO_GERAL');
      setStatus(individuoParaEditar.status || 'ATIVO');
      setFotoUrl(individuoParaEditar.fotoUrl || '');

      // Verificar se o tipo penal está na lista padrão
      if (TIPOS_PENAIS_COMUNS.includes(individuoParaEditar.tipoPenal)) {
        setTipoPenalSelect(individuoParaEditar.tipoPenal);
        setTipoPenalCustom('');
      } else {
        setTipoPenalSelect('OUTRO');
        setTipoPenalCustom(individuoParaEditar.tipoPenal || '');
      }

      setNumeroProcesso(individuoParaEditar.numeroProcesso || '');
      setVaraJudicial(individuoParaEditar.varaJudicial || 'Vara Criminal');
      setComarca(individuoParaEditar.comarca || 'Comarca Central');
      setResumoTipificacao(individuoParaEditar.resumoTipificacao || '');

      setNumeroTornozeleira(individuoParaEditar.numeroTornozeleiraOuReceptor || '');
      setImeiDispositivo(individuoParaEditar.imeiDispositivo || '');
      setRaioExclusao(individuoParaEditar.raioExclusaoMetros || 500);
      setIndividuoVinculadoId(individuoParaEditar.individuoVinculadoId || '');

      setEnderecoResidencial(individuoParaEditar.enderecoResidencial || '');
      setCidade(individuoParaEditar.cidade || '');
      setEstado(individuoParaEditar.estado || 'SP');
      setTelefoneContato(individuoParaEditar.telefoneContato || '');
      setObservacoesGerais(individuoParaEditar.observacoesGerais || '');
    } else {
      // Reset para novo cadastro
      setNomeCompleto('');
      setCpf('');
      setDataNascimento('1995-05-15');
      setGenero('MASCULINO');
      setPerfil('MONITORADO_GERAL');
      setStatus('ATIVO');
      setFotoUrl('');
      setTipoPenalSelect('Art. 129, § 9º - Lesão Corporal (Violência Doméstica)');
      setTipoPenalCustom('');
      setNumeroProcesso('');
      setVaraJudicial('Vara Criminal');
      setComarca('Comarca Central');
      setResumoTipificacao('');
      setNumeroTornozeleira('');
      setImeiDispositivo('');
      setRaioExclusao(500);
      setIndividuoVinculadoId('');
      setDataEntrada(dataHojeStr);
      setHoraEntrada(horaAgoraStr);
      setMotivoEntrada('INSTALACAO_INICIAL');
      setResponsavelOperacional('Agente Policial Penal');
      setNumeroOficio('');
      setEnderecoResidencial('');
      setCidade('');
      setEstado('SP');
      setTelefoneContato('');
      setObservacoesGerais('');
    }
  }, [individuoParaEditar, isOpen]);

  // Calculate age and age group dynamically
  const idadeCalculada = calcularIdade(dataNascimento);
  const faixaCalculada = obterFaixaEtaria(idadeCalculada);

  if (!isOpen) return null;

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsarFotoExemplo = (tipoFoto: 'masculino' | 'feminino') => {
    if (tipoFoto === 'masculino') {
      setFotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
    } else {
      setFotoUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto || !numeroProcesso) {
      alert('Por favor, preencha o Nome Completo e o Número do Processo.');
      return;
    }

    const tipoPenalFinal = tipoPenalSelect === 'OUTRO' ? tipoPenalCustom : tipoPenalSelect;

    let nomeVinculado = '';
    if (individuoVinculadoId) {
      const vinc = individuosExistentes.find((i) => i.id === individuoVinculadoId);
      if (vinc) nomeVinculado = vinc.nomeCompleto;
    }

    if (isEdicao && individuoParaEditar) {
      // Edição de cadastro existente
      const atualizado: IndividuoMonitorado = {
        ...individuoParaEditar,
        nomeCompleto,
        cpf: cpf || '000.000.000-00',
        dataNascimento,
        genero,
        perfil,
        status,
        fotoUrl: fotoUrl || individuoParaEditar.fotoUrl,
        numeroProcesso,
        varaJudicial: varaJudicial || 'Vara Criminal',
        comarca: comarca || 'Comarca Central',
        tipoPenal: tipoPenalFinal || 'Não especificado',
        resumoTipificacao,
        numeroTornozeleiraOuReceptor: numeroTornozeleira || individuoParaEditar.numeroTornozeleiraOuReceptor,
        imeiDispositivo,
        raioExclusaoMetros: perfil !== 'MONITORADO_GERAL' ? raioExclusao : undefined,
        individuoVinculadoId: individuoVinculadoId || undefined,
        nomeIndividuoVinculado: nomeVinculado || undefined,
        enderecoResidencial: enderecoResidencial || 'Endereço residencial cadastrado',
        cidade: cidade || 'São Paulo',
        estado,
        telefoneContato,
        observacoesGerais,
      };

      onSalvar(atualizado);
      onClose();
      return;
    }

    // Novo cadastro
    const dataHoraIso = new Date(`${dataEntrada}T${horaEntrada}:00`).toISOString();
    const novoId = `mon-${Date.now()}`;

    const novoIndividuo: IndividuoMonitorado = {
      id: novoId,
      nomeCompleto,
      cpf: cpf || '000.000.000-00',
      dataNascimento,
      genero,
      fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      perfil,
      status: 'ATIVO',
      numeroProcesso,
      varaJudicial: varaJudicial || 'Vara Criminal',
      comarca: comarca || 'Comarca Central',
      tipoPenal: tipoPenalFinal || 'Não especificado',
      resumoTipificacao,
      numeroTornozeleiraOuReceptor: numeroTornozeleira || (perfil === 'VITIMA_PROTEGIDA' ? 'RX-BOT-PENDENTE' : 'TX-PENDENTE'),
      imeiDispositivo: imeiDispositivo || '',
      raioExclusaoMetros: perfil !== 'MONITORADO_GERAL' ? raioExclusao : undefined,
      individuoVinculadoId: individuoVinculadoId || undefined,
      nomeIndividuoVinculado: nomeVinculado || undefined,
      dataPrimeiraEntrada: dataHoraIso,
      enderecoResidencial: enderecoResidencial || 'Endereço residencial cadastrado',
      cidade: cidade || 'São Paulo',
      estado,
      telefoneContato: telefoneContato || '',
      observacoesGerais,
      movimentacoes: [
        {
          id: `mov-${Date.now()}`,
          individuoId: novoId,
          tipo: 'ENTRADA',
          dataHora: dataHoraIso,
          motivo: motivoEntrada,
          motivoDetalhado: `Cadastro e acolhimento inicial no sistema de monitoramento eletrônico. Motivo: ${motivoEntrada}.`,
          responsavelOperacional: responsavelOperacional || 'Agente de Plantão',
          numeroOficioOuMandado: numeroOficio || 'MAND-INICIAL',
        },
      ],
      fugas: [],
    };

    onSalvar(novoIndividuo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[96vh] sm:max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isEdicao
                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                : 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
            }`}>
              {isEdicao ? <Edit3 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {isEdicao ? 'Editar Cadastro de Pessoa' : 'Novo Cadastro no Sistema'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {isEdicao
                  ? `Atualização cadastral de: ${individuoParaEditar?.nomeCompleto}`
                  : 'Registro de pessoa, tipo penal, processo, equipamento e entrada'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Seção 1: Foto e Identificação Civil */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              1. Identificação Pessoal & Fotografia do Monitorado
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              {/* Foto Slot */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="relative w-36 h-44 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 overflow-hidden flex flex-col items-center justify-center group mb-2">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt="Foto do Monitorado"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-3 text-slate-400">
                      <Camera className="w-8 h-8 mb-1 text-slate-500" />
                      <span className="text-[11px] font-medium">Foto Obrigatória</span>
                      <span className="text-[9px] text-slate-500">Padrão Penal / Frontal</span>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity text-xs font-medium gap-1">
                    <Upload className="w-5 h-5" />
                    <span>{fotoUrl ? 'Alterar Foto' : 'Carregar Foto'}</span>
                    <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUsarFotoExemplo('masculino')}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                  >
                    Exemplo Masc.
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => handleUsarFotoExemplo('feminino')}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                  >
                    Exemplo Fem.
                  </button>
                </div>
              </div>

              {/* Campos Civis */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Ex: Carlos Eduardo da Silva"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gênero</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro / Não binário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Data de Nascimento <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Cálculo Dinâmico de Faixa Etária */}
                <div className="flex flex-col justify-end">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Idade Atual:</span>
                      <span className="font-bold text-white font-mono">{idadeCalculada} anos</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Faixa Etária:</span>
                      <span className="font-semibold text-amber-400">{rotuloFaixaEtaria(faixaCalculada)}</span>
                    </div>
                  </div>
                </div>

                {/* Status (especialmente visível na edição) */}
                {isEdicao && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Status do Monitoramento no Sistema
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StatusMonitoramento)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold"
                    >
                      <option value="ATIVO">ATIVO (Em cumprimento normal de medida)</option>
                      <option value="FORAGIDO">FORAGIDO (Rompimento / Evasão confirmada)</option>
                      <option value="DESLIGADO">DESLIGADO (Extinção de pena ou revogação formal)</option>
                      <option value="SUSPENSO">SUSPENSO (Suspensão cautelar)</option>
                    </select>
                  </div>
                )}

                {/* Perfil no Sistema */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Classificação / Perfil de Monitoramento <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPerfil('MONITORADO_GERAL')}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        perfil === 'MONITORADO_GERAL'
                          ? 'bg-slate-800 border-amber-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">Monitorado Geral</div>
                      <div className="text-[10px] text-slate-400">Regime aberto / cautelares</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfil('AGRESSOR')}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        perfil === 'AGRESSOR'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-amber-300">Agressor (M. Penha)</div>
                      <div className="text-[10px] text-slate-400">Perímetro e raio de exclusão</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfil('VITIMA_PROTEGIDA')}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        perfil === 'VITIMA_PROTEGIDA'
                          ? 'bg-purple-950/40 border-purple-400 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-purple-300">Vítima Protegida</div>
                      <div className="text-[10px] text-slate-400">Botão do Pânico / Dispositivo</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Dados Jurídicos (Tipo Penal e Número do Processo) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              2. Dados Judiciais & Tipificação Penal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tipo Penal que está Respondendo <span className="text-red-400">*</span>
                </label>
                <select
                  value={tipoPenalSelect}
                  onChange={(e) => setTipoPenalSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {TIPOS_PENAIS_COMUNS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                  <option value="OUTRO">Outro / Especificar Manualmente</option>
                </select>

                {tipoPenalSelect === 'OUTRO' && (
                  <input
                    type="text"
                    required
                    value={tipoPenalCustom}
                    onChange={(e) => setTipoPenalCustom(e.target.value)}
                    placeholder="Digite o Artigo e a Descrição do Tipo Penal"
                    className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Número do Processo Judicial (CNJ) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(e.target.value)}
                  placeholder="0001234-56.2024.8.26.0100"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vara Judicial</label>
                <input
                  type="text"
                  value={varaJudicial}
                  onChange={(e) => setVaraJudicial(e.target.value)}
                  placeholder="Ex: 1ª Vara de Violência Doméstica"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Comarca / Foro</label>
                <input
                  type="text"
                  value={comarca}
                  onChange={(e) => setComarca(e.target.value)}
                  placeholder="Ex: Comarca Central"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Resumo das Circunstâncias</label>
                <input
                  type="text"
                  value={resumoTipificacao}
                  onChange={(e) => setResumoTipificacao(e.target.value)}
                  placeholder="Ex: Medida Cautelar com recolhimento noturno"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Equipamento e Dispositivo */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              3. Telemetria & Equipamento de Monitoramento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nº Série Tornozeleira / Receptor
                </label>
                <input
                  type="text"
                  value={numeroTornozeleira}
                  onChange={(e) => setNumeroTornozeleira(e.target.value)}
                  placeholder={perfil === 'VITIMA_PROTEGIDA' ? 'Ex: RX-BOT-5012' : 'Ex: TX-99120'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">IMEI do Equipamento</label>
                <input
                  type="text"
                  value={imeiDispositivo}
                  onChange={(e) => setImeiDispositivo(e.target.value)}
                  placeholder="Ex: 864291048291032"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {perfil !== 'MONITORADO_GERAL' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Raio de Exclusão (Metros)</label>
                  <input
                    type="number"
                    value={raioExclusao}
                    onChange={(e) => setRaioExclusao(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              ) : (
                <div className="flex items-center text-xs text-slate-500 pt-6">
                  Monitoramento padrão de área residencial.
                </div>
              )}

              {/* Vinculação de Par (Agressor ou Vítima) */}
              {perfil !== 'MONITORADO_GERAL' && (
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {perfil === 'AGRESSOR' ? 'Vincular à Vítima Protegida:' : 'Vincular ao Agressor:'}
                  </label>
                  <select
                    value={individuoVinculadoId}
                    onChange={(e) => setIndividuoVinculadoId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Nenhum vínculo selecionado (ou cadastrar depois)</option>
                    {individuosExistentes
                      .filter((ind) => (perfil === 'AGRESSOR' ? ind.perfil === 'VITIMA_PROTEGIDA' : ind.perfil === 'AGRESSOR'))
                      .map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.nomeCompleto} - Proc: {ind.numeroProcesso}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Seção 4: Se for NOVO CADASTRO, mostra dados da entrada inicial */}
          {!isEdicao && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                4. Registro Formal de Entrada Inicial
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data da Entrada</label>
                  <input
                    type="date"
                    required
                    value={dataEntrada}
                    onChange={(e) => setDataEntrada(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hora da Entrada</label>
                  <input
                    type="time"
                    required
                    value={horaEntrada}
                    onChange={(e) => setHoraEntrada(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Motivo da Entrada</label>
                  <select
                    value={motivoEntrada}
                    onChange={(e) => setMotivoEntrada(e.target.value as MotivoEntrada)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="INSTALACAO_INICIAL">Instalação Inicial</option>
                    <option value="MEDIDA_PROTETIVA_CONCEDIDA">Medida Protetiva Concedida</option>
                    <option value="RETORNO_RECAPTURA">Retorno por Recaptura</option>
                    <option value="TRANSFERENCIA_ENTRADA">Transferência de Entrada</option>
                    <option value="SUBSTITUICAO_EQUIPAMENTO">Substituição de Equipamento</option>
                    <option value="OUTRO">Outro Motivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Responsável Operacional</label>
                  <input
                    type="text"
                    value={responsavelOperacional}
                    onChange={(e) => setResponsavelOperacional(e.target.value)}
                    placeholder="Nome / Matrícula"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nº Mandado ou Ofício Judicial</label>
                  <input
                    type="text"
                    value={numeroOficio}
                    onChange={(e) => setNumeroOficio(e.target.value)}
                    placeholder="Ex: MAND-2024/091-VEC"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Endereço e Contato */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {isEdicao ? '4' : '5'}. Endereço Residencial Base & Contatos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={enderecoResidencial}
                  onChange={(e) => setEnderecoResidencial(e.target.value)}
                  placeholder="Rua, número, complemento e bairro"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Telefone de Contato</label>
                <input
                  type="text"
                  value={telefoneContato}
                  onChange={(e) => setTelefoneContato(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Observações Gerais / Restrições</label>
                <input
                  type="text"
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  placeholder="Horários de recolhimento, rotas autorizadas, etc."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 bg-slate-900/95 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
              isEdicao
                ? 'bg-blue-500 hover:bg-blue-400 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            {isEdicao ? <Edit3 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            <span>{isEdicao ? 'Salvar Alterações Cadastrais' : 'Salvar e Efetivar Entrada'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
