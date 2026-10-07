/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { MonitoradosListView } from './components/MonitoradosListView';
import { MovimentacoesView } from './components/MovimentacoesView';
import { VitimasAgressoresView } from './components/VitimasAgressoresView';
import { FugasView } from './components/FugasView';
import { DemographicsView } from './components/DemographicsView';
import { PromptGeneratorModal } from './components/PromptGeneratorModal';
import { CadastrarIndividuoModal } from './components/CadastrarIndividuoModal';
import { RegistrarMovimentacaoModal } from './components/RegistrarMovimentacaoModal';
import { RegistrarFugaModal } from './components/RegistrarFugaModal';
import { FichaIndividuoModal } from './components/FichaIndividuoModal';
import { AlertaFugaModal } from './components/AlertaFugaModal';
import { IndividuoMonitorado, TipoMovimentacao, RegistroFuga } from './types/monitoring';
import { DADOS_INICIAIS_MONITORADOS } from './data/mockData';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'cmep_monitoramento_dados_v1';

export default function App() {
  // Carregar dados salvos no LocalStorage ou usar mock inicial
  const [individuos, setIndividuos] = useState<IndividuoMonitorado[]>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
    }
    return DADOS_INICIAIS_MONITORADOS;
  });

  // Salvar no LocalStorage sempre que alterar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(individuos));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [individuos]);

  // Navegação de abas
  const [abaAtiva, setAbaAtiva] = useState<
    'todos' | 'movimentacoes' | 'vitimas_agressores' | 'fugas' | 'faixas_etarias' | 'prompt_mestre'
  >('todos');

  // Modais
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false);
  const [movimentacaoPreId, setMovimentacaoPreId] = useState<string | undefined>();
  const [isFugaOpen, setIsFugaOpen] = useState(false);
  const [fugaPreId, setFugaPreId] = useState<string | undefined>();
  const [individuoFicha, setIndividuoFicha] = useState<IndividuoMonitorado | null>(null);
  const [alertaFugaIndividuo, setAlertaFugaIndividuo] = useState<IndividuoMonitorado | null>(null);
  const [alertaFugaRegistro, setAlertaFugaRegistro] = useState<RegistroFuga | null>(null);

  // Contagem de foragidos ativos para a badge no header
  const foragidosAtivosCount = individuos.filter((i) => i.status === 'FORAGIDO').length;

  // Ações de persistência
  const handleSalvarNovoIndividuo = (novo: IndividuoMonitorado) => {
    setIndividuos((prev) => [novo, ...prev]);
  };

  const handleSalvarMovimentacao = (
    individuoId: string,
    tipo: TipoMovimentacao,
    dados: {
      dataHora: string;
      motivo: any;
      motivoDetalhado: string;
      responsavelOperacional: string;
      numeroOficioOuMandado?: string;
      observacoes?: string;
    }
  ) => {
    setIndividuos((prev) =>
      prev.map((ind) => {
        if (ind.id !== individuoId) return ind;

        const novaMov = {
          id: `mov-${Date.now()}`,
          individuoId,
          tipo,
          ...dados,
        };

        let novoStatus = ind.status;
        let ultimaSaida = ind.dataUltimaSaida;

        if (tipo === 'SAIDA') {
          ultimaSaida = dados.dataHora;
          if (dados.motivo === 'FUGA_ROMPIMENTO') {
            novoStatus = 'FORAGIDO';
          } else {
            novoStatus = 'DESLIGADO';
          }
        } else if (tipo === 'ENTRADA') {
          novoStatus = 'ATIVO';
        }

        return {
          ...ind,
          status: novoStatus,
          dataUltimaSaida: ultimaSaida,
          movimentacoes: [novaMov, ...ind.movimentacoes],
        };
      })
    );
  };

  const handleSalvarFuga = (fugaData: {
    individuoId: string;
    dataHoraFuga: string;
    localFuga: string;
    coordenadasAproximadas?: string;
    circunstancias: string;
    mandadoPrisaoNumero?: string;
    orgaosComunicados: string[];
    observacoes?: string;
  }) => {
    const novaFuga: RegistroFuga = {
      id: `fuga-${Date.now()}`,
      individuoId: fugaData.individuoId,
      dataHoraFuga: fugaData.dataHoraFuga,
      localFuga: fugaData.localFuga,
      coordenadasAproximadas: fugaData.coordenadasAproximadas,
      circunstancias: fugaData.circunstancias,
      statusFuga: 'FORAGIDO',
      mandadoPrisaoNumero: fugaData.mandadoPrisaoNumero,
      orgaoComunicado: fugaData.orgaosComunicados,
      observacoes: fugaData.observacoes,
    };

    const movSaida = {
      id: `mov-${Date.now()}`,
      individuoId: fugaData.individuoId,
      tipo: 'SAIDA' as TipoMovimentacao,
      dataHora: fugaData.dataHoraFuga,
      motivo: 'FUGA_ROMPIMENTO' as const,
      motivoDetalhado: `Evasão registrada. Local: ${fugaData.localFuga}. Circunstâncias: ${fugaData.circunstancias}`,
      responsavelOperacional: 'Central de Operações Telemetria CMEP',
      numeroOficioOuMandado: fugaData.mandadoPrisaoNumero,
    };

    let individuoAtualizado: IndividuoMonitorado | null = null;

    setIndividuos((prev) =>
      prev.map((ind) => {
        if (ind.id !== fugaData.individuoId) return ind;
        const atual = {
          ...ind,
          status: 'FORAGIDO' as const,
          dataUltimaSaida: fugaData.dataHoraFuga,
          fugas: [novaFuga, ...ind.fugas],
          movimentacoes: [movSaida, ...ind.movimentacoes],
        };
        individuoAtualizado = atual;
        return atual;
      })
    );

    // Abrir imediatamente o Alerta de Fuga para impressão ou difusão
    if (individuoAtualizado) {
      setAlertaFugaIndividuo(individuoAtualizado);
      setAlertaFugaRegistro(novaFuga);
    }
  };

  const handleMarcarRecapturado = (individuoId: string, fugaId: string) => {
    const agoraIso = new Date().toISOString();

    setIndividuos((prev) =>
      prev.map((ind) => {
        if (ind.id !== individuoId) return ind;

        const fugasAtualizadas = ind.fugas.map((f) =>
          f.id === fugaId
            ? { ...f, statusFuga: 'RECAPTURADO' as const, dataRecaptura: agoraIso }
            : f
        );

        const movRetorno = {
          id: `mov-${Date.now()}`,
          individuoId,
          tipo: 'ENTRADA' as TipoMovimentacao,
          dataHora: agoraIso,
          motivo: 'RETORNO_RECAPTURA' as const,
          motivoDetalhado: 'Retorno ao sistema após cumprimento de mandado de recaptura.',
          responsavelOperacional: 'Equipe de Plantão CMEP',
        };

        return {
          ...ind,
          status: 'ATIVO' as const,
          fugas: fugasAtualizadas,
          movimentacoes: [movRetorno, ...ind.movimentacoes],
        };
      })
    );
  };

  const handleResetDados = () => {
    if (confirm('Deseja restaurar os dados de exemplo padrão do sistema?')) {
      setIndividuos(DADOS_INICIAIS_MONITORADOS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header com 3 Zonas Institucionais */}
      <Header
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        onNovoCadastro={() => setIsCadastroOpen(true)}
        onNovaMovimentacao={() => {
          setMovimentacaoPreId(undefined);
          setIsMovimentacaoOpen(true);
        }}
        onNovaFuga={() => {
          setFugaPreId(undefined);
          setIsFugaOpen(true);
        }}
        fugasAtivasCount={foragidosAtivosCount}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Painel de Indicadores Executivos no topo (exibido nas abas principais) */}
        {abaAtiva !== 'prompt_mestre' && (
          <DashboardStats individuos={individuos} />
        )}

        {/* Abas */}
        {abaAtiva === 'todos' && (
          <MonitoradosListView
            individuos={individuos}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
            onRegistrarMovimentacao={(id) => {
              setMovimentacaoPreId(id);
              setIsMovimentacaoOpen(true);
            }}
            onRegistrarFuga={(id) => {
              setFugaPreId(id);
              setIsFugaOpen(true);
            }}
            onVerAlertaFuga={(ind) => {
              setAlertaFugaIndividuo(ind);
              setAlertaFugaRegistro(ind.fugas[0] || null);
            }}
            onNovoCadastro={() => setIsCadastroOpen(true)}
          />
        )}

        {abaAtiva === 'movimentacoes' && (
          <MovimentacoesView
            individuos={individuos}
            onNovaMovimentacao={() => {
              setMovimentacaoPreId(undefined);
              setIsMovimentacaoOpen(true);
            }}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
          />
        )}

        {abaAtiva === 'vitimas_agressores' && (
          <VitimasAgressoresView
            individuos={individuos}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
            onNovoCadastro={() => setIsCadastroOpen(true)}
            onNovaMovimentacao={(id) => {
              setMovimentacaoPreId(id);
              setIsMovimentacaoOpen(true);
            }}
          />
        )}

        {abaAtiva === 'fugas' && (
          <FugasView
            individuos={individuos}
            onNovaFuga={() => {
              setFugaPreId(undefined);
              setIsFugaOpen(true);
            }}
            onVerAlertaFuga={(ind, fuga) => {
              setAlertaFugaIndividuo(ind);
              setAlertaFugaRegistro(fuga);
            }}
            onMarcarRecapturado={handleMarcarRecapturado}
          />
        )}

        {abaAtiva === 'faixas_etarias' && (
          <DemographicsView
            individuos={individuos}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
          />
        )}

        {abaAtiva === 'prompt_mestre' && (
          <PromptGeneratorModal inline />
        )}
      </main>

      {/* Footer simples e institucional */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2">
          <span>CMEP · Central de Monitoramento Eletrônico de Pessoas</span>
          <span>·</span>
          <span>Resolução CNJ nº 412/2021 & Lei 11.340/2006</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDados}
            title="Restaurar dados de demonstração originais"
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar Amostras</span>
          </button>
        </div>
      </footer>

      {/* Modais Globais */}
      <CadastrarIndividuoModal
        isOpen={isCadastroOpen}
        onClose={() => setIsCadastroOpen(false)}
        onSalvar={handleSalvarNovoIndividuo}
        individuosExistentes={individuos}
      />

      <RegistrarMovimentacaoModal
        isOpen={isMovimentacaoOpen}
        onClose={() => setIsMovimentacaoOpen(false)}
        individuos={individuos}
        individuoPreSelecionadoId={movimentacaoPreId}
        onSalvarMovimentacao={handleSalvarMovimentacao}
      />

      <RegistrarFugaModal
        isOpen={isFugaOpen}
        onClose={() => setIsFugaOpen(false)}
        individuos={individuos}
        individuoPreSelecionadoId={fugaPreId}
        onSalvarFuga={handleSalvarFuga}
      />

      <FichaIndividuoModal
        isOpen={!!individuoFicha}
        onClose={() => setIndividuoFicha(null)}
        individuo={individuoFicha}
        onRegistrarMovimentacao={(id) => {
          setIndividuoFicha(null);
          setMovimentacaoPreId(id);
          setIsMovimentacaoOpen(true);
        }}
        onRegistrarFuga={(id) => {
          setIndividuoFicha(null);
          setFugaPreId(id);
          setIsFugaOpen(true);
        }}
        onVerAlertaFuga={(ind) => {
          setIndividuoFicha(null);
          setAlertaFugaIndividuo(ind);
          setAlertaFugaRegistro(ind.fugas[0] || null);
        }}
      />

      <AlertaFugaModal
        isOpen={!!alertaFugaIndividuo}
        onClose={() => {
          setAlertaFugaIndividuo(null);
          setAlertaFugaRegistro(null);
        }}
        individuo={alertaFugaIndividuo}
        fuga={alertaFugaRegistro}
        onMarcarRecapturado={handleMarcarRecapturado}
      />
    </div>
  );
}
