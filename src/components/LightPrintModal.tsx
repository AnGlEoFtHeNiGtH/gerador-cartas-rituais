import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Ritual } from '../types';
import { LightPrintCard } from './LightPrintCard';
import { exportCardAsPng, sanitizeFilename } from '../utils/exportCard';
import { soundEngine } from '../utils/audio';
import {
  Printer,
  X,
  Download,
  Layers,
  Sparkles,
  Check,
  Feather,
  ZoomIn,
  ZoomOut,
  FileCheck,
} from 'lucide-react';

interface LightPrintModalProps {
  ritual: Ritual;
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
}

export const LightPrintModal: React.FC<LightPrintModalProps> = ({
  ritual,
  isOpen,
  onClose,
  appMode = 'dark',
}) => {
  const isLight = appMode === 'light';
  const [layout, setLayout] = useState<'both' | 'single-sheet' | 'front-only' | 'back-only'>('both');
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.85);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const basePdValue =
    ritual.basePd || (ritual as unknown as { basePe?: string }).basePe || '1 PD';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handlePrint = () => {
    soundEngine.playCardFlip();
    window.print();
  };

  // Export Single Face (Front or Back)
  const handleExportSingle = async (side: 'front' | 'back') => {
    setIsExporting(true);
    soundEngine.playSigilChime(580);
    const elementId = side === 'front' ? 'light-print-card-front' : 'light-print-card-back';
    const filename = sanitizeFilename(ritual.name, `leve-${side}`);

    try {
      const success = await exportCardAsPng(elementId, filename, 2.5);
      if (success) {
        showToast(`✦ Face ${side === 'front' ? 'Frente' : 'Verso'} Leve exportada em 300 DPI!`);
      } else {
        showToast('Falha ao exportar imagem. Tente novamente.');
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar a carta.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export Complete Bundle Sheet (Side-by-Side Front and Back)
  const handleExportFullSheet = async () => {
    setIsExporting(true);
    soundEngine.playSigilChime(640);
    const filename = sanitizeFilename(ritual.name, 'folha-leve-completa-a4');

    try {
      const success = await exportCardAsPng('light-print-virtual-sheet', filename, 2.5);
      if (success) {
        showToast('✦ Folha Completa (Frente e Verso) exportada em alta resolução!');
      } else {
        showToast('Falha ao exportar folha completa.');
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar folha completa.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* ON-SCREEN MODAL UI (HIDDEN COMPLETELY DURING PRINT)       */}
      {/* ======================================================== */}
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div
          className={`relative w-full max-w-5xl max-h-[92vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors ${
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
              <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-300 shadow-xs">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={`font-cinzel text-base font-bold tracking-wide ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Versão de Impressão Leve (A4)
                  </h2>
                  <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                    Economia de Tinta
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Fundo 100% branco, traços minimalistas e paginação A4 sem folhas em branco
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                title="Imprimir folha limpa sem páginas em branco"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {layout === 'both'
                    ? 'Imprimir 2 Páginas (Frente e Verso)'
                    : layout === 'single-sheet'
                    ? 'Imprimir 1 Folha (Ambas Lado a Lado)'
                    : layout === 'front-only'
                    ? 'Imprimir Frente (1 Página)'
                    : 'Imprimir Verso (1 Página)'}
                </span>
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

          {/* Action Toolbar */}
          <div
            className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-4 text-xs ${
              isLight ? 'border-slate-200 bg-slate-100/90' : 'border-zinc-800 bg-[#14141a]'
            }`}
          >
            {/* Layout Mode Selector */}
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[11px] uppercase ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Paginação / Formato:
              </span>
              <div
                className={`flex items-center gap-1 p-1 rounded-lg border ${
                  isLight ? 'bg-white border-slate-300' : 'bg-[#1c1c24] border-zinc-800'
                }`}
              >
                <button
                  onClick={() => setLayout('both')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    layout === 'both'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'bg-zinc-700 text-white font-semibold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="2 páginas A4: Frente na pág. 1 e Verso na pág. 2 (Tamanho original)"
                >
                  2 Páginas (Frente + Verso)
                </button>
                <button
                  onClick={() => setLayout('single-sheet')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    layout === 'single-sheet'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'bg-zinc-700 text-white font-semibold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="1 página A4: Ambas as faces lado a lado (Economiza papel sulfite)"
                >
                  1 Folha (Ambas Lado a Lado)
                </button>
                <button
                  onClick={() => setLayout('front-only')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    layout === 'front-only'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'bg-zinc-700 text-white font-semibold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Apenas Frente
                </button>
                <button
                  onClick={() => setLayout('back-only')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    layout === 'back-only'
                      ? isLight
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'bg-zinc-700 text-white font-semibold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Apenas Verso
                </button>
              </div>
            </div>

            {/* Crop Marks & Zoom Controls */}
            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-2 cursor-pointer ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="w-4 h-4 rounded accent-slate-900"
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
                  onClick={() => setPreviewScale((s) => Math.max(0.65, s - 0.1))}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] px-1 text-slate-500">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.15, s + 0.1))}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Virtual Sheet Preview Container */}
          <div
            className={`flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center ${
              isLight ? 'bg-slate-200/70' : 'bg-[#08080a]'
            }`}
          >
            {/* Virtual Sheet Container to be previewed and exported via HTML2Canvas */}
            <div
              id="light-print-virtual-sheet"
              className="bg-white text-slate-900 p-6 md:p-8 rounded-lg shadow-2xl relative flex flex-wrap items-center justify-center gap-8 min-h-[520px]"
              style={{
                width: layout === 'both' || layout === 'single-sheet' ? `${920 * previewScale}px` : `${500 * previewScale}px`,
                maxWidth: '100%',
              }}
            >
              {/* FACE 1: FRENTE LEVE */}
              {(layout === 'both' || layout === 'single-sheet' || layout === 'front-only') && (
                <div className="relative flex flex-col items-center">
                  {showCropMarks && (
                    <>
                      <div className="absolute -top-4 w-px h-3 bg-slate-900/60" />
                      <div className="absolute -bottom-4 w-px h-3 bg-slate-900/60" />
                      <div className="absolute -left-4 h-px w-3 bg-slate-900/60" />
                      <div className="absolute -right-4 h-px w-3 bg-slate-900/60" />
                    </>
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5 no-print">
                    [FACE 1 · FRENTE LEVE]
                  </span>
                  <LightPrintCard
                    id="light-print-card-front"
                    ritual={ritual}
                    viewSide="front"
                    scale={previewScale}
                  />
                </div>
              )}

              {/* FACE 2: VERSO LEVE */}
              {(layout === 'both' || layout === 'single-sheet' || layout === 'back-only') && (
                <div className="relative flex flex-col items-center">
                  {showCropMarks && (
                    <>
                      <div className="absolute -top-4 w-px h-3 bg-slate-900/60" />
                      <div className="absolute -bottom-4 w-px h-3 bg-slate-900/60" />
                      <div className="absolute -left-4 h-px w-3 bg-slate-900/60" />
                      <div className="absolute -right-4 h-px w-3 bg-slate-900/60" />
                    </>
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5 no-print">
                    [FACE 2 · VERSO LEVE]
                  </span>
                  <LightPrintCard
                    id="light-print-card-back"
                    ritual={ritual}
                    viewSide="back"
                    scale={previewScale}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Export Bar */}
          <div
            className={`px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
              isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0d0d12]'
            }`}
          >
            {/* Info note */}
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {layout === 'both'
                  ? 'Impressão A4: 2 páginas limpas (Frente e Verso com quebra de página automática).'
                  : layout === 'single-sheet'
                  ? 'Impressão A4: 1 folha compacta contendo Frente e Verso lado a lado.'
                  : 'Impressão A4: 1 página individual.'}
              </span>
            </div>

            {/* Export Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* 1. Export Front PNG */}
              <button
                onClick={() => handleExportSingle('front')}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                    : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Frente Leve (PNG)</span>
              </button>

              {/* 2. Export Back PNG */}
              <button
                onClick={() => handleExportSingle('back')}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                    : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Verso Leve (PNG)</span>
              </button>

              {/* 3. Export Full Sheet PNG (Bundle) */}
              <button
                onClick={handleExportFullSheet}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Exportar Bundle Completo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-blue-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium animate-fade-in">
            <Check className="w-4 h-4 text-blue-400" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DEDICATED PRINT CONTAINER (PORTALED DIRECTLY TO BODY)    */}
      {/* Strict A4 sheets with page breaks, zero trailing pages    */}
      {/* ======================================================== */}
      {createPortal(
        <div className="print-container">
          {/* LAYOUT: 'both' - 2 Páginas A4 Separadas (Page 1 = Frente, Page 2 = Verso) */}
          {layout === 'both' && (
            <>
              {/* PAGE 1: FRENTE LEVE */}
              <div className="page-a4-sheet">
                <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-6">
                  <span>ORDEM PARANORMAL · FICHA DE CAMPO LEVE</span>
                  <span className="font-bold text-slate-800">FACE 1 · FRENTE · {ritual.name}</span>
                  <span>CUSTO: {basePdValue}</span>
                </div>

                <div className="relative flex flex-col items-center justify-center my-auto">
                  {showCropMarks && (
                    <>
                      {/* Corner crop lines */}
                      <div className="absolute -top-6 left-0 w-px h-5 bg-slate-900" />
                      <div className="absolute -top-6 right-0 w-px h-5 bg-slate-900" />
                      <div className="absolute -bottom-6 left-0 w-px h-5 bg-slate-900" />
                      <div className="absolute -bottom-6 right-0 w-px h-5 bg-slate-900" />
                      <div className="absolute top-0 -left-6 h-px w-5 bg-slate-900" />
                      <div className="absolute bottom-0 -left-6 h-px w-5 bg-slate-900" />
                      <div className="absolute top-0 -right-6 h-px w-5 bg-slate-900" />
                      <div className="absolute bottom-0 -right-6 h-px w-5 bg-slate-900" />
                    </>
                  )}
                  <LightPrintCard ritual={ritual} viewSide="front" scale={1} />
                </div>

                <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-6">
                  <span>FORMATO POKER SIZE (63mm × 88mm)</span>
                  <span>CORTE NAS GUIAS EXTERNAS</span>
                  <span>ECONOMIA DE TINTA · 100% BRANCO</span>
                </div>
              </div>

              {/* PAGE 2: VERSO LEVE */}
              <div className="page-a4-sheet">
                <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-6">
                  <span>ORDEM PARANORMAL · FICHA DE CAMPO LEVE</span>
                  <span className="font-bold text-slate-800">FACE 2 · VERSO · APRIMORAMENTOS & SIGILOS</span>
                  <span>ELEMENTO: {ritual.element.toUpperCase()}</span>
                </div>

                <div className="relative flex flex-col items-center justify-center my-auto">
                  {showCropMarks && (
                    <>
                      {/* Corner crop lines */}
                      <div className="absolute -top-6 left-0 w-px h-5 bg-slate-900" />
                      <div className="absolute -top-6 right-0 w-px h-5 bg-slate-900" />
                      <div className="absolute -bottom-6 left-0 w-px h-5 bg-slate-900" />
                      <div className="absolute -bottom-6 right-0 w-px h-5 bg-slate-900" />
                      <div className="absolute top-0 -left-6 h-px w-5 bg-slate-900" />
                      <div className="absolute bottom-0 -left-6 h-px w-5 bg-slate-900" />
                      <div className="absolute top-0 -right-6 h-px w-5 bg-slate-900" />
                      <div className="absolute bottom-0 -right-6 h-px w-5 bg-slate-900" />
                    </>
                  )}
                  <LightPrintCard ritual={ritual} viewSide="back" scale={1} />
                </div>

                <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-6">
                  <span>FORMATO POKER SIZE (63mm × 88mm)</span>
                  <span>ALINHE COM A FACE 1 PARA IMPRESSÃO FRENTE/VERSO</span>
                  <span>ECONOMIA DE TINTA · 100% BRANCO</span>
                </div>
              </div>
            </>
          )}

          {/* LAYOUT: 'single-sheet' - Ambas as faces na mesma folha A4 (1 página única) */}
          {layout === 'single-sheet' && (
            <div className="page-a4-sheet">
              <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-4">
                <span>ORDEM PARANORMAL · FOLHA ECONÔMICA (FRENTE E VERSO)</span>
                <span className="font-bold text-slate-800">{ritual.name}</span>
                <span>CUSTO: {basePdValue}</span>
              </div>

              <div className="flex items-center justify-center gap-6 my-auto">
                {/* Front */}
                <div className="relative flex flex-col items-center">
                  {showCropMarks && (
                    <>
                      <div className="absolute -top-4 left-0 w-px h-3 bg-slate-900" />
                      <div className="absolute -top-4 right-0 w-px h-3 bg-slate-900" />
                      <div className="absolute -bottom-4 left-0 w-px h-3 bg-slate-900" />
                      <div className="absolute -bottom-4 right-0 w-px h-3 bg-slate-900" />
                      <div className="absolute top-0 -left-4 h-px w-3 bg-slate-900" />
                      <div className="absolute bottom-0 -left-4 h-px w-3 bg-slate-900" />
                      <div className="absolute top-0 -right-4 h-px w-3 bg-slate-900" />
                      <div className="absolute bottom-0 -right-4 h-px w-3 bg-slate-900" />
                    </>
                  )}
                  <LightPrintCard ritual={ritual} viewSide="front" scale={0.76} />
                </div>

                {/* Back */}
                <div className="relative flex flex-col items-center">
                  {showCropMarks && (
                    <>
                      <div className="absolute -top-4 left-0 w-px h-3 bg-slate-900" />
                      <div className="absolute -top-4 right-0 w-px h-3 bg-slate-900" />
                      <div className="absolute -bottom-4 left-0 w-px h-3 bg-slate-900" />
                      <div className="absolute -bottom-4 right-0 w-px h-3 bg-slate-900" />
                      <div className="absolute top-0 -left-4 h-px w-3 bg-slate-900" />
                      <div className="absolute bottom-0 -left-4 h-px w-3 bg-slate-900" />
                      <div className="absolute top-0 -right-4 h-px w-3 bg-slate-900" />
                      <div className="absolute bottom-0 -right-4 h-px w-3 bg-slate-900" />
                    </>
                  )}
                  <LightPrintCard ritual={ritual} viewSide="back" scale={0.76} />
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-4">
                <span>DOBRE AO MEIO OU RECORTE PARA SLEEVE</span>
                <span>1 FOLHA SULFITE A4 COMPACTA</span>
                <span>ECONOMIA TOTAL DE PAPEL & TINTA</span>
              </div>
            </div>
          )}

          {/* LAYOUT: 'front-only' - Apenas Face 1 (1 página única) */}
          {layout === 'front-only' && (
            <div className="page-a4-sheet">
              <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-6">
                <span>ORDEM PARANORMAL · FICHA DE CAMPO LEVE</span>
                <span className="font-bold text-slate-800">FACE 1 · FRENTE · {ritual.name}</span>
                <span>CUSTO: {basePdValue}</span>
              </div>

              <div className="relative flex flex-col items-center justify-center my-auto">
                {showCropMarks && (
                  <>
                    <div className="absolute -top-6 left-0 w-px h-5 bg-slate-900" />
                    <div className="absolute -top-6 right-0 w-px h-5 bg-slate-900" />
                    <div className="absolute -bottom-6 left-0 w-px h-5 bg-slate-900" />
                    <div className="absolute -bottom-6 right-0 w-px h-5 bg-slate-900" />
                    <div className="absolute top-0 -left-6 h-px w-5 bg-slate-900" />
                    <div className="absolute bottom-0 -left-6 h-px w-5 bg-slate-900" />
                    <div className="absolute top-0 -right-6 h-px w-5 bg-slate-900" />
                    <div className="absolute bottom-0 -right-6 h-px w-5 bg-slate-900" />
                  </>
                )}
                <LightPrintCard ritual={ritual} viewSide="front" scale={1} />
              </div>

              <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-6">
                <span>FORMATO POKER SIZE (63mm × 88mm)</span>
                <span>CORTE NAS GUIAS EXTERNAS</span>
                <span>ECONOMIA DE TINTA · 100% BRANCO</span>
              </div>
            </div>
          )}

          {/* LAYOUT: 'back-only' - Apenas Face 2 (1 página única) */}
          {layout === 'back-only' && (
            <div className="page-a4-sheet">
              <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase border-b border-slate-300 pb-2 mb-6">
                <span>ORDEM PARANORMAL · FICHA DE CAMPO LEVE</span>
                <span className="font-bold text-slate-800">FACE 2 · VERSO · APRIMORAMENTOS & SIGILOS</span>
                <span>ELEMENTO: {ritual.element.toUpperCase()}</span>
              </div>

              <div className="relative flex flex-col items-center justify-center my-auto">
                {showCropMarks && (
                  <>
                    <div className="absolute -top-6 left-0 w-px h-5 bg-slate-900" />
                    <div className="absolute -top-6 right-0 w-px h-5 bg-slate-900" />
                    <div className="absolute -bottom-6 left-0 w-px h-5 bg-slate-900" />
                    <div className="absolute -bottom-6 right-0 w-px h-5 bg-slate-900" />
                    <div className="absolute top-0 -left-6 h-px w-5 bg-slate-900" />
                    <div className="absolute bottom-0 -left-6 h-px w-5 bg-slate-900" />
                    <div className="absolute top-0 -right-6 h-px w-5 bg-slate-900" />
                    <div className="absolute bottom-0 -right-6 h-px w-5 bg-slate-900" />
                  </>
                )}
                <LightPrintCard ritual={ritual} viewSide="back" scale={1} />
              </div>

              <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-300 pt-2 mt-6">
                <span>FORMATO POKER SIZE (63mm × 88mm)</span>
                <span>VERSO COM MODIFICAÇÕES DISCENTE/VERDADEIRO</span>
                <span>ECONOMIA DE TINTA · 100% BRANCO</span>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

