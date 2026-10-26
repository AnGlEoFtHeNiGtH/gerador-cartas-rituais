import React, { useState, useEffect } from 'react';
import { Ritual, ElementId, ELEMENT_CONFIGS } from '../types';
import { OccultSigil } from './OccultSigil';
import { soundEngine } from '../utils/audio';
import { healCorruptedCharacters, sanitizeTextForCustomFont } from '../utils/textFormatter';
import {
  getPublicRituals,
  publishRitualToPublicDeck,
  deleteRitualFromPublicDeck,
} from '../utils/publicDeck';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Globe,
  X,
  Check,
  RefreshCw,
  Printer,
  Grid2X2,
  Shield,
  ShieldCheck,
  Share2,
  DownloadCloud,
  Eye,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';

interface DeckManagerProps {
  rituals: Ritual[];
  currentRitualId: string;
  onSelectRitual: (ritual: Ritual) => void;
  onCreateNewRitual: () => void;
  onDuplicateRitual: (ritual: Ritual) => void;
  onDeleteRitual: (id: string) => void;
  onResetToDefaults: () => void;
  onImportDeck: (imported: Ritual[]) => void;
  onCopyFromPublicDeck: (ritual: Ritual) => void;
  onOpenMultiPrint?: (selectedRituals: Ritual[]) => void;
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
  isAdminAuthenticated: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
}

export const DeckManager: React.FC<DeckManagerProps> = ({
  rituals,
  currentRitualId,
  onSelectRitual,
  onCreateNewRitual,
  onDuplicateRitual,
  onDeleteRitual,
  onResetToDefaults,
  onImportDeck,
  onCopyFromPublicDeck,
  onOpenMultiPrint,
  isOpen,
  onClose,
  appMode = 'dark',
  isAdminAuthenticated,
  onOpenAdminModal,
  onLogoutAdmin,
}) => {
  const isLight = appMode === 'light';

  // Primary navigation: Private vs Public Community Grimoire
  const [activeDeckTab, setActiveDeckTab] = useState<'private' | 'public'>('private');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<ElementId | 'all'>('all');
  const [circleFilter, setCircleFilter] = useState<number | 'all'>('all');

  // Confirmation IDs
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmAdminDeleteId, setConfirmAdminDeleteId] = useState<string | null>(null);

  // Multi-print 2x2 selection
  const [selectedRitualIds, setSelectedRitualIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Public Deck local state synced with storage events
  const [publicRituals, setPublicRituals] = useState<Ritual[]>(() => getPublicRituals());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync public deck on mount or whenever storage/custom event fires
  useEffect(() => {
    const handleUpdate = () => {
      setPublicRituals(getPublicRituals());
    };

    window.addEventListener('public-deck-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('public-deck-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Multi-card selection toggle (max 4 for Grid 2x2 sheet)
  const handleToggleSelectCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedRitualIds.includes(id)) {
      setSelectedRitualIds((prev) => prev.filter((item) => item !== id));
      soundEngine.playCardFlip();
    } else {
      if (selectedRitualIds.length >= 4) {
        showToast('⚠️ Limite de 4 cartas por folha A4 atingido!');
        soundEngine.playSigilChime(320);
        return;
      }
      setSelectedRitualIds((prev) => [...prev, id]);
      soundEngine.playCardFlip();
    }
  };

  const handleClearSelection = () => {
    setSelectedRitualIds([]);
  };

  // Trigger Grid 2x2 print
  const handleTriggerMultiPrint = () => {
    const sourcePool = activeDeckTab === 'private' ? rituals : publicRituals;
    if (selectedRitualIds.length === 0) {
      const autoSelected = (activeDeckTab === 'private' ? filteredPrivateRituals : filteredPublicRituals).slice(0, 4);
      if (autoSelected.length === 0) {
        showToast('Nenhum ritual disponível para imprimir.');
        return;
      }
      setSelectedRitualIds(autoSelected.map((r) => r.id));
      if (onOpenMultiPrint) {
        onOpenMultiPrint(autoSelected);
      }
    } else {
      const selected = sourcePool.filter((r) => selectedRitualIds.includes(r.id));
      if (onOpenMultiPrint) {
        onOpenMultiPrint(selected);
      }
    }
  };

  // Publish a private ritual into the public community deck
  const handlePublishRitual = (ritualToPublish: Ritual, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playSigilChime(640);
    const res = publishRitualToPublicDeck(ritualToPublish, 'Agente Ocultista');
    if (res.success) {
      showToast(res.message);
      setPublicRituals(getPublicRituals());
    } else {
      showToast(res.message);
    }
  };

  // Copy ritual from public grimoire into user's private grimoire
  const handleCopyFromPublic = (pubRitual: Ritual, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playSigilChime(580);
    onCopyFromPublicDeck(pubRitual);
    showToast(`✦ Ritual "${pubRitual.name}" adicionado ao seu Grimório Privado!`);
  };

  // Admin moderation: delete from public deck
  const handleAdminDeletePublicRitual = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playSigilChime(280);
    const res = deleteRitualFromPublicDeck(id);
    if (res.success) {
      showToast(res.message);
      setPublicRituals(getPublicRituals());
      setConfirmAdminDeleteId(null);
    } else {
      showToast(res.message);
    }
  };

  // Filter Private rituals
  const filteredPrivateRituals = rituals.filter((r) => {
    const healedName = healCorruptedCharacters(r.name).toLowerCase();
    const healedDesc = healCorruptedCharacters(r.description).toLowerCase();
    const searchClean = search.toLowerCase();
    const matchesSearch = healedName.includes(searchClean) || healedDesc.includes(searchClean);
    const matchesElement = elementFilter === 'all' || r.element === elementFilter;
    const matchesCircle = circleFilter === 'all' || r.circle === circleFilter;
    return matchesSearch && matchesElement && matchesCircle;
  });

  // Filter Public rituals
  const filteredPublicRituals = publicRituals.filter((r) => {
    const healedName = healCorruptedCharacters(r.name).toLowerCase();
    const healedDesc = healCorruptedCharacters(r.description).toLowerCase();
    const searchClean = search.toLowerCase();
    const matchesSearch = healedName.includes(searchClean) || healedDesc.includes(searchClean);
    const matchesElement = elementFilter === 'all' || r.element === elementFilter;
    const matchesCircle = circleFilter === 'all' || r.circle === circleFilter;
    return matchesSearch && matchesElement && matchesCircle;
  });

  // Export Deck to JSON
  const handleExportDeckJson = () => {
    const sourceData = activeDeckTab === 'private' ? rituals : publicRituals;
    const prefix = activeDeckTab === 'private' ? 'meu-grimorio-privado' : 'grimorio-publico-comunidade';
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(sourceData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${prefix}-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('✦ Backup do Grimório exportado em JSON!');
  };

  // Import Deck from JSON
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Normalize legacy PE fields and heal corrupted accents
          const normalized: Ritual[] = parsed.map((item) => ({
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
          onImportDeck(normalized);
          showToast(`✦ Grimório importado! ${normalized.length} rituais carregados.`);
        } else {
          showToast('Arquivo JSON inválido. Certifique-se de que é um backup do Grimório.');
        }
      } catch {
        showToast('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xs animate-fade-in">
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-800'
            : 'bg-[#101015] border-zinc-800 text-zinc-100'
        }`}
      >
        {/* ======================================================== */}
        {/* HEADER: TITLE, TABS & ADMIN SHORTCUT */}
        {/* ======================================================== */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-3.5 border-b gap-3 ${
            isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0d0d11]'
          }`}
        >
          {/* Title & Grimoire Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-800/60 flex items-center justify-center text-red-400 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`font-cinzel text-base md:text-lg font-bold tracking-wide ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Grimório de Rituais Paranormais
                </h2>
                {isAdminAuthenticated && (
                  <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Admin Ativo
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {activeDeckTab === 'private'
                  ? `Seu grimório pessoal (${rituals.length} rituais salvos localmente)`
                  : `Grimório público compartilhado da comunidade (${publicRituals.length} rituais)`}
              </p>
            </div>
          </div>

          {/* Action Header Group */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Admin Access Button */}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Gerenciar Sessão de Administrador"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="p-1.5 hover:bg-red-950/40 border border-red-800/40 text-red-400 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Encerrar Sessão Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300'
                }`}
                title="Acesso de Administrador (Moderação de Cartas Públicas)"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Acesso Admin</span>
              </button>
            )}

            {/* Create New Ritual (available in private tab) */}
            {activeDeckTab === 'private' && (
              <button
                type="button"
                onClick={onCreateNewRitual}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Ritual</span>
              </button>
            )}

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRIMARY TABS: MEU GRIMÓRIO (PRIVADO) VS GRIMÓRIO PÚBLICO */}
        {/* ======================================================== */}
        <div
          className={`flex items-center justify-between px-6 pt-3 pb-2 border-b transition-colors ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#14141a] border-zinc-800/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Tab 1: Meu Grimório (Privado) */}
            <button
              type="button"
              onClick={() => {
                setActiveDeckTab('private');
                soundEngine.playCardFlip();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDeckTab === 'private'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                    : 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-red-500" />
              <span>Meu Grimório (Privado)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeDeckTab === 'private'
                    ? 'bg-red-600 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {rituals.length}
              </span>
            </button>

            {/* Tab 2: Grimório Público (Comunidade) */}
            <button
              type="button"
              onClick={() => {
                setActiveDeckTab('public');
                soundEngine.playCardFlip();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDeckTab === 'public'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                    : 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Grimório Público (Comunidade)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeDeckTab === 'public'
                    ? 'bg-blue-600 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {publicRituals.length}
              </span>
            </button>
          </div>

          {/* Tab Information Pill */}
          <div className="hidden md:flex items-center gap-2 text-[11px]">
            {activeDeckTab === 'public' && (
              <span className={`italic ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Copie qualquer ritual público para editar livremente no seu espaço privado.
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ADMIN MODERATION BANNER IN PUBLIC TAB */}
        {/* ======================================================== */}
        {activeDeckTab === 'public' && isAdminAuthenticated && (
          <div
            className={`px-6 py-2 border-b flex items-center justify-between text-xs ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Modo Administrador Ativo:</strong> Você possui privilégio de exclusão instantânea para moderar qualquer carta pública.
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400/90">
              Gauss0413
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* SEARCH & FILTER TOOLBAR */}
        {/* ======================================================== */}
        <div
          className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800/80 bg-[#121217]'
          }`}
        >
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeDeckTab === 'private'
                  ? 'Buscar no seu grimório por nome ou efeito...'
                  : 'Buscar no grimório público da comunidade...'
              }
              className={`w-full rounded-lg pl-9 pr-3 py-1.5 text-xs transition-colors focus:outline-hidden ${
                isLight
                  ? 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-red-500'
                  : 'bg-[#181820] border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:border-red-500'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Element Filter */}
          <select
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value as ElementId | 'all')}
            className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:outline-hidden ${
              isLight
                ? 'bg-white border border-slate-300 text-slate-800'
                : 'bg-[#181820] border border-zinc-700/80 text-zinc-200'
            }`}
          >
            <option value="all">Todos os Elementos</option>
            <option value="sangue">Sangue</option>
            <option value="morte">Morte</option>
            <option value="energia">Energia</option>
            <option value="conhecimento">Conhecimento</option>
            <option value="medo">Medo</option>
            <option value="custom">Elemento Customizado</option>
          </select>

          {/* Circle Filter */}
          <select
            value={circleFilter}
            onChange={(e) =>
              setCircleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:outline-hidden ${
              isLight
                ? 'bg-white border border-slate-300 text-slate-800'
                : 'bg-[#181820] border border-zinc-700/80 text-zinc-200'
            }`}
          >
            <option value="all">Todos os Círculos</option>
            <option value="1">1º Círculo</option>
            <option value="2">2º Círculo</option>
            <option value="3">3º Círculo</option>
            <option value="4">4º Círculo</option>
          </select>

          {/* Multi-print 2x2 trigger button */}
          <div className="flex items-center gap-1.5">
            {selectedRitualIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className={`text-[11px] px-2 py-1 rounded transition-colors ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Limpar seleção de impressão"
              >
                Limpar ({selectedRitualIds.length})
              </button>
            )}

            <button
              type="button"
              onClick={handleTriggerMultiPrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                selectedRitualIds.length > 0
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
              title="Abrir modal de impressão em grade 2×2 (A4)"
            >
              <Grid2X2 className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Imprimir Grade 2×2
                {selectedRitualIds.length > 0 ? ` (${selectedRitualIds.length}/4)` : ''}
              </span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RITUAL CARDS GRID (RENDERED BASED ON ACTIVE TAB) */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {(() => {
            const currentList =
              activeDeckTab === 'private' ? filteredPrivateRituals : filteredPublicRituals;

            if (currentList.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center text-zinc-500 mb-3">
                    {activeDeckTab === 'private' ? (
                      <BookOpen className="w-7 h-7" />
                    ) : (
                      <Globe className="w-7 h-7" />
                    )}
                  </div>
                  <h3
                    className={`font-cinzel text-base font-bold ${
                      isLight ? 'text-slate-800' : 'text-zinc-200'
                    }`}
                  >
                    Nenhum ritual encontrado
                  </h3>
                  <p className={`text-xs mt-1 max-w-sm ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    {search || elementFilter !== 'all' || circleFilter !== 'all'
                      ? 'Nenhum ritual corresponde aos filtros selecionados. Tente limpar sua busca.'
                      : activeDeckTab === 'private'
                      ? 'Seu grimório privado ainda não possui rituais. Crie um novo ritual ou copie rituais do Grimório Público.'
                      : 'Nenhum ritual disponível no momento no grimório público.'}
                  </p>
                  {activeDeckTab === 'private' && (
                    <button
                      type="button"
                      onClick={onCreateNewRitual}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Criar Primeiro Ritual
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentList.map((r) => {
                  const elementConfig =
                    r.element === 'custom'
                      ? {
                          primaryColor: r.customElementColor || '#0ea5e9',
                          name: r.customElementName || 'Custom',
                        }
                      : ELEMENT_CONFIGS[r.element];

                  const isCurrentActive = r.id === currentRitualId && activeDeckTab === 'private';
                  const isCheckedForPrint = selectedRitualIds.includes(r.id);
                  const displayPd =
                    r.basePd || (r as unknown as { basePe?: string }).basePe || '1 PD';

                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        onSelectRitual(r);
                        soundEngine.playCardFlip();
                      }}
                      className={`group relative rounded-xl border p-3.5 transition-all flex flex-col justify-between cursor-pointer ${
                        isCurrentActive
                          ? isLight
                            ? 'bg-red-50/80 border-red-500 ring-2 ring-red-400 shadow-md'
                            : 'bg-red-950/20 border-red-500 ring-1 ring-red-500 shadow-lg'
                          : isCheckedForPrint
                          ? isLight
                            ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                            : 'bg-amber-950/20 border-amber-500/80 shadow-md'
                          : isLight
                          ? 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                          : 'bg-[#15151c] border-zinc-800 hover:border-zinc-700 hover:bg-[#1a1a24]'
                      }`}
                    >
                      {/* Top Row: Sigil, Element Badge, Checkbox & Circle */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* Multi-print Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleSelectCard(r.id, e)}
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                isCheckedForPrint
                                  ? 'bg-red-600 border-red-600 text-white'
                                  : isLight
                                  ? 'border-slate-300 hover:border-slate-500 bg-white'
                                  : 'border-zinc-700 hover:border-zinc-500 bg-black/40'
                              }`}
                              title={
                                isCheckedForPrint
                                  ? 'Remover da seleção de grade 2×2'
                                  : 'Selecionar para impressão em grade 2×2'
                              }
                            >
                              {isCheckedForPrint && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            {/* Element Sigil Preview */}
                            <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                              <OccultSigil
                                element={r.element}
                                symbolPreset={r.symbolPreset}
                                customIconUrl={r.customElementIcon}
                                customIconFilter={r.theme.customIconFilter}
                                customIconInvert={r.theme.customIconInvert}
                                cardMode={r.theme.cardMode}
                                size={20}
                                color={elementConfig.primaryColor}
                              />
                            </div>

                            {/* Element Label */}
                            <span
                              className="text-[10px] font-mono font-bold uppercase tracking-wider"
                              style={{ color: elementConfig.primaryColor }}
                            >
                              {elementConfig.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isCheckedForPrint && (
                              <span className="text-[9px] font-mono uppercase bg-red-600 text-white font-bold px-1 rounded shadow-xs">
                                Grid 2×2
                              </span>
                            )}
                            <span
                              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isLight
                                  ? 'text-slate-600 bg-slate-100 border-slate-300'
                                  : 'text-zinc-400 bg-black/50 border-zinc-800'
                              }`}
                            >
                              {r.circle}º Círculo
                            </span>
                          </div>
                        </div>

                        {/* Ritual Name in Westsac safe typography */}
                        <h4
                          className={`font-title text-sm font-bold transition-colors ${
                            isLight
                              ? 'text-slate-900 group-hover:text-red-700'
                              : 'text-white group-hover:text-red-300'
                          }`}
                          title={healCorruptedCharacters(r.name)}
                        >
                          {sanitizeTextForCustomFont(r.name)}
                        </h4>

                        {/* Author / Community tag in Public Grimoire */}
                        {activeDeckTab === 'public' && (
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-zinc-500">
                            <User className="w-3 h-3 text-zinc-400" />
                            <span>{r.author || 'Agente Paranormal'}</span>
                          </div>
                        )}

                        {/* Attributes preview */}
                        <p
                          className={`text-[11px] line-clamp-2 mt-1 leading-snug font-body ${
                            isLight ? 'text-slate-600' : 'text-zinc-400'
                          }`}
                        >
                          {healCorruptedCharacters(r.description.replace(/\*\*/g, '').replace(/\*/g, ''))}
                        </p>
                      </div>

                      {/* Footer bar & Action buttons */}
                      <div
                        className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                          isLight ? 'border-slate-200' : 'border-zinc-800/80'
                        }`}
                      >
                        <span
                          className={`font-mono font-medium ${
                            isLight ? 'text-slate-500' : 'text-zinc-400'
                          }`}
                        >
                          {healCorruptedCharacters(r.execution)} •{' '}
                          <span className={isLight ? 'text-red-700 font-bold' : 'text-red-300'}>
                            {displayPd}
                          </span>
                        </span>

                        {/* Action buttons based on active tab */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* ===================================== */}
                          {/* PRIVATE TAB ACTIONS */}
                          {/* ===================================== */}
                          {activeDeckTab === 'private' && (
                            <>
                              {/* Publicar Carta no Deck Público */}
                              <button
                                type="button"
                                onClick={(e) => handlePublishRitual(r, e)}
                                title="Publicar esta carta no Grimório Público (Comunidade)"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                    : 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900'
                                }`}
                              >
                                <Share2 className="w-3 h-3" />
                                <span>Publicar</span>
                              </button>

                              {/* Duplicate */}
                              <button
                                type="button"
                                onClick={() => onDuplicateRitual(r)}
                                title="Duplicar este ritual no grimório privado"
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  isLight
                                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete confirmation */}
                              {confirmDeleteId === r.id ? (
                                <div className="flex items-center gap-1 bg-red-950/80 border border-red-800 px-1.5 py-0.5 rounded">
                                  <span className="text-[9px] text-red-200">Excluir?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteRitual(r.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-1 rounded font-bold"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[9px] text-zinc-400 hover:text-white"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(r.id)}
                                  disabled={rituals.length <= 1}
                                  title={
                                    rituals.length <= 1
                                      ? 'O grimório precisa ter pelo menos um ritual'
                                      : 'Excluir ritual'
                                  }
                                  className={`p-1 rounded transition-colors cursor-pointer ${
                                    rituals.length <= 1
                                      ? 'opacity-30 cursor-not-allowed'
                                      : isLight
                                      ? 'text-slate-400 hover:text-red-700 hover:bg-red-50'
                                      : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}

                          {/* ===================================== */}
                          {/* PUBLIC COMMUNITY TAB ACTIONS */}
                          {/* ===================================== */}
                          {activeDeckTab === 'public' && (
                            <>
                              {/* Visualizar / Selecionar */}
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectRitual(r);
                                  showToast(`✦ Visualizando "${r.name}"`);
                                }}
                                title="Visualizar ritual no editor de cartas"
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  isLight
                                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Copiar para o Meu Grimório */}
                              <button
                                type="button"
                                onClick={(e) => handleCopyFromPublic(r, e)}
                                title="Copiar este ritual para o seu Grimório Privado"
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-600 hover:bg-red-500 text-white shadow-xs transition-colors cursor-pointer"
                              >
                                <DownloadCloud className="w-3 h-3" />
                                <span>Copiar</span>
                              </button>

                              {/* ADMIN EXCLUSION PRIVILEGE */}
                              {isAdminAuthenticated && (
                                <>
                                  {confirmAdminDeleteId === r.id ? (
                                    <div className="flex items-center gap-1 bg-red-950 border border-red-700 px-1.5 py-0.5 rounded">
                                      <span className="text-[9px] text-red-200 font-bold">Excluir do público?</span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleAdminDeletePublicRitual(r.id, e)}
                                        className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-1.5 py-0.2 rounded font-bold"
                                      >
                                        Sim
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmAdminDeleteId(null)}
                                        className="text-[9px] text-zinc-400 hover:text-white"
                                      >
                                        Não
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmAdminDeleteId(r.id)}
                                      title="[ADMIN] Excluir permanentemente este ritual do Grimório Público"
                                      className="p-1 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* ======================================================== */}
        {/* FOOTER BAR: BACKUP & ACTIONS */}
        {/* ======================================================== */}
        <div
          className={`px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0c0c10]'
          }`}
        >
          {/* Left Actions: JSON Backup & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportDeckJson}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isLight
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
              }`}
              title="Baixar arquivo JSON com backup dos rituais"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>

            {activeDeckTab === 'private' && (
              <>
                <label
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                  }`}
                  title="Importar rituais de um arquivo JSON anterior"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Tem certeza que deseja restaurar os rituais clássicos padrão? Seus rituais customizados não salvos serão substituídos.'
                      )
                    ) {
                      onResetToDefaults();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                  title="Restaurar rituais originais do livro"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restaurar Padrões</span>
                </button>
              </>
            )}
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-3">
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              {activeDeckTab === 'private'
                ? `${rituals.length} rituais salvos no navegador`
                : `${publicRituals.length} rituais compartilhados pela comunidade`}
            </span>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Local Toast Message inside modal */}
        {toastMessage && (
          <div className="absolute bottom-16 right-6 z-50 flex items-center gap-2 bg-[#181824] border border-red-600/80 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium animate-fade-in">
            <Check className="w-4 h-4 text-red-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
