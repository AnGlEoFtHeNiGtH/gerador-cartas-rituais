import React, { useState } from 'react';
import { authenticateAdmin, logoutAdmin, ADMIN_CREDENTIALS } from '../utils/adminAuth';
import { soundEngine } from '../utils/audio';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  KeyRound,
  X,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
  isAdminAuthenticated: boolean;
  onAuthStateChange: (isAuth: boolean) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  appMode = 'dark',
  isAdminAuthenticated,
  onAuthStateChange,
}) => {
  const isLight = appMode === 'light';
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authenticateAdmin(loginInput, passwordInput);
    if (result.success) {
      soundEngine.playSigilChime(640);
      setSuccessAnimation(true);
      setTimeout(() => {
        onAuthStateChange(true);
        setSuccessAnimation(false);
        setLoginInput('');
        setPasswordInput('');
        onClose();
      }, 700);
    } else {
      soundEngine.playSigilChime(260);
      setErrorMessage(result.error || 'Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    soundEngine.playCardFlip();
    logoutAdmin();
    onAuthStateChange(false);
    onClose();
  };

  const handleFillDemoAdmin = () => {
    setLoginInput('Gauss0413');
    setPasswordInput('Alv04130211LVA');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-800'
            : 'bg-[#111117] border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header with decorative occult border */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0d0d12] border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-xs border ${
                isAdminAuthenticated
                  ? isLight
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-400'
                  : isLight
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-amber-950/80 border-amber-700/60 text-amber-400'
              }`}
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3
                className={`font-cinzel text-base font-bold tracking-wide ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {isAdminAuthenticated ? 'Painel do Administrador' : 'Acesso de Administrador'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {isAdminAuthenticated
                  ? 'Sessão de moderação e controle ativa'
                  : 'Autenticação restrita da Ordo Realitas'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isAdminAuthenticated ? (
            /* Logged In View */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">
                    Modo Administrador Ativo (Agente: {ADMIN_CREDENTIALS.login})
                  </p>
                  <p className="leading-relaxed opacity-90">
                    Você possui autorização para <strong>excluir rituais impróprios</strong> diretamente da aba <em>Grimório Público (Comunidade)</em>.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-mono ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-black/50 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500">Credencial:</span>
                  <span className="font-bold text-red-500">{ADMIN_CREDENTIALS.login}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-zinc-800/40">
                  <span className="text-zinc-500">Privilégio:</span>
                  <span className="text-emerald-400 font-semibold">Exclusão Global de Cartas Públicas</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-950/30 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar Sessão Admin</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : (
            /* Login Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl border border-red-500/50 bg-red-950/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successAnimation && (
                <div className="p-3 rounded-xl border border-emerald-500/50 bg-emerald-950/50 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>✦ Autenticado com sucesso! Carregando modo de moderação...</span>
                </div>
              )}

              <div>
                <label
                  className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Identificação do Agente (Login)
                </label>
                <div className="relative">
                  <User
                    className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      isLight ? 'text-slate-400' : 'text-zinc-500'
                    }`}
                  />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Ex: Gauss0413"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500 border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#181820] border-zinc-700 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Chave de Acesso (Senha)
                </label>
                <div className="relative">
                  <KeyRound
                    className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      isLight ? 'text-slate-400' : 'text-zinc-500'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••••"
                    className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500 border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#181820] border-zinc-700 text-white placeholder-zinc-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      isLight ? 'text-slate-400 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Preencher Credenciais Helper */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>
                  Credencial designada: <code className="font-bold">Gauss0413</code>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoAdmin}
                  className={`hover:underline cursor-pointer ${
                    isLight ? 'text-red-700' : 'text-red-400'
                  }`}
                >
                  Preencher dados
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={successAnimation}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white rounded-xl text-xs font-semibold shadow-md shadow-red-950/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Autenticar no Sistema</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
