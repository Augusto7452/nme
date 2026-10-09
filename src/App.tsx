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
import { IndividuoMonitorado, TipoMovimentacao, RegistroFuga, MovimentacaoRegistro, UsuarioOperador } from './types/monitoring';
import { DADOS_INICIAIS_MONITORADOS } from './data/mockData';
import { gerarRelatorioPDF } from './utils/pdfGenerator';
import { RotateCcw, FileText } from 'lucide-react';
import { LoginView } from './components/LoginView';
import { SupabaseModal } from './components/SupabaseModal';
import {
  carregarIndividuosDoSupabase,
  salvarIndividuoNoSupabase,
  excluirIndividuoNoSupabase,
  salvarMovimentacaoNoSupabase,
  salvarFugaNoSupabase,
} from './services/supabaseService';
import { getSupabaseCredentials } from './lib/supabase';

const STORAGE_KEY = 'cmep_monitoramento_dados_v1';
const SESSION_STORAGE_KEY = 'dme_sessao_usuario_v1';

export default function App() {
  // Sessão do Operador Autenticado
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioOperador | null>(() => {
    try {
      const salvo = localStorage.getItem(SESSION_STORAGE_KEY);
      if (salvo) {
        return JSON.parse(salvo);
      }
    } catch (e) {
      console.error('Erro ao ler sessão do operador:', e);
    }
    return null;
  });

  const handleLogin = (usuario: UsuarioOperador) => {
    setUsuarioLogado(usuario);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(usuario));
    } catch (e) {
      console.error('Erro ao salvar sessão:', e);
    }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Erro ao remover sessão:', e);
    }
  };

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

  // Modais e Estados de Edição
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [individuoParaEditar, setIndividuoParaEditar] = useState<IndividuoMonitorado | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false);
  const [movimentacaoPreId, setMovimentacaoPreId] = useState<string | undefined>();
  const [movimentacaoParaEditar, setMovimentacaoParaEditar] = useState<{
    individuoId: string;
    movimentacao: MovimentacaoRegistro;
  } | null>(null);

  const [isFugaOpen, setIsFugaOpen] = useState(false);
  const [fugaPreId, setFugaPreId] = useState<string | undefined>();
  const [individuoFicha, setIndividuoFicha] = useState<IndividuoMonitorado | null>(null);
  const [alertaFugaIndividuo, setAlertaFugaIndividuo] = useState<IndividuoMonitorado | null>(null);
  const [alertaFugaRegistro, setAlertaFugaRegistro] = useState<RegistroFuga | null>(null);

  // Manter individuoFicha sincronizado com a lista de indivíduos
  useEffect(() => {
    if (individuoFicha) {
      const atualizado = individuos.find((i) => i.id === individuoFicha.id);
      if (atualizado) {
        setIndividuoFicha(atualizado);
      }
    }
  }, [individuos]);

  // Sincronizar com o banco Supabase na inicialização se configurado
  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds.source !== 'none') {
      carregarIndividuosDoSupabase()
        .then((res) => {
          if (res.sucesso && res.dados && res.dados.length > 0) {
            setIndividuos(res.dados);
          }
        })
        .catch((e) => {
          console.warn('Aviso: Falha ao sincronizar com Supabase na inicialização:', e);
        });
    }
  }, []);

  // Contagem de foragidos ativos para a badge no header
  const foragidosAtivosCount = individuos.filter((i) => i.status === 'FORAGIDO').length;

  // Ações de persistência: Criar ou Editar Cadastro de Indivíduo
  const handleSalvarIndividuo = (novoOuAtualizado: IndividuoMonitorado) => {
    setIndividuos((prev) => {
      const existe = prev.some((i) => i.id === novoOuAtualizado.id);
      if (existe) {
        return prev.map((i) => (i.id === novoOuAtualizado.id ? novoOuAtualizado : i));
      }
      return [novoOuAtualizado, ...prev];
    });

    if (individuoFicha && individuoFicha.id === novoOuAtualizado.id) {
      setIndividuoFicha(novoOuAtualizado);
    }
    setIndividuoParaEditar(null);

    // Sincronizar com o Supabase em segundo plano
    salvarIndividuoNoSupabase(novoOuAtualizado).catch((err) => {
      console.warn('Aviso Supabase (salvar indivíduo):', err);
    });
  };

  const handleExcluirIndividuo = (individuoId: string) => {
    setIndividuos((prev) => prev.filter((i) => i.id !== individuoId));
    if (individuoFicha && individuoFicha.id === individuoId) {
      setIndividuoFicha(null);
    }

    // Excluir do Supabase em segundo plano
    excluirIndividuoNoSupabase(individuoId).catch((err) => {
      console.warn('Aviso Supabase (excluir indivíduo):', err);
    });
  };

  // Registrar Nova Movimentação
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

        const novaMov: MovimentacaoRegistro = {
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

    // Sincronizar nova movimentação com o Supabase
    salvarMovimentacaoNoSupabase({
      id: `mov-${Date.now()}`,
      individuoId,
      tipo,
      ...dados,
    }).catch((err) => {
      console.warn('Aviso Supabase (salvar movimentação):', err);
    });
  };

  // Editar Movimentação Existente (Entrada ou Saída)
  const handleEditarMovimentacao = (
    individuoId: string,
    movimentacaoId: string,
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

        const movsAtualizadas = ind.movimentacoes.map((mov) =>
          mov.id === movimentacaoId
            ? {
                ...mov,
                tipo,
                ...dados,
              }
            : mov
        );

        // Se for a movimentação mais recente, ajustar status do indivíduo
        let novoStatus = ind.status;
        if (tipo === 'SAIDA') {
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
          movimentacoes: movsAtualizadas,
        };
      })
    );

    setMovimentacaoParaEditar(null);
  };

  // Excluir Registro de Movimentação
  const handleExcluirMovimentacao = (individuoId: string, movimentacaoId: string) => {
    setIndividuos((prev) =>
      prev.map((ind) => {
        if (ind.id !== individuoId) return ind;
        return {
          ...ind,
          movimentacoes: ind.movimentacoes.filter((m) => m.id !== movimentacaoId),
        };
      })
    );
    setMovimentacaoParaEditar(null);
  };

  // Registrar Ocorrência de Fuga
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
      responsavelOperacional: 'Divisão de Monitoramento Eletrônico - DME',
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

    // Sincronizar fuga com o Supabase
    salvarFugaNoSupabase(novaFuga).catch((err) => {
      console.warn('Aviso Supabase (salvar fuga):', err);
    });
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

        const fugaAlterada = fugasAtualizadas.find((f) => f.id === fugaId);
        if (fugaAlterada) {
          salvarFugaNoSupabase(fugaAlterada).catch(console.warn);
        }

        const movRetorno = {
          id: `mov-${Date.now()}`,
          individuoId,
          tipo: 'ENTRADA' as TipoMovimentacao,
          dataHora: agoraIso,
          motivo: 'RETORNO_RECAPTURA' as const,
          motivoDetalhado: 'Retorno ao sistema após cumprimento de mandado de recaptura.',
          responsavelOperacional: 'Equipe de Plantão DME',
        };

        salvarMovimentacaoNoSupabase(movRetorno).catch(console.warn);

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

  const handleExportarRelatorio = () => {
    gerarRelatorioPDF(abaAtiva, individuos);
  };

  // Se o operador não estiver autenticado, exibir a Tela de Login Institucional da DME
  if (!usuarioLogado) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header com 3 Zonas Institucionais */}
      <Header
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        usuarioLogado={usuarioLogado}
        onLogout={handleLogout}
        onNovoCadastro={() => {
          setIndividuoParaEditar(null);
          setIsCadastroOpen(true);
        }}
        onNovaMovimentacao={() => {
          setMovimentacaoPreId(undefined);
          setMovimentacaoParaEditar(null);
          setIsMovimentacaoOpen(true);
        }}
        onNovaFuga={() => {
          setFugaPreId(undefined);
          setIsFugaOpen(true);
        }}
        onExportarRelatorio={handleExportarRelatorio}
        onAbrirSupabase={() => setIsSupabaseModalOpen(true)}
        fugasAtivasCount={foragidosAtivosCount}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Painel de Indicadores Executivos no topo */}
        {abaAtiva !== 'prompt_mestre' && (
          <DashboardStats individuos={individuos} />
        )}

        {/* Barra de Ação Rápida de Exportação de Relatório Oficial com jsPDF */}
        {abaAtiva !== 'prompt_mestre' && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print shadow-sm">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>Exportação de Relatório Oficial (jsPDF)</span>
                  <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate">
                    {abaAtiva === 'fugas'
                      ? 'Lista Oficial de Foragidos'
                      : abaAtiva === 'movimentacoes'
                      ? 'Livro de Entradas & Saídas'
                      : abaAtiva === 'vitimas_agressores'
                      ? 'Proteção à Mulher (Maria da Penha)'
                      : abaAtiva === 'faixas_etarias'
                      ? 'Estatísticas por Faixa Etária'
                      : 'Relação Geral de Monitorados'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Gera PDF em formato formal (A4 institucional) com cabeçalho da Secretaria/DME e numeração de páginas.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportarRelatorio}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Exportar Relatório (PDF)</span>
            </button>
          </div>
        )}

        {/* Aba 1: Monitorados Geral */}
        {abaAtiva === 'todos' && (
          <MonitoradosListView
            individuos={individuos}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
            onEditarCadastro={(ind) => {
              setIndividuoParaEditar(ind);
              setIsCadastroOpen(true);
            }}
            onRegistrarMovimentacao={(id) => {
              setMovimentacaoPreId(id);
              setMovimentacaoParaEditar(null);
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
            onNovoCadastro={() => {
              setIndividuoParaEditar(null);
              setIsCadastroOpen(true);
            }}
          />
        )}

        {/* Aba 2: Livro de Entradas & Saídas */}
        {abaAtiva === 'movimentacoes' && (
          <MovimentacoesView
            individuos={individuos}
            onNovaMovimentacao={() => {
              setMovimentacaoPreId(undefined);
              setMovimentacaoParaEditar(null);
              setIsMovimentacaoOpen(true);
            }}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
            onEditarMovimentacao={(individuoId, mov) => {
              setMovimentacaoParaEditar({ individuoId, movimentacao: mov });
              setIsMovimentacaoOpen(true);
            }}
            onExportarPDF={handleExportarRelatorio}
          />
        )}

        {/* Aba 3: Vítimas & Agressores */}
        {abaAtiva === 'vitimas_agressores' && (
          <VitimasAgressoresView
            individuos={individuos}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
            onEditarCadastro={(ind) => {
              setIndividuoParaEditar(ind);
              setIsCadastroOpen(true);
            }}
            onNovoCadastro={() => {
              setIndividuoParaEditar(null);
              setIsCadastroOpen(true);
            }}
            onNovaMovimentacao={(id) => {
              setMovimentacaoPreId(id);
              setMovimentacaoParaEditar(null);
              setIsMovimentacaoOpen(true);
            }}
          />
        )}

        {/* Aba 4: Fugas & Evasões */}
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
            onExportarPDF={handleExportarRelatorio}
          />
        )}

        {/* Aba 5: Faixas Etárias */}
        {abaAtiva === 'faixas_etarias' && (
          <DemographicsView
            individuos={individuos}
            onSelecionarIndividuo={(ind) => setIndividuoFicha(ind)}
          />
        )}

        {/* Aba 6: Prompt Mestre */}
        {abaAtiva === 'prompt_mestre' && (
          <PromptGeneratorModal inline />
        )}
      </main>

      {/* Footer simples e institucional */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3.5 sm:py-4 px-4 sm:px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left no-print">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span>DME · Divisão de Monitoramento Eletrônico</span>
          <span className="hidden sm:inline">·</span>
          <span className="text-[11px] text-slate-500">Res. CNJ nº 412/21 & Lei 11.340/06</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDados}
            title="Restaurar dados de demonstração originais"
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors text-xs py-1 px-2 rounded-lg hover:bg-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Amostras</span>
          </button>
        </div>
      </footer>

      {/* Modal de Cadastrar / Editar Indivíduo */}
      <CadastrarIndividuoModal
        isOpen={isCadastroOpen}
        onClose={() => {
          setIsCadastroOpen(false);
          setIndividuoParaEditar(null);
        }}
        onSalvar={handleSalvarIndividuo}
        individuosExistentes={individuos}
        individuoParaEditar={individuoParaEditar}
      />

      {/* Modal de Registrar / Editar Entrada ou Saída */}
      <RegistrarMovimentacaoModal
        isOpen={isMovimentacaoOpen}
        onClose={() => {
          setIsMovimentacaoOpen(false);
          setMovimentacaoParaEditar(null);
        }}
        individuos={individuos}
        individuoPreSelecionadoId={movimentacaoPreId}
        movimentacaoParaEditar={movimentacaoParaEditar}
        onSalvarMovimentacao={handleSalvarMovimentacao}
        onEditarMovimentacao={handleEditarMovimentacao}
        onExcluirMovimentacao={handleExcluirMovimentacao}
      />

      {/* Modal de Registrar Fuga */}
      <RegistrarFugaModal
        isOpen={isFugaOpen}
        onClose={() => setIsFugaOpen(false)}
        individuos={individuos}
        individuoPreSelecionadoId={fugaPreId}
        onSalvarFuga={handleSalvarFuga}
      />

      {/* Modal Dossiê Individual do Indivíduo */}
      <FichaIndividuoModal
        isOpen={!!individuoFicha}
        onClose={() => setIndividuoFicha(null)}
        individuo={individuoFicha}
        onEditarCadastro={(ind) => {
          setIndividuoParaEditar(ind);
          setIsCadastroOpen(true);
        }}
        onRegistrarMovimentacao={(id) => {
          setMovimentacaoPreId(id);
          setMovimentacaoParaEditar(null);
          setIsMovimentacaoOpen(true);
        }}
        onEditarMovimentacao={(individuoId, mov) => {
          setMovimentacaoParaEditar({ individuoId, movimentacao: mov });
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
        onExcluirCadastro={handleExcluirIndividuo}
      />

      {/* Modal de Alerta Policial de Fuga / Mandado */}
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

      {/* Modal de Gerenciamento do Banco Supabase & Migrations SQL */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        individuosLocais={individuos}
        onIndividuosAtualizados={(novos) => setIndividuos(novos)}
      />
    </div>
  );
}
