import React, { useState } from 'react';
import {
  Ritual,
  ElementId,
  CircleTier,
  CornerStyle,
  BorderStyle,
  BgTone,
  ELEMENT_CONFIGS,
} from '../types';
import { OccultSigil } from './OccultSigil';
import { soundEngine } from '../utils/audio';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  Palette,
  FileText,
  Sliders,
  Bold,
  Italic,
  Dices,
} from 'lucide-react';

interface EditorPanelProps {
  ritual: Ritual;
  onChange: (updated: Ritual) => void;
  activeView: 'front' | 'back';
  setActiveView: (view: 'front' | 'back') => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  ritual,
  onChange,
  activeView,
  setActiveView,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'mods' | 'style'>('content');

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

  // Add Modification
  const handleAddModification = () => {
    const isFirst = ritual.modifications.length === 0;
    const isSecond = ritual.modifications.length === 1;

    const newMod = {
      id: `mod-${Date.now()}`,
      name: isFirst ? 'Discente' : isSecond ? 'Verdadeiro' : 'Aprimoramento',
      cost: isFirst ? '+2 PE' : isSecond ? '+5 PE' : '+3 PE',
      requirement: isFirst ? 'Requer 2º Círculo' : isSecond ? 'Requer 3º Círculo' : '',
      text: 'Descreva aqui a alteração ou ampliação do efeito ao pagar os Pontos de Esforço adicionais.',
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
  const insertFormatTag = (tagType: 'bold' | 'italic' | 'dice' | 'dt') => {
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

  return (
    <div className="flex flex-col h-full bg-[#121217] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header: Tabs & View Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-[#0d0d12]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#1a1a22] p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dados & Custos</span>
          </button>

          <button
            onClick={() => setActiveTab('mods')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'mods'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aprimoramentos</span>
            {ritual.modifications.length > 0 && (
              <span className="text-[10px] bg-red-950/80 text-red-300 px-1.5 py-0.2 rounded-full border border-red-800/40">
                {ritual.modifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'style'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Estilo & Borda</span>
          </button>
        </div>

        {/* View Face Switch (Frente / Verso) */}
        <div className="flex items-center gap-1 bg-[#1a1a22] p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              setActiveView('front');
              soundEngine.playCardFlip();
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeView === 'front'
                ? 'bg-zinc-700 text-white shadow-xs font-semibold'
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
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeView === 'back'
                ? 'bg-zinc-700 text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Verso
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ======================================================== */}
        {/* TAB 1: CONTENT (DADOS PRINCIPAIS & CUSTOS) */}
        {/* ======================================================== */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Nome do Ritual */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Nome do Ritual
              </label>
              <input
                type="text"
                value={ritual.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Ex: Amaldiçoar Arma, Ectoplasma..."
                className="w-full bg-[#181820] border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-cinzel font-semibold"
              />
            </div>

            {/* Elemento & Círculo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Element Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
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
                              ? 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-semibold'
                              : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          <OccultSigil element={elem} size={16} color={cfg.primaryColor} />
                          <span className="truncate">{cfg.name}</span>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Custom Element options if selected */}
                {ritual.element === 'custom' && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Nome do Elemento</span>
                      <input
                        type="text"
                        value={ritual.customElementName || ''}
                        onChange={(e) => update({ customElementName: e.target.value })}
                        placeholder="Ex: Tenebra, Vácuo, Luz..."
                        className="w-full bg-[#141419] border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Cor do Elemento</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={ritual.customElementColor || '#10b981'}
                          onChange={(e) => update({ customElementColor: e.target.value })}
                          className="w-8 h-8 rounded border border-zinc-700 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-zinc-300">
                          {ritual.customElementColor || '#10b981'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Círculo do Ritual */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Círculo / Grau
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([1, 2, 3, 4] as CircleTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => update({ circle: tier })}
                      className={`flex flex-col items-center justify-center py-2 rounded-lg border text-xs font-cinzel transition-all ${
                        ritual.circle === tier
                          ? 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-bold'
                          : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-sm font-bold">{tier}º</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Círculo</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Atributos / Barra de Custos */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Barra de Atributos & Conjuração
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* Execução */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Execução</label>
                  <input
                    type="text"
                    value={ritual.execution}
                    onChange={(e) => update({ execution: e.target.value })}
                    placeholder="Padrão, Completa, Reação..."
                    className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Alcance */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Alcance</label>
                  <input
                    type="text"
                    value={ritual.range}
                    onChange={(e) => update({ range: e.target.value })}
                    placeholder="Toque, Curto (9m)..."
                    className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Alvo / Área */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Alvo / Área</label>
                  <input
                    type="text"
                    value={ritual.target}
                    onChange={(e) => update({ target: e.target.value })}
                    placeholder="1 criatura, 1 objeto..."
                    className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Duração</label>
                  <input
                    type="text"
                    value={ritual.duration}
                    onChange={(e) => update({ duration: e.target.value })}
                    placeholder="Cena, Instantânea..."
                    className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Custo Base PE */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Custo Base PE</label>
                  <input
                    type="text"
                    value={ritual.basePe}
                    onChange={(e) => update({ basePe: e.target.value })}
                    placeholder="1 PE, 3 PE, 6 PE..."
                    className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono font-semibold"
                  />
                </div>

                {/* Resistência */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-0.5">Resistência</label>
                  <input
                    type="text"
                    value={ritual.resistance || ''}
                    onChange={(e) => update({ resistance: e.target.value })}
                    placeholder="Nenhuma, Vontade anula..."
                    className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Descrição Principal com Formatação Rápida */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Descrição do Efeito Principal
                </label>

                {/* Formatting Quick Tools */}
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => insertFormatTag('bold')}
                    title="Negrito (**texto**)"
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                  >
                    <Bold className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('italic')}
                    title="Itálico (*texto*)"
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
                  >
                    <Italic className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('dice')}
                    title="Adicionar rolagem de dado (ex: 3d6)"
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs flex items-center gap-0.5"
                  >
                    <Dices className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatTag('dt')}
                    title="Adicionar tag de DT"
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                className="w-full bg-[#181820] border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 leading-relaxed font-sans"
              />
              <span className="text-[10px] text-zinc-400 block">
                Dica: Você pode usar <strong className="text-zinc-300">**negrito**</strong>, <em className="text-zinc-300">*itálico*</em> ou notação de dados como <span className="font-mono text-zinc-300">2d6</span> diretamente.
              </span>
            </div>

            {/* Texto de Ambientação / Citação (Flavor Text) */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Frase de Ambientação (Flavor Text - Opcional)
              </label>
              <input
                type="text"
                value={ritual.flavorText || ''}
                onChange={(e) => update({ flavorText: e.target.value })}
                placeholder="Ex: O metal sedento estremece e pulsa como uma artéria aberta..."
                className="w-full bg-[#181820] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-300 italic placeholder-zinc-600"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MODIFICATIONS (DISCENTE / VERDADEIRO) */}
        {/* ======================================================== */}
        {activeTab === 'mods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Aprimoramentos de Custo em PE
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Configure as variações Discente, Verdadeiro ou Especiais deste ritual.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddModification}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 rounded-lg text-xs font-medium text-red-200 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Modificação</span>
              </button>
            </div>

            {/* List of modifications */}
            {ritual.modifications.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">
                  Nenhum aprimoramento adicionado ainda.
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Adicione variações como Discente (+2 PE) ou Verdadeiro (+5 PE).
                </p>
                <button
                  type="button"
                  onClick={handleAddModification}
                  className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors"
                >
                  Adicionar Primeiro Aprimoramento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ritual.modifications.map((mod, index) => (
                  <div
                    key={mod.id}
                    className="p-3 bg-[#181820] border border-zinc-800 rounded-lg space-y-2.5 relative group"
                  >
                    {/* Header controls: Name, Cost, Reorder, Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {/* Name (e.g. Discente) */}
                        <input
                          type="text"
                          value={mod.name}
                          onChange={(e) =>
                            handleUpdateModification(mod.id, 'name', e.target.value)
                          }
                          placeholder="Discente, Verdadeiro..."
                          className="bg-black/60 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-bold w-28"
                        />

                        {/* Cost (e.g. +2 PE) */}
                        <input
                          type="text"
                          value={mod.cost}
                          onChange={(e) =>
                            handleUpdateModification(mod.id, 'cost', e.target.value)
                          }
                          placeholder="+2 PE"
                          className="bg-black/60 border border-zinc-700 rounded px-2 py-1 text-xs text-red-300 font-mono font-bold w-20"
                        />

                        {/* Requirement (e.g. Requer 2º Círculo) */}
                        <input
                          type="text"
                          value={mod.requirement || ''}
                          onChange={(e) =>
                            handleUpdateModification(mod.id, 'requirement', e.target.value)
                          }
                          placeholder="Requisito (ex: Requer 2º Círculo)"
                          className="bg-black/60 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 flex-1 placeholder-zinc-600"
                        />
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveModification(index, 'up')}
                          disabled={index === 0}
                          title="Mover para cima"
                          className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveModification(index, 'down')}
                          disabled={index === ritual.modifications.length - 1}
                          title="Mover para baixo"
                          className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveModification(mod.id)}
                          title="Excluir modificação"
                          className="p-1 rounded text-zinc-400 hover:text-red-400 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Effect Text */}
                    <textarea
                      rows={2}
                      value={mod.text}
                      onChange={(e) =>
                        handleUpdateModification(mod.id, 'text', e.target.value)
                      }
                      placeholder="Descreva o efeito ampliado ao pagar este custo..."
                      className="w-full bg-black/60 border border-zinc-800 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-red-500 leading-snug"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: STYLE & AESTHETICS (BORDAS, CANTOS, VERSO) */}
        {/* ======================================================== */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Formato dos Cantos */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Corte dos Cantos da Carta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'chamfer', label: 'Chanfrado Ocultista', sub: 'Corte 45º clássico' },
                  { id: 'sharp', label: 'Reto Clássico', sub: 'Cantos afiados 90º' },
                  { id: 'rounded', label: 'Arredondado', sub: 'Padrão card game' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateTheme({ cornerStyle: opt.id as CornerStyle })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      ritual.theme.cornerStyle === opt.id
                        ? 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-semibold'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-medium block">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo da Borda */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Estilo da Borda Dupla
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'double-silver', label: 'Dupla Prata Clássica', desc: 'Borda prateada envelhecida' },
                  { id: 'runic', label: 'Ocultista Rúnica', desc: 'Brilho prateado com runas' },
                  { id: 'gold-accent', label: 'Dourada de Conhecimento', desc: 'Aura dourada sutil' },
                  { id: 'pure-minimal', label: 'Minimalista Sombria', desc: 'Bordas finas discretas' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateTheme({ borderStyle: opt.id as BorderStyle })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      ritual.theme.borderStyle === opt.id
                        ? 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-semibold'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-medium block">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tom de Fundo da Carta */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Tom de Fundo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'black', label: 'Preto Absoluto', sub: '#000000 puro' },
                  { id: 'charcoal', label: 'Cinza Chumbo', sub: '#0d0d12 profundo' },
                  { id: 'parchment', label: 'Grimório Escuro', sub: 'Textura de trama' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateTheme({ bgTone: opt.id as BgTone })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      ritual.theme.bgTone === opt.id
                        ? 'bg-zinc-800 border-zinc-400 text-white shadow-xs font-semibold'
                        : 'bg-[#181820] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-medium block">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensidade da Marca d'Água do Sigilo */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Opacidade do Sigilo de Fundo (Marca d'Água)
                </label>
                <span className="text-xs font-mono text-zinc-300">
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
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Brilho Paranormal (Aura Glow) */}
            <div className="flex items-center justify-between p-3 bg-[#181820] border border-zinc-800 rounded-lg">
              <div>
                <span className="text-xs font-medium text-white block">
                  Brilho Paranormal do Elemento
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  Emite uma aura sutil na cor primordial do ritual
                </span>
              </div>
              <input
                type="checkbox"
                checked={ritual.theme.accentGlow}
                onChange={(e) => updateTheme({ accentGlow: e.target.checked })}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>

            {/* Verso da Carta Settings */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Personalização do Verso da Carta
              </span>

              {/* Sigil Style on Back */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateTheme({ backSigilStyle: 'grand-seal' })}
                  className={`p-2 rounded border text-xs text-left transition-all ${
                    ritual.theme.backSigilStyle === 'grand-seal'
                      ? 'bg-zinc-800 border-zinc-400 text-white font-semibold'
                      : 'bg-[#181820] border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="block font-medium">Grande Selo Universal</span>
                  <span className="text-[10px] text-zinc-500 block">Os 5 elementos entrelaçados</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateTheme({ backSigilStyle: 'element' })}
                  className={`p-2 rounded border text-xs text-left transition-all ${
                    ritual.theme.backSigilStyle === 'element'
                      ? 'bg-zinc-800 border-zinc-400 text-white font-semibold'
                      : 'bg-[#181820] border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="block font-medium">Sigilo do Elemento</span>
                  <span className="text-[10px] text-zinc-500 block">Ocultismo primordial puro</span>
                </button>
              </div>

              {/* Back quote */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-0.5">
                  Frase Ocultista Gravada no Verso
                </label>
                <input
                  type="text"
                  value={ritual.theme.backQuoteText || ''}
                  onChange={(e) => updateTheme({ backQuoteText: e.target.value })}
                  placeholder="A Realidade é uma membrana frágil..."
                  className="w-full bg-[#181820] border border-zinc-700/80 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
