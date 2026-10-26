import React, { useState } from 'react';
import { Ritual, ElementId, ELEMENT_CONFIGS } from '../types';
import { OccultSigil } from './OccultSigil';
import { soundEngine } from '../utils/audio';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  BookOpen,
  X,
  Check,
  RefreshCw,
  Printer,
  Grid2X2,
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
  onOpenMultiPrint?: (selectedRituals: Ritual[]) => void;
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
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
  onOpenMultiPrint,
  isOpen,
  onClose,
  appMode = 'dark',
}) => {
  const isLight = appMode === 'light';
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<ElementId | 'all'>('all');
  const [circleFilter, setCircleFilter] = useState<number | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedRitualIds, setSelectedRitualIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const handleTriggerMultiPrint = () => {
    if (selectedRitualIds.length === 0) {
      // If none selected, auto-select up to 4 filtered rituals
      const autoSelected = filteredRituals.slice(0, 4);
      if (autoSelected.length === 0) {
        showToast('Nenhum ritual disponível para imprimir.');
        return;
      }
      setSelectedRitualIds(autoSelected.map((r) => r.id));
      if (onOpenMultiPrint) {
        onOpenMultiPrint(autoSelected);
      }
    } else {
      const selected = rituals.filter((r) => selectedRitualIds.includes(r.id));
      if (onOpenMultiPrint) {
        onOpenMultiPrint(selected);
      }
    }
  };

  if (!isOpen) return null;

  // Filter rituals
  const filteredRituals = rituals.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesElement = elementFilter === 'all' || r.element === elementFilter;
    const matchesCircle = circleFilter === 'all' || r.circle === circleFilter;
    return matchesSearch && matchesElement && matchesCircle;
  });

  // Export Deck to JSON
  const handleExportDeckJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(rituals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `grimorio-paranormal-deck-${new Date().toISOString().slice(0, 10)}.json`
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
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
          // Normalize legacy PE fields if found
          const normalized: Ritual[] = parsed.map((item) => ({
            ...item,
            basePd: item.basePd || item.basePe || '1 PD',
            modifications: (item.modifications || []).map((m: { cost?: string }) => ({
              ...m,
              cost: (m.cost || '+2 PD').replace(/PE/g, 'PD'),
            })),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className={`relative w-full max-w-4xl max-h-[85vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-300 text-slate-800'
            : 'bg-[#101015] border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight
              ? 'border-slate-200 bg-white'
              : 'border-zinc-800 bg-[#0d0d11]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`font-cinzel text-base font-bold tracking-wide ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Grimório de Rituais (Deck)
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Gerencie todos os seus rituais salvos ({rituals.length} no grimório)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreateNewRitual}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Ritual</span>
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

        {/* Search & Filter Toolbar */}
        <div
          className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isLight
              ? 'border-slate-200 bg-slate-100/80'
              : 'border-zinc-800/80 bg-[#14141a]'
          }`}
        >
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou efeito do ritual..."
              className={`w-full rounded-lg pl-9 pr-3 py-1.5 text-xs transition-colors focus:outline-hidden ${
                isLight
                  ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500'
                  : 'bg-[#1b1b24] border border-zinc-700/80 text-white placeholder-zinc-500 focus:border-red-500'
              }`}
            />
          </div>

          {/* Element Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setElementFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                elementFilter === 'all'
                  ? isLight
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-zinc-700 text-white font-semibold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {(['sangue', 'morte', 'energia', 'conhecimento', 'medo'] as ElementId[]).map(
              (elem) => {
                const cfg = ELEMENT_CONFIGS[elem];
                const isSelected = elementFilter === elem;
                return (
                  <button
                    key={elem}
                    onClick={() => setElementFilter(elem)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-white border border-slate-400 text-slate-900 font-semibold shadow-xs'
                          : 'bg-zinc-800 border border-zinc-600 text-white font-semibold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <OccultSigil element={elem} size={13} color={cfg.primaryColor} />
                    <span className="hidden sm:inline">{cfg.name}</span>
                  </button>
                );
              }
            )}
          </div>

          {/* Circle Filter */}
          <div
            className={`flex items-center gap-1 p-0.5 rounded border text-xs ${
              isLight
                ? 'bg-white border-slate-300'
                : 'bg-[#1b1b24] border-zinc-800'
            }`}
          >
            <span className={`px-1.5 text-[10px] uppercase font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              Grau:
            </span>
            {[
              { val: 'all', label: 'Todos' },
              { val: 1, label: '1º' },
              { val: 2, label: '2º' },
              { val: 3, label: '3º' },
              { val: 4, label: '4º' },
            ].map((c) => (
              <button
                key={c.val}
                onClick={() => setCircleFilter(c.val as number | 'all')}
                className={`px-2 py-0.5 rounded font-mono ${
                  circleFilter === c.val
                    ? isLight
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-zinc-700 text-white font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Print Selection Sticky Bar */}
        {selectedRitualIds.length > 0 && (
          <div
            className={`px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs transition-all animate-fade-in ${
              isLight
                ? 'bg-red-50 border-red-200 text-red-950 shadow-xs'
                : 'bg-red-950/40 border-red-900/60 text-red-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>
                  {selectedRitualIds.length}/4 cartas selecionadas para o Grid 2×2 A4
                </span>
              </span>
              <button
                onClick={handleClearSelection}
                className="text-[11px] underline opacity-80 hover:opacity-100 ml-2 cursor-pointer"
              >
                Limpar seleção
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerMultiPrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-950/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Selecionadas (Grid 2×2)</span>
              </button>
            </div>
          </div>
        )}

        {/* Rituals Grid */}
        <div className={`flex-1 overflow-y-auto p-4 ${isLight ? 'bg-slate-100/50' : 'bg-transparent'}`}>
          {filteredRituals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">Nenhum ritual encontrado com esses filtros.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setElementFilter('all');
                  setCircleFilter('all');
                }}
                className="mt-2 text-xs text-red-400 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRituals.map((r) => {
                const cfg =
                  r.element === 'custom'
                    ? {
                        name: r.customElementName || 'Custom',
                        primaryColor: r.customElementColor || '#10b981',
                      }
                    : ELEMENT_CONFIGS[r.element];
                const isSelected = r.id === currentRitualId;
                const isCheckedForPrint = selectedRitualIds.includes(r.id);
                const displayPd =
                  r.basePd || (r as unknown as { basePe?: string }).basePe || '1 PD';

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectRitual(r);
                      onClose();
                    }}
                    className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                      isCheckedForPrint
                        ? isLight
                          ? 'bg-red-50/90 border-red-500 shadow-md ring-2 ring-red-400'
                          : 'bg-[#1e1c24] border-red-500/90 shadow-lg shadow-red-950/40 ring-2 ring-red-500/70'
                        : isSelected
                        ? isLight
                          ? 'bg-slate-50 border-slate-400 shadow-xs ring-1 ring-slate-400'
                          : 'bg-[#1c1c24] border-zinc-700 shadow-xs ring-1 ring-zinc-600'
                        : isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                        : 'bg-[#15151c] border-zinc-800 hover:border-zinc-700 hover:bg-[#181822]'
                    }`}
                  >
                    <div>
                      {/* Top row with Checkbox and Element */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Multi-print Checkbox */}
                          <div
                            onClick={(e) => handleToggleSelectCard(r.id, e)}
                            className="p-1 -ml-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title={
                              isCheckedForPrint
                                ? 'Desmarcar da impressão em lote'
                                : 'Selecionar para impressão em lote (Grid 2×2, máx. 4)'
                            }
                          >
                            <input
                              type="checkbox"
                              checked={isCheckedForPrint}
                              onChange={() => {}}
                              className="w-4 h-4 rounded cursor-pointer accent-red-600 border-zinc-500 focus:ring-0"
                            />
                          </div>

                          <OccultSigil
                            element={r.element}
                            symbolPreset={r.symbolPreset}
                            customIconUrl={r.customElementIcon}
                            size={18}
                            color={cfg.primaryColor}
                          />
                          <span
                            className="text-[11px] font-mono uppercase tracking-wider font-semibold"
                            style={{ color: cfg.primaryColor }}
                          >
                            {cfg.name}
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

                      {/* Ritual Name */}
                      <h4
                        className={`font-title text-sm font-bold transition-colors ${
                          isLight
                            ? 'text-slate-900 group-hover:text-red-700'
                            : 'text-white group-hover:text-red-300'
                        }`}
                      >
                        {r.name}
                      </h4>

                      {/* Attributes preview */}
                      <p
                        className={`text-[11px] line-clamp-2 mt-1 leading-snug font-body ${
                          isLight ? 'text-slate-600' : 'text-zinc-400'
                        }`}
                      >
                        {r.description.replace(/\*\*/g, '').replace(/\*/g, '')}
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
                        {r.execution} •{' '}
                        <span className={isLight ? 'text-red-700 font-bold' : 'text-red-300'}>
                          {displayPd}
                        </span>
                      </span>

                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => onDuplicateRitual(r)}
                          title="Duplicar este ritual"
                          className={`p-1 rounded transition-colors ${
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
                              onClick={() => {
                                onDeleteRitual(r.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-red-300 hover:text-white font-bold"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-zinc-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(r.id)}
                            title="Excluir ritual"
                            className={`p-1 rounded transition-colors ${
                              isLight
                                ? 'text-slate-500 hover:text-red-600 hover:bg-slate-200'
                                : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Bar: Import, Export, Multi-Print, Reset defaults */}
        <div
          className={`px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isLight
              ? 'border-slate-200 bg-white'
              : 'border-zinc-800 bg-[#0d0d11]'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Multi-print highlighted button */}
            <button
              onClick={handleTriggerMultiPrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedRitualIds.length > 0
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/30'
                  : isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
              title="Imprimir até 4 cartas em uma folha A4 em formato Grid 2×2"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span>
                Imprimir em Lote (Grid 2×2)
                {selectedRitualIds.length > 0 && ` (${selectedRitualIds.length}/4)`}
              </span>
            </button>

            {/* Export Deck */}
            <button
              onClick={handleExportDeckJson}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Deck (.json)</span>
            </button>

            {/* Import Deck */}
            <label
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Deck</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <button
              onClick={() => {
                onResetToDefaults();
                showToast('✦ Rituais originais restaurados!');
              }}
              className={`flex items-center gap-1 transition-colors text-[11px] ${
                isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar Rituais Originais</span>
            </button>
          </div>
        </div>

        {/* In-Modal Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-5 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-red-500 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-medium animate-fade-in">
            <Check className="w-4 h-4 text-red-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
