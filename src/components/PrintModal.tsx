import React, { useState } from 'react';
import { Ritual } from '../types';
import { RitualCard } from './RitualCard';
import { Printer, X, LayoutGrid, Layers, Check } from 'lucide-react';

interface PrintModalProps {
  ritual: Ritual;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ ritual, isOpen, onClose }) => {
  const [printLayout, setPrintLayout] = useState<'both' | 'front-only' | 'back-only'>('both');
  const [showCropMarks, setShowCropMarks] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#101015] border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0c0c10]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-white tracking-wide">
                Modo de Impressão Física (63mm × 88mm)
              </h2>
              <p className="text-xs text-zinc-400">
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
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar / Options */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-[#14141a] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px] uppercase">Formato:</span>
            <div className="flex items-center gap-1 bg-[#1c1c24] p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setPrintLayout('both')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  printLayout === 'both'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Frente e Verso (Lado a Lado)
              </button>
              <button
                onClick={() => setPrintLayout('front-only')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  printLayout === 'front-only'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Apenas Frente
              </button>
              <button
                onClick={() => setPrintLayout('back-only')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  printLayout === 'back-only'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Apenas Verso
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
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
        <div className="flex-1 overflow-y-auto p-8 bg-[#08080a] flex items-center justify-center">
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
        <div className="px-6 py-2.5 border-t border-zinc-800 bg-[#0c0c10] text-center text-[11px] text-zinc-400">
          💡 Para melhor qualidade física, configure sua impressora para &ldquo;Escala: 100%&rdquo; e papel fotográfico ou couchê 250g/m² ou 300g/m².
        </div>
      </div>
    </div>
  );
};
