import React, { useState } from 'react';
import { ArsenalItem, MundaneSubcategory, ItemCategoryTier, MUNDANE_SUBCATEGORIES, ELEMENT_CONFIGS, ElementId } from '../types';
import { OccultSigil } from './OccultSigil';
import { soundEngine } from '../utils/audio';
import { healCorruptedCharacters } from '../utils/textFormatter';
import {
  Package,
  Shield,
  Crosshair,
  Wrench,
  Search,
  Plus,
  Copy,
  Trash2,
  X,
  Check,
  Disc,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Grid2X2,
} from 'lucide-react';

interface ArsenalManagerProps {
  items: ArsenalItem[];
  currentItemId: string;
  onSelectItem: (item: ArsenalItem) => void;
  onCreateNewItem: () => void;
  onDuplicateItem: (item: ArsenalItem) => void;
  onDeleteItem: (id: string) => void;
  onResetToDefaults: () => void;
  onImportItems: (imported: ArsenalItem[]) => void;
  onOpenMultiPrint?: (selected: ArsenalItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
  appMode?: 'dark' | 'light';
}

export const ArsenalManager: React.FC<ArsenalManagerProps> = ({
  items,
  currentItemId,
  onSelectItem,
  onCreateNewItem,
  onDuplicateItem,
  onDeleteItem,
  onResetToDefaults,
  onImportItems,
  onOpenMultiPrint,
  isOpen,
  onClose,
  appMode = 'dark',
}) => {
  const isLight = appMode === 'light';
  const [search, setSearch] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState<MundaneSubcategory | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<ItemCategoryTier | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSelectItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds((prev) => prev.filter((item) => item !== id));
      soundEngine.playCardFlip();
    } else {
      if (selectedItemIds.length >= 4) {
        showToast('⚠️ Limite de 4 itens por folha A4 atingido!');
        soundEngine.playSigilChime(320);
        return;
      }
      setSelectedItemIds((prev) => [...prev, id]);
      soundEngine.playCardFlip();
    }
  };

  const handleTriggerMultiPrint = () => {
    if (!onOpenMultiPrint) return;
    const selected = selectedItemIds.length > 0
      ? items.filter((it) => selectedItemIds.includes(it.id))
      : filteredItems.slice(0, 4);

    if (selected.length === 0) {
      showToast('Nenhum equipamento para imprimir.');
      return;
    }
    soundEngine.playSigilChime(500);
    onOpenMultiPrint(selected);
  };

  if (!isOpen) return null;

  // Filter items
  const filteredItems = items.filter((item) => {
    const nameMatch = healCorruptedCharacters(item.name).toLowerCase().includes(search.toLowerCase());
    const descMatch = healCorruptedCharacters(item.description).toLowerCase().includes(search.toLowerCase());
    const matchesSearch = nameMatch || descMatch;
    const matchesSub = subcategoryFilter === 'all' || item.subcategory === subcategoryFilter;
    const matchesTier = tierFilter === 'all' || item.categoryTier === tierFilter;
    return matchesSearch && matchesSub && matchesTier;
  });

  // Export Arsenal to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `meu-arsenal-ordem-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('✦ Arsenal exportado em JSON com sucesso!');
  };

  // Import Arsenal from JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportItems(parsed);
          showToast(`✦ Arsenal importado! ${parsed.length} itens adicionados.`);
        } else {
          showToast('Arquivo JSON inválido.');
        }
      } catch {
        showToast('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xs animate-fade-in">
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#101015] border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-b ${
            isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0d0d11]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`font-title text-base md:text-lg font-bold tracking-wide ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                  style={{ fontFamily: "'Cinzel', 'Westsac', Georgia, serif" }}
                >
                  Arsenal de Equipamentos da Ordem
                </h2>
                <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-bold">
                  {items.length} Itens Salvos
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Gerenciamento de armas, proteções, munições, utilitários e artefatos de agentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMultiPrint && (
              <button
                type="button"
                onClick={handleTriggerMultiPrint}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                  selectedItemIds.length > 0
                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                    : isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-700/80'
                }`}
                title="Imprimir até 4 equipamentos selecionados em grade 2×2 A4 com alinhamento duplex"
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span>Grade 2×2 (A4)</span>
                {selectedItemIds.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-black/60 text-amber-300 rounded-full text-[10px] font-bold">
                    {selectedItemIds.length}/4
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onCreateNewItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Equipamento</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div
          className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800/80 bg-[#121217]'
          }`}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no arsenal por nome ou efeito..."
              className={`w-full rounded-lg pl-9 pr-3 py-1.5 text-xs transition-colors focus:outline-hidden ${
                isLight
                  ? 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500'
                  : 'bg-[#181820] border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:border-amber-500'
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

          {/* Subcategory Filter */}
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value as MundaneSubcategory | 'all')}
            className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:outline-hidden ${
              isLight ? 'bg-white border border-slate-300 text-slate-800' : 'bg-[#181820] border border-zinc-700/80 text-zinc-200'
            }`}
          >
            <option value="all">Todas as Subcategorias</option>
            <option value="utilitario">Itens Operacionais (Utilitários)</option>
            <option value="arma">Armas</option>
            <option value="protecao">Proteções (Armaduras)</option>
            <option value="municao">Munições</option>
            <option value="acessorio">Acessórios</option>
            <option value="paranormal">Itens Paranormais / Amaldiçoados</option>
          </select>

          {/* Category Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as ItemCategoryTier | 'all')}
            className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:outline-hidden ${
              isLight ? 'bg-white border border-slate-300 text-slate-800' : 'bg-[#181820] border border-zinc-700/80 text-zinc-200'
            }`}
          >
            <option value="all">Todas as Categorias</option>
            <option value="0">Categoria 0</option>
            <option value="I">Categoria I</option>
            <option value="II">Categoria II</option>
            <option value="III">Categoria III</option>
            <option value="IV">Categoria IV</option>
          </select>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center text-zinc-500 mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className={`font-title text-base font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                Nenhum equipamento encontrado
              </h3>
              <p className={`text-xs mt-1 max-w-sm ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                Tente ajustar os filtros de busca ou crie um novo equipamento para o seu arsenal.
              </p>
              <button
                type="button"
                onClick={onCreateNewItem}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Criar Primeiro Equipamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((itm) => {
                const isSelected = itm.id === currentItemId;
                return (
                  <div
                    key={itm.id}
                    onClick={() => {
                      onSelectItem(itm);
                      soundEngine.playCardFlip();
                    }}
                    className={`group relative rounded-xl border p-3.5 transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400 shadow-md'
                          : 'bg-amber-950/25 border-amber-500 ring-1 ring-amber-500 shadow-lg'
                        : isLight
                        ? 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                        : 'bg-[#15151c] border-zinc-800 hover:border-zinc-700 hover:bg-[#1a1a24]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 font-bold min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                            CAT {itm.categoryTier || 'I'}
                          </span>
                          <span className="text-zinc-400 uppercase truncate">
                            {MUNDANE_SUBCATEGORIES[itm.subcategory]?.name || itm.subcategory}
                          </span>
                          {((itm.showElementBadge !== undefined ? itm.showElementBadge : itm.itemType === 'amaldicoado') && (() => {
                            const elem = ((itm.element || 'sangue').toLowerCase().trim() as ElementId);
                            const cfg = elem !== 'custom' ? ELEMENT_CONFIGS[elem] : undefined;
                            if (!cfg) return null;
                            return (
                              <span
                                className="px-1.5 py-0.5 rounded border flex items-center gap-1 shrink-0"
                                style={{
                                  borderColor: `${isLight ? cfg.lightPrimaryColor : cfg.primaryColor}55`,
                                  backgroundColor: `${isLight ? cfg.lightPrimaryColor : cfg.primaryColor}14`,
                                  color: isLight ? cfg.lightPrimaryColor : cfg.primaryColor,
                                }}
                              >
                                <OccultSigil
                                  element={elem}
                                  isLightBackground={isLight}
                                  size={12}
                                  color={isLight ? cfg.lightPrimaryColor : cfg.primaryColor}
                                />
                                <span>{cfg.name}</span>
                              </span>
                            );
                          })())}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                            {itm.inventorySlots === 0 ? '0 Espaço' : `${itm.inventorySlots} Esp`}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleToggleSelectItem(itm.id, e)}
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                              selectedItemIds.includes(itm.id)
                                ? 'bg-amber-600 border-amber-500 text-white shadow-xs'
                                : isLight
                                ? 'border-slate-300 bg-slate-100 hover:border-amber-400 text-transparent hover:text-slate-400'
                                : 'border-zinc-700 bg-zinc-800/80 hover:border-amber-500 text-transparent hover:text-zinc-500'
                            }`}
                            title={selectedItemIds.includes(itm.id) ? 'Remover da Grade 2×2' : 'Selecionar para Grade 2×2 (máx 4)'}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      {/* Item Name */}
                      <h4
                        className={`font-title text-sm font-bold truncate transition-colors ${
                          isLight ? 'text-slate-900 group-hover:text-amber-700' : 'text-white group-hover:text-amber-300'
                        }`}
                        title={itm.name}
                      >
                        {itm.name}
                      </h4>

                      {/* Stats pill if weapon/protection */}
                      {itm.weaponDamage && (
                        <div className="text-[10px] font-mono text-red-400 font-semibold mt-1">
                          ✦ Dano: {itm.weaponDamage} ({itm.weaponDamageType || 'Dano'}) • Crítico: {itm.weaponCritical || 'x2'}
                        </div>
                      )}
                      {itm.protectionDefense && (
                        <div className="text-[10px] font-mono text-blue-400 font-semibold mt-1">
                          ✦ Defesa: {itm.protectionDefense} • Penalidade: {itm.protectionPenalty || 'Nenhuma'}
                        </div>
                      )}

                      {/* Description excerpt */}
                      <p className={`text-[11px] line-clamp-2 mt-1.5 leading-snug ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        {healCorruptedCharacters(itm.description.replace(/\*\*/g, '').replace(/\*/g, ''))}
                      </p>

                      {/* Usage Pips Preview */}
                      {itm.showUseTracker && itm.maxUses > 0 && (
                        <div className="flex items-start gap-1.5 mt-2 text-[10px] font-mono text-zinc-400">
                          <span className={`font-semibold shrink-0 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                            Cargas:
                          </span>
                          <div className="flex items-center flex-wrap gap-1">
                            {Array.from({ length: Math.min(20, itm.maxUses) }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                                  i < itm.currentUses ? 'bg-red-500 border-red-600' : 'bg-zinc-800 border-zinc-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div
                      className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                        isLight ? 'border-slate-200' : 'border-zinc-800/80'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-mono text-zinc-500">
                        {itm.theme?.itemCode || 'ORD-EQP'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicateItem(itm)}
                          title="Duplicar este equipamento"
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === itm.id ? (
                          <div className="flex items-center gap-1 bg-red-950/80 border border-red-800 px-1.5 py-0.5 rounded">
                            <span className="text-[9px] text-red-200">Excluir?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteItem(itm.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-1 rounded font-bold cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[9px] text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(itm.id)}
                            disabled={items.length <= 1}
                            title={items.length <= 1 ? 'Mantenha pelo menos um equipamento' : 'Excluir equipamento'}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              items.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
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

        {/* Footer with Backup & Reset */}
        <div
          className={`px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
            isLight ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-[#0c0c10]'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Exportar Backup (JSON)</span>
            </button>

            <label
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>Importar JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Restaurar os equipamentos padrão da Ordem? Seus itens personalizados podem ser substituídos.')) {
                onResetToDefaults();
                showToast('Itens padrão restaurados com sucesso!');
              }
            }}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Equipamentos Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
