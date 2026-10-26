import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Ritual } from '../types';
import { RitualCard } from './RitualCard';
import { Printer, X, LayoutGrid, Layers, Check } from 'lucide-react';

interface PrintModalProps {
  ritual: Ritual;
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
}

export const PrintModal: React.FC<PrintModalProps> = ({
  ritual,
  isOpen,
  onClose,
  appMode = 'dark',
}) => {
  const isLight = appMode === 'light';
  const [printLayout, setPrintLayout] = useState<'both' | 'front-only' | 'back-only'>('both');
  const [showCropMarks, setShowCropMarks] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-800'
            : 'bg-[#101015] border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0c0c10]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-slate-200 text-slate-800' : 'bg-zinc-800 text-white'
              }`}
            >
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`font-cinzel text-base font-bold tracking-wide ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Modo de Impressão Física (63mm × 88mm)
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Formato real de card game (Poker Size) com guias de corte para sleeves
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-red-950/40 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora (Ctrl+P)</span>
            </button>
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
        </div>

        {/* Toolbar / Options */}
        <div
          className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-4 text-xs ${
            isLight ? 'border-slate-200 bg-slate-100/90' : 'border-zinc-800 bg-[#14141a]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[11px] uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Formato:
            </span>
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border ${
                isLight ? 'bg-white border-slate-300' : 'bg-[#1c1c24] border-zinc-800'
              }`}
            >
              <button
                onClick={() => setPrintLayout('both')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  printLayout === 'both'
                    ? isLight
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-zinc-700 text-white font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Frente e Verso (Lado a Lado)
              </button>
              <button
                onClick={() => setPrintLayout('front-only')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  printLayout === 'front-only'
                    ? isLight
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-zinc-700 text-white font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Apenas Frente
              </button>
              <button
                onClick={() => setPrintLayout('back-only')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  printLayout === 'back-only'
                    ? isLight
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-zinc-700 text-white font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Apenas Verso
              </button>
            </div>
          </div>

          <label className={`flex items-center gap-2 cursor-pointer ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            <input
              type="checkbox"
              checked={showCropMarks}
              onChange={(e) => setShowCropMarks(e.target.checked)}
              className="w-4 h-4 rounded accent-red-600"
            />
            <span className="text-xs">Exibir Guias de Corte (Crop Marks)</span>
          </label>
        </div>

        {/* Printable Preview Sheet */}
        <div className={`flex-1 overflow-y-auto p-8 flex items-center justify-center ${isLight ? 'bg-slate-200/70' : 'bg-[#08080a]'}`}>
          {/* Virtual A4 Paper Container */}
          <div
            id="print-area"
            className="bg-white text-black p-8 rounded-lg shadow-2xl relative flex flex-wrap items-center justify-center gap-8 min-h-[500px]"
            style={{
              width: printLayout === 'both' ? '820px' : '480px',
            }}
          >
            {/* Front Card */}
            {(printLayout === 'both' || printLayout === 'front-only') && (
              <div className="relative flex flex-col items-center">
                {showCropMarks && (
                  <>
                    {/* Top crop mark */}
                    <div className="absolute -top-4 w-px h-3 bg-black/60" />
                    {/* Bottom crop mark */}
                    <div className="absolute -bottom-4 w-px h-3 bg-black/60" />
                    {/* Left crop mark */}
                    <div className="absolute -left-4 h-px w-3 bg-black/60" />
                    {/* Right crop mark */}
                    <div className="absolute -right-4 h-px w-3 bg-black/60" />
                  </>
                )}
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5 no-print">
                  [FRENTE] {ritual.name}
                </span>
                <RitualCard ritual={ritual} viewSide="front" scale={0.88} />
              </div>
            )}

            {/* Back Card */}
            {(printLayout === 'both' || printLayout === 'back-only') && (
              <div className="relative flex flex-col items-center">
                {showCropMarks && (
                  <>
                    <div className="absolute -top-4 w-px h-3 bg-black/60" />
                    <div className="absolute -bottom-4 w-px h-3 bg-black/60" />
                    <div className="absolute -left-4 h-px w-3 bg-black/60" />
                    <div className="absolute -right-4 h-px w-3 bg-black/60" />
                  </>
                )}
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1.5 no-print">
                  [VERSO] {ritual.name}
                </span>
                <RitualCard ritual={ritual} viewSide="back" scale={0.88} />
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div
          className={`px-6 py-2.5 border-t text-center text-[11px] ${
            isLight
              ? 'border-slate-200 bg-white text-slate-500'
              : 'border-zinc-800 bg-[#0c0c10] text-zinc-400'
          }`}
        >
          💡 Para melhor qualidade física, configure sua impressora para &ldquo;Escala: 100%&rdquo; e papel fotográfico ou couchê 250g/m² ou 300g/m².
        </div>
      </div>
    </div>

    {/* Portaled dedicated print output */}
    {createPortal(
      <div className="print-container">
        {(printLayout === 'both' || printLayout === 'front-only') && (
          <div className="page-a4-sheet">
            <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-6">
              <span>ORDEM PARANORMAL · IMPRESSÃO FÍSICA POKER SIZE</span>
              <span className="font-bold text-slate-800">FACE 1 · FRENTE · {ritual.name}</span>
              <span>{ritual.element.toUpperCase()}</span>
            </div>
            <div className="relative flex flex-col items-center justify-center my-auto">
              {showCropMarks && (
                <>
                  <div className="absolute -top-6 left-0 w-px h-5 bg-black" />
                  <div className="absolute -top-6 right-0 w-px h-5 bg-black" />
                  <div className="absolute -bottom-6 left-0 w-px h-5 bg-black" />
                  <div className="absolute -bottom-6 right-0 w-px h-5 bg-black" />
                  <div className="absolute top-0 -left-6 h-px w-5 bg-black" />
                  <div className="absolute bottom-0 -left-6 h-px w-5 bg-black" />
                  <div className="absolute top-0 -right-6 h-px w-5 bg-black" />
                  <div className="absolute bottom-0 -right-6 h-px w-5 bg-black" />
                </>
              )}
              <RitualCard ritual={ritual} viewSide="front" scale={1} />
            </div>
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-6">
              <span>FORMATO POKER SIZE (63mm × 88mm)</span>
              <span>CORTE NAS GUIAS EXTERNAS</span>
              <span>PAPEL RECOMENDADO: COUCHÊ 250G OU 300G</span>
            </div>
          </div>
        )}

        {(printLayout === 'both' || printLayout === 'back-only') && (
          <div className="page-a4-sheet">
            <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-6">
              <span>ORDEM PARANORMAL · IMPRESSÃO FÍSICA POKER SIZE</span>
              <span className="font-bold text-slate-800">FACE 2 · VERSO · {ritual.name}</span>
              <span>{ritual.element.toUpperCase()}</span>
            </div>
            <div className="relative flex flex-col items-center justify-center my-auto">
              {showCropMarks && (
                <>
                  <div className="absolute -top-6 left-0 w-px h-5 bg-black" />
                  <div className="absolute -top-6 right-0 w-px h-5 bg-black" />
                  <div className="absolute -bottom-6 left-0 w-px h-5 bg-black" />
                  <div className="absolute -bottom-6 right-0 w-px h-5 bg-black" />
                  <div className="absolute top-0 -left-6 h-px w-5 bg-black" />
                  <div className="absolute bottom-0 -left-6 h-px w-5 bg-black" />
                  <div className="absolute top-0 -right-6 h-px w-5 bg-black" />
                  <div className="absolute bottom-0 -right-6 h-px w-5 bg-black" />
                </>
              )}
              <RitualCard ritual={ritual} viewSide="back" scale={1} />
            </div>
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-6">
              <span>FORMATO POKER SIZE (63mm × 88mm)</span>
              <span>ALINHE COM A FACE 1</span>
              <span>PAPEL RECOMENDADO: COUCHÊ 250G OU 300G</span>
            </div>
          </div>
        )}
      </div>,
      document.body
    )}
  </>
  );
};
