import React, { useState } from 'react';
import {
  Ritual,
  ElementId,
  CircleTier,
  CornerStyle,
  BorderStyle,
  BgTone,
  CardMode,
  CustomIconFilter,
  ELEMENT_CONFIGS,
} from '../types';
import { OccultSigil, SIGIL_PRESETS } from './OccultSigil';
import { soundEngine } from '../utils/audio';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Palette,
  FileText,
  Bold,
  Italic,
  Dices,
  Image as ImageIcon,
  Upload,
  X,
  Sun,
  Moon,
  Wand2,
  Feather,
  Share2,
} from 'lucide-react';

interface EditorPanelProps {
  ritual: Ritual;
  onChange: (updated: Ritual) => void;
  activeView: 'front' | 'back';
  setActiveView: (view: 'front' | 'back') => void;
  appMode?: 'dark' | 'light';
  onOpenLightPrint?: () => void;
  onPublishToPublic?: () => void;
}

// Compress uploaded image onto client canvas to prevent exceeding localStorage quota
const processUploadedImage = (file: File, maxWidth = 850): Promise<string> => {
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
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(format, 0.85);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const EditorPanel: React.FC<EditorPanelProps> = ({
  ritual,
  onChange,
  activeView,
  setActiveView,
  appMode = 'dark',
  onOpenLightPrint,
  onPublishToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'mods' | 'art' | 'style'>('content');
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [iconInputUrl, setIconInputUrl] = useState('');

  const isLightApp = appMode === 'light';

  // Fallback for basePd if older data exists
  const currentBasePd =
    ritual.basePd || (ritual as unknown as { basePe?: string }).basePe || '1 PD';

  // Helper updater
  const update = (partial: Partial<Ritual>) => {
    onChange({
      ...ritual,
      ...partial,
      updatedAt: Date.now(),
    });
  };

  const updateTheme = (partialTheme: Partial<typeof ritual.theme>) => {
    onChange({
      ...ritual,
      theme: {
        ...ritual.theme,
        ...partialTheme,
      },
      updatedAt: Date.now(),
    });
  };

  const updateArtwork = (partialArt: Partial<NonNullable<typeof ritual.artwork>>) => {
    const current = ritual.artwork || {
      url: '',
      mode: 'illustration',
      opacity: 0.9,
      scale: 1,
      fit: 'cover',
      positionY: 50,
      showOnFront: true,
      showOnBack: false,
      blendMode: 'normal',
    };
    update({
      artwork: {
        ...current,
        ...partialArt,
      },
    });
  };

  // Add Modification (Custos em PD)
  const handleAddModification = () => {
    const isFirst = ritual.modifications.length === 0;
    const isSecond = ritual.modifications.length === 1;

    const newMod = {
      id: `mod-${Date.now()}`,
      name: isFirst ? 'Discente' : isSecond ? 'Verdadeiro' : 'Aprimoramento',
      cost: isFirst ? '+2 PD' : isSecond ? '+5 PD' : '+3 PD',
      requirement: isFirst ? 'Requer 2º Círculo' : isSecond ? 'Requer 3º Círculo' : '',
      text: 'Descreva a alteração ou ampliação do efeito ao pagar os Pontos de Destruição (PD) adicionais.',
    };

    update({
      modifications: [...ritual.modifications, newMod],
    });
  };

  // Remove Modification
  const handleRemoveModification = (id: string) => {
    update({
      modifications: ritual.modifications.filter((m) => m.id !== id),
    });
  };

  // Update specific Modification
  const handleUpdateModification = (
    id: string,
    field: 'name' | 'cost' | 'requirement' | 'text',
    value: string
  ) => {
    update({
      modifications: ritual.modifications.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  };

  // Move Modification Up / Down
  const handleMoveModification = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ritual.modifications.length) return;

    const list = [...ritual.modifications];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    update({ modifications: list });
  };

  // Insert formatting tag into description textarea
  const insertFormatTag = (tagType: 'bold' | 'italic' | 'dice' | 'pd' | 'dt') => {
    const textarea = document.getElementById('ritual-desc-textarea') as HTMLTextAreaElement | null;
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
        insertion = selected ? `${selected}` : '3d6';
        break;
      case 'pd':
        insertion = '+2 PD';
        break;
      case 'dt':
        insertion = 'DT';
        break;
    }

    const newText =
      textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    update({ description: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  // Handle image upload from computer
  const handleArtworkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await processUploadedImage(file, 900);
      updateArtwork({
        url: base64,
        mode: ritual.artwork?.mode || 'illustration',
        showOnFront: true,
      });
      soundEngine.playSigilChime(580);
    } catch {
      alert('Erro ao carregar a imagem selecionada.');
    }
    e.target.value = '';
  };

  // Handle universal custom element symbol upload (accepts any image format)
  const handleSymbolIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await processUploadedImage(file, 300);
      update({
        customElementIcon: base64,
      });
      // Set default auto filter
      if (!ritual.theme.customIconFilter) {
        updateTheme({ customIconFilter: 'auto' });
      }
      soundEngine.playSigilChime(620);
    } catch {
      alert('Erro ao carregar o ícone selecionado.');
    }
    e.target.value = '';
  };

  return (
    <div
      className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl transition-colors border ${
        isLightApp
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#121217] border-zinc-800 text-zinc-100'
      }`}
    >
      {/* Editor Header: Tabs & View Switcher */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 shrink-0 ${
          isLightApp
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d0d12] border-zinc-800/80'
        }`}
      >
        {/* Navigation Tabs */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
            isLightApp
              ? 'bg-slate-200/60 border-slate-300'
              : 'bg-[#1a1a22] border-zinc-800'
          }`}
        >
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'content'
                ? isLightApp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-zinc-800 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dados & Custos</span>
          </button>

          <button
            onClick={() => setActiveTab('mods')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'mods'
                ? isLightApp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-zinc-800 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aprimoramentos (PD)</span>
            {ritual.modifications.length > 0 && (
              <span className="text-[10px] bg-red-800/80 text-red-200 px-1.5 py-0.2 rounded-full font-bold">
                {ritual.modifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('art')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'art'
                ? isLightApp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-zinc-800 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Arte</span>
            {ritual.artwork?.url && <span className="w-2 h-2 rounded-full bg-red-500" />}
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'style'
                ? isLightApp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-zinc-800 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tema & Visual</span>
          </button>
        </div>

        {/* View Face Switch (Frente / Verso) */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ml-2 ${
            isLightApp
              ? 'bg-slate-200/60 border-slate-300'
              : 'bg-[#1a1a22] border-zinc-800'
          }`}
        >
          <button
            onClick={() => {
              setActiveView('front');
              soundEngine.playCardFlip();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'front'
                ? isLightApp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-zinc-700 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Frente
          </button>
          <button
            onClick={() => {
              setActiveView('back');
              soundEngine.playCardFlip();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'back'
                ? isLightApp
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-zinc-700 text-white shadow-xs'
                : isLightApp
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Verso
          </button>
        </div>

        {/* Publicar Carta no Deck Público button */}
        {onPublishToPublic && (
          <button
            type="button"
            onClick={onPublishToPublic}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ml-2 ${
              isLightApp
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border-blue-800/60 shadow-2xs'
            }`}
            title="Publicar esta carta no Grimório Público da Comunidade"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Publicar</span>
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ======================================================== */}
        {/* TAB 1: CONTENT (DADOS PRINCIPAIS & CUSTOS EM PD) */}
        {/* ======================================================== */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Nome do Ritual (Westsac font) */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Nome do Ritual (Fonte Westsac)
              </label>
              <input
                type="text"
                value={ritual.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ex: Amaldiçoar Arma, Ectoplasma..."
                className={`w-full rounded-xl px-3.5 py-2 text-base font-sans font-bold tracking-wide focus:outline-hidden focus:ring-2 focus:ring-red-500 transition-all border ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-[#181820] border-zinc-700/80 text-white placeholder-zinc-500'
                }`}
              />
            </div>

            {/* Elemento & Círculo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Element Selector */}
              <div>
                <label
                  className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                    isLightApp ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Elemento
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['sangue', 'morte', 'energia', 'conhecimento', 'medo', 'custom'] as ElementId[]).map(
                    (elem) => {
                      const cfg = ELEMENT_CONFIGS[elem];
                      const isSelected = ritual.element === elem;
                      return (
                        <button
                          key={elem}
                          type="button"
                          onClick={() => {
                            soundEngine.playSigilChime();
                            update({ element: elem });
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all ${
                            isSelected
                              ? isLightApp
                                ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                                : 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-semibold'
                              : isLightApp
                              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                              : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          <OccultSigil
                            element={elem}
                            symbolPreset={ritual.symbolPreset}
                            customIconUrl={ritual.customElementIcon}
                            customIconFilter={ritual.theme.customIconFilter}
                            customIconInvert={ritual.theme.customIconInvert}
                            cardMode={ritual.theme.cardMode}
                            size={16}
                            color={cfg.primaryColor}
                          />
                          <span className="truncate">{cfg.name}</span>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Custom Element options if selected */}
                {ritual.element === 'custom' && (
                  <div
                    className={`mt-2.5 p-2.5 rounded-xl border space-y-2 ${
                      isLightApp ? 'bg-slate-50 border-slate-300' : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-medium block mb-1">Nome do Elemento</span>
                      <input
                        type="text"
                        value={ritual.customElementName || ''}
                        onChange={(e) => update({ customElementName: e.target.value })}
                        placeholder="Ex: Tenebra, Vácuo, Luz..."
                        className="w-full bg-transparent border border-zinc-400/50 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium block mb-1">Cor do Elemento</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={ritual.customElementColor || '#10b981'}
                          onChange={(e) => update({ customElementColor: e.target.value })}
                          className="w-8 h-8 rounded border border-zinc-500 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono font-bold">
                          {ritual.customElementColor || '#10b981'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Círculo do Ritual */}
              <div>
                <label
                  className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                    isLightApp ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Círculo / Grau
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([1, 2, 3, 4] as CircleTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => update({ circle: tier })}
                      className={`flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-cinzel transition-all ${
                        ritual.circle === tier
                          ? isLightApp
                            ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                            : 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-bold'
                          : isLightApp
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-sm font-bold">{tier}º</span>
                      <span className="text-[9px] font-mono uppercase opacity-75">Círculo</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Símbolo do Elemento Universal (Pre-configurados ou Qualquer Imagem) */}
            <div
              className={`p-3.5 rounded-xl border space-y-3 ${
                isLightApp ? 'bg-slate-50 border-slate-200' : 'bg-[#181820] border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                    Símbolo do Elemento
                  </span>
                  <span className="text-[11px] opacity-75 block">
                    Escolha um símbolo temático ou envie qualquer imagem própria
                  </span>
                </div>
                {ritual.customElementIcon && (
                  <button
                    type="button"
                    onClick={() => update({ customElementIcon: undefined })}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Restaurar Padrão</span>
                  </button>
                )}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {SIGIL_PRESETS.map((preset) => {
                  const isSelected =
                    !ritual.customElementIcon &&
                    (ritual.symbolPreset || 'default') === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        update({
                          symbolPreset: preset.id,
                          customElementIcon: undefined,
                        });
                        soundEngine.playSigilChime(500);
                      }}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? isLightApp
                            ? 'bg-slate-900 border-slate-900 text-white font-bold'
                            : 'bg-zinc-800 border-zinc-400 text-white font-semibold'
                          : isLightApp
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-black/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <OccultSigil
                        element={ritual.element}
                        symbolPreset={preset.id}
                        cardMode={ritual.theme.cardMode}
                        size={20}
                        color={isSelected ? undefined : undefined}
                      />
                      <span className="text-[11px] truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Universal Image Upload & Treatment for Custom Icons */}
              <div
                className={`pt-2.5 border-t space-y-2 ${
                  isLightApp ? 'border-slate-200' : 'border-zinc-800'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload de Qualquer Imagem (PNG/JPG/SVG)</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      onChange={handleSymbolIconUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Icon URL */}
                  <div className="flex-1 min-w-[170px] flex items-center gap-1">
                    <input
                      type="text"
                      value={iconInputUrl}
                      onChange={(e) => setIconInputUrl(e.target.value)}
                      placeholder="Ou cole URL da imagem..."
                      className={`w-full rounded-lg px-2.5 py-1 text-xs border ${
                        isLightApp
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-black/60 border-zinc-800 text-white'
                      }`}
                    />
                    {iconInputUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          update({ customElementIcon: iconInputUrl });
                          setIconInputUrl('');
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded font-medium"
                      >
                        Aplicar
                      </button>
                    )}
                  </div>
                </div>

                {/* Treatment Controls for Uploaded Custom Icon */}
                {ritual.customElementIcon && (
                  <div
                    className={`p-2.5 rounded-lg border space-y-2 mt-2 ${
                      isLightApp ? 'bg-white border-slate-300' : 'bg-black/50 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                        Tratamento Visual da Imagem
                      </span>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ritual.theme.customIconInvert ?? false}
                          onChange={(e) =>
                            updateTheme({ customIconInvert: e.target.checked })
                          }
                          className="w-3.5 h-3.5 rounded accent-red-600"
                        />
                        <span>Inverter Cores</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'auto', label: 'Auto (Remover Fundo)' },
                        { id: 'silhouette', label: 'Silhueta do Elemento' },
                        { id: 'monochrome', label: 'Monocromático' },
                        { id: 'original', label: 'Original' },
                      ].map((fil) => (
                        <button
                          key={fil.id}
                          type="button"
                          onClick={() =>
                            updateTheme({ customIconFilter: fil.id as CustomIconFilter })
                          }
                          className={`px-2 py-1 rounded text-xs transition-all font-medium border ${
                            (ritual.theme.customIconFilter || 'auto') === fil.id
                              ? 'bg-red-700 border-red-700 text-white font-bold'
                              : isLightApp
                              ? 'bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {fil.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Atributos / Barra de Custos */}
            <div
              className={`space-y-2 pt-2 border-t ${
                isLightApp ? 'border-slate-200' : 'border-zinc-800/80'
              }`}
            >
              <span
                className={`text-xs font-mono uppercase tracking-wider font-semibold block ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Barra de Atributos & Conjuração (Custos em PD)
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* Execução */}
                <div>
                  <label className="block text-[11px] font-semibold opacity-75 mb-0.5">Execução</label>
                  <input
                    type="text"
                    value={ritual.execution}
                    onChange={(e) => update({ execution: e.target.value })}
                    placeholder="Padrão, Completa, Reação..."
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
                      isLightApp
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700/80 text-white'
                    }`}
                  />
                </div>

                {/* Alcance */}
                <div>
                  <label className="block text-[11px] font-semibold opacity-75 mb-0.5">Alcance</label>
                  <input
                    type="text"
                    value={ritual.range}
                    onChange={(e) => update({ range: e.target.value })}
                    placeholder="Toque, Curto (9m)..."
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
                      isLightApp
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700/80 text-white'
                    }`}
                  />
                </div>

                {/* Alvo / Área */}
                <div>
                  <label className="block text-[11px] font-semibold opacity-75 mb-0.5">Alvo / Área</label>
                  <input
                    type="text"
                    value={ritual.target}
                    onChange={(e) => update({ target: e.target.value })}
                    placeholder="1 criatura, 1 objeto..."
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
                      isLightApp
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700/80 text-white'
                    }`}
                  />
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-[11px] font-semibold opacity-75 mb-0.5">Duração</label>
                  <input
                    type="text"
                    value={ritual.duration}
                    onChange={(e) => update({ duration: e.target.value })}
                    placeholder="Cena, Instantânea..."
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
                      isLightApp
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700/80 text-white'
                    }`}
                  />
                </div>

                {/* Custo Base PD */}
                <div>
                  <label className="block text-[11px] text-red-600 font-bold mb-0.5">
                    Custo Base PD
                  </label>
                  <input
                    type="text"
                    value={currentBasePd}
                    onChange={(e) => update({ basePd: e.target.value })}
                    placeholder="1 PD, 3 PD, 6 PD..."
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold border ${
                      isLightApp
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : 'bg-[#181820] border-red-900/60 text-red-200'
                    }`}
                  />
                </div>

                {/* Resistência */}
                <div>
                  <label className="block text-[11px] font-semibold opacity-75 mb-0.5">Resistência</label>
                  <input
                    type="text"
                    value={ritual.resistance || ''}
                    onChange={(e) => update({ resistance: e.target.value })}
                    placeholder="Nenhuma, Vontade anula..."
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
                      isLightApp
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700/80 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Descrição Principal com Formatação Rápida */}
            <div
              className={`space-y-1.5 pt-2 border-t ${
                isLightApp ? 'border-slate-200' : 'border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                    isLightApp ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  Descrição do Efeito Principal
                </label>

                {/* Formatting Quick Tools */}
                <div
                  className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                    isLightApp ? 'bg-slate-100 border-slate-300' : 'bg-black/40 border-zinc-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => insertFormatTag('bold')}
                    title="Negrito (**texto**)"
                    className="p-1 rounded hover:bg-zinc-700/50 text-xs"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('italic')}
                    title="Itálico (*texto*)"
                    className="p-1 rounded hover:bg-zinc-700/50 text-xs"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('dice')}
                    title="Adicionar rolagem de dado"
                    className="p-1 rounded hover:bg-zinc-700/50 text-xs flex items-center gap-0.5"
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('pd')}
                    title="Adicionar tag de PD"
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-red-500 hover:bg-zinc-700/50"
                  >
                    +PD
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('dt')}
                    title="Adicionar tag de DT"
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono hover:bg-zinc-700/50"
                  >
                    DT
                  </button>
                </div>
              </div>

              <textarea
                id="ritual-desc-textarea"
                rows={5}
                value={ritual.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Descreva o efeito básico do ritual em detalhes..."
                className={`w-full rounded-xl p-3 text-[13px] font-body leading-relaxed border focus:outline-hidden focus:ring-2 focus:ring-red-500 ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-[#181820] border-zinc-700/80 text-zinc-100 placeholder-zinc-500'
                }`}
              />
            </div>

            {/* Texto de Ambientação (Flavor Text) */}
            <div
              className={`pt-2 border-t ${
                isLightApp ? 'border-slate-200' : 'border-zinc-800/80'
              }`}
            >
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Frase de Ambientação (Flavor Text - Opcional)
              </label>
              <input
                type="text"
                value={ritual.flavorText || ''}
                onChange={(e) => update({ flavorText: e.target.value })}
                placeholder="Ex: O metal sedento estremece e pulsa como uma artéria aberta..."
                className={`w-full rounded-xl px-3 py-2 text-xs italic border ${
                  isLightApp
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#181820] border-zinc-700/80 text-zinc-300'
                }`}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MODIFICATIONS (DISCENTE / VERDADEIRO EM PD) */}
        {/* ======================================================== */}
        {activeTab === 'mods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
                  Aprimoramentos de Custo em PD
                </h3>
                <p className="text-[11px] opacity-75">
                  Configure as variações Discente (+PD), Verdadeiro (+PD) ou Especiais.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddModification}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Modificação (PD)</span>
              </button>
            </div>

            {/* List of modifications */}
            {ritual.modifications.length === 0 ? (
              <div
                className={`p-8 text-center border-2 border-dashed rounded-2xl ${
                  isLightApp ? 'border-slate-300 bg-slate-50' : 'border-zinc-800 bg-zinc-900/30'
                }`}
              >
                <Sparkles className="w-8 h-8 opacity-40 mx-auto mb-2" />
                <p className="text-xs font-semibold">Nenhum aprimoramento adicionado.</p>
                <button
                  type="button"
                  onClick={handleAddModification}
                  className="mt-3 px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded-lg text-xs text-white font-semibold"
                >
                  Adicionar Discente (+2 PD)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ritual.modifications.map((mod, index) => (
                  <div
                    key={mod.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 relative group ${
                      isLightApp ? 'bg-slate-50 border-slate-300' : 'bg-[#181820] border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={mod.name}
                          onChange={(e) =>
                            handleUpdateModification(mod.id, 'name', e.target.value)
                          }
                          placeholder="Discente..."
                          className={`rounded-lg px-2 py-1 text-xs font-bold w-28 border ${
                            isLightApp
                              ? 'bg-white border-slate-300 text-slate-900'
                              : 'bg-black/60 border-zinc-700 text-white'
                          }`}
                        />
                        <input
                          type="text"
                          value={mod.cost}
                          onChange={(e) =>
                            handleUpdateModification(mod.id, 'cost', e.target.value)
                          }
                          placeholder="+2 PD"
                          className={`rounded-lg px-2 py-1 text-xs font-mono font-bold w-20 border ${
                            isLightApp
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-black/60 border-red-900/80 text-red-300'
                          }`}
                        />
                        <input
                          type="text"
                          value={mod.requirement || ''}
                          onChange={(e) =>
                            handleUpdateModification(mod.id, 'requirement', e.target.value)
                          }
                          placeholder="Requisito (ex: Requer 2º Círculo)"
                          className={`rounded-lg px-2 py-1 text-xs flex-1 border ${
                            isLightApp
                              ? 'bg-white border-slate-300 text-slate-900'
                              : 'bg-black/60 border-zinc-700 text-zinc-300'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveModification(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded opacity-70 hover:opacity-100 disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveModification(index, 'down')}
                          disabled={index === ritual.modifications.length - 1}
                          className="p-1 rounded opacity-70 hover:opacity-100 disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveModification(mod.id)}
                          className="p-1 rounded text-red-500 hover:text-red-600 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={mod.text}
                      onChange={(e) =>
                        handleUpdateModification(mod.id, 'text', e.target.value)
                      }
                      placeholder="Descreva o efeito ampliado ao pagar este custo em PD..."
                      className={`w-full rounded-lg p-2 text-xs font-body border leading-snug ${
                        isLightApp
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-black/60 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ART & IMAGE MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'art' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
                Arte & Ilustração do Ritual
              </h3>
              <p className="text-[11px] opacity-75">
                Faça upload de uma arte do seu computador ou cole um link web.
              </p>
            </div>

            {ritual.artwork?.url ? (
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isLightApp ? 'bg-slate-50 border-slate-300' : 'bg-[#181820] border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-500 bg-black shrink-0 relative">
                    <img
                      src={ritual.artwork.url}
                      alt="Arte do ritual"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <span className="text-xs font-bold block">Imagem Carregada</span>
                    <span className="text-[11px] opacity-75 block mt-0.5">
                      Modo atual: <strong className="capitalize">{ritual.artwork.mode}</strong>
                    </span>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => update({ artwork: undefined })}
                        className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover Imagem</span>
                      </button>

                      <label
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                          isLightApp
                            ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                        }`}
                      >
                        <span>Trocar Arquivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleArtworkFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Artwork Position & Mode Controls */}
                <div
                  className={`pt-3 border-t space-y-3 ${
                    isLightApp ? 'border-slate-200' : 'border-zinc-800/80'
                  }`}
                >
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
                      Modo de Enquadramento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: 'illustration',
                          label: 'Quadro de Destaque',
                          desc: 'Moldura acima do texto',
                        },
                        {
                          id: 'background',
                          label: 'Arte de Fundo',
                          desc: 'Marca d\'água sob texto',
                        },
                        {
                          id: 'back-cover',
                          label: 'Capa no Verso',
                          desc: 'Destaque no verso',
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            updateArtwork({
                              mode: m.id as 'illustration' | 'background' | 'back-cover',
                              showOnFront: m.id !== 'back-cover',
                              showOnBack: m.id === 'back-cover' || (ritual.artwork?.showOnBack ?? false),
                            })
                          }
                          className={`p-2 rounded-xl border text-left transition-all ${
                            ritual.artwork?.mode === m.id
                              ? isLightApp
                                ? 'bg-slate-900 border-slate-900 text-white font-bold'
                                : 'bg-zinc-800 border-zinc-400 text-white font-bold'
                              : isLightApp
                              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              : 'bg-black/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-xs block font-bold">{m.label}</span>
                          <span className="text-[10px] opacity-75 block mt-0.5">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ritual.artwork.showOnFront ?? true}
                        onChange={(e) =>
                          updateArtwork({ showOnFront: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-600 rounded"
                      />
                      <span>Exibir na Frente da Carta</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ritual.artwork.showOnBack ?? false}
                        onChange={(e) =>
                          updateArtwork({ showOnBack: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-600 rounded"
                      />
                      <span>Exibir no Verso da Carta</span>
                    </label>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span>Opacidade</span>
                        <span className="font-mono">
                          {Math.round((ritual.artwork.opacity ?? 0.9) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={ritual.artwork.opacity ?? 0.9}
                        onChange={(e) =>
                          updateArtwork({ opacity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span>Zoom / Escala</span>
                        <span className="font-mono">
                          {Math.round((ritual.artwork.scale ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.8"
                        step="0.05"
                        value={ritual.artwork.scale ?? 1}
                        onChange={(e) =>
                          updateArtwork({ scale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span>Posição Vertical</span>
                        <span className="font-mono">
                          {Math.round(ritual.artwork.positionY ?? 50)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={ritual.artwork.positionY ?? 50}
                        onChange={(e) =>
                          updateArtwork({ positionY: parseInt(e.target.value) })
                        }
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`p-8 border-2 border-dashed rounded-2xl text-center space-y-4 ${
                  isLightApp ? 'border-slate-300 bg-slate-50' : 'border-zinc-700/80 bg-black/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center mx-auto text-red-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Adicionar Imagem Pré-existente ao Ritual</h4>
                  <p className="text-xs opacity-75 mt-1 max-w-md mx-auto">
                    Envie a arte de uma criatura ou cena do seu computador (PNG, JPG, WebP) ou insira um link.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Fazer Upload do Arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArtworkFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center justify-center gap-2 max-w-sm mx-auto pt-2">
                  <input
                    type="text"
                    value={imageInputUrl}
                    onChange={(e) => setImageInputUrl(e.target.value)}
                    placeholder="Ou cole a URL da imagem..."
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs border ${
                      isLightApp
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-[#181820] border-zinc-700 text-white'
                    }`}
                  />
                  {imageInputUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        updateArtwork({
                          url: imageInputUrl,
                          mode: 'illustration',
                          showOnFront: true,
                        });
                        setImageInputUrl('');
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg font-medium"
                    >
                      Carregar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: STYLE, LIGHT MODE & AESTHETICS */}
        {/* ======================================================== */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* TEMA DA CARTA: MODO CLARO VS MODO ESCURO */}
            <div
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLightApp ? 'bg-slate-50 border-slate-300' : 'bg-[#181820] border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                    Tema Visual da Carta
                  </span>
                  <span className="text-[11px] opacity-75 block">
                    Alterne entre a estética sombria clássica e o modo claro de alto contraste
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateTheme({
                      cardMode: 'dark',
                      bgTone: ritual.theme.bgTone === 'light-pure' || ritual.theme.bgTone === 'light-parchment' ? 'black' : ritual.theme.bgTone,
                    })
                  }
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    ritual.theme.cardMode !== 'light'
                      ? 'bg-zinc-900 border-zinc-400 text-white font-bold ring-1 ring-zinc-400'
                      : isLightApp
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-black/50 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Moon className="w-4 h-4 text-zinc-300" />
                  <div>
                    <span className="text-xs block">Modo Escuro (Paranormal)</span>
                    <span className="text-[10px] opacity-75 block">Fundo preto e bordas prateadas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateTheme({
                      cardMode: 'light',
                      bgTone: 'light-pure',
                    })
                  }
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    ritual.theme.cardMode === 'light'
                      ? 'bg-white border-slate-900 text-slate-900 font-bold ring-1 ring-slate-900'
                      : isLightApp
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-black/50 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs block">Modo Claro (Alquimia)</span>
                    <span className="text-[10px] opacity-75 block">Fundo claro e bordas escuras</span>
                  </div>
                </button>
              </div>

              {onOpenLightPrint && (
                <div
                  className={`pt-2.5 mt-2 border-t flex flex-wrap items-center justify-between gap-2 ${
                    isLightApp ? 'border-slate-200' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    <Feather className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Deseja economizar tinta preta para imprimir em sulfite?</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenLightPrint}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors shrink-0"
                  >
                    <span>Ver Impressão Leve</span>
                  </button>
                </div>
              )}
            </div>

            {/* Formato dos Cantos */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Corte dos Cantos da Carta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'chamfer', label: 'Chanfrado Ocultista', sub: 'Corte 45º clássico' },
                  { id: 'sharp', label: 'Reto Clássico', sub: 'Cantos retos 90º' },
                  { id: 'rounded', label: 'Arredondado', sub: 'Padrão card game' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateTheme({ cornerStyle: opt.id as CornerStyle })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      ritual.theme.cornerStyle === opt.id
                        ? isLightApp
                          ? 'bg-slate-900 border-slate-900 text-white font-bold'
                          : 'bg-zinc-800 border-zinc-400 text-white font-bold'
                        : isLightApp
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo da Borda */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Estilo da Borda Dupla
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'double-silver', label: 'Dupla Clássica', desc: 'Borda dupla fina' },
                  { id: 'runic', label: 'Ocultista Marcada', desc: 'Contornos nítidos' },
                  { id: 'gold-accent', label: 'Dourada Alquímica', desc: 'Dourado de Conhecimento' },
                  { id: 'pure-minimal', label: 'Minimalista Fina', desc: 'Traço sutil e discreto' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateTheme({ borderStyle: opt.id as BorderStyle })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      ritual.theme.borderStyle === opt.id
                        ? isLightApp
                          ? 'bg-slate-900 border-slate-900 text-white font-bold'
                          : 'bg-zinc-800 border-zinc-400 text-white font-bold'
                        : isLightApp
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tom de Fundo da Carta */}
            <div>
              <label
                className={`block text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold ${
                  isLightApp ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                Textura do Fundo da Carta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ritual.theme.cardMode === 'light'
                  ? [
                      { id: 'light-pure', label: 'Branco Puro', sub: 'Contraste máximo' },
                      { id: 'light-parchment', label: 'Pergaminho Claro', sub: 'Textura suave' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateTheme({ bgTone: opt.id as BgTone })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          ritual.theme.bgTone === opt.id
                            ? 'bg-slate-900 border-slate-900 text-white font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className="text-[10px] opacity-75 block mt-0.5">{opt.sub}</span>
                      </button>
                    ))
                  : [
                      { id: 'black', label: 'Preto Absoluto', sub: '#000000 puro' },
                      { id: 'charcoal', label: 'Cinza Chumbo', sub: '#0d0d12 profundo' },
                      { id: 'parchment', label: 'Grimório Escuro', sub: 'Trama paranormal' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateTheme({ bgTone: opt.id as BgTone })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          ritual.theme.bgTone === opt.id
                            ? 'bg-zinc-800 border-zinc-400 text-white font-bold'
                            : 'bg-[#181820] border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className="text-[10px] opacity-75 block mt-0.5">{opt.sub}</span>
                      </button>
                    ))}
              </div>
            </div>

            {/* Opacidade do Sigilo */}
            <div
              className={`space-y-1.5 pt-2 border-t ${
                isLightApp ? 'border-slate-200' : 'border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider font-semibold">
                  Opacidade do Sigilo de Fundo (Marca d'Água)
                </label>
                <span className="text-xs font-mono font-bold">
                  {Math.round(ritual.theme.watermarkOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.04"
                max="0.35"
                step="0.01"
                value={ritual.theme.watermarkOpacity}
                onChange={(e) =>
                  updateTheme({ watermarkOpacity: parseFloat(e.target.value) })
                }
                className="w-full accent-red-600"
              />
            </div>

            {/* ESTILO DO VERSO DA CARTA: APENAS SÍMBOLO LIMPO & SELO */}
            <div
              className={`p-3.5 rounded-xl border space-y-3 ${
                isLightApp ? 'bg-slate-50 border-slate-300' : 'bg-[#181820] border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                    Selo e Simbologia do Verso
                  </span>
                  <span className="text-[11px] opacity-75 block">
                    Personalize a aparência das marcas ocultas na face traseira da carta
                  </span>
                </div>
              </div>

              {/* Checkbox: Apenas Símbolo Limpo no Verso */}
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  ritual.theme.cleanBackSymbolOnly
                    ? isLightApp
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-blue-950/50 border-blue-800 text-blue-200'
                    : isLightApp
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-black/40 border-zinc-700/60 text-zinc-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ritual.theme.cleanBackSymbolOnly ?? false}
                  onChange={(e) => updateTheme({ cleanBackSymbolOnly: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold block">Apenas Símbolo Limpo no Verso</span>
                  <span className="text-[11px] opacity-75 block mt-0.5 leading-snug">
                    Remove completamente os padrões complexos, anéis concêntricos e círculos rúnicos de fundo, renderizando apenas o símbolo puro no centro da carta.
                  </span>
                </div>
              </label>

              {!ritual.theme.cleanBackSymbolOnly && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => updateTheme({ backSigilStyle: 'grand-seal' })}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      ritual.theme.backSigilStyle !== 'element'
                        ? 'bg-zinc-800 border-zinc-400 text-white font-bold'
                        : isLightApp
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Grande Selo Completo</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">Anéis astronômicos e rúnicos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateTheme({ backSigilStyle: 'element' })}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      ritual.theme.backSigilStyle === 'element'
                        ? 'bg-zinc-800 border-zinc-400 text-white font-bold'
                        : isLightApp
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">Sigilo do Elemento</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">Glifo temático clássico</span>
                  </button>
                </div>
              )}
            </div>

            {/* Frase Ocultista Gravada no Verso */}
            <div
              className={`pt-2 border-t ${
                isLightApp ? 'border-slate-200' : 'border-zinc-800/80'
              }`}
            >
              <label className="block text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
                Frase Gravada no Verso da Carta
              </label>
              <input
                type="text"
                value={ritual.theme.backQuoteText || ''}
                onChange={(e) => updateTheme({ backQuoteText: e.target.value })}
                placeholder="A Realidade é uma membrana frágil..."
                className={`w-full rounded-xl px-3 py-2 text-xs border ${
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
