import React from 'react';
import { ArsenalItem, CardMode, ElementId, ELEMENT_CONFIGS } from '../types';
import { formatRitualText, healCorruptedCharacters, sanitizeTextForCustomFont } from '../utils/textFormatter';
import { soundEngine } from '../utils/audio';
import {
  Package,
  Shield,
  Crosshair,
  Wrench,
  Radio,
  Sparkles,
  Zap,
  Check,
  Disc,
  Circle,
  Skull,
} from 'lucide-react';

interface ItemCardProps {
  item: ArsenalItem;
  viewSide?: 'front' | 'back';
  isFlipped?: boolean;
  scale?: number;
  id?: string;
  className?: string;
  onUpdateUses?: (newUses: number) => void;
  interactivePips?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  viewSide = 'front',
  isFlipped = false,
  scale = 1,
  id = 'item-card-canvas',
  className = '',
  onUpdateUses,
  interactivePips = true,
}) => {
  const isBack = (viewSide === 'back' && !isFlipped) || (viewSide === 'front' && isFlipped);
  const isScaled = scale !== 1;
  const baseWidth = 440;
  const baseHeight = 615;

  const cardMode: CardMode = item.theme?.cardMode || 'dark';
  const isLightMode = cardMode === 'light';

  // Parchment background tone for the description box
  const getParchmentClass = () => {
    switch (item.theme?.parchmentTone) {
      case 'tactical-dark':
        return 'bg-[#1c1c24] text-zinc-100 border-zinc-700';
      case 'blood-stained':
        return 'bg-[#f4dede] text-zinc-900 border-[#b91c1c]/40';
      case 'off-white':
        return 'bg-[#faf7f0] text-zinc-900 border-stone-300';
      case 'classic-aged':
      default:
        return 'bg-[#f2ece1] bg-[radial-gradient(#dfd4be_1px,transparent_1px)] [background-size:12px_12px] text-zinc-950 border-[#cfc4ad]';
    }
  };

  const itemType = item.itemType || item.category || 'mundano';
  const effectiveTier = item.categoryTier || item.tier || 'I';
  const effectiveSlots = item.inventorySlots !== undefined ? item.inventorySlots : (item.spaces !== undefined ? item.spaces : 1);

  // Accent color by item type or element
  const getAccentColor = () => {
    if (itemType === 'amaldicoado') {
      if (item.element && item.element !== 'custom') {
        return ELEMENT_CONFIGS[item.element]?.primaryColor || '#9333ea';
      }
      return '#a855f7';
    }
    if (itemType === 'paranormal') {
      return '#0284c7';
    }
    switch (item.subcategory) {
      case 'arma':
        return '#dc2626';
      case 'protecao':
        return '#2563eb';
      case 'municao':
        return '#d97706';
      case 'utilitario':
      case 'acessorio':
      default:
        return '#d97706';
    }
  };

  const accentColor = getAccentColor();

  // Subcategory label
  const getSubcategoryLabel = () => {
    switch (item.subcategory) {
      case 'arma':
        return 'Arma';
      case 'protecao':
        return 'Proteção';
      case 'municao':
        return 'Munição';
      case 'acessorio':
        return 'Acessório';
      case 'paranormal':
        return 'Item Paranormal';
      case 'utilitario':
      default:
        return 'Item Operacional';
    }
  };

  // Handle pip click
  const handlePipClick = (index: number) => {
    if (!interactivePips || !onUpdateUses) return;
    soundEngine.playCardFlip();
    // Toggle: if clicked the current filled count, reduce by 1; else set to index + 1
    const targetUses = item.currentUses === index + 1 ? index : index + 1;
    onUpdateUses(Math.max(0, Math.min(item.maxUses, targetUses)));
  };

  return (
    <div
      id={id}
      className={`relative select-none font-body ${className}`}
      style={{
        width: `${Math.round(baseWidth * scale)}px`,
        height: `${Math.round(baseHeight * scale)}px`,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        className={`w-[440px] h-[615px] p-2.5 transition-all relative overflow-hidden flex flex-col justify-between ${
          isLightMode ? 'bg-zinc-100 text-zinc-900' : 'bg-[#0b0b0f] text-zinc-100'
        } border-[3px] border-black shadow-[0_12px_32px_rgba(0,0,0,0.85)] rounded-xl`}
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: isScaled ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        {/* Distressed texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:8px_8px] z-1" />

        {/* Outer Corner Rivets / Crosshairs */}
        <div className="absolute top-1.5 left-1.5 text-[10px] font-mono leading-none text-zinc-500 opacity-60 z-20">┼</div>
        <div className="absolute top-1.5 right-1.5 text-[10px] font-mono leading-none text-zinc-500 opacity-60 z-20">┼</div>
        <div className="absolute bottom-1.5 left-1.5 text-[10px] font-mono leading-none text-zinc-500 opacity-60 z-20">┼</div>
        <div className="absolute bottom-1.5 right-1.5 text-[10px] font-mono leading-none text-zinc-500 opacity-60 z-20">┼</div>

        {/* ============================================================== */}
        {/* CARD FRONT SIDE */}
        {/* ============================================================== */}
        {!isBack ? (
          <div className="relative flex flex-col h-full justify-between z-10">
            {/* 1. TOP HEADER: SOLID BLACK BAR WITH CENTERED TITLE */}
            <div className="shrink-0 mb-1.5">
              <div className="bg-black border-2 border-zinc-800 rounded-lg p-2 shadow-md relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-60" />

                <h1
                  className="font-title text-base sm:text-lg font-bold tracking-wider uppercase text-white drop-shadow-md truncate px-2"
                  style={{
                    fontFamily: "'Cinzel', 'Westsac', Georgia, serif",
                    letterSpacing: '0.06em',
                  }}
                  title={healCorruptedCharacters(item.name)}
                >
                  {sanitizeTextForCustomFont(item.name) || 'ITEM OPERACIONAL'}
                </h1>
              </div>

              {/* Sub-Header Metadata Bar: Category, Subcategory & Inventory Slots */}
              <div className="flex items-center justify-between mt-1 px-1 text-[10px] font-mono uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-1.5 py-0.5 rounded font-bold border"
                    style={{
                      borderColor: `${accentColor}77`,
                      backgroundColor: `${accentColor}22`,
                      color: accentColor,
                    }}
                  >
                    CAT {effectiveTier}
                  </span>
                  <span className="text-zinc-400 font-semibold">
                    {getSubcategoryLabel()}
                  </span>
                  {itemType === 'amaldicoado' && (
                    <span className="text-purple-400 font-bold flex items-center gap-0.5">
                      <Skull className="w-2.5 h-2.5" />
                      Amaldiçoado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-zinc-300 font-bold bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded">
                  <Package className="w-3 h-3 text-amber-400" />
                  <span>
                    {effectiveSlots === 0
                      ? '0 Espaço'
                      : `${effectiveSlots} ${effectiveSlots === 1 ? 'Espaço' : 'Espaços'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ARTWORK / EQUIPMENT ILLUSTRATION CONTAINER */}
            <div className="relative flex-1 min-h-[175px] max-h-[205px] my-1 rounded-lg overflow-hidden border-2 border-zinc-800 bg-[#0f0f15] flex items-center justify-center shadow-inner group">
              {item.artwork?.url ? (
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                  <img
                    src={item.artwork.url}
                    alt={item.name}
                    className="w-full h-full transition-transform duration-300"
                    style={{
                      objectFit: item.artwork.fit || 'contain',
                      objectPosition: `50% ${item.artwork.positionY ?? 50}%`,
                      transform: `scale(${item.artwork.scale ?? 1})`,
                      opacity: item.artwork.opacity ?? 1,
                    }}
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
                </div>
              ) : (
                /* Blueprint / Technical Placeholder */
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center mb-2 shadow-inner">
                    {item.subcategory === 'arma' ? (
                      <Crosshair className="w-7 h-7 text-red-500/70" />
                    ) : item.subcategory === 'protecao' ? (
                      <Shield className="w-7 h-7 text-blue-500/70" />
                    ) : item.subcategory === 'municao' ? (
                      <Disc className="w-7 h-7 text-amber-500/70" />
                    ) : (
                      <Wrench className="w-7 h-7 text-zinc-400/70" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase font-semibold">
                    [Registro Técnico de Equipamento]
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600 mt-0.5">
                    {item.theme?.itemCode || 'ORD-EQP-REF'}
                  </span>
                </div>
              )}

              {/* Technical corner alignment marks */}
              <div className="absolute top-1 left-1 text-[8px] font-mono text-zinc-500 pointer-events-none">┌</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-zinc-500 pointer-events-none">┐</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-zinc-500 pointer-events-none">└</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-zinc-500 pointer-events-none">┘</div>
            </div>

            {/* 3. DESCRIPTION BOX (AUTHENTIC AGED PARCHMENT PANEL) */}
            <div
              className={`relative rounded-lg border-2 p-2.5 shadow-md flex flex-col justify-between min-h-[175px] max-h-[220px] overflow-hidden ${getParchmentClass()}`}
            >
              {/* Optional Weapon or Protection Stats Badges */}
              {(item.subcategory === 'arma' || item.subcategory === 'protecao' || item.itemType === 'amaldicoado') && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b border-black/15 text-[10px] font-mono">
                  {item.subcategory === 'arma' && item.weaponDamage && (
                    <div className="bg-black/10 px-1.5 py-0.5 rounded border border-black/20 font-bold">
                      <span className="text-zinc-600">Dano:</span> {item.weaponDamage}{' '}
                      {item.weaponDamageType && <span className="opacity-80">({item.weaponDamageType})</span>}
                    </div>
                  )}

                  {item.subcategory === 'arma' && item.weaponCritical && (
                    <div className="bg-black/10 px-1.5 py-0.5 rounded border border-black/20 font-bold">
                      <span className="text-zinc-600">Crítico:</span> {item.weaponCritical}
                    </div>
                  )}

                  {item.subcategory === 'arma' && item.weaponRange && (
                    <div className="bg-black/10 px-1.5 py-0.5 rounded border border-black/20 font-bold">
                      <span className="text-zinc-600">Alcance:</span> {item.weaponRange}
                    </div>
                  )}

                  {item.subcategory === 'protecao' && item.protectionDefense && (
                    <div className="bg-black/10 px-1.5 py-0.5 rounded border border-black/20 font-bold">
                      <span className="text-zinc-600">Defesa:</span> {item.protectionDefense}
                    </div>
                  )}

                  {item.subcategory === 'protecao' && item.protectionPenalty && (
                    <div className="bg-black/10 px-1.5 py-0.5 rounded border border-black/20 font-bold">
                      <span className="text-zinc-600">Penalidade:</span> {item.protectionPenalty}
                    </div>
                  )}

                  {item.curseCost && (
                    <div className="bg-purple-900/15 text-purple-900 px-1.5 py-0.5 rounded border border-purple-800/30 font-bold">
                      <span>Custo:</span> {item.curseCost}
                    </div>
                  )}
                </div>
              )}

              {/* Main Description Text */}
              <div className="text-[12px] leading-relaxed overflow-y-auto scrollbar-none pr-0.5 flex-1 font-medium">
                {formatRitualText(item.description, '#991b1b')}
              </div>

              {/* Optional Flavor Lore Quote */}
              {item.flavorText && (
                <div className="text-[10px] italic font-serif leading-tight mt-1.5 pt-1 border-t border-black/10 text-zinc-700 text-center line-clamp-1">
                  &ldquo;{healCorruptedCharacters(item.flavorText)}&rdquo;
                </div>
              )}

              {/* 4. TRACKER PIPS (MARCADORES DE USO / MUNIÇÃO) */}
              {item.showUseTracker && item.maxUses > 0 && (
                <div className="mt-2 pt-1.5 border-t border-black/20 flex items-center justify-between bg-black/5 px-2 py-1 rounded">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1">
                    <Disc className="w-3 h-3 text-red-700" />
                    <span>Usos / Cargas:</span>
                  </span>

                  {/* Pip Circles Row */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: item.maxUses }).map((_, idx) => {
                      const isSpent = idx < (item.currentUses || 0);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePipClick(idx)}
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            interactivePips ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
                          } ${
                            isSpent
                              ? 'bg-zinc-900 border-zinc-950 text-white shadow-xs'
                              : 'bg-white/80 border-zinc-800 hover:bg-zinc-200'
                          }`}
                          title={`Uso ${idx + 1} de ${item.maxUses} (${isSpent ? 'Gasto' : 'Disponível'})`}
                        >
                          {isSpent ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-transparent" />
                          )}
                        </button>
                      );
                    })}
                    <span className="text-[9px] font-mono font-bold ml-1 text-zinc-700">
                      ({item.currentUses || 0}/{item.maxUses})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. CARD FOOTER: ORDO REALITAS ARSENAL IDENTIFICATION */}
            <div className="shrink-0 mt-1.5 pt-1 border-t border-zinc-800 flex items-center justify-between text-[9px] font-mono text-zinc-400 px-1">
              <span className="font-semibold text-zinc-300">ORDEM PARANORMAL</span>
              <span className="tracking-widest uppercase text-amber-500/90 font-bold">
                ARSENAL OPERACIONAL
              </span>
              <span>{item.theme?.itemCode || 'CONFIDENCIAL'}</span>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CARD BACK SIDE (CONFIDENTIAL ORDO REALITAS DOSSIER BACK) */
          /* ============================================================== */
          <div className="relative flex flex-col h-full justify-between items-center text-center p-6 bg-[#0a0a0e] border-2 border-zinc-800 rounded-lg overflow-hidden z-10">
            {/* Top Classified Header */}
            <div className="w-full border-b border-zinc-800 pb-2">
              <div className="inline-block px-3 py-1 bg-red-950/80 border border-red-700/60 rounded text-[10px] font-mono uppercase tracking-widest text-red-300 font-bold">
                MATERIAL CLASSIFICADO • ORDO REALITAS
              </div>
            </div>

            {/* Center Official Emblem & Stamp */}
            <div className="my-auto flex flex-col items-center justify-center relative">
              <div className="w-36 h-36 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center p-2 mb-3 bg-black/60 shadow-2xl relative">
                <div className="w-28 h-28 rounded-full border border-zinc-600 flex items-center justify-center text-zinc-400">
                  <Shield className="w-14 h-14 text-amber-500/80" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full border border-red-900/40" />
                </div>
              </div>

              <h2
                className="font-title text-base font-bold tracking-widest uppercase text-white"
                style={{ fontFamily: "'Cinzel', 'Westsac', Georgia, serif" }}
              >
                EQUIPAMENTO DA ORDEM
              </h2>
              <p className="text-[10px] font-mono uppercase text-zinc-400 mt-1 max-w-[260px] tracking-wider">
                Propriedade intransferível da Ordo Realitas. O uso indevido por civis está sujeito a intervenção imediata.
              </p>
            </div>

            {/* Bottom Barcode & Verification */}
            <div className="w-full border-t border-zinc-800 pt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500">
              <span>REF: {item.theme?.itemCode || 'ORD-EQP-413'}</span>
              <span className="text-red-400 font-bold tracking-widest uppercase">USO RESTRITO</span>
              <span>SETOR ARSENAL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
