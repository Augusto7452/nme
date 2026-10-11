import React, { useState } from 'react';
import { X, User, KeyRound, Shield, CheckCircle2, AlertTriangle, Eye, EyeOff, Building, BadgeCheck } from 'lucide-react';
import { UsuarioOperador } from '../types/monitoring';
import { cadastrarOperadorNoSupabase } from '../services/supabaseService';

interface EditarOperadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioLogado: UsuarioOperador;
  onUsuarioAtualizado: (usuario: UsuarioOperador) => void;
}

export const EditarOperadorModal: React.FC<EditarOperadorModalProps> = ({
  isOpen,
  onClose,
  usuarioLogado,
  onUsuarioAtualizado,
}) => {
  const [nome, setNome] = useState(usuarioLogado.nome);
  const [matricula, setMatricula] = useState(usuarioLogado.matricula);
  const [cargo, setCargo] = useState(usuarioLogado.cargo);
  const [lotacao, setLotacao] = useState(usuarioLogado.lotacao);
  const [email] = useState(usuarioLogado.email || `${usuarioLogado.matricula.toLowerCase()}@dme.seguranca.gov.br`);

  // Troca de Senha
  const [alterarSenha, setAlterarSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estados de Operação
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    const nomeTrim = nome.trim();
    const matriculaTrim = matricula.trim().toUpperCase();
    const cargoTrim = cargo.trim();
    const lotacaoTrim = lotacao.trim();

    if (!nomeTrim) {
      setErro('Informe seu nome completo institucional.');
      return;
    }

    if (!matriculaTrim) {
      setErro('Informe sua matrícula funcional.');
      return;
    }

    if (alterarSenha) {
      if (!novaSenha.trim()) {
        setErro('Digite a nova senha individual desejada.');
        return;
      }
      if (novaSenha.trim().length < 6) {
        setErro('A nova senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (novaSenha.trim() !== confirmaSenha.trim()) {
        setErro('A confirmação de senha não coincide com a nova senha digitada.');
        return;
      }
    }

    setSalvando(true);

    try {
      // Se solicitou troca de senha, passa nova senha; se não, passa a senha padrão/atual
      const senhaParaGravar = alterarSenha && novaSenha.trim() ? novaSenha.trim() : 'dme@2026';

      const res = await cadastrarOperadorNoSupabase({
        nome: nomeTrim,
        matricula: matriculaTrim,
        email,
        cargo: cargoTrim,
        perfilAcesso: usuarioLogado.perfilAcesso,
        lotacao: lotacaoTrim,
        senha: senhaParaGravar,
      });

      if (res.sucesso && res.operador) {
        setSucesso('Cadastro do operador atualizado com sucesso no banco de dados!');
        const operadorAtualizado: UsuarioOperador = {
          ...res.operador,
          lotacao: lotacaoTrim,
          cargo: cargoTrim,
          horarioLogin: usuarioLogado.horarioLogin,
        };

        onUsuarioAtualizado(operadorAtualizado);

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErro(res.erro || 'Falha ao atualizar dados do operador no banco.');
      }
    } catch (err: any) {
      setErro(`Erro ao atualizar: ${err.message || String(err)}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Editar Cadastro do Operador</h2>
              <p className="text-[11px] text-slate-400">Atualização cadastral e credencial institucional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Sucesso */}
          {sucesso && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{sucesso}</span>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Atenção:</span> {erro}
              </div>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome Completo do Policial / Agente <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Matrícula & Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Matrícula Funcional <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Função</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Lotação */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lotação Operacional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={lotacao}
                onChange={(e) => setLotacao(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Opção para alterar senha */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={alterarSenha}
                  onChange={(e) => setAlterarSenha(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span>Alterar Senha Individual de Acesso</span>
              </label>
              {alterarSenha && (
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{mostrarSenha ? 'Ocultar' : 'Ver'}</span>
                </button>
              )}
            </div>

            {alterarSenha && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nova Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Confirmar Nova Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={confirmaSenha}
                      onChange={(e) => setConfirmaSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Alterações do Operador</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
