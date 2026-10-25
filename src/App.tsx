import React, { useState, useEffect } from 'react';
import { Ritual } from './types';
import { PRESET_RITUALS } from './data/presets';
import { RitualCard } from './components/RitualCard';
import { EditorPanel } from './components/EditorPanel';
import { DeckManager } from './components/DeckManager';
import { PrintModal } from './components/PrintModal';
import { exportCardAsPng, sanitizeFilename } from './utils/exportCard';
import { soundEngine } from './utils/audio';
import { OccultSigil } from './components/OccultSigil';
import {
  Download,
  Printer,
  RotateCw,
  BookOpen,
  Volume2,
  VolumeX,
  Plus,
  Check,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'grimorio_paranormal_rituals_v3';

export default function App() {
  // Load saved rituals or initial presets, normalizing any legacy PE to PD
  const [rituals, setRituals] = useState<Ritual[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('grimorio_paranormal_rituals_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize legacy PE fields if found
          return parsed.map((item) => ({
            ...item,
            basePd: item.basePd || item.basePe || '1 PD',
            modifications: (item.modifications || []).map((m: { cost?: string }) => ({
              ...m,
              cost: (m.cost || '+2 PD').replace(/PE/g, 'PD'),
            })),
          }));
        }
      }
    } catch {
      // fallback
    }
    return PRESET_RITUALS;
  });

  // Current active ritual
  const [currentRitual, setCurrentRitual] = useState<Ritual>(() => rituals[0] || PRESET_RITUALS[0]);

  // Card view state
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [isFlipped3D, setIsFlipped3D] = useState(false);
  const [cardScale, setCardScale] = useState(1.0);
  const [previewMode, setPreviewMode] = useState<'single' | 'split'>('single');

  // Modals & Audio
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rituals));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }, [rituals]);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Update current ritual both in local state and within the deck
  const handleRitualChange = (updated: Ritual) => {
    setCurrentRitual(updated);
    setRituals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Create new blank ritual (Totalmente em PD)
  const handleCreateNewRitual = () => {
    const newRitual: Ritual = {
      id: `ritual-${Date.now()}`,
      name: 'Novo Ritual',
      element: 'sangue',
      symbolPreset: 'default',
      circle: 1,
      execution: 'Padrão',
      range: 'Toque',
      target: '1 criatura',
      duration: 'Instantânea',
      basePd: '1 PD',
      resistance: 'Nenhuma',
      description:
        'Descreva o efeito do ritual paranormal aqui. Você pode destacar termos usando **negrito**, rolagens como 2d6 ou custos em +2 PD.',
      modifications: [
        {
          id: `mod-${Date.now()}-1`,
          name: 'Discente',
          cost: '+2 PD',
          requirement: 'Requer 2º Círculo',
          text: 'Muda o efeito base aumentando a potência ou o alcance.',
        },
      ],
      flavorText: 'As palavras sussurradas abrem fendas na Realidade.',
      theme: {
        cornerStyle: 'chamfer',
        borderStyle: 'double-silver',
        bgTone: 'black',
        watermarkOpacity: 0.12,
        showFlavorText: true,
        accentGlow: true,
        backQuoteText: 'A Realidade é uma membrana frágil diante do Outro Lado.',
        backSigilStyle: 'grand-seal',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setRituals([newRitual, ...rituals]);
    setCurrentRitual(newRitual);
    setActiveView('front');
    setIsFlipped3D(false);
    showToast('Novo ritual criado no Grimório!');
  };

  // Duplicate current ritual
  const handleDuplicateRitual = (ritualToDup: Ritual) => {
    const duplicated: Ritual = {
      ...ritualToDup,
      id: `ritual-${Date.now()}`,
      name: `${ritualToDup.name} (Cópia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setRituals([duplicated, ...rituals]);
    setCurrentRitual(duplicated);
    showToast(`Ritual "${ritualToDup.name}" duplicado com sucesso!`);
  };

  // Delete ritual
  const handleDeleteRitual = (id: string) => {
    if (rituals.length <= 1) {
      showToast('O Grimório precisa ter pelo menos um ritual.');
      return;
    }
    const updated = rituals.filter((r) => r.id !== id);
    setRituals(updated);
    if (currentRitual.id === id) {
      setCurrentRitual(updated[0]);
    }
    showToast('Ritual removido do Grimório.');
  };

  // Reset to default presets
  const handleResetToDefaults = () => {
    setRituals(PRESET_RITUALS);
    setCurrentRitual(PRESET_RITUALS[0]);
    showToast('Rituais clássicos restaurados com sucesso.');
  };

  // Import deck from JSON
  const handleImportDeck = (imported: Ritual[]) => {
    setRituals(imported);
    if (imported.length > 0) {
      setCurrentRitual(imported[0]);
    }
  };

  // Flip card animation
  const handleToggleFlip = () => {
    soundEngine.playCardFlip();
    setIsFlipped3D(!isFlipped3D);
    setActiveView(activeView === 'front' ? 'back' : 'front');
  };

  // Toggle Ambient Audio
  const handleToggleAmbient = () => {
    const isPlaying = soundEngine.toggleAmbient();
    setIsAmbientPlaying(isPlaying);
    showToast(
      isPlaying
        ? '✦ Ambientação Paranormal Ativada'
        : 'Ambientação Paranormal Silenciada'
    );
  };

  // Export Front or Back PNG
  const handleExportPng = async (side: 'front' | 'back' | 'both') => {
    setIsExporting(true);
    soundEngine.playSigilChime(520);

    try {
      if (side === 'both') {
        // Export front first
        setActiveView('front');
        setIsFlipped3D(false);
        await new Promise((r) => setTimeout(r, 200));
        await exportCardAsPng(
          'main-preview-card',
          sanitizeFilename(currentRitual.name, 'frente'),
          2.5
        );

        // Then back
        setActiveView('back');
        setIsFlipped3D(true);
        await new Promise((r) => setTimeout(r, 300));
        await exportCardAsPng(
          'main-preview-card',
          sanitizeFilename(currentRitual.name, 'verso'),
          2.5
        );
        showToast('✦ Ambas as faces da carta foram exportadas em alta resolução!');
      } else {
        const sideTarget = side;
        if (sideTarget !== activeView) {
          setActiveView(sideTarget);
          setIsFlipped3D(sideTarget === 'back');
          await new Promise((r) => setTimeout(r, 200));
        }

        await exportCardAsPng(
          'main-preview-card',
          sanitizeFilename(currentRitual.name, sideTarget),
          2.5
        );
        showToast(`✦ Carta (${sideTarget.toUpperCase()}) salva em 300 DPI!`);
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-zinc-100 flex flex-col font-sans selection:bg-red-950 selection:text-red-200">
      {/* ======================================================== */}
      {/* TOP BAR CONTRACT: Zone 1 (Wordmark) — Zone 2 (Nav links) — Zone 3 (Primary Action) */}
      {/* ======================================================== */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-zinc-800/80 bg-[#0d0d12]/95 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shadow-xs">
            <OccultSigil
              element={currentRitual.element}
              symbolPreset={currentRitual.symbolPreset}
              customIconUrl={currentRitual.customElementIcon}
              size={20}
            />
          </div>
          <span className="font-cinzel text-base font-bold tracking-wider text-white">
            Grimório Paranormal
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            PD Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links & Deck Manager Quick Access */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <button
            onClick={() => setIsDeckOpen(true)}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Deck de Rituais ({rituals.length})</span>
          </button>

          <button
            onClick={handleCreateNewRitual}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>Novo Ritual</span>
          </button>

          <button
            onClick={() => setIsPrintOpen(true)}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            <span>Folha de Impressão</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Atmosphere, Quick Export) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Ambient Sound Toggle */}
          <button
            onClick={handleToggleAmbient}
            title={
              isAmbientPlaying
                ? 'Desativar som ambiente'
                : 'Ativar som ambiente paranormal'
            }
            className={`p-2 rounded-lg border transition-all ${
              isAmbientPlaying
                ? 'bg-red-950/70 border-red-800 text-red-300 shadow-xs'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isAmbientPlaying ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Quick Deck Button on mobile */}
          <button
            onClick={() => setIsDeckOpen(true)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
            title="Abrir Grimório"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Primary Action Button: Export PNG */}
          <div className="relative group">
            <button
              onClick={() => handleExportPng(activeView)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-lg shadow-lg shadow-red-950/40 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Renderizando...' : 'Exportar Carta (PNG)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN WORKSPACE: Split View (Editor on Left, Live Preview on Right) */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Comprehensive Live Editor Panel */}
        <section className="lg:col-span-6 xl:col-span-5 h-[calc(100vh-120px)] min-h-[640px] sticky top-20">
          <EditorPanel
            ritual={currentRitual}
            onChange={handleRitualChange}
            activeView={activeView}
            setActiveView={(v) => {
              setActiveView(v);
              setIsFlipped3D(v === 'back');
            }}
          />
        </section>

        {/* RIGHT COLUMN: Live Card Preview & Controls */}
        <section className="lg:col-span-6 xl:col-span-7 flex flex-col items-center">
          {/* Preview Toolbar */}
          <div className="w-full max-w-[580px] mb-4 p-3 bg-[#131319] border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
            {/* View Mode Toggle: Single (with 3D Flip) or Side-by-Side Split */}
            <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setPreviewMode('single')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  previewMode === 'single'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Modo Foco
              </button>
              <button
                onClick={() => setPreviewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  previewMode === 'split'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lado a Lado</span>
              </button>
            </div>

            {/* Flip Card Action Button (Single mode) */}
            {previewMode === 'single' && (
              <button
                onClick={handleToggleFlip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium border border-zinc-700/60 transition-colors shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Girar Carta ({activeView === 'front' ? 'Ver Verso' : 'Ver Frente'})</span>
              </button>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#1a1a24] p-1 rounded-lg border border-zinc-800 text-xs text-zinc-300">
              <button
                onClick={() => setCardScale((s) => Math.max(0.75, s - 0.1))}
                title="Diminuir Zoom"
                className="p-1 hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 text-zinc-400">
                {Math.round(cardScale * 100)}%
              </span>
              <button
                onClick={() => setCardScale((s) => Math.min(1.3, s + 0.1))}
                title="Aumentar Zoom"
                className="p-1 hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Presentation Canvas */}
          <div className="w-full flex flex-col items-center justify-center p-6 bg-[#09090d] border border-zinc-800/90 rounded-2xl shadow-2xl relative overflow-hidden min-h-[660px]">
            {/* Occult background ambient pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1c1c28_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

            {previewMode === 'single' ? (
              /* SINGLE CARD VIEW WITH 3D FLIP */
              <div className="perspective-1000 my-auto py-2">
                <div
                  className={`transition-transform duration-500 transform-style-3d ${
                    isFlipped3D ? 'rotate-y-180' : ''
                  }`}
                >
                  <RitualCard
                    id="main-preview-card"
                    ritual={currentRitual}
                    viewSide={activeView}
                    scale={cardScale}
                  />
                </div>
              </div>
            ) : (
              /* SIDE-BY-SIDE DUAL PREVIEW (FRONT & BACK) */
              <div className="flex flex-wrap items-center justify-center gap-8 my-auto py-4">
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                    ✦ FACE PRINCIPAL (FRENTE)
                  </span>
                  <RitualCard
                    id="main-preview-card-front"
                    ritual={currentRitual}
                    viewSide="front"
                    scale={Math.min(0.92, cardScale)}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                    ✦ FACE OCULTA (VERSO)
                  </span>
                  <RitualCard
                    id="main-preview-card-back"
                    ritual={currentRitual}
                    viewSide="back"
                    scale={Math.min(0.92, cardScale)}
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative z-10">
              <button
                onClick={() => handleExportPng('front')}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Exportar Frente</span>
              </button>

              <button
                onClick={() => handleExportPng('back')}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Exportar Verso</span>
              </button>

              <button
                onClick={() => handleExportPng('both')}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800 hover:bg-red-900 text-xs text-red-200 transition-colors shadow-xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Exportar Ambas (Bundle)</span>
              </button>

              <button
                onClick={() => setIsPrintOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span>Imprimir Cartas (63×88mm)</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#181822] border border-red-600/70 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in text-xs font-medium">
          <Check className="w-4 h-4 text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Deck / Grimoire Manager Modal */}
      <DeckManager
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
        rituals={rituals}
        currentRitualId={currentRitual.id}
        onSelectRitual={(r) => {
          setCurrentRitual(r);
          setActiveView('front');
          setIsFlipped3D(false);
        }}
        onCreateNewRitual={handleCreateNewRitual}
        onDuplicateRitual={handleDuplicateRitual}
        onDeleteRitual={handleDeleteRitual}
        onResetToDefaults={handleResetToDefaults}
        onImportDeck={handleImportDeck}
      />

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        ritual={currentRitual}
      />
    </div>
  );
}
