import React from 'react';
import { ORDO_REALITAS_LOGO } from '../data/elementSymbols';
import { soundEngine } from '../utils/audio';
import {
  BookOpen,
  Package,
  ArrowRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Shield,
  ShieldCheck,
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectWorkspace: (workspace: 'rituals' | 'arsenal') => void;
  ritualCount: number;
  itemCount: number;
  appMode: 'dark' | 'light';
  onToggleAppMode: () => void;
  isAmbientPlaying: boolean;
  onToggleAmbient: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminModal: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectWorkspace,
  ritualCount,
  itemCount,
  appMode,
  onToggleAppMode,
  isAmbientPlaying,
  onToggleAmbient,
  isAdminLoggedIn,
  onOpenAdminModal,
}) => {
  const isLight = appMode === 'light';

  const handleEnter = (workspace: 'rituals' | 'arsenal') => {
    soundEngine.playPageTurn();
    onSelectWorkspace(workspace);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors relative overflow-hidden ${
        isLight
          ? 'bg-[#f4f5f9] text-slate-900 selection:bg-red-200 selection:text-red-950'
          : 'bg-[#09090d] text-zinc-100 selection:bg-red-950 selection:text-red-200'
      }`}
    >
      {/* Subtle Tactical Grid Backdrop */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:48px_48px] opacity-30'
            : 'bg-[linear-gradient(to_right,#181822_1px,transparent_1px),linear-gradient(to_bottom,#181822_1px,transparent_1px)] bg-[size:48px_48px] opacity-40'
        }`}
      />

      {/* Minimal Top Bar */}
      <header
        className={`relative z-10 flex items-center justify-between gap-8 px-6 py-4 border-b backdrop-blur-md ${
          isLight ? 'border-slate-200 bg-white/90' : 'border-zinc-800/80 bg-[#0d0d12]/90'
        }`}
      >
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center bg-white border-zinc-300 p-1 shadow-xs">
            <img
              src={ORDO_REALITAS_LOGO}
              alt="Ordo Realitas"
              className="w-full h-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <span
            className={`font-title text-base font-bold tracking-wider ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Ordem Paranormal
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAdminModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isAdminLoggedIn
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900/90'
                : isLight
                ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            {isAdminLoggedIn ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isAdminLoggedIn ? 'Admin Ativo' : 'Acesso Admin'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleAppMode}
            title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200'
                : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleAmbient}
            title={isAmbientPlaying ? 'Desativar som ambiente' : 'Ativar som ambiente paranormal'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isAmbientPlaying
                ? 'bg-red-950/70 border-red-800 text-red-300'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Selection Canvas */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-5xl w-full mx-auto">
        {/* Official Ordo Realitas Emblem & Dossier Intro */}
        <div className="flex flex-col items-center text-center mb-10 max-w-2xl">
          <div
            className={`w-24 h-24 rounded-2xl border flex items-center justify-center p-2.5 mb-5 shadow-md ${
              isLight
                ? 'bg-white border-slate-300'
                : 'bg-[#121218] border-zinc-800'
            }`}
          >
            <img
              src={ORDO_REALITAS_LOGO}
              alt="Selo Oficial da Ordo Realitas"
              className="w-full h-full object-contain select-none"
              style={
                isLight
                  ? { mixBlendMode: 'multiply' }
                  : { filter: 'invert(1) brightness(1.08)', mixBlendMode: 'screen' }
              }
            />
          </div>

          <p
            className={`text-xs font-mono uppercase tracking-[0.22em] mb-2 ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            Ordo Realitas · Terminal de Catalogação Tática
          </p>

          <h1
            className={`font-title text-3xl sm:text-4xl font-bold tracking-wide text-balance mb-3 ${
              isLight ? 'text-slate-950' : 'text-white'
            }`}
            style={{ fontFamily: "'Cinzel', 'Westsac', Georgia, serif" }}
          >
            Gerador de Cartas Paranormais
          </h1>

          <p
            className={`text-sm sm:text-base leading-relaxed max-w-xl ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            Selecione o setor de trabalho para editar cartas em formato Poker Size (63×88mm), exportar em alta definição ou montar folhas A4 frente e verso.
          </p>
        </div>

        {/* Two Prominent Workspace Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
          {/* Option 1: Grimório de Rituais */}
          <button
            type="button"
            onClick={() => handleEnter('rituals')}
            className={`group text-left rounded-2xl border p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 ${
              isLight
                ? 'bg-white border-slate-300 hover:border-red-600 shadow-sm hover:shadow-xl'
                : 'bg-[#121218] border-zinc-800 hover:border-red-600/80 shadow-xl hover:bg-[#16141b]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                    isLight
                      ? 'bg-red-50 border-red-200 text-red-700 group-hover:bg-red-700 group-hover:text-white'
                      : 'bg-red-950/60 border-red-800/70 text-red-400 group-hover:bg-red-700 group-hover:text-white'
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                </div>

                <span
                  className={`text-xs font-mono tabular-nums ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}
                >
                  {ritualCount} {ritualCount === 1 ? 'ritual salvo' : 'rituais salvos'}
                </span>
              </div>

              <h2
                className={`font-title text-xl font-bold tracking-wide mb-2 transition-colors ${
                  isLight
                    ? 'text-slate-900 group-hover:text-red-800'
                    : 'text-white group-hover:text-red-300'
                }`}
                style={{ fontFamily: "'Cinzel', 'Westsac', Georgia, serif" }}
              >
                ✦ Grimório de Rituais
              </h2>

              <p
                className={`text-sm leading-relaxed mb-5 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Para gerir, criar e exportar cartas de rituais paranormais.
              </p>

              <div
                className={`text-xs font-mono pt-4 border-t flex flex-wrap items-center gap-x-2 gap-y-1 ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-zinc-800/90 text-zinc-400'
                }`}
              >
                <span>5 Elementos</span>
                <span aria-hidden="true">·</span>
                <span>Círculos e PD</span>
                <span aria-hidden="true">·</span>
                <span>Grimório Público</span>
                <span aria-hidden="true">·</span>
                <span>Impressão Leve e 2×2</span>
              </div>
            </div>

            <div className="mt-7 pt-2 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isLight
                    ? 'bg-red-700 text-white group-hover:bg-red-800'
                    : 'bg-red-700 text-white group-hover:bg-red-600'
                }`}
              >
                <span>Acessar Grimório</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </button>

          {/* Option 2: Arsenal de Equipamentos */}
          <button
            type="button"
            onClick={() => handleEnter('arsenal')}
            className={`group text-left rounded-2xl border p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
              isLight
                ? 'bg-white border-slate-300 hover:border-amber-600 shadow-sm hover:shadow-xl'
                : 'bg-[#121218] border-zinc-800 hover:border-amber-500/80 shadow-xl hover:bg-[#171512]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-700 group-hover:bg-amber-700 group-hover:text-white'
                      : 'bg-amber-950/60 border-amber-800/70 text-amber-400 group-hover:bg-amber-600 group-hover:text-white'
                  }`}
                >
                  <Package className="w-6 h-6" />
                </div>

                <span
                  className={`text-xs font-mono tabular-nums ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}
                >
                  {itemCount} {itemCount === 1 ? 'item salvo' : 'itens salvos'}
                </span>
              </div>

              <h2
                className={`font-title text-xl font-bold tracking-wide mb-2 transition-colors ${
                  isLight
                    ? 'text-slate-900 group-hover:text-amber-800'
                    : 'text-white group-hover:text-amber-300'
                }`}
                style={{ fontFamily: "'Cinzel', 'Westsac', Georgia, serif" }}
              >
                ✦ Arsenal de Equipamentos
              </h2>

              <p
                className={`text-sm leading-relaxed mb-5 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Para gerir, criar e exportar cartas de itens, armas e acessórios.
              </p>

              <div
                className={`text-xs font-mono pt-4 border-t flex flex-wrap items-center gap-x-2 gap-y-1 ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-zinc-800/90 text-zinc-400'
                }`}
              >
                <span>Armas e Proteções</span>
                <span aria-hidden="true">·</span>
                <span>Espaços Decimais</span>
                <span aria-hidden="true">·</span>
                <span>Estilo Dossier</span>
                <span aria-hidden="true">·</span>
                <span>Grade 2×2 A4</span>
              </div>
            </div>

            <div className="mt-7 pt-2 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isLight
                    ? 'bg-amber-700 text-white group-hover:bg-amber-800'
                    : 'bg-amber-600 text-white group-hover:bg-amber-500'
                }`}
              >
                <span>Acessar Arsenal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer
        className={`relative z-10 px-6 py-4 border-t text-center text-xs font-mono ${
          isLight
            ? 'border-slate-200 bg-white/80 text-slate-500'
            : 'border-zinc-800/70 bg-[#0d0d12]/80 text-zinc-500'
        }`}
      >
        <span>Ordo Realitas · Dados salvos localmente no navegador · Formato padrão 63mm × 88mm</span>
      </footer>
    </div>
  );
};
