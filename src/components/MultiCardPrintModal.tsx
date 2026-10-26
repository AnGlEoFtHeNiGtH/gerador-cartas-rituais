import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Ritual } from '../types';
import { RitualCard } from './RitualCard';
import { LightPrintCard } from './LightPrintCard';
import { exportCardAsPng, sanitizeFilename } from '../utils/exportCard';
import { soundEngine } from '../utils/audio';
import {
  Printer,
  X,
  Layers,
  Sparkles,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileCheck,
  Grid2X2,
  Info,
} from 'lucide-react';

interface MultiCardPrintModalProps {
  rituals: Ritual[];
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
}

export const MultiCardPrintModal: React.FC<MultiCardPrintModalProps> = ({
  rituals,
  isOpen,
  onClose,
  appMode = 'dark',
}) => {
  const isLight = appMode === 'light';

  // Config state
  const [printStyle, setPrintStyle] = useState<'original' | 'light'>('original');
  const [duplexMode, setDuplexMode] = useState<'long-edge' | 'none' | 'short-edge'>('long-edge');
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [previewTab, setPreviewTab] = useState<'page1' | 'page2' | 'both'>('page1');
  const [previewScale, setPreviewScale] = useState(0.72);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Ensure exactly 4 slots (fill empty slots with null)
  const slots: (Ritual | null)[] = [
    rituals[0] || null,
    rituals[1] || null,
    rituals[2] || null,
    rituals[3] || null,
  ];

  // Source slot index helper for duplex alignment:
  // When flipping along Long Edge (standard 2-sided portrait print):
  // Col 0 <-> Col 1 (Slot 0 <-> Slot 1, and Slot 2 <-> Slot 3)
  const getSourceIndex = (index: number): number => {
    if (duplexMode === 'long-edge') {
      const mapping = [1, 0, 3, 2];
      return mapping[index];
    }
    if (duplexMode === 'short-edge') {
      const mapping = [2, 3, 0, 1];
      return mapping[index];
    }
    return index;
  };

  const getBackSlotRitual = (index: number): Ritual | null => {
    const src = getSourceIndex(index);
    return slots[src] || null;
  };

  const handlePrint = () => {
    soundEngine.playCardFlip();
    window.print();
  };

  // Export Front or Back Sheet as high-resolution PNG
  const handleExportSheet = async (page: 'front' | 'back') => {
    setIsExporting(true);
    soundEngine.playSigilChime(600);
    const elementId = page === 'front' ? 'multi-print-preview-front' : 'multi-print-preview-back';
    const filename = sanitizeFilename(
      rituals.map((r) => r.name).join('-').slice(0, 35) || 'grade-4-cartas',
      `lote-a4-${page}`
    );

    try {
      const success = await exportCardAsPng(elementId, filename, 2.5);
      if (success) {
        showToast(`✦ Folha A4 (${page === 'front' ? 'Frente' : 'Verso'}) exportada em 300 DPI!`);
      } else {
        showToast('Falha ao exportar folha. Tente novamente.');
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar a imagem da folha.');
    } finally {
      setIsExporting(false);
    }
  };

  // Render a single cell in the 2x2 grid (scale 0.54 corresponds exactly to physical ~63mm x 88mm Poker Size)
  const renderCardSlot = (
    ritual: Ritual | null,
    viewSide: 'front' | 'back',
    slotNumber: number,
    cardScale: number = 0.54,
    sourceSlotNote?: string
  ) => {
    const cardWidth = Math.round(440 * cardScale);
    const cardHeight = Math.round(615 * cardScale);

    if (!ritual) {
      return (
        <div
          className="relative flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 isolate"
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            boxSizing: 'border-box',
          }}
        >
          <div className="text-center p-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              Slot {slotNumber + 1}
            </span>
            <p className="text-xs text-slate-400 font-medium font-body">Espaço Vazio</p>
            {sourceSlotNote && (
              <span className="text-[9px] font-mono text-slate-400/80 block mt-1">
                {sourceSlotNote}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative flex items-center justify-center isolate"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          boxSizing: 'border-box',
        }}
      >
        {/* Precise Pre-Press Corner Crop Marks (positioned strictly outside) */}
        {showCropMarks && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
            {/* Top-Left Corner */}
            <div className="absolute -top-3 left-0 w-px h-2.5 bg-slate-900" />
            <div className="absolute top-0 -left-3 h-px w-2.5 bg-slate-900" />

            {/* Top-Right Corner */}
            <div className="absolute -top-3 right-0 w-px h-2.5 bg-slate-900" />
            <div className="absolute top-0 -right-3 h-px w-2.5 bg-slate-900" />

            {/* Bottom-Left Corner */}
            <div className="absolute -bottom-3 left-0 w-px h-2.5 bg-slate-900" />
            <div className="absolute bottom-0 -left-3 h-px w-2.5 bg-slate-900" />

            {/* Bottom-Right Corner */}
            <div className="absolute -bottom-3 right-0 w-px h-2.5 bg-slate-900" />
            <div className="absolute bottom-0 -right-3 h-px w-2.5 bg-slate-900" />
          </div>
        )}

        {/* Selected Card Component wrapped in isolated relative container with exact bounds */}
        <div
          className="relative overflow-hidden rounded-xl shadow-xs"
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            boxSizing: 'border-box',
          }}
        >
          {printStyle === 'light' ? (
            <LightPrintCard
              ritual={ritual}
              viewSide={viewSide}
              scale={cardScale}
            />
          ) : (
            <RitualCard
              ritual={ritual}
              viewSide={viewSide}
              scale={cardScale}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ======================================================== */}
      {/* ON-SCREEN MODAL UI (HIDDEN FROM PRINT ENGINE VIA no-print)*/}
      {/* ======================================================== */}
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md">
        <div
          className={`relative w-full max-w-6xl max-h-[94vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors ${
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
              <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 shadow-xs">
                <Grid2X2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={`font-title text-base font-bold tracking-wide ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Impressão em Lote (Grid 2×2 A4)
                  </h2>
                  <span className="text-[10px] font-mono uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded border border-red-300 dark:border-red-800 font-semibold">
                    {rituals.length} / 4 Cartas
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Folha A4 padrão (63mm × 88mm por carta) com espelhamento duplex automático para corte frente e verso
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-red-950/30 transition-colors"
                title="Imprimir as 2 páginas A4 perfeitamente alinhadas"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Folha A4 (Frente e Verso)</span>
              </button>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Configuration Toolbar */}
          <div
            className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-4 text-xs ${
              isLight ? 'border-slate-200 bg-slate-100/90' : 'border-zinc-800 bg-[#14141a]'
            }`}
          >
            {/* Visual Preview Tab */}
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[11px] uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Visualização:
              </span>
              <div
                className={`flex items-center gap-1 p-1 rounded-lg border ${
                  isLight ? 'bg-white border-slate-300' : 'bg-[#1c1c24] border-zinc-800'
                }`}
              >
                <button
                  onClick={() => setPreviewTab('page1')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    previewTab === 'page1'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-zinc-700 text-white font-semibold'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Pág. 1 (Frentes)
                </button>
                <button
                  onClick={() => setPreviewTab('page2')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    previewTab === 'page2'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-zinc-700 text-white font-semibold'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Pág. 2 (Versos Duplex)
                </button>
                <button
                  onClick={() => setPreviewTab('both')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    previewTab === 'both'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-zinc-700 text-white font-semibold'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Ambas Lado a Lado
                </button>
              </div>
            </div>

            {/* Print Theme & Duplex Options */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Card Style Selector */}
              <div className="flex items-center gap-1.5">
                <span className={`font-mono text-[11px] uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Estilo:
                </span>
                <select
                  value={printStyle}
                  onChange={(e) => setPrintStyle(e.target.value as 'original' | 'light')}
                  className={`rounded-lg px-2.5 py-1 text-xs border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-[#1c1c24] border-zinc-800 text-zinc-200'
                  }`}
                >
                  <option value="original">Estilo Noturno / Pergaminho (Completo)</option>
                  <option value="light">Modo Leve A4 (Economia de Tinta Sulfite)</option>
                </select>
              </div>

              {/* Duplex Alignment Selector */}
              <div className="flex items-center gap-1.5">
                <span className={`font-mono text-[11px] uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Duplex:
                </span>
                <select
                  value={duplexMode}
                  onChange={(e) => setDuplexMode(e.target.value as 'long-edge' | 'none' | 'short-edge')}
                  className={`rounded-lg px-2.5 py-1 text-xs border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-[#1c1c24] border-zinc-800 text-zinc-200'
                  }`}
                  title="Alinhamento automático das colunas para impressão frente e verso na impressora"
                >
                  <option value="long-edge">Borda Longa (Espelha Colunas - Padrão A4)</option>
                  <option value="none">Sem Espelhamento (Direto 1:1)</option>
                  <option value="short-edge">Borda Curta (Inverte Linhas)</option>
                </select>
              </div>

              {/* Crop Marks Toggle */}
              <label className={`flex items-center gap-1.5 cursor-pointer ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="w-4 h-4 rounded accent-red-600"
                />
                <span className="text-xs">Guias de Corte</span>
              </label>

              {/* Zoom Controls */}
              <div
                className={`flex items-center gap-1 p-0.5 rounded-lg border text-xs ${
                  isLight ? 'bg-white border-slate-300' : 'bg-[#1c1c24] border-zinc-800'
                }`}
              >
                <button
                  onClick={() => setPreviewScale((s) => Math.max(0.45, s - 0.08))}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] px-1 text-slate-500">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.0, s + 0.08))}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div
            className={`flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center ${
              isLight ? 'bg-slate-200/70' : 'bg-[#08080a]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-center gap-8">
              {/* Virtual Sheet: PÁGINA 1 (FRENTES) */}
              {(previewTab === 'page1' || previewTab === 'both') && (
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                    [PÁGINA 1 · FRENTES 2×2]
                  </span>
                  <div
                    style={{
                      width: `${Math.round(794 * previewScale)}px`,
                      height: `${Math.round(1123 * previewScale)}px`,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    className="rounded-lg shadow-2xl bg-white"
                  >
                    <div
                      id="multi-print-preview-front"
                      className="bg-white text-slate-900 p-8 relative flex flex-col justify-between"
                      style={{
                        width: '794px',
                        height: '1123px',
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Header sheet text */}
                      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-300 pb-2 mb-2 shrink-0">
                        <span>ORDEM PARANORMAL · GRID 2×2 A4</span>
                        <span className="font-bold text-slate-900">FRENTES DAS CARTAS</span>
                        <span>POKER SIZE (63×88mm)</span>
                      </div>

                      {/* 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 my-auto items-center justify-center">
                        {slots.map((r, idx) => (
                          <div key={`front-preview-${idx}`}>
                            {renderCardSlot(r, 'front', idx, 0.54)}
                          </div>
                        ))}
                      </div>

                      {/* Footer sheet text */}
                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-2 shrink-0">
                        <span>PÁGINA 1 DE 2</span>
                        <span>CORTE NAS GUIAS EXTERNAS</span>
                        <span>ESCALA: 100% (63mm × 88mm)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Virtual Sheet: PÁGINA 2 (VERSOS COM DUPLEX) */}
              {(previewTab === 'page2' || previewTab === 'both') && (
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                    [PÁGINA 2 · VERSOS 2×2 ({duplexMode === 'long-edge' ? 'DUPLEX ESPELHADO' : duplexMode === 'short-edge' ? 'BORDA CURTA' : 'DIRETO 1:1'})]
                  </span>
                  <div
                    style={{
                      width: `${Math.round(794 * previewScale)}px`,
                      height: `${Math.round(1123 * previewScale)}px`,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    className="rounded-lg shadow-2xl bg-white"
                  >
                    <div
                      id="multi-print-preview-back"
                      className="bg-white text-slate-900 p-8 relative flex flex-col justify-between"
                      style={{
                        width: '794px',
                        height: '1123px',
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Header sheet text */}
                      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-300 pb-2 mb-2 shrink-0">
                        <span>ORDEM PARANORMAL · GRID 2×2 A4</span>
                        <span className="font-bold text-slate-900">
                          VERSOS ({duplexMode === 'long-edge' ? 'BORDA LONGA - COLUNAS ESPELHADAS' : duplexMode === 'short-edge' ? 'BORDA CURTA - LINHAS INVERTIDAS' : 'SEM ESPELHAMENTO'})
                        </span>
                        <span>POKER SIZE (63×88mm)</span>
                      </div>

                      {/* 2x2 Grid with duplex mapping */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 my-auto items-center justify-center">
                        {slots.map((_, idx) => {
                          const backRitual = getBackSlotRitual(idx);
                          const sourceIndex = getSourceIndex(idx);
                          return (
                            <div key={`back-preview-${idx}`}>
                              {renderCardSlot(
                                backRitual,
                                'back',
                                idx,
                                0.54,
                                `Alinha com Carta ${sourceIndex + 1}`
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer sheet text */}
                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-2 shrink-0">
                        <span>PÁGINA 2 DE 2</span>
                        <span>ALINHA COM A PÁGINA 1 NO CORTE DUPLEX</span>
                        <span>ESCALA: 100% (63mm × 88mm)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Instructions & Actions */}
          <div
            className={`px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
              isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0d0d12]'
            }`}
          >
            {/* Duplex Instruction Note */}
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                <strong>Dica de Impressão Duplex:</strong> Configure sua impressora para &ldquo;Papel A4&rdquo;, &ldquo;Escala 100%&rdquo; e &ldquo;Frente e Verso: Virar na borda longa&rdquo;. As colunas são espelhadas automaticamente para que o verso coincida no corte.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportSheet('front')}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                    : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                }`}
                title="Exportar imagem PNG de alta resolução da página 1 (300 DPI)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Frentes (PNG)</span>
              </button>

              <button
                onClick={() => handleExportSheet('back')}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                    : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                }`}
                title="Exportar imagem PNG de alta resolução da página 2 (300 DPI)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Versos (PNG)</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-red-950/30 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Agora (Ctrl+P)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-red-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium animate-fade-in">
            <Check className="w-4 h-4 text-red-400" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DEDICATED PRINT CONTAINER (PORTALED DIRECTLY TO BODY)    */}
      {/* Strict A4 sheets with page breaks and zero blank pages   */}
      {/* ======================================================== */}
      {createPortal(
        <div className="print-container">
          {/* PÁGINA 1: FRENTES (GRID 2x2) */}
          <div className="page-a4-sheet">
            {/* Printable Top Sheet Header */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-4 shrink-0">
              <span>ORDEM PARANORMAL · FOLHA DE IMPRESSÃO EM LOTE (GRID 2×2)</span>
              <span className="font-bold text-slate-900">PÁGINA 1 · FRENTES</span>
              <span>POKER SIZE (63mm × 88mm)</span>
            </div>

            {/* 2x2 Grid of Fronts */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 my-auto items-center justify-center">
              {slots.map((r, idx) => (
                <div key={`front-sheet-slot-${idx}`}>
                  {renderCardSlot(r, 'front', idx, 0.54)}
                </div>
              ))}
            </div>

            {/* Printable Bottom Sheet Footer */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-4 shrink-0">
              <span>FORMATO POKER SIZE (63mm × 88mm)</span>
              <span>CORTE NAS GUIAS EXTERNAS</span>
              <span>ORDEM PARANORMAL RPG · GRIMÓRIO</span>
            </div>
          </div>

          {/* PÁGINA 2: VERSOS (GRID 2x2 COM ESPELHAMENTO DUPLEX) */}
          <div className="page-a4-sheet">
            {/* Printable Top Sheet Header */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-4 shrink-0">
              <span>ORDEM PARANORMAL · FOLHA DE IMPRESSÃO EM LOTE (GRID 2×2)</span>
              <span className="font-bold text-slate-900">
                PÁGINA 2 · VERSOS ({duplexMode === 'long-edge' ? 'DUPLEX ESPELHADO' : duplexMode === 'short-edge' ? 'BORDA CURTA' : 'DIRETO'})
              </span>
              <span>POKER SIZE (63mm × 88mm)</span>
            </div>

            {/* 2x2 Grid of Backs (with duplex mirrored placement) */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 my-auto items-center justify-center">
              {slots.map((_, idx) => {
                const backRitual = getBackSlotRitual(idx);
                const sourceIndex = getSourceIndex(idx);
                return (
                  <div key={`back-sheet-slot-${idx}`}>
                    {renderCardSlot(
                      backRitual,
                      'back',
                      idx,
                      0.54,
                      `Alinha com Carta ${sourceIndex + 1}`
                    )}
                  </div>
                );
              })}
            </div>

            {/* Printable Bottom Sheet Footer */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-4 shrink-0">
              <span>FORMATO POKER SIZE (63mm × 88mm)</span>
              <span>ALINHAMENTO COM A PÁGINA 1 (FRENTES)</span>
              <span>ORDEM PARANORMAL RPG · GRIMÓRIO</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
