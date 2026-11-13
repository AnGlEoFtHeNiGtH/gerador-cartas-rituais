import React from 'react';
import { ArsenalItem, CardMode, ElementId, ELEMENT_CONFIGS } from '../types';
import { ORDO_REALITAS_LOGO } from '../data/elementSymbols';
import { OccultSigil } from './OccultSigil';
import { formatRitualText, healCorruptedCharacters, sanitizeTextForCustomFont } from '../utils/textFormatter';
import { soundEngine } from '../utils/audio';
import {
  Package,
  Shield,
  Crosshair,
  Wrench,
  Disc,
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

  const cardMode: CardMode = item.theme?.cardMode || 'light';
  const isDossierStyle = item.theme?.borderStyle === 'dossier-thick-black';
  const isLightMode = cardMode === 'light' || isDossierStyle;
  const isParchmentDark = item.theme?.parchmentTone === 'tactical-dark' && !isLightMode;

  // Parchment background tone for the description box (strictly solid/clean, zero dot-grid)
  const getParchmentClass = () => {
    switch (item.theme?.parchmentTone) {
      case 'tactical-dark':
        return isLightMode
          ? 'bg-zinc-100 text-zinc-950 border-zinc-400'
          : 'bg-[#1c1c24] text-zinc-100 border-zinc-700';
      case 'blood-stained':
        return 'bg-[#f4dede] text-zinc-900 border-[#b91c1c]/40';
      case 'off-white':
        return 'bg-white text-zinc-900 border-stone-300';
      case 'classic-aged':
      default:
        return 'bg-[#f2ece1] text-zinc-950 border-[#cfc4ad]';
    }
  };

  const itemType = item.itemType || item.category || 'mundano';
  const effectiveTier = item.categoryTier || item.tier || 'I';
  const rawSlots = item.inventorySlots !== undefined ? item.inventorySlots : (item.spaces !== undefined ? item.spaces : 1);
  const formattedSlots = Number.isInteger(rawSlots) ? rawSlots : Number(rawSlots.toFixed(2));
  const slotLabel = formattedSlots === 1 ? 'Espaço' : 'Espaços';

  // Resolve element cleanly for Amaldiçoado / Paranormal items
  const rawElement =
    typeof item.element === 'string' ? (item.element.toLowerCase().trim() as ElementId) : undefined;
  const effectiveElement: ElementId | undefined =
    itemType === 'amaldicoado' ? (rawElement || 'sangue') : rawElement;
  const elementConfig =
    effectiveElement && effectiveElement !== 'custom' ? ELEMENT_CONFIGS[effectiveElement] : undefined;

  // Accent color by item type or element (light/white contrast safe)
  const getAccentColor = () => {
    if (itemType === 'amaldicoado') {
      if (elementConfig) {
        return isLightMode ? elementConfig.lightPrimaryColor : elementConfig.primaryColor;
      }
      return isLightMode ? '#7e22ce' : '#a855f7';
    }
    if (itemType === 'paranormal' || itemType === 'ritual') {
      if (elementConfig) {
        return isLightMode ? elementConfig.lightPrimaryColor : elementConfig.primaryColor;
      }
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

  // Element colors inside parchment description box (which is light unless tactical-dark)
  const parchmentElementColor = elementConfig
    ? isParchmentDark
      ? elementConfig.primaryColor
      : elementConfig.lightPrimaryColor
    : isParchmentDark
    ? '#c084fc'
    : '#6b21a8';

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

  // Top header text logic (respecting user customization and hide flag)
  const defaultHeaderLabel = 'MATERIAL CLASSIFICADO • ORDO REALITAS';
  const rawHeaderLabel = item.theme?.topHeaderLabel !== undefined ? item.theme.topHeaderLabel : defaultHeaderLabel;
  const showTopHeader = !item.theme?.hideTopHeader && rawHeaderLabel.trim().length > 0;

  // Tracker pips (supports up to 20 charges cleanly)
  const totalPips = Math.min(20, Math.max(0, item.maxUses || 0));
  const spentPips = Math.min(totalPips, Math.max(0, item.currentUses || 0));
  const isCompactPips = totalPips > 8;

  // Handle pip click
  const handlePipClick = (index: number) => {
    if (!interactivePips || !onUpdateUses) return;
    soundEngine.playCardFlip();
    const targetUses = spentPips === index + 1 ? index : index + 1;
    onUpdateUses(Math.max(0, Math.min(totalPips, targetUses)));
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
          isBack
            ? isDossierStyle
              ? 'border-[12px] border-black bg-white text-zinc-950 rounded-lg shadow-2xl'
              : 'border-[3px] border-black bg-white text-zinc-950 shadow-xl rounded-xl'
            : isDossierStyle
            ? 'border-[12px] border-black bg-white text-zinc-950 rounded-lg shadow-2xl'
            : isLightMode
            ? 'border-[3px] border-zinc-900 bg-white text-zinc-950 shadow-xl rounded-xl'
            : 'border-[3px] border-black bg-[#0b0b0f] text-zinc-100 shadow-[0_12px_32px_rgba(0,0,0,0.85)] rounded-xl'
        }`}
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: isScaled ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          backgroundColor: isBack || isLightMode ? '#ffffff' : undefined,
          boxShadow: isBack ? '0 10px 25px rgba(0,0,0,0.12)' : undefined,
        }}
      >
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
            {/* 1. TOP HEADER: SOLID BLACK BAR WITH CENTERED TITLE & ELEMENT SIGIL */}
            <div className="shrink-0 mb-1.5">
              {showTopHeader && (
                <div
                  className={`text-[8.5px] font-mono tracking-widest uppercase text-center py-0.5 px-2 mb-1 border rounded font-bold truncate shadow-xs ${
                    isLightMode
                      ? 'border-red-300 bg-red-100 text-red-950'
                      : 'border-zinc-800 bg-black/80 text-red-300'
                  }`}
                >
                  {rawHeaderLabel}
                </div>
              )}
              <div
                className="bg-black border-2 border-zinc-900 rounded-lg px-2.5 py-2 shadow-md relative overflow-hidden flex items-center justify-between gap-2"
                style={{
                  borderColor: effectiveElement && elementConfig ? `${elementConfig.primaryColor}55` : undefined,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
                  style={{
                    background:
                      effectiveElement && elementConfig
                        ? `linear-gradient(to right, transparent, ${elementConfig.primaryColor}, transparent)`
                        : 'linear-gradient(to right, transparent, #71717a, transparent)',
                  }}
                />

                {effectiveElement && (
                  <div
                    className="w-7 h-7 rounded-full bg-zinc-950 border flex items-center justify-center shrink-0 shadow-xs"
                    style={{ borderColor: elementConfig?.primaryColor || '#a855f7' }}
                    title={`Elemento: ${elementConfig?.name || 'Amaldiçoado'}`}
                  >
                    <OccultSigil
                      element={effectiveElement}
                      isLightBackground={false}
                      size={20}
                      color={elementConfig?.primaryColor || '#f1f5f9'}
                      glow={true}
                    />
                  </div>
                )}

                <h1
                  className="flex-1 min-w-0 font-title text-base sm:text-lg font-bold tracking-wider uppercase text-white drop-shadow-md truncate text-center px-1"
                  style={{
                    fontFamily: "'Cinzel', 'Westsac', Georgia, serif",
                    letterSpacing: '0.06em',
                  }}
                  title={healCorruptedCharacters(item.name)}
                >
                  {sanitizeTextForCustomFont(item.name) || 'ITEM OPERACIONAL'}
                </h1>

                {effectiveElement && (
                  <div className="w-7 h-7 shrink-0 flex items-center justify-center opacity-85">
                    <OccultSigil
                      element={effectiveElement}
                      isLightBackground={false}
                      size={18}
                      color={elementConfig?.primaryColor || '#f1f5f9'}
                    />
                  </div>
                )}
              </div>

              {/* Sub-Header Metadata Bar: Category, Subcategory, Element & Inventory Slots */}
              <div className="flex items-center justify-between mt-1 px-1 text-[10px] font-mono uppercase tracking-wider gap-1">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span
                    className="px-1.5 py-0.5 rounded font-bold border shrink-0"
                    style={{
                      borderColor: `${accentColor}77`,
                      backgroundColor: `${accentColor}1a`,
                      color: accentColor,
                    }}
                  >
                    CAT {effectiveTier}
                  </span>
                  <span className={`font-semibold truncate ${isLightMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
                    {getSubcategoryLabel()}
                  </span>
                  {(itemType === 'amaldicoado' || effectiveElement) && (
                    <span
                      className="px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border shrink-0"
                      style={{
                        borderColor: isLightMode
                          ? `${elementConfig?.lightPrimaryColor || '#7e22ce'}55`
                          : `${elementConfig?.primaryColor || '#a855f7'}55`,
                        backgroundColor: isLightMode
                          ? `${elementConfig?.lightPrimaryColor || '#7e22ce'}12`
                          : `${elementConfig?.primaryColor || '#a855f7'}1a`,
                        color: isLightMode
                          ? elementConfig?.lightPrimaryColor || '#6b21a8'
                          : elementConfig?.primaryColor || '#c084fc',
                      }}
                    >
                      {effectiveElement ? (
                        <OccultSigil
                          element={effectiveElement}
                          isLightBackground={isLightMode}
                          size={13}
                          color={isLightMode ? elementConfig?.lightPrimaryColor : elementConfig?.primaryColor}
                        />
                      ) : (
                        <Skull className="w-2.5 h-2.5" />
                      )}
                      <span>{elementConfig ? elementConfig.name : 'Amaldiçoado'}</span>
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded border shrink-0 ${
                    isLightMode
                      ? 'bg-zinc-100 border-zinc-300 text-zinc-900 shadow-2xs'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <Package className="w-3 h-3 text-amber-500" />
                  <span>
                    {formattedSlots === 0 ? '0 Espaço' : `${formattedSlots} ${slotLabel}`}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ARTWORK / EQUIPMENT ILLUSTRATION CONTAINER */}
            <div
              className={`relative flex-1 min-h-[155px] ${
                isCompactPips && item.showUseTracker ? 'max-h-[185px]' : 'max-h-[205px]'
              } my-1 rounded-lg overflow-hidden border-2 flex items-center justify-center group ${
                isLightMode ? 'border-zinc-300 bg-white' : 'border-zinc-800 bg-[#0f0f15]'
              }`}
              style={{
                backgroundColor: isLightMode ? '#ffffff' : undefined,
              }}
            >
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
                  {/* Subtle inner shadow only in dark mode so light white cards remain crisp #ffffff */}
                  {!isLightMode && (
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
                  )}
                </div>
              ) : (
                /* Blueprint / Technical or Occult Placeholder */
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div
                    className={`w-16 h-16 rounded-full border flex items-center justify-center mb-2 shadow-inner ${
                      isLightMode
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-800'
                        : 'bg-zinc-900 border-zinc-700/80'
                    }`}
                    style={{
                      borderColor: effectiveElement && elementConfig ? `${accentColor}66` : undefined,
                    }}
                  >
                    {effectiveElement ? (
                      <OccultSigil
                        element={effectiveElement}
                        isLightBackground={isLightMode}
                        size={42}
                        color={accentColor}
                        glow={!isLightMode}
                      />
                    ) : item.subcategory === 'arma' ? (
                      <Crosshair className="w-7 h-7 text-red-600" />
                    ) : item.subcategory === 'protecao' ? (
                      <Shield className="w-7 h-7 text-blue-600" />
                    ) : item.subcategory === 'municao' ? (
                      <Disc className="w-7 h-7 text-amber-600" />
                    ) : (
                      <Wrench className="w-7 h-7 text-zinc-500" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-mono tracking-wider uppercase font-semibold ${
                      isLightMode ? 'text-zinc-700' : 'text-zinc-400'
                    }`}
                  >
                    {itemType === 'amaldicoado' && elementConfig
                      ? `[Relíquia Amaldiçoada • ${elementConfig.name}]`
                      : '[Registro Técnico de Equipamento]'}
                  </span>
                  <span
                    className={`text-[9px] font-mono mt-0.5 ${
                      isLightMode ? 'text-zinc-500' : 'text-zinc-600'
                    }`}
                  >
                    {item.theme?.itemCode || 'ORD-EQP-REF'}
                  </span>
                </div>
              )}

              {/* Technical corner alignment marks */}
              <div className="absolute top-1 left-1 text-[8px] font-mono text-zinc-400 pointer-events-none">┌</div>
              <div className="absolute top-1 right-1 text-[8px] font-mono text-zinc-400 pointer-events-none">┐</div>
              <div className="absolute bottom-1 left-1 text-[8px] font-mono text-zinc-400 pointer-events-none">└</div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-zinc-400 pointer-events-none">┘</div>
            </div>

            {/* 3. DESCRIPTION BOX (AUTHENTIC CLEAN DOCUMENT PANEL) */}
            <div
              className={`relative rounded-lg border-2 p-2.5 shadow-md flex flex-col justify-between min-h-[175px] ${
                isCompactPips && item.showUseTracker ? 'max-h-[245px]' : 'max-h-[225px]'
              } overflow-hidden ${getParchmentClass()}`}
            >
              {/* Optional Weapon, Protection or Curse Stats Badges */}
              {(item.subcategory === 'arma' || item.subcategory === 'protecao' || itemType === 'amaldicoado') && (
                <div
                  className={`flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b text-[10px] font-mono ${
                    isParchmentDark ? 'border-white/15' : 'border-black/15'
                  }`}
                >
                  {itemType === 'amaldicoado' && effectiveElement && (
                    <div
                      className="px-1.5 py-0.5 rounded border font-bold flex items-center gap-1"
                      style={{
                        borderColor: `${parchmentElementColor}55`,
                        backgroundColor: `${parchmentElementColor}14`,
                        color: parchmentElementColor,
                      }}
                    >
                      <OccultSigil
                        element={effectiveElement}
                        isLightBackground={!isParchmentDark}
                        size={12}
                        color={parchmentElementColor}
                      />
                      <span>
                        {item.curseName
                          ? `${elementConfig?.name || 'Maldição'}: ${item.curseName}`
                          : `Maldição de ${elementConfig?.name || 'Outro Lado'}`}
                      </span>
                    </div>
                  )}

                  {item.subcategory === 'arma' && item.weaponDamage && (
                    <div
                      className={`px-1.5 py-0.5 rounded border font-bold ${
                        isParchmentDark ? 'bg-white/10 border-white/15 text-zinc-100' : 'bg-black/10 border-black/20'
                      }`}
                    >
                      <span className={isParchmentDark ? 'text-zinc-400' : 'text-zinc-600'}>Dano:</span>{' '}
                      {item.weaponDamage}{' '}
                      {item.weaponDamageType && <span className="opacity-80">({item.weaponDamageType})</span>}
                    </div>
                  )}

                  {item.subcategory === 'arma' && item.weaponCritical && (
                    <div
                      className={`px-1.5 py-0.5 rounded border font-bold ${
                        isParchmentDark ? 'bg-white/10 border-white/15 text-zinc-100' : 'bg-black/10 border-black/20'
                      }`}
                    >
                      <span className={isParchmentDark ? 'text-zinc-400' : 'text-zinc-600'}>Crítico:</span>{' '}
                      {item.weaponCritical}
                    </div>
                  )}

                  {item.subcategory === 'arma' && item.weaponRange && (
                    <div
                      className={`px-1.5 py-0.5 rounded border font-bold ${
                        isParchmentDark ? 'bg-white/10 border-white/15 text-zinc-100' : 'bg-black/10 border-black/20'
                      }`}
                    >
                      <span className={isParchmentDark ? 'text-zinc-400' : 'text-zinc-600'}>Alcance:</span>{' '}
                      {item.weaponRange}
                    </div>
                  )}

                  {item.subcategory === 'protecao' && item.protectionDefense && (
                    <div
                      className={`px-1.5 py-0.5 rounded border font-bold ${
                        isParchmentDark ? 'bg-white/10 border-white/15 text-zinc-100' : 'bg-black/10 border-black/20'
                      }`}
                    >
                      <span className={isParchmentDark ? 'text-zinc-400' : 'text-zinc-600'}>Defesa:</span>{' '}
                      {item.protectionDefense}
                    </div>
                  )}

                  {item.subcategory === 'protecao' && item.protectionPenalty && (
                    <div
                      className={`px-1.5 py-0.5 rounded border font-bold ${
                        isParchmentDark ? 'bg-white/10 border-white/15 text-zinc-100' : 'bg-black/10 border-black/20'
                      }`}
                    >
                      <span className={isParchmentDark ? 'text-zinc-400' : 'text-zinc-600'}>Penalidade:</span>{' '}
                      {item.protectionPenalty}
                    </div>
                  )}

                  {item.curseCost && (
                    <div
                      className={`px-1.5 py-0.5 rounded border font-bold ${
                        isParchmentDark
                          ? 'bg-purple-950/60 text-purple-200 border-purple-500/40'
                          : 'bg-purple-900/15 text-purple-900 border-purple-800/30'
                      }`}
                    >
                      <span>Custo:</span> {item.curseCost}
                    </div>
                  )}
                </div>
              )}

              {/* Main Description Text */}
              <div className="text-[12px] leading-relaxed overflow-y-auto scrollbar-none pr-0.5 flex-1 font-medium">
                {formatRitualText(item.description, isParchmentDark ? '#fca5a5' : '#991b1b')}
              </div>

              {/* Optional Flavor Lore Quote */}
              {item.flavorText && (
                <div
                  className={`text-[10px] italic font-serif leading-tight mt-1.5 pt-1 border-t text-center line-clamp-1 ${
                    isParchmentDark ? 'border-white/10 text-zinc-400' : 'border-black/10 text-zinc-700'
                  }`}
                >
                  &ldquo;{healCorruptedCharacters(item.flavorText)}&rdquo;
                </div>
              )}

              {/* 4. TRACKER PIPS (MARCADORES DE USO / MUNIÇÃO ATÉ 20 PIPS) */}
              {item.showUseTracker && totalPips > 0 && (
                <div
                  className={`mt-2 pt-1.5 border-t px-2 py-1 rounded ${
                    isParchmentDark
                      ? 'border-white/15 bg-black/30'
                      : 'border-black/20 bg-black/5'
                  } ${
                    isCompactPips
                      ? 'flex flex-col gap-1.5'
                      : 'flex items-center justify-between gap-2'
                  }`}
                >
                  <div className={`flex items-center justify-between ${isCompactPips ? 'w-full' : ''}`}>
                    <span
                      className={`text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isParchmentDark ? 'text-zinc-200' : 'text-zinc-800'
                      }`}
                    >
                      <Disc className={`w-3 h-3 ${isParchmentDark ? 'text-red-400' : 'text-red-700'}`} />
                      <span>Usos / Cargas:</span>
                    </span>
                    {isCompactPips && (
                      <span
                        className={`text-[9px] font-mono font-bold ${
                          isParchmentDark ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        ({spentPips}/{totalPips})
                      </span>
                    )}
                  </div>

                  {/* Pip Circles (Auto-wraps neatly up to 20 pips: max 10 per row) */}
                  <div
                    className={`flex items-center flex-wrap ${
                      isCompactPips ? 'gap-1.5 justify-start' : 'gap-1.5 justify-end'
                    }`}
                  >
                    {Array.from({ length: totalPips }).map((_, idx) => {
                      const isSpent = idx < spentPips;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePipClick(idx)}
                          className={`${
                            isCompactPips ? 'w-3.5 h-3.5' : 'w-4 h-4'
                          } rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            interactivePips ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
                          } ${
                            isSpent
                              ? 'bg-zinc-900 border-zinc-950 text-white shadow-xs'
                              : isParchmentDark
                              ? 'bg-zinc-800 border-zinc-400 hover:bg-zinc-700'
                              : 'bg-white border-zinc-800 hover:bg-zinc-200'
                          }`}
                          title={`Uso ${idx + 1} de ${totalPips} (${isSpent ? 'Gasto' : 'Disponível'})`}
                        >
                          {isSpent ? (
                            <div
                              className={`${
                                isCompactPips ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5'
                              } rounded-full bg-red-500`}
                            />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-transparent" />
                          )}
                        </button>
                      );
                    })}
                    {!isCompactPips && (
                      <span
                        className={`text-[9px] font-mono font-bold ml-1 ${
                          isParchmentDark ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        ({spentPips}/{totalPips})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 5. CARD FOOTER: ORDO REALITAS ARSENAL IDENTIFICATION (CUSTOMIZÁVEL / REMOVÍVEL) */}
            {!item.theme?.hideBottomFooter && (
              <div
                className={`shrink-0 mt-1.5 pt-1 border-t flex items-center justify-between text-[9px] font-mono px-1 ${
                  isLightMode ? 'border-zinc-300 text-zinc-600' : 'border-zinc-800 text-zinc-400'
                }`}
              >
                <span className={`font-semibold ${isLightMode ? 'text-zinc-800' : 'text-zinc-300'}`}>
                  {item.theme?.bottomFooterLeft !== undefined ? item.theme.bottomFooterLeft : 'ORDEM PARANORMAL'}
                </span>
                <span className={`tracking-widest uppercase font-bold ${isLightMode ? 'text-amber-700' : 'text-amber-500/90'}`}>
                  {item.theme?.bottomFooterCenter !== undefined ? item.theme.bottomFooterCenter : 'ARSENAL OPERACIONAL'}
                </span>
                <span>
                  {item.theme?.bottomFooterRight !== undefined
                    ? item.theme.bottomFooterRight
                    : (item.theme?.itemCode || 'CONFIDENCIAL')}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* CARD BACK SIDE (CONFIDENTIAL ORDO REALITAS DOSSIER BACK) */
          /* ============================================================== */
          <div
            className="relative flex flex-col h-full justify-between items-center text-center p-6 rounded-lg overflow-hidden z-10 border-2 border-zinc-900/60 bg-white text-zinc-950"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Top Classified Header (CUSTOMIZÁVEL / REMOVÍVEL) */}
            {showTopHeader && (
              <div className="w-full border-b border-zinc-300 pb-2">
                <div className="inline-block px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs border bg-red-50 border-red-300 text-red-950">
                  {rawHeaderLabel}
                </div>
              </div>
            )}

            {/* Center Official Emblem & Stamp (Official ORDO_REALITAS_LOGO or Custom Upload) */}
            <div className="my-auto flex flex-col items-center justify-center relative w-full">
              {/* Clean, imposing logo without dashed circle wrapper */}
              <div className="w-48 h-48 sm:w-52 sm:h-52 max-w-[215px] max-h-[215px] flex items-center justify-center p-1 mb-3 relative select-none pointer-events-none">
                <img
                  src={item.theme?.customBackLogoUrl || ORDO_REALITAS_LOGO}
                  alt="Ordo Realitas Logo"
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                  style={{
                    filter: 'contrast(135%) brightness(0.95)',
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>

              <h2
                className="font-title text-base sm:text-lg font-bold tracking-widest uppercase text-zinc-950"
                style={{ fontFamily: "'Cinzel', 'Westsac', Georgia, serif" }}
              >
                EQUIPAMENTO DA ORDEM
              </h2>
              <p className="text-[10.5px] font-mono uppercase mt-1.5 max-w-[280px] tracking-wider leading-relaxed text-zinc-700 font-medium">
                {item.theme?.backQuoteText ||
                  'Propriedade intransferível da Ordo Realitas. O uso indevido por civis está sujeito a intervenção imediata.'}
              </p>
            </div>

            {/* Bottom Barcode & Verification (CUSTOMIZÁVEL / REMOVÍVEL) */}
            {!item.theme?.hideBottomFooter && (
              <div className="w-full border-t border-zinc-300 pt-3 flex items-center justify-between text-[9px] font-mono text-zinc-600">
                <span>
                  {item.theme?.bottomFooterLeft !== undefined
                    ? item.theme.bottomFooterLeft
                    : `REF: ${item.theme?.itemCode || 'ORD-EQP-413'}`}
                </span>
                <span className="text-red-700 font-bold tracking-widest uppercase">
                  {item.theme?.bottomFooterCenter !== undefined ? item.theme.bottomFooterCenter : 'USO RESTRITO'}
                </span>
                <span>
                  {item.theme?.bottomFooterRight !== undefined ? item.theme.bottomFooterRight : 'SETOR ARSENAL'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
