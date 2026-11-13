import React, { useState, useEffect } from 'react';
import { Ritual, ArsenalItem } from './types';
import { PRESET_RITUALS } from './data/presets';
import { PRESET_ITEMS } from './data/presetItems';
import { RitualCard } from './components/RitualCard';
import { ItemCard } from './components/ItemCard';
import { EditorPanel } from './components/EditorPanel';
import { ItemEditorPanel } from './components/ItemEditorPanel';
import { DeckManager } from './components/DeckManager';
import { ArsenalManager } from './components/ArsenalManager';
import { PrintModal } from './components/PrintModal';
import { LightPrintModal } from './components/LightPrintModal';
import { MultiCardPrintModal } from './components/MultiCardPrintModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WelcomeScreen } from './components/WelcomeScreen';
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
  Package,
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
          // Normalize legacy PE fields, heal corrupted accent characters and sanitize legacy v1 symbols
          return parsed.map((item) => ({
            ...item,
            symbolPreset: item.symbolPreset === 'custom' && item.customSymbolUrl ? 'custom' : 'default',
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

  // Global Welcome Screen & Workspace Switcher: 'rituals' (Grimório) vs 'arsenal' (Itens & Equipamentos)
  const [hasEnteredWorkspace, setHasEnteredWorkspace] = useState<boolean>(false);
  const [activeWorkspace, setActiveWorkspace] = useState<'rituals' | 'arsenal'>('rituals');

  // Arsenal Items state (persisted to localStorage)
  const ARSENAL_STORAGE_KEY = 'grimorio_paranormal_arsenal_v1';
  const [items, setItems] = useState<ArsenalItem[]>(() => {
    try {
      const saved = localStorage.getItem(ARSENAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: ArsenalItem) => ({
            ...item,
            name: healCorruptedCharacters(item.name || ''),
            description: healCorruptedCharacters(item.description || ''),
            flavorText: healCorruptedCharacters(item.flavorText || ''),
            curseName: item.curseName ? healCorruptedCharacters(item.curseName) : item.curseName,
            curseCost: item.curseCost ? healCorruptedCharacters(item.curseCost) : item.curseCost,
            theme: {
              ...item.theme,
              backQuoteText: healCorruptedCharacters(item.theme?.backQuoteText || ''),
            },
          }));
        }
      }
    } catch {}
    return PRESET_ITEMS;
  });

  // Current active arsenal item
  const [currentItem, setCurrentItem] = useState<ArsenalItem>(() => items[0] || PRESET_ITEMS[0]);
  const [isArsenalOpen, setIsArsenalOpen] = useState(false);

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
  const [isItemMultiPrintOpen, setIsItemMultiPrintOpen] = useState(false);
  const [multiPrintItems, setMultiPrintItems] = useState<ArsenalItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAdminAuthenticated());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [deckInitialTab, setDeckInitialTab] = useState<'private' | 'public'>('private');

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

  // Sync rituals to localStorage safely
  useEffect(() => {
    const result = safeSaveToLocalStorage(STORAGE_KEY, rituals);
    if (!result.success) {
      console.warn('LocalStorage limit reached for rituals');
    }
  }, [rituals]);

  // Sync arsenal items to localStorage safely
  useEffect(() => {
    const result = safeSaveToLocalStorage(ARSENAL_STORAGE_KEY, items);
    if (!result.success) {
      console.warn('LocalStorage limit reached for arsenal items');
    }
  }, [items]);

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

  // Update current arsenal item
  const handleItemChange = (updated: ArsenalItem) => {
    setCurrentItem(updated);
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
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

  // Create new blank arsenal item
  const handleCreateNewItem = () => {
    const code = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: ArsenalItem = {
      id: `item-${Date.now()}`,
      name: 'Novo Equipamento',
      itemType: 'mundano',
      subcategory: 'utilitario',
      categoryTier: 'I',
      inventorySlots: 1,
      description:
        'Descreva o funcionamento tático ou utilitário do item. Você pode usar formatação como **negrito**, dados como 2d8 ou testes de DT 20.',
      flavorText: 'Equipamento padrão catalogado pelos setores de inteligência da Ordo Realitas.',
      showUseTracker: true,
      maxUses: 4,
      currentUses: 0,
      theme: {
        cardMode: 'light',
        parchmentTone: 'classic-aged',
        borderStyle: 'rustic-tactical',
        itemCode: code,
        backQuoteText: 'Apenas os agentes preparados sobrevivem às sombras.',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setItems([newItem, ...items]);
    setCurrentItem(newItem);
    setActiveView('front');
    setIsFlipped3D(false);
    showToast('✦ Novo item adicionado ao Arsenal!');
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

  // Duplicate current arsenal item
  const handleDuplicateItem = (itemToDup: ArsenalItem) => {
    const duplicated: ArsenalItem = {
      ...itemToDup,
      id: `item-${Date.now()}`,
      name: `${itemToDup.name} (Cópia)`,
      itemCode: `${itemToDup.itemCode || 'ORD'}-CP`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setItems([duplicated, ...items]);
    setCurrentItem(duplicated);
    showToast(`✦ Item "${itemToDup.name}" duplicado com sucesso!`);
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

  // Delete arsenal item
  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      showToast('O Arsenal precisa ter pelo menos um item.');
      return;
    }
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    if (currentItem.id === id) {
      setCurrentItem(updated[0]);
    }
    showToast('Item removido do Arsenal.');
  };

  // Reset rituals to default presets
  const handleResetToDefaults = () => {
    setRituals(PRESET_RITUALS);
    setCurrentRitual(PRESET_RITUALS[0]);
    showToast('Rituais clássicos restaurados com sucesso.');
  };

  // Reset arsenal items to default presets
  const handleResetItemsToDefaults = () => {
    setItems(PRESET_ITEMS);
    setCurrentItem(PRESET_ITEMS[0]);
    showToast('Itens clássicos do Arsenal restaurados.');
  };

  // Import deck from JSON
  const handleImportDeck = (imported: Ritual[]) => {
    setRituals(imported);
    if (imported.length > 0) {
      setCurrentRitual(imported[0]);
    }
  };

  // Import arsenal items from JSON
  const handleImportItems = (imported: ArsenalItem[]) => {
    setItems(imported);
    if (imported.length > 0) {
      setCurrentItem(imported[0]);
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

  // Export Front or Back PNG (Works dynamically for both Rituals and Arsenal Items)
  const handleExportPng = async (side: 'front' | 'back' | 'both') => {
    setIsExporting(true);
    soundEngine.playSigilChime(520);

    const activeCardName = activeWorkspace === 'rituals' ? currentRitual.name : currentItem.name;

    try {
      if (side === 'both') {
        // Export front first
        setActiveView('front');
        setIsFlipped3D(false);
        await new Promise((r) => setTimeout(r, 200));
        await exportCardAsPng(
          'main-preview-card',
          sanitizeFilename(activeCardName, 'frente'),
          2.5
        );

        // Then back
        setActiveView('back');
        setIsFlipped3D(true);
        await new Promise((r) => setTimeout(r, 300));
        await exportCardAsPng(
          'main-preview-card',
          sanitizeFilename(activeCardName, 'verso'),
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
          sanitizeFilename(activeCardName, sideTarget),
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

  const handleSelectWorkspaceFromWelcome = (workspace: 'rituals' | 'arsenal') => {
    setActiveWorkspace(workspace);
    setActiveView('front');
    setIsFlipped3D(false);
    setHasEnteredWorkspace(true);
  };

  if (!hasEnteredWorkspace) {
    return (
      <>
        <WelcomeScreen
          onSelectWorkspace={handleSelectWorkspaceFromWelcome}
          ritualCount={rituals.length}
          itemCount={items.length}
          appMode={appMode}
          onToggleAppMode={toggleAppMode}
          isAmbientPlaying={isAmbientPlaying}
          onToggleAmbient={handleToggleAmbient}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminModal={handleOpenAdminModal}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#181822] border border-red-600/70 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in text-xs font-medium">
            <Check className="w-4 h-4 text-red-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <AdminLoginModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          appMode={appMode}
          isAdminAuthenticated={isAdminLoggedIn}
          onAuthStateChange={(isAuth) => setIsAdminLoggedIn(isAuth)}
        />
      </>
    );
  }

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
        {/* Zone 1: Wordmark & Global Workspace Switcher */}
        <div className="flex items-center gap-4 whitespace-nowrap shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playPageTurn();
              setHasEnteredWorkspace(false);
            }}
            title="Voltar ao Painel de Acesso Inicial"
            className="flex items-center gap-2.5 cursor-pointer group focus-visible:outline-hidden"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs transition-colors ${
                activeWorkspace === 'rituals'
                  ? 'bg-red-950/80 border border-red-800/60 text-red-400'
                  : 'bg-amber-950/80 border border-amber-800/60 text-amber-400'
              }`}
            >
              {activeWorkspace === 'rituals' ? (
                <OccultSigil
                  element={currentRitual.element}
                  symbolPreset={currentRitual.symbolPreset}
                  customIconUrl={currentRitual.customElementIcon}
                  size={20}
                />
              ) : (
                <Package className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <span
              className={`font-title text-base font-bold tracking-wider transition-opacity group-hover:opacity-80 ${
                isLightApp ? 'text-slate-900' : 'text-white'
              }`}
            >
              Ordem Paranormal
            </span>
          </button>

          {/* Global Workspace Mode Switcher (Grimório vs Arsenal) */}
          <div
            className={`flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
              isLightApp ? 'bg-slate-100 border-slate-300' : 'bg-black/60 border-zinc-800'
            }`}
          >
            <button
              onClick={() => {
                setActiveWorkspace('rituals');
                setActiveView('front');
                setIsFlipped3D(false);
                soundEngine.playPageTurn();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeWorkspace === 'rituals'
                  ? isLightApp
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-red-950 border border-red-800/80 text-red-200 shadow-xs'
                  : isLightApp
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grimório (Rituais)</span>
            </button>
            <button
              onClick={() => {
                setActiveWorkspace('arsenal');
                setActiveView('front');
                setIsFlipped3D(false);
                soundEngine.playPageTurn();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeWorkspace === 'arsenal'
                  ? isLightApp
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-amber-950 border border-amber-800/80 text-amber-200 shadow-xs'
                  : isLightApp
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Arsenal (Itens)</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links & Deck / Arsenal Manager Quick Access */}
        <nav
          className={`hidden md:flex items-center gap-4 text-sm font-medium ${
            isLightApp ? 'text-slate-600' : 'text-zinc-300'
          }`}
        >
          {activeWorkspace === 'rituals' ? (
            <>
              {/* Meu Grimório (Privado) */}
              <button
                onClick={() => {
                  setDeckInitialTab('private');
                  setIsDeckOpen(true);
                }}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-red-500" />
                <span>Meu Grimório ({rituals.length})</span>
              </button>

              {/* Grimório Público (Comunidade) */}
              <button
                onClick={() => {
                  setDeckInitialTab('public');
                  setIsDeckOpen(true);
                }}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Grimório Público</span>
              </button>

              {/* Acesso Admin Shortcut in Header */}
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                  isAdminLoggedIn
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900/90'
                    : isLightApp
                    ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300'
                }`}
                title="Acesso de Administrador (Gauss0413)"
              >
                {isAdminLoggedIn ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isAdminLoggedIn ? 'Admin Ativo' : 'Acesso Admin'}</span>
              </button>

              <button
                onClick={handleCreateNewRitual}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-zinc-400" />
                <span>Novo Ritual</span>
              </button>

              <button
                onClick={() => setIsPrintOpen(true)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4 text-zinc-400" />
                <span>63×88mm</span>
              </button>

              <button
                onClick={() => setIsLightPrintOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer ${
                  isLightApp
                    ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300'
                    : 'bg-blue-950/70 border-blue-800/80 text-blue-300 hover:bg-blue-900 hover:text-white'
                }`}
                title="Versão de Impressão Leve (A4) - Fundo 100% Branco e Economia de Tinta"
              >
                <Feather className="w-3.5 h-3.5 text-blue-400" />
                <span>Impressão Leve (A4)</span>
              </button>
            </>
          ) : (
            <>
              {/* Meu Arsenal de Itens */}
              <button
                onClick={() => setIsArsenalOpen(true)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>Meu Arsenal ({items.length})</span>
              </button>

              <button
                onClick={handleCreateNewItem}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-zinc-400" />
                <span>Novo Equipamento</span>
              </button>

              <button
                onClick={() => setIsPrintOpen(true)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isLightApp ? 'hover:text-slate-950' : 'hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4 text-zinc-400" />
                <span>63×88mm</span>
              </button>

              <button
                onClick={() => {
                  setMultiPrintItems([currentItem]);
                  setIsItemMultiPrintOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer ${
                  isLightApp
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400'
                    : 'bg-amber-950/70 border-amber-800/80 text-amber-300 hover:bg-amber-900 hover:text-white'
                }`}
                title="Imprimir até 4 equipamentos em uma folha A4 em formato Grid 2×2 com alinhamento duplex"
              >
                <Grid2X2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Grade 2×2 (A4)</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Light/Dark Toggle, Atmosphere, Publicar, Quick Export) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Publicar Carta no Deck Público (Rituais) */}
          {activeWorkspace === 'rituals' && (
            <button
              onClick={handlePublishCurrentRitual}
              title="Publicar esta carta no Grimório Público da Comunidade"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isLightApp
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border-blue-800/60 shadow-2xs'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Publicar Carta</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleAppMode}
            title={
              isLightApp
                ? 'Alternar para Modo Escuro na interface'
                : 'Alternar para Modo Claro na interface'
            }
            className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
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
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
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

          {/* Quick Deck/Arsenal Button on mobile */}
          <button
            onClick={() => {
              if (activeWorkspace === 'rituals') {
                setIsDeckOpen(true);
              } else {
                setIsArsenalOpen(true);
              }
            }}
            className={`md:hidden p-2 rounded-lg border cursor-pointer ${
              isLightApp
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
            title={activeWorkspace === 'rituals' ? 'Abrir Grimório' : 'Abrir Arsenal'}
          >
            {activeWorkspace === 'rituals' ? (
              <BookOpen className="w-4 h-4" />
            ) : (
              <Package className="w-4 h-4" />
            )}
          </button>

          {/* Primary Action Button: Export PNG */}
          <div className="relative group">
            <button
              onClick={() => handleExportPng(activeView)}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-lg transition-all whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer ${
                activeWorkspace === 'rituals'
                  ? 'bg-red-700 hover:bg-red-600 shadow-red-950/40'
                  : 'bg-amber-700 hover:bg-amber-600 shadow-amber-950/40'
              }`}
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
          {activeWorkspace === 'rituals' ? (
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
              onPublishToPublic={handlePublishCurrentRitual}
            />
          ) : (
            <ItemEditorPanel
              item={currentItem}
              onChange={handleItemChange}
              activeView={activeView}
              setActiveView={(v) => {
                setActiveView(v);
                setIsFlipped3D(v === 'back');
              }}
              appMode={appMode}
            />
          )}
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
                  {activeWorkspace === 'rituals' ? (
                    <RitualCard
                      id="main-preview-card"
                      ritual={currentRitual}
                      viewSide={activeView}
                      scale={cardScale}
                      onUpdateUses={(newUses) => handleRitualChange({ ...currentRitual, currentUses: newUses })}
                    />
                  ) : (
                    <ItemCard
                      id="main-preview-card"
                      item={currentItem}
                      viewSide={activeView}
                      scale={cardScale}
                      onUpdateUses={(newUses) => handleItemChange({ ...currentItem, currentUses: newUses })}
                    />
                  )}
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
                  {activeWorkspace === 'rituals' ? (
                    <RitualCard
                      id="main-preview-card-front"
                      ritual={currentRitual}
                      viewSide="front"
                      scale={Math.min(0.92, cardScale)}
                      onUpdateUses={(newUses) => handleRitualChange({ ...currentRitual, currentUses: newUses })}
                    />
                  ) : (
                    <ItemCard
                      id="main-preview-card-front"
                      item={currentItem}
                      viewSide="front"
                      scale={Math.min(0.92, cardScale)}
                      onUpdateUses={(newUses) => handleItemChange({ ...currentItem, currentUses: newUses })}
                    />
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <span
                    className={`text-[11px] font-mono uppercase tracking-widest mb-2 ${
                      isLightApp ? 'text-slate-500' : 'text-zinc-500'
                    }`}
                  >
                    ✦ FACE OCULTA (VERSO)
                  </span>
                  {activeWorkspace === 'rituals' ? (
                    <RitualCard
                      id="main-preview-card-back"
                      ritual={currentRitual}
                      viewSide="back"
                      scale={Math.min(0.92, cardScale)}
                    />
                  ) : (
                    <ItemCard
                      id="main-preview-card-back"
                      item={currentItem}
                      viewSide="back"
                      scale={Math.min(0.92, cardScale)}
                    />
                  )}
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

              {activeWorkspace === 'rituals' ? (
                <>
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
                </>
              ) : (
                <>
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
                    onClick={() => {
                      setMultiPrintItems([currentItem]);
                      setIsItemMultiPrintOpen(true);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-xs ${
                      isLightApp
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-900'
                        : 'bg-amber-950/70 border-amber-800/80 hover:bg-amber-900 text-amber-200'
                    }`}
                    title="Imprimir até 4 equipamentos em uma folha A4 em formato Grid 2×2 com alinhamento duplex"
                  >
                    <Grid2X2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Grade 2×2 (A4)</span>
                  </button>
                </>
              )}
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
        onCopyFromPublicDeck={handleCopyFromPublicDeck}
        onOpenMultiPrint={handleOpenMultiPrint}
        appMode={appMode}
        isAdminAuthenticated={isAdminLoggedIn}
        onOpenAdminModal={handleOpenAdminModal}
        onLogoutAdmin={handleLogoutAdmin}
        initialTab={deckInitialTab}
      />

      {/* Arsenal Equipment Manager Modal */}
      <ArsenalManager
        isOpen={isArsenalOpen}
        onClose={() => setIsArsenalOpen(false)}
        items={items}
        currentItemId={currentItem.id}
        onSelectItem={(it) => {
          setCurrentItem(it);
          setActiveView('front');
          setIsFlipped3D(false);
        }}
        onCreateNewItem={handleCreateNewItem}
        onDuplicateItem={handleDuplicateItem}
        onDeleteItem={handleDeleteItem}
        onResetToDefaults={handleResetItemsToDefaults}
        onImportItems={handleImportItems}
        onOpenMultiPrint={(selected) => {
          setMultiPrintItems(selected);
          setIsItemMultiPrintOpen(true);
        }}
        appMode={appMode}
      />

      {/* Admin Login & Moderation Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        appMode={appMode}
        isAdminAuthenticated={isAdminLoggedIn}
        onAuthStateChange={(isAuth) => setIsAdminLoggedIn(isAuth)}
      />

      {/* Print Modal (Classic 63x88mm Cards) */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        ritual={currentRitual}
        item={currentItem}
        mode={activeWorkspace}
        appMode={appMode}
      />

      {/* Light Print Modal (Versão de Impressão Leve - Economia de Tinta / Ficha Limpa) */}
      <LightPrintModal
        isOpen={isLightPrintOpen}
        onClose={() => setIsLightPrintOpen(false)}
        ritual={currentRitual}
        appMode={appMode}
      />

      {/* Multi-Card Batch Print Modal for Rituals (Grid 2x2 A4 com Alinhamento Duplex) */}
      <MultiCardPrintModal
        isOpen={isMultiPrintOpen}
        onClose={() => setIsMultiPrintOpen(false)}
        rituals={multiPrintRituals.length > 0 ? multiPrintRituals : [currentRitual]}
        mode="rituals"
        appMode={appMode}
      />

      {/* Multi-Card Batch Print Modal for Arsenal (Grid 2x2 A4 com Alinhamento Duplex) */}
      <MultiCardPrintModal
        isOpen={isItemMultiPrintOpen}
        onClose={() => setIsItemMultiPrintOpen(false)}
        items={multiPrintItems.length > 0 ? multiPrintItems : [currentItem]}
        mode="arsenal"
        appMode={appMode}
      />
    </div>
  );
}
