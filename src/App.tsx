import React, { useState, useEffect } from 'react';
import { Ritual } from './types';
import { PRESET_RITUALS } from './data/presets';
import { RitualCard } from './components/RitualCard';
import { EditorPanel } from './components/EditorPanel';
import { DeckManager } from './components/DeckManager';
import { PrintModal } from './components/PrintModal';
import { LightPrintModal } from './components/LightPrintModal';
import { MultiCardPrintModal } from './components/MultiCardPrintModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { exportCardAsPng, sanitizeFilename, safeSaveToLocalStorage } from './utils/exportCard';
import { healCorruptedCharacters } from './utils/textFormatter';
import { soundEngine } from './utils/audio';
import { OccultSigil } from './components/OccultSigil';
import { isAdminAuthenticated, logoutAdmin } from './utils/adminAuth';
import { publishRitualToPublicDeck } from './utils/publicDeck';
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
  Sun,
  Moon,
  Feather,
  Grid2X2,
  Shield,
  ShieldCheck,
  Globe,
  Share2,
} from 'lucide-react';

const STORAGE_KEY = 'grimorio_paranormal_rituals_v3';

export default function App() {
  // Application UI Mode: dark or light
  const [appMode, setAppMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('grimorio_paranormal_theme_ui');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleAppMode = () => {
    setAppMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('grimorio_paranormal_theme_ui', next);
      } catch {}
      showToast(
        next === 'light'
          ? 'Modo Claro ativado na interface'
          : 'Modo Escuro ativado na interface'
      );
      return next;
    });
  };

  // Load saved rituals or initial presets, normalizing any legacy PE to PD and healing corrupted characters
  const [rituals, setRituals] = useState<Ritual[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('grimorio_paranormal_rituals_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize legacy PE fields and heal any corrupted accent characters
          return parsed.map((item) => ({
            ...item,
            name: healCorruptedCharacters(item.name || ''),
            description: healCorruptedCharacters(item.description || ''),
            execution: healCorruptedCharacters(item.execution || ''),
            range: healCorruptedCharacters(item.range || ''),
            target: healCorruptedCharacters(item.target || ''),
            duration: healCorruptedCharacters(item.duration || ''),
            resistance: healCorruptedCharacters(item.resistance || ''),
            flavorText: healCorruptedCharacters(item.flavorText || ''),
            basePd: item.basePd || item.basePe || '1 PD',
            modifications: (item.modifications || []).map((m: { id: string; name?: string; text?: string; cost?: string; requirement?: string }) => ({
              ...m,
              name: healCorruptedCharacters(m.name || ''),
              text: healCorruptedCharacters(m.text || ''),
              requirement: healCorruptedCharacters(m.requirement || ''),
              cost: (m.cost || '+2 PD').replace(/PE/g, 'PD'),
            })),
            theme: {
              ...item.theme,
              backQuoteText: healCorruptedCharacters(item.theme?.backQuoteText || ''),
            },
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
  const [isLightPrintOpen, setIsLightPrintOpen] = useState(false);
  const [isMultiPrintOpen, setIsMultiPrintOpen] = useState(false);
  const [multiPrintRituals, setMultiPrintRituals] = useState<Ritual[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAdminAuthenticated());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const custom = e as CustomEvent<{ isAuthenticated: boolean }>;
      if (custom.detail && typeof custom.detail.isAuthenticated === 'boolean') {
        setIsAdminLoggedIn(custom.detail.isAuthenticated);
      } else {
        setIsAdminLoggedIn(isAdminAuthenticated());
      }
    };
    window.addEventListener('admin-auth-changed', handleAuthChange);
    return () => window.removeEventListener('admin-auth-changed', handleAuthChange);
  }, []);

  const handleOpenAdminModal = () => {
    setIsAdminModalOpen(true);
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    setIsAdminLoggedIn(false);
    showToast('Modo Administrador encerrado.');
  };

  // Copy ritual from public community deck to user's private grimoire
  const handleCopyFromPublicDeck = (pubRitual: Ritual) => {
    const clone: Ritual = {
      ...pubRitual,
      id: `ritual-${Date.now()}`,
      name: `${pubRitual.name} (Cópia)`,
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [clone, ...rituals];
    setRituals(updated);
    setCurrentRitual(clone);
    setActiveView('front');
    setIsFlipped3D(false);
    showToast(`✦ Ritual "${pubRitual.name}" adicionado ao seu Grimório!`);
  };

  // Publish current active ritual directly to the public community grimoire
  const handlePublishCurrentRitual = () => {
    soundEngine.playSigilChime(640);
    const res = publishRitualToPublicDeck(currentRitual, 'Agente Ocultista');
    showToast(res.message);
  };

  const handleOpenMultiPrint = (selected: Ritual[]) => {
    setMultiPrintRituals(selected);
    setIsMultiPrintOpen(true);
  };

  // Sync to localStorage safely
  useEffect(() => {
    const result = safeSaveToLocalStorage(STORAGE_KEY, rituals);
    if (!result.success) {
      console.warn('LocalStorage limit reached');
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
        cardMode: 'dark',
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

  const isLightApp = appMode === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isLightApp
          ? 'bg-[#f4f5f9] text-slate-900 selection:bg-red-200 selection:text-red-950'
          : 'bg-[#0b0b0f] text-zinc-100 selection:bg-red-950 selection:text-red-200'
      }`}
    >
      {/* ======================================================== */}
      {/* TOP BAR CONTRACT: Zone 1 (Wordmark) — Zone 2 (Nav links) — Zone 3 (Primary Action) */}
      {/* ======================================================== */}
      <header
        className={`flex items-center justify-between gap-8 px-6 py-3.5 border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isLightApp
            ? 'border-slate-200 bg-white/95'
            : 'border-zinc-800/80 bg-[#0d0d12]/95'
        }`}
      >
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
          <span
            className={`font-title text-base font-bold tracking-wider ${
              isLightApp ? 'text-slate-900' : 'text-white'
            }`}
          >
            Grimório Paranormal
          </span>
          <span
            className={`hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded border ${
              isLightApp
                ? 'text-slate-600 bg-slate-100 border-slate-300'
                : 'text-zinc-400 bg-zinc-900 border-zinc-800'
            }`}
          >
            PD Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links & Deck Manager Quick Access */}
        <nav
          className={`hidden md:flex items-center gap-6 text-sm font-medium ${
            isLightApp ? 'text-slate-600' : 'text-zinc-300'
          }`}
        >
          <button
            onClick={() => setIsDeckOpen(true)}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
              isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Deck de Rituais ({rituals.length})</span>
          </button>

          <button
            onClick={handleCreateNewRitual}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>Novo Ritual</span>
          </button>

          <button
            onClick={() => setIsPrintOpen(true)}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            <span>Folha Padrão (63×88)</span>
          </button>

          <button
            onClick={() => setIsLightPrintOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 shadow-xs ${
              isLightApp
                ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300'
                : 'bg-blue-950/70 border-blue-800/80 text-blue-300 hover:bg-blue-900 hover:text-white'
            }`}
            title="Versão de Impressão Leve (A4) - Fundo 100% Branco e Economia de Tinta"
          >
            <Feather className="w-3.5 h-3.5 text-blue-400" />
            <span>Versão de Impressão Leve (A4)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Light/Dark Toggle, Atmosphere, Quick Export) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleAppMode}
            title={
              isLightApp
                ? 'Alternar para Modo Escuro na interface'
                : 'Alternar para Modo Claro na interface'
            }
            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
              isLightApp
                ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200 hover:text-amber-700 shadow-xs'
                : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800 hover:text-amber-300'
            }`}
          >
            {isLightApp ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

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
                : isLightApp
                ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
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
            className={`md:hidden p-2 rounded-lg border ${
              isLightApp
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
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
            appMode={appMode}
            onOpenLightPrint={() => setIsLightPrintOpen(true)}
          />
        </section>

        {/* RIGHT COLUMN: Live Card Preview & Controls */}
        <section className="lg:col-span-6 xl:col-span-7 flex flex-col items-center">
          {/* Preview Toolbar */}
          <div
            className={`w-full max-w-[580px] mb-4 p-3 border rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg transition-colors ${
              isLightApp
                ? 'bg-white border-slate-200'
                : 'bg-[#131319] border-zinc-800'
            }`}
          >
            {/* View Mode Toggle: Single (with 3D Flip) or Side-by-Side Split */}
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                isLightApp
                  ? 'bg-slate-100 border-slate-300'
                  : 'bg-[#1a1a24] border-zinc-800'
              }`}
            >
              <button
                onClick={() => setPreviewMode('single')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  previewMode === 'single'
                    ? isLightApp
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-zinc-700 text-white font-semibold'
                    : isLightApp
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Modo Foco
              </button>
              <button
                onClick={() => setPreviewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  previewMode === 'split'
                    ? isLightApp
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-zinc-700 text-white font-semibold'
                    : isLightApp
                    ? 'text-slate-600 hover:text-slate-900'
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-xs ${
                  isLightApp
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700/60'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Girar Carta ({activeView === 'front' ? 'Ver Verso' : 'Ver Frente'})</span>
              </button>
            )}

            {/* Zoom Controls */}
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                isLightApp
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-[#1a1a24] border-zinc-800 text-zinc-300'
              }`}
            >
              <button
                onClick={() => setCardScale((s) => Math.max(0.75, s - 0.1))}
                title="Diminuir Zoom"
                className={isLightApp ? 'p-1 hover:text-slate-950' : 'p-1 hover:text-white'}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span
                className={`font-mono text-[11px] px-1 ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                {Math.round(cardScale * 100)}%
              </span>
              <button
                onClick={() => setCardScale((s) => Math.min(1.3, s + 0.1))}
                title="Aumentar Zoom"
                className={isLightApp ? 'p-1 hover:text-slate-950' : 'p-1 hover:text-white'}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Presentation Canvas */}
          <div
            className={`w-full flex flex-col items-center justify-center p-6 border rounded-2xl shadow-2xl relative overflow-hidden min-h-[660px] transition-colors ${
              isLightApp
                ? 'bg-[#e2e8f0]/70 border-slate-300 shadow-inner'
                : 'bg-[#09090d] border-zinc-800/90'
            }`}
          >
            {/* Occult background ambient pattern */}
            <div
              className={`absolute inset-0 [background-size:24px_24px] pointer-events-none ${
                isLightApp
                  ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] opacity-35'
                  : 'bg-[radial-gradient(#1c1c28_1px,transparent_1px)] opacity-40'
              }`}
            />

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
                  <span
                    className={`text-[11px] font-mono uppercase tracking-widest mb-2 ${
                      isLightApp ? 'text-slate-500' : 'text-zinc-500'
                    }`}
                  >
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
                  <span
                    className={`text-[11px] font-mono uppercase tracking-widest mb-2 ${
                      isLightApp ? 'text-slate-500' : 'text-zinc-500'
                    }`}
                  >
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors shadow-xs ${
                  isLightApp
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'bg-zinc-900 border-zinc-700/80 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Exportar Frente</span>
              </button>

              <button
                onClick={() => handleExportPng('back')}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors shadow-xs ${
                  isLightApp
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'bg-zinc-900 border-zinc-700/80 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Exportar Verso</span>
              </button>

              <button
                onClick={() => handleExportPng('both')}
                disabled={isExporting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors shadow-xs font-medium ${
                  isLightApp
                    ? 'bg-red-700 border-red-700 hover:bg-red-800 text-white shadow-md'
                    : 'bg-red-950/80 border border-red-800 hover:bg-red-900 text-red-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-red-300" />
                <span>Exportar Ambas (Bundle)</span>
              </button>

              <button
                onClick={() => setIsPrintOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors shadow-xs ${
                  isLightApp
                    ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'bg-zinc-900 border-zinc-700/80 hover:bg-zinc-800 text-zinc-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span>Imprimir Padrão (63×88mm)</span>
              </button>

              <button
                onClick={() => setIsLightPrintOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs ${
                  isLightApp
                    ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-900'
                    : 'bg-blue-950/70 border-blue-800/80 hover:bg-blue-900 text-blue-200'
                }`}
                title="Versão de Impressão Leve (A4) - Fundo 100% Branco e Economia de Tinta"
              >
                <Feather className="w-3.5 h-3.5 text-blue-400" />
                <span>Impressão Leve (A4)</span>
              </button>

              <button
                onClick={() => {
                  setMultiPrintRituals([currentRitual]);
                  setIsMultiPrintOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs ${
                  isLightApp
                    ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-900'
                    : 'bg-amber-950/70 border-amber-800/80 hover:bg-amber-900 text-amber-200'
                }`}
                title="Imprimir até 4 cartas em uma folha A4 em formato Grid 2×2 com alinhamento duplex"
              >
                <Grid2X2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Grade 2×2 (A4)</span>
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
        onOpenMultiPrint={handleOpenMultiPrint}
        appMode={appMode}
      />

      {/* Print Modal (Classic 63x88mm Cards) */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        ritual={currentRitual}
        appMode={appMode}
      />

      {/* Light Print Modal (Versão de Impressão Leve - Economia de Tinta / Ficha Limpa) */}
      <LightPrintModal
        isOpen={isLightPrintOpen}
        onClose={() => setIsLightPrintOpen(false)}
        ritual={currentRitual}
        appMode={appMode}
      />

      {/* Multi-Card Batch Print Modal (Grid 2x2 A4 com Alinhamento Duplex) */}
      <MultiCardPrintModal
        isOpen={isMultiPrintOpen}
        onClose={() => setIsMultiPrintOpen(false)}
        rituals={multiPrintRituals.length > 0 ? multiPrintRituals : [currentRitual]}
        appMode={appMode}
      />
    </div>
  );
}
