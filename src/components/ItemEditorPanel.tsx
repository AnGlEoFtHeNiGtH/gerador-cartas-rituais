import React, { useState } from 'react';
import {
  ArsenalItem,
  CardCategory,
  MundaneSubcategory,
  ItemCategoryTier,
  CardMode,
  ElementId,
  ELEMENT_CONFIGS,
  MUNDANE_SUBCATEGORIES,
} from '../types';
import { soundEngine } from '../utils/audio';
import {
  Package,
  Shield,
  Crosshair,
  Wrench,
  Radio,
  Sparkles,
  Upload,
  Image as ImageIcon,
  X,
  FileText,
  Sliders,
  Palette,
  Disc,
  RotateCcw,
  Check,
  Bold,
  Italic,
  Dices,
  Trash2,
  Skull,
} from 'lucide-react';

interface ItemEditorPanelProps {
  item: ArsenalItem;
  onChange: (updated: ArsenalItem) => void;
  activeView: 'front' | 'back';
  setActiveView: (view: 'front' | 'back') => void;
  appMode?: 'dark' | 'light';
  onPublishToPublic?: () => void;
}

// Compress uploaded image onto client canvas to prevent exceeding localStorage quota
const processUploadedImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ItemEditorPanel: React.FC<ItemEditorPanelProps> = ({
  item,
  onChange,
  activeView,
  setActiveView,
  appMode = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'stats' | 'art' | 'style'>('content');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const isLightApp = appMode === 'light';

  const update = (partial: Partial<ArsenalItem>) => {
    onChange({
      ...item,
      ...partial,
      updatedAt: Date.now(),
    });
  };

  const updateArtwork = (partialArt: Partial<NonNullable<typeof item.artwork>>) => {
    const current = item.artwork || {
      url: '',
      fit: 'contain',
      scale: 1,
      positionY: 50,
      opacity: 1,
    };
    update({
      artwork: {
        ...current,
        ...partialArt,
      },
    });
  };

  const updateTheme = (partialTheme: Partial<NonNullable<typeof item.theme>>) => {
    const current = item.theme || {
      borderStyle: 'rustic-tactical',
      parchmentTone: 'classic-aged',
      cardMode: 'dark',
      itemCode: 'ORD-EQP-01',
    };
    update({
      theme: {
        ...current,
        ...partialTheme,
      },
    });
  };

  // Insert formatting tag into description textarea
  const insertFormatTag = (tagType: 'bold' | 'italic' | 'dice' | 'dt') => {
    const textarea = document.getElementById('item-desc-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    let insertion = '';
    switch (tagType) {
      case 'bold':
        insertion = `**${selected || 'texto em destaque'}**`;
        break;
      case 'italic':
        insertion = `*${selected || 'texto em itálico'}*`;
        break;
      case 'dice':
        insertion = selected ? `${selected}` : '2d6';
        break;
      case 'dt':
        insertion = 'DT 15';
        break;
    }

    const newText = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    update({ description: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  // Handle local image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await processUploadedImage(file, 850);
      updateArtwork({
        url: base64,
        fit: 'contain',
      });
      soundEngine.playSigilChime(580);
    } catch {
      alert('Erro ao carregar a imagem do item.');
    }
    e.target.value = '';
  };

  return (
    <div
      className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl transition-colors border ${
        isLightApp ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121217] border-zinc-800 text-zinc-100'
      }`}
    >
      {/* ============================================================== */}
      {/* HEADER: TABS & VIEW SWITCHER */}
      {/* ============================================================== */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 shrink-0 ${
          isLightApp ? 'bg-slate-50 border-slate-200' : 'bg-[#0e0e13] border-zinc-800'
        }`}
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'content'
                ? isLightApp
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Conteúdo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stats'
                ? isLightApp
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Atributos & Cargas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('art')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'art'
                ? isLightApp
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto / Arte</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'style'
                ? isLightApp
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Estilo</span>
          </button>
        </div>

        {/* View Switcher: Frente vs Verso */}
        <div className="flex items-center bg-black/40 border border-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveView('front');
              soundEngine.playCardFlip();
            }}
            className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-all ${
              activeView === 'front' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('back');
              soundEngine.playCardFlip();
            }}
            className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-all ${
              activeView === 'back' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Verso
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB CONTENT SCROLL AREA */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ============================================================== */}
        {/* TAB 1: CONTEÚDO (Nome, Categoria, Subcategoria, Descrição) */}
        {/* ============================================================== */}
        {activeTab === 'content' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Nome do Item */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Nome do Item / Equipamento
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ex: Laser de Varredura, Pó Revelador, Revólver .38..."
                className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 border ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#181820] border-zinc-700/80 text-white'
                }`}
              />
            </div>

            {/* Categoria Geral do Item */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Natureza do Item
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mundano', label: 'Mundano', desc: 'Tecnologia & Equipamento Civil/Militar' },
                  { id: 'amaldicoado', label: 'Amaldiçoado', desc: 'Infundido pelo Outro Lado' },
                  { id: 'ritual', label: 'Paranormal', desc: 'Relíquia ou Matéria do Outro Lado' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      update({ itemType: cat.id as CardCategory });
                      soundEngine.playSigilChime(500);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      item.itemType === cat.id
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                        : isLightApp
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#181820] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{cat.label}</span>
                    <span className="text-[10px] opacity-75 block mt-0.5 line-clamp-1">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategoria Mundana / Operacional */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Subcategoria de Equipamento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(['utilitario', 'arma', 'protecao', 'municao', 'acessorio', 'paranormal'] as MundaneSubcategory[]).map(
                  (sub) => {
                    const cfg = MUNDANE_SUBCATEGORIES[sub];
                    const isSelected = item.subcategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          update({ subcategory: sub });
                          soundEngine.playSigilChime(520);
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-500 text-white font-bold ring-1 ring-amber-500/50 shadow-xs'
                            : isLightApp
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#f59e0b' : '#71717a' }} />
                        <span className="truncate">{cfg?.name || sub}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Se for Amaldiçoado: Seletor de Elemento Opcional */}
            {item.itemType === 'amaldicoado' && (
              <div
                className={`p-3 rounded-xl border space-y-2.5 ${
                  isLightApp ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/20 border-purple-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <Skull className="w-4 h-4" />
                  <span>Configurações da Maldição</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono block mb-1">Nome da Maldição</label>
                    <input
                      type="text"
                      value={item.curseName || ''}
                      onChange={(e) => update({ curseName: e.target.value })}
                      placeholder="Ex: Sede Voraz, Sussurros..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono block mb-1">Custo de Sanidade</label>
                    <input
                      type="text"
                      value={item.curseCost || ''}
                      onChange={(e) => update({ curseCost: e.target.value })}
                      placeholder="Ex: 1 Sanidade por cena..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono block mb-1">Elemento Principal da Maldição</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['sangue', 'morte', 'energia', 'conhecimento', 'medo'] as ElementId[]).map((elem) => {
                      const cfg = ELEMENT_CONFIGS[elem];
                      const isElemActive = item.element === elem;
                      return (
                        <button
                          key={elem}
                          type="button"
                          onClick={() => update({ element: elem })}
                          className={`p-1.5 rounded-lg border text-center text-[10px] font-bold transition-all ${
                            isElemActive
                              ? 'bg-zinc-800 border-amber-400 text-white shadow-xs'
                              : 'bg-black/30 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                          style={{
                            borderColor: isElemActive ? cfg.primaryColor : undefined,
                            color: isElemActive ? cfg.primaryColor : undefined,
                          }}
                        >
                          {cfg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Descrição Detalhada com Toolbar de Formatação */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                    isLightApp ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Descrição & Mecânica do Item
                </label>
                {/* Formatting Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormatTag('bold')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    title="Negrito (**texto**)"
                  >
                    <Bold className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('italic')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    title="Itálico (*texto*)"
                  >
                    <Italic className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('dice')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-0.5"
                    title="Inserir Dado"
                  >
                    <Dices className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('dt')}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono font-bold"
                    title="Inserir DT"
                  >
                    DT
                  </button>
                </div>
              </div>

              <textarea
                id="item-desc-textarea"
                rows={5}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Descreva detalhadamente a mecânica, efeito tático, perícia exigida e regras de uso deste item..."
                className={`w-full rounded-xl p-3 text-xs font-mono leading-relaxed transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 border ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#181820] border-zinc-700/80 text-white'
                }`}
              />
            </div>

            {/* Frase de Efeito / Lore */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Frase de Efeito / Lore
              </label>
              <input
                type="text"
                value={item.flavorText || ''}
                onChange={(e) => update({ flavorText: e.target.value })}
                placeholder="Ex: As partículas brilham onde os olhos humanos insistem em não ver nada..."
                className={`w-full rounded-xl px-3 py-2 text-xs italic transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 border ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#181820] border-zinc-700/80 text-white'
                }`}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ATRIBUTOS & CARGAS (Espaços, Categoria, Armas, Usos) */}
        {/* ============================================================== */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Categoria de Prestígio e Espaços no Inventário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                    isLightApp ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Categoria de Patente
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {(['0', 'I', 'II', 'III', 'IV'] as ItemCategoryTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => update({ categoryTier: tier })}
                      className={`py-1.5 rounded-lg border text-center text-xs font-bold transition-all ${
                        item.categoryTier === tier
                          ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                          : isLightApp
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-[#181820] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                    isLightApp ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Espaços Ocupados (Inventário)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={item.inventorySlots}
                    onChange={(e) => update({ inventorySlots: Math.max(0, parseInt(e.target.value) || 0) })}
                    className={`w-20 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-center border ${
                      isLightApp
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700/80 text-white'
                    }`}
                  />
                  <span className="text-xs text-zinc-400">
                    {item.inventorySlots === 0
                      ? 'Não ocupa espaço (0)'
                      : `${item.inventorySlots} ${item.inventorySlots === 1 ? 'espaço' : 'espaços'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* SEÇÃO ESPECÍFICA: ARMAS DE FOGO & CORPO A CORPO */}
            {item.subcategory === 'arma' && (
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isLightApp ? 'bg-red-50/60 border-red-200' : 'bg-red-950/20 border-red-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <Crosshair className="w-4 h-4" />
                  <span>Estatísticas de Combate da Arma</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono block mb-1">Dano Base</label>
                    <input
                      type="text"
                      value={item.weaponDamage || ''}
                      onChange={(e) => update({ weaponDamage: e.target.value })}
                      placeholder="Ex: 2d6, 1d8, 3d6..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono block mb-1">Margem Crítica</label>
                    <input
                      type="text"
                      value={item.weaponCritical || ''}
                      onChange={(e) => update({ weaponCritical: e.target.value })}
                      placeholder="Ex: 19/x3, x2, 20/x4..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono block mb-1">Alcance</label>
                    <input
                      type="text"
                      value={item.weaponRange || ''}
                      onChange={(e) => update({ weaponRange: e.target.value })}
                      placeholder="Ex: Curto (9m), Médio, Corpo a corpo..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono block mb-1">Tipo de Dano</label>
                    <input
                      type="text"
                      value={item.weaponDamageType || ''}
                      onChange={(e) => update({ weaponDamageType: e.target.value })}
                      placeholder="Ex: Balístico, Corte, Impacto..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO ESPECÍFICA: PROTEÇÕES & ARMADURAS */}
            {item.subcategory === 'protecao' && (
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isLightApp ? 'bg-blue-50/60 border-blue-200' : 'bg-blue-950/20 border-blue-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Estatísticas de Proteção</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono block mb-1">Bônus de Defesa</label>
                    <input
                      type="text"
                      value={item.protectionDefense || ''}
                      onChange={(e) => update({ protectionDefense: e.target.value })}
                      placeholder="Ex: +5 Defesa, +10 Defesa..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono block mb-1">Penalidade de Perícia</label>
                    <input
                      type="text"
                      value={item.protectionPenalty || ''}
                      onChange={(e) => update({ protectionPenalty: e.target.value })}
                      placeholder="Ex: -2 Perícias, Nenhuma..."
                      className="w-full bg-black/40 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO: CONTADOR DE CARGAS & USOS (TRACKER PIPS) */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLightApp ? 'bg-slate-50 border-slate-200' : 'bg-[#181820] border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                      Marcadores de Usos / Munição (Tracker Pips)
                    </span>
                    <span className="text-[11px] opacity-75 block">
                      Exibe bolinhas interativas para marcar cargas gastas (idêntico ao Pó Revelador)
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.showUseTracker}
                    onChange={(e) => update({ showUseTracker: e.target.checked, maxUses: item.maxUses || 5 })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                </label>
              </div>

              {item.showUseTracker && (
                <div className="pt-2 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Número Máximo de Cargas / Bolinhas:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={item.maxUses || 5}
                        onChange={(e) => update({ maxUses: parseInt(e.target.value) || 1 })}
                        className="w-28 accent-amber-500"
                      />
                      <span className="text-xs font-mono font-bold w-6 text-center">
                        {item.maxUses || 5}
                      </span>
                    </div>
                  </div>

                  {/* Pré-visualização dos Pips no Painel */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400">
                      Cargas Gastas: {item.currentUses || 0} de {item.maxUses}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: item.maxUses || 5 }).map((_, idx) => {
                        const isFilled = idx < (item.currentUses || 0);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const next = item.currentUses === idx + 1 ? idx : idx + 1;
                              update({ currentUses: next });
                              soundEngine.playCardFlip();
                            }}
                            className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 ${
                              isFilled ? 'bg-zinc-900 border-zinc-950 text-white' : 'bg-white border-zinc-600'
                            }`}
                            title={`Clique para marcar/desmarcar pip ${idx + 1}`}
                          >
                            {isFilled && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mx-auto" />}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => update({ currentUses: 0 })}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Zerar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: FOTO / ARTE (Upload de Imagem, URL e Enquadramento) */}
        {/* ============================================================== */}
        {activeTab === 'art' && (
          <div className="space-y-4 animate-fadeIn">
            <div
              className={`p-3.5 rounded-xl border space-y-3 ${
                isLightApp ? 'bg-slate-50 border-slate-200' : 'bg-[#181820] border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                    Fotografia / Ilustração do Item
                  </span>
                  <span className="text-[11px] opacity-75 block">
                    Envie fotos de armas, ferramentas, documentos ou gadgets para a carta
                  </span>
                </div>
                {item.artwork?.url && (
                  <button
                    type="button"
                    onClick={() => update({ artwork: undefined })}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Foto</span>
                  </button>
                )}
              </div>

              {/* Upload Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Carregar do Computador (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* URL Input */}
                <div className="flex-1 min-w-[200px] flex items-center gap-1">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Cole a URL da imagem..."
                    className={`w-full rounded-lg px-2.5 py-2 text-xs border ${
                      isLightApp
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-black/60 border-zinc-800 text-white'
                    }`}
                  />
                  {imageUrlInput && (
                    <button
                      type="button"
                      onClick={() => {
                        updateArtwork({ url: imageUrlInput });
                        setImageUrlInput('');
                        soundEngine.playSigilChime(580);
                      }}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-xs text-white rounded-lg font-bold shrink-0"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
              </div>

              {/* Controles de Enquadramento da Imagem */}
              {item.artwork?.url && (
                <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs block mb-1">Enquadramento:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateArtwork({ fit: 'contain' })}
                          className={`py-1 text-xs rounded border font-semibold ${
                            item.artwork.fit === 'contain'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-black/40 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          Conter (Inteira)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateArtwork({ fit: 'cover' })}
                          className={`py-1 text-xs rounded border font-semibold ${
                            item.artwork.fit === 'cover'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-black/40 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          Preencher (Cover)
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs block mb-1">Zoom / Escala:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0.6}
                          max={2.0}
                          step={0.05}
                          value={item.artwork.scale ?? 1}
                          onChange={(e) => updateArtwork({ scale: parseFloat(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                        <span className="text-xs font-mono w-8 text-right">
                          {Math.round((item.artwork.scale ?? 1) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs block mb-1">Posicionamento Vertical (Y):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={item.artwork.positionY ?? 50}
                        onChange={(e) => updateArtwork({ positionY: parseInt(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                      <span className="text-xs font-mono w-8 text-right">
                        {item.artwork.positionY ?? 50}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: ESTILO & TEMA (Pergaminho, Código de Patrimônio) */}
        {/* ============================================================== */}
        {activeTab === 'style' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Tom do Pergaminho */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Textura / Tom da Caixa de Descrição
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'classic-aged', name: 'Pergaminho Envelhecido', desc: 'Tom areia clássico com textura' },
                  { id: 'off-white', name: 'Papel Arquivo (Off-White)', desc: 'Documento limpo de investigação' },
                  { id: 'tactical-dark', name: 'Tático Noturno (Dark)', desc: 'Fundo preto/cinza tático militar' },
                  { id: 'blood-stained', name: 'Marcado de Sangue', desc: 'Resíduo rubro nas bordas' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => updateTheme({ parchmentTone: tone.id as NonNullable<typeof item.theme>['parchmentTone'] })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      (item.theme?.parchmentTone || 'classic-aged') === tone.id
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                        : isLightApp
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#181820] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{tone.name}</span>
                    <span className="text-[10px] opacity-75 block mt-0.5 line-clamp-1">{tone.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Código de Patrimônio / Registro */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Código de Patrimônio (Ordo Realitas)
              </label>
              <input
                type="text"
                value={item.theme?.itemCode || 'ORD-EQP-01'}
                onChange={(e) => updateTheme({ itemCode: e.target.value })}
                placeholder="Ex: ORD-UTIL-05, ORD-WPN-38..."
                className={`w-full rounded-xl px-3 py-2 text-xs font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 border ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#181820] border-zinc-700/80 text-white'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
