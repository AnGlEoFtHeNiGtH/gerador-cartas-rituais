import React from 'react';
import {
  Ritual,
  ELEMENT_CONFIGS,
  ElementConfig,
  getOfficialBackArtGlow,
  getElementDefaultSymbol,
} from '../types';
import { ORDO_REALITAS_LOGO } from '../data/elementSymbols';
import { OccultSigil, GrandOccultSeal } from './OccultSigil';
import { formatRitualText, healCorruptedCharacters, sanitizeTextForCustomFont } from '../utils/textFormatter';
import { Compass, Target, Hourglass, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface RitualCardProps {
  ritual: Ritual;
  viewSide?: 'front' | 'back';
  isFlipped?: boolean;
  scale?: number;
  id?: string;
  className?: string;
  onUpdateUses?: (newUses: number) => void;
}

export const RitualCard: React.FC<RitualCardProps> = ({
  ritual,
  viewSide = 'front',
  isFlipped = false,
  scale = 1,
  id = 'ritual-card-canvas',
  className = '',
  onUpdateUses,
}) => {
  const isLight = ritual.theme.cardMode === 'light';
  const isDossierStyle = ritual.theme.borderStyle === 'dossier-thick-black';
  const isEffectivelyLight = isLight || isDossierStyle;

  const defaultHeaderLabel = 'MATERIAL CLASSIFICADO • ORDO REALITAS';
  const rawHeaderLabel = ritual.theme.topHeaderLabel !== undefined ? ritual.theme.topHeaderLabel : defaultHeaderLabel;
  const showTopHeader = !ritual.theme.hideTopHeader && rawHeaderLabel.trim().length > 0;

  const baseConfig =
    ritual.element === 'custom'
      ? {
          id: 'custom' as const,
          name: ritual.customElementName || 'Custom',
          concept: 'Elemento Oculto',
          primaryColor: ritual.customElementColor || '#10b981',
          secondaryColor: '#047857',
          glowColor: `${ritual.customElementColor || '#10b981'}66`,
          textColor: '#ffffff',
          borderColor: ritual.customElementColor || '#10b981',
          lightPrimaryColor: ritual.customElementColor || '#047857',
          lightTextColor: '#064e3b',
          lightBorderColor: ritual.customElementColor || '#047857',
        }
      : ELEMENT_CONFIGS[ritual.element];

  const elementConfig: ElementConfig = baseConfig;
  const activeAccentColor = isEffectivelyLight ? elementConfig.lightPrimaryColor : elementConfig.primaryColor;

  const romanNumerals: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
  };

  const currentSide = isFlipped ? (viewSide === 'front' ? 'back' : 'front') : viewSide;
  const isBack = currentSide === 'back';
  const defaultElementSymbol = getElementDefaultSymbol(ritual.element);
  // Auto-loads official element standard symbol unless card has user-uploaded custom icon
  const effectiveElementIcon = ritual.customElementIcon || defaultElementSymbol;
  const backArtGlowStyle = getOfficialBackArtGlow(ritual.element, ritual.customElementColor);
  const basePdValue =
    ritual.basePd || (ritual as unknown as { basePe?: string }).basePe || '1 PD';

  // Background styling based on theme, cardMode and dossier style
  const getBgClass = () => {
    if (isBack) {
      return 'bg-white text-zinc-950';
    }

    if (isDossierStyle) {
      return 'bg-white text-zinc-950';
    }

    if (isLight) {
      switch (ritual.theme.bgTone) {
        case 'light-parchment':
          return 'bg-[#fbf9f4] text-zinc-900';
        case 'light-pure':
        default:
          return 'bg-white text-zinc-950';
      }
    }

    switch (ritual.theme.bgTone) {
      case 'charcoal':
        return 'bg-[#0d0d12] text-zinc-100';
      case 'parchment':
        return 'bg-[#08080b] text-zinc-100';
      case 'black':
      default:
        return 'bg-[#030305] text-zinc-100';
    }
  };

  // Border style classes
  const getOuterBorderClass = () => {
    if (isDossierStyle) {
      return 'border-[10px] sm:border-[12px] border-black shadow-[0_16px_36px_rgba(0,0,0,0.9)]';
    }

    if (isLight) {
      switch (ritual.theme.borderStyle) {
        case 'gold-accent':
          return 'border-[#b45309] shadow-[0_0_15px_rgba(180,83,9,0.18)]';
        case 'runic':
          return 'border-zinc-800 shadow-[0_0_12px_rgba(0,0,0,0.1)]';
        case 'pure-minimal':
          return 'border-zinc-400';
        case 'double-silver':
        default:
          return 'border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.15)]';
      }
    }

    switch (ritual.theme.borderStyle) {
      case 'gold-accent':
        return 'border-[#eab308]/70 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
      case 'runic':
        return 'border-zinc-300 shadow-[0_0_12px_rgba(255,255,255,0.08)]';
      case 'pure-minimal':
        return 'border-zinc-600/80';
      case 'double-silver':
      default:
        return 'border-zinc-300 shadow-[0_0_18px_rgba(0,0,0,0.9)]';
    }
  };

  const getCornerClass = () => {
    switch (ritual.theme.cornerStyle) {
      case 'chamfer':
        return 'corner-chamfer-lg';
      case 'rounded':
        return 'rounded-2xl';
      case 'sharp':
      default:
        return 'rounded-none';
    }
  };

  const getInnerCornerClass = () => {
    switch (ritual.theme.cornerStyle) {
      case 'chamfer':
        return 'corner-chamfer-inner';
      case 'rounded':
        return 'rounded-xl';
      case 'sharp':
      default:
        return 'rounded-none';
    }
  };

  const hasArtwork = Boolean(ritual.artwork?.url);
  const showArtworkOnFront = hasArtwork && (ritual.artwork?.showOnFront ?? true);
  const showArtworkOnBack =
    hasArtwork &&
    (ritual.artwork?.showOnBack || ritual.artwork?.mode === 'back-cover' || Boolean(ritual.theme.backArtGlow));
  const isIllustrationMode = showArtworkOnFront && ritual.artwork?.mode === 'illustration';
  const isBackgroundArtMode = showArtworkOnFront && ritual.artwork?.mode === 'background';

  const baseWidth = 440;
  const baseHeight = 615;
  const isScaled = scale !== 1;

  // Base preview dimensions: 440px x 615px (poker card ratio ~1:1.397)
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
          isBack ? 'bg-white text-zinc-950' : getBgClass()
        } ${getCornerClass()} border-2 ${getOuterBorderClass()}`}
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: isScaled ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          backgroundColor: isBack ? '#ffffff' : undefined,
          boxShadow: isBack
            ? '0 10px 25px rgba(0,0,0,0.12)'
            : isLight
            ? ritual.theme.accentGlow
              ? `0 0 20px ${activeAccentColor}44, inset 0 0 20px rgba(0,0,0,0.05)`
              : '0 10px 25px rgba(0,0,0,0.12), inset 0 0 15px rgba(0,0,0,0.03)'
            : ritual.theme.accentGlow
            ? `0 0 25px ${elementConfig.glowColor}, inset 0 0 30px rgba(0,0,0,0.9)`
            : '0 10px 30px rgba(0,0,0,0.85), inset 0 0 25px rgba(0,0,0,0.95)',
        }}
      >
        {/* Decorative Corner Ornaments (Crosshairs) */}
        <div
          className={`absolute top-2 left-2 text-[10px] font-mono leading-none pointer-events-none z-20 ${
            isLight ? 'text-zinc-500 opacity-60' : 'text-zinc-400 opacity-60'
          }`}
        >
          ┼
        </div>
        <div
          className={`absolute top-2 right-2 text-[10px] font-mono leading-none pointer-events-none z-20 ${
            isLight ? 'text-zinc-500 opacity-60' : 'text-zinc-400 opacity-60'
          }`}
        >
          ┼
        </div>
        <div
          className={`absolute bottom-2 left-2 text-[10px] font-mono leading-none pointer-events-none z-20 ${
            isLight ? 'text-zinc-500 opacity-60' : 'text-zinc-400 opacity-60'
          }`}
        >
          ┼
        </div>
        <div
          className={`absolute bottom-2 right-2 text-[10px] font-mono leading-none pointer-events-none z-20 ${
            isLight ? 'text-zinc-500 opacity-60' : 'text-zinc-400 opacity-60'
          }`}
        >
          ┼
        </div>

        {/* Inner Hairline Double Border Box */}
        <div
          className={`w-full h-full p-3.5 flex flex-col justify-between relative border ${getInnerCornerClass()} overflow-hidden ${
            isBack
              ? 'border-zinc-800/60 bg-white shadow-none text-zinc-950'
              : isEffectivelyLight
              ? 'border-zinc-800/60 bg-white/80 shadow-inner'
              : 'border-zinc-400/40 bg-black/40'
          }`}
          style={{
            backgroundColor: isBack ? '#ffffff' : undefined,
            borderColor: isBack
              ? 'rgba(0, 0, 0, 0.65)'
              : isDossierStyle
              ? 'rgba(0, 0, 0, 0.65)'
              : isLight
              ? ritual.theme.borderStyle === 'gold-accent'
                ? 'rgba(180, 83, 9, 0.45)'
                : 'rgba(82, 82, 91, 0.45)'
              : ritual.theme.borderStyle === 'gold-accent'
              ? 'rgba(234, 179, 8, 0.4)'
              : 'rgba(212, 212, 216, 0.35)',
          }}
        >
          {/* Watermark Sigil in the background - strictly for front view */}
          {!isBack && (!isBackgroundArtMode || (ritual.artwork?.opacity ?? 0) < 0.3) && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden transition-opacity z-0"
              style={{
                opacity: isEffectivelyLight
                  ? ritual.theme.watermarkOpacity * 0.7
                  : ritual.theme.watermarkOpacity,
              }}
            >
              {ritual.theme.backSigilStyle === 'grand-seal' ? (
                <GrandOccultSeal
                  size={330}
                  color={activeAccentColor}
                  cardMode={ritual.theme.cardMode}
                />
              ) : (
                <OccultSigil
                  element={ritual.element}
                  symbolPreset={ritual.symbolPreset}
                  customIconUrl={effectiveElementIcon}
                  customIconFilter={ritual.theme.customIconFilter}
                  customIconInvert={ritual.theme.customIconInvert}
                  cardMode={ritual.theme.cardMode}
                  isLightBackground={isEffectivelyLight}
                  size={290}
                  color={activeAccentColor}
                />
              )}
            </div>
          )}

          {/* Background Custom Artwork Layer */}
          {currentSide === 'front' && isBackgroundArtMode && ritual.artwork && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden z-0"
              style={{
                opacity: ritual.artwork.opacity ?? 0.3,
                mixBlendMode: isEffectivelyLight
                  ? ritual.artwork.blendMode === 'normal'
                    ? 'multiply'
                    : ritual.artwork.blendMode
                  : ritual.artwork.blendMode || 'normal',
              }}
            >
              <img
                src={ritual.artwork.url}
                alt=""
                className="w-full h-full transition-transform"
                style={{
                  objectFit: ritual.artwork.fit || 'cover',
                  objectPosition: `50% ${ritual.artwork.positionY ?? 50}%`,
                  transform: `scale(${ritual.artwork.scale ?? 1})`,
                }}
              />
              <div
                className={`absolute inset-0 ${
                  isEffectivelyLight ? 'bg-white/50 backdrop-blur-[0.5px]' : 'bg-black/55 backdrop-blur-[0.5px]'
                }`}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* FRONT VIEW */}
          {/* ======================================================== */}
          {currentSide === 'front' ? (
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Optional Top Classified Tape / Header Label */}
              {showTopHeader && (
                <div
                  className={`text-[8.5px] font-mono tracking-widest uppercase text-center py-0.5 px-2 mb-1.5 border rounded font-bold shrink-0 ${
                    isEffectivelyLight
                      ? 'text-red-800 border-red-300 bg-red-50/90 shadow-2xs'
                      : 'text-red-300 border-red-800/80 bg-red-950/60 shadow-2xs'
                  }`}
                >
                  {rawHeaderLabel}
                </div>
              )}

              {/* TOP HEADER: LARGER ICONS & TITLES */}
              <div
                className={`border-b pb-3 shrink-0 ${
                  isEffectivelyLight ? 'border-zinc-300' : 'border-zinc-700/60'
                }`}
              >
                {/* TOP HEADER: DYNAMIC FONT SIZING & PROTECTED BADGE SPACE */}
                {(() => {
                  const rawName = healCorruptedCharacters(ritual.name || '') || 'Nome do Ritual';
                  const ritualName = sanitizeTextForCustomFont(rawName);
                  const nameLen = ritualName.trim().length;
                  let titleFontSizeClass = 'text-lg md:text-xl';
                  if (nameLen > 32) {
                    titleFontSizeClass = 'text-[12px] leading-tight';
                  } else if (nameLen > 22) {
                    titleFontSizeClass = 'text-[14px] leading-tight';
                  } else if (nameLen > 14) {
                    titleFontSizeClass = 'text-base leading-tight';
                  }

                  const hideSymbol = ritual.theme.hideElementSymbol;

                  return (
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Left: Element Sigil / Custom Icon (Protected 48px Box) - Conditionally Hidden */}
                      {!hideSymbol && (
                        <div
                          className={`shrink-0 w-12 h-12 min-w-[48px] flex items-center justify-center rounded-full border shadow-inner ${
                            isEffectivelyLight
                              ? 'border-zinc-800 bg-zinc-100'
                              : 'border-zinc-700 bg-black/80'
                          }`}
                          style={{
                            borderColor: activeAccentColor,
                          }}
                        >
                          <OccultSigil
                            element={ritual.element}
                            symbolPreset={ritual.symbolPreset}
                            customIconUrl={effectiveElementIcon}
                            customIconFilter={ritual.theme.customIconFilter}
                            customIconInvert={ritual.theme.customIconInvert}
                            cardMode={ritual.theme.cardMode}
                            isLightBackground={isEffectivelyLight}
                            size={36}
                            color={activeAccentColor}
                            glow={ritual.theme.accentGlow}
                          />
                        </div>
                      )}

                      {/* Center: Title in Westsac Font with Unicode Latin Fallback & Custom Font Sanitization */}
                      <div
                        className={`flex-1 min-w-0 flex flex-col justify-center overflow-hidden ${
                          hideSymbol ? 'text-left pl-1.5' : 'text-center px-1'
                        }`}
                      >
                        <h2
                          className={`font-title ${titleFontSizeClass} font-bold tracking-wider uppercase line-clamp-2 break-words ${
                            isEffectivelyLight ? 'text-zinc-950 drop-shadow-xs' : 'text-white drop-shadow-md'
                          }`}
                          style={{
                            fontFamily: "'Westsac', 'Cinzel', 'Times New Roman', Georgia, serif",
                            letterSpacing: '0.05em',
                            wordBreak: 'break-word',
                            textShadow:
                              ritual.theme.accentGlow && !isLight
                                ? `0 0 10px ${elementConfig.glowColor}`
                                : undefined,
                          }}
                          title={rawName}
                        >
                          {ritualName}
                        </h2>
                        <div
                          className={`flex items-center gap-1.5 text-xs tracking-widest uppercase font-semibold mt-0.5 shrink-0 ${
                            hideSymbol ? 'justify-start' : 'justify-center'
                          } ${isEffectivelyLight ? 'text-zinc-700' : 'text-zinc-400'}`}
                        >
                          <span style={{ color: activeAccentColor }}>
                            {elementConfig.name}
                          </span>
                          <span className={isEffectivelyLight ? 'text-zinc-400' : 'text-zinc-600'}>/</span>
                          <span className="font-bold">{ritual.circle}º Círculo</span>
                        </div>
                      </div>

                      {/* Right: Circle Tier Badge (Protected fixed 48px, never pushed out) */}
                      <div
                        className={`shrink-0 w-12 h-12 min-w-[48px] flex flex-col items-center justify-center rounded-full border shadow-inner ${
                          isEffectivelyLight
                            ? 'border-zinc-300 bg-zinc-50'
                            : 'border-zinc-700 bg-black/80'
                        }`}
                        style={{
                          borderColor: activeAccentColor,
                        }}
                      >
                        <span
                          className="font-title text-sm md:text-base font-bold leading-none"
                          style={{ color: activeAccentColor }}
                        >
                          {romanNumerals[ritual.circle] || 'I'}
                        </span>
                        <span
                          className={`text-[8.5px] uppercase tracking-tighter font-mono font-semibold mt-0.5 ${
                            isEffectivelyLight ? 'text-zinc-600' : 'text-zinc-400'
                          }`}
                        >
                          Grau
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* ATTRIBUTES / CASTING COST ROW: LARGER ICONS & FONTS */}
                <div
                  className={`mt-2.5 pt-2 border-t grid grid-cols-5 gap-1 text-center rounded px-2 py-2 ${
                    isLight
                      ? 'border-zinc-300 bg-zinc-100/90 border text-zinc-800'
                      : 'border-zinc-800/80 bg-black/70 border border-zinc-800 text-zinc-100'
                  }`}
                >
                  {/* Execução */}
                  <div className="flex flex-col items-center justify-center min-w-0 overflow-hidden">
                    <span
                      className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isLight ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      Exec
                    </span>
                    <span
                      className={`text-xs font-bold truncate w-full mt-0.5 ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                      title={healCorruptedCharacters(ritual.execution || '')}
                    >
                      {healCorruptedCharacters(ritual.execution || 'Padrão')}
                    </span>
                  </div>

                  {/* Alcance */}
                  <div
                    className={`flex flex-col items-center justify-center border-l pl-1 min-w-0 overflow-hidden ${
                      isLight ? 'border-zinc-300' : 'border-zinc-800'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isLight ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5 shrink-0" />
                      Alc
                    </span>
                    <span
                      className={`text-xs font-bold truncate w-full mt-0.5 ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                      title={healCorruptedCharacters(ritual.range || '')}
                    >
                      {healCorruptedCharacters(ritual.range || 'Toque')}
                    </span>
                  </div>

                  {/* Alvo / Área */}
                  <div
                    className={`flex flex-col items-center justify-center border-l pl-1 min-w-0 overflow-hidden ${
                      isLight ? 'border-zinc-300' : 'border-zinc-800'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isLight ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 shrink-0" />
                      Alvo
                    </span>
                    <span
                      className={`text-xs font-bold truncate w-full mt-0.5 ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                      title={healCorruptedCharacters(ritual.target || '')}
                    >
                      {healCorruptedCharacters(ritual.target || '1 criatura')}
                    </span>
                  </div>

                  {/* Duração */}
                  <div
                    className={`flex flex-col items-center justify-center border-l pl-1 min-w-0 overflow-hidden ${
                      isLight ? 'border-zinc-300' : 'border-zinc-800'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isLight ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      <Hourglass className="w-3.5 h-3.5 shrink-0" />
                      Dur
                    </span>
                    <span
                      className={`text-xs font-bold truncate w-full mt-0.5 ${
                        isLight ? 'text-zinc-900' : 'text-zinc-100'
                      }`}
                      title={healCorruptedCharacters(ritual.duration || '')}
                    >
                      {healCorruptedCharacters(ritual.duration || 'Instantânea')}
                    </span>
                  </div>

                  {/* Custo PD Base (Rigorosamente PD, Maior e Destacado) */}
                  <div
                    className={`flex flex-col items-center justify-center border-l pl-1 min-w-0 overflow-hidden ${
                      isLight ? 'border-zinc-300' : 'border-zinc-800'
                    }`}
                  >
                    <span
                      className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold"
                      style={{ color: activeAccentColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      Custo
                    </span>
                    <span
                      className="text-[13px] font-bold font-mono truncate w-full mt-0.5 tracking-tight"
                      style={{ color: activeAccentColor }}
                      title={basePdValue}
                    >
                      {basePdValue}
                    </span>
                  </div>
                </div>

                {/* Resistência / DT bar if specified */}
                {ritual.resistance && ritual.resistance !== 'Nenhuma' && (
                  <div
                    className={`mt-1.5 flex items-center justify-between px-2.5 py-1 rounded text-[11px] ${
                      isLight
                        ? 'bg-zinc-100 border border-zinc-300 text-zinc-900'
                        : 'bg-zinc-900/70 border border-zinc-800 text-zinc-100'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1.5 font-mono font-semibold ${
                        isLight ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Resistência:
                    </span>
                    <span className="font-bold">{healCorruptedCharacters(ritual.resistance)}</span>
                  </div>
                )}
              </div>

              {/* DEDICATED ARTWORK ILLUSTRATION FRAME */}
              {isIllustrationMode && ritual.artwork && (
                <div
                  className={`relative w-full h-34 my-2 rounded-lg overflow-hidden border shrink-0 shadow-inner ${
                    isLight
                      ? 'border-zinc-300 bg-zinc-100'
                      : 'border-zinc-700/80 bg-black/80'
                  }`}
                >
                  <img
                    src={ritual.artwork.url}
                    alt={ritual.name}
                    className="w-full h-full transition-transform"
                    style={{
                      objectFit: ritual.artwork.fit || 'cover',
                      objectPosition: `50% ${ritual.artwork.positionY ?? 50}%`,
                      opacity: ritual.artwork.opacity ?? 0.95,
                      transform: `scale(${ritual.artwork.scale ?? 1})`,
                      mixBlendMode: ritual.artwork.blendMode || 'normal',
                    }}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isLight
                        ? 'from-white/60 via-transparent to-white/20'
                        : 'from-black/80 via-transparent to-black/30'
                    } pointer-events-none`}
                  />
                  <div className="absolute top-1 left-1 text-[8px] text-zinc-400 opacity-60 font-mono pointer-events-none">
                    ┼
                  </div>
                  <div className="absolute top-1 right-1 text-[8px] text-zinc-400 opacity-60 font-mono pointer-events-none">
                    ┼
                  </div>
                  <div className="absolute bottom-1 left-1 text-[8px] text-zinc-400 opacity-60 font-mono pointer-events-none">
                    ┼
                  </div>
                  <div className="absolute bottom-1 right-1 text-[8px] text-zinc-400 opacity-60 font-mono pointer-events-none">
                    ┼
                  </div>
                </div>
              )}

              {/* CARD MAIN BODY: INCREASED TEXT SIZE TO 13px (OPTIMA LT STD MEDIUM) */}
              <div className="flex-1 my-2 overflow-hidden flex flex-col justify-start">
                <div
                  className={`text-[13px] leading-relaxed overflow-y-auto scrollbar-none pr-1 ${
                    isLight ? 'text-zinc-900 font-medium' : 'text-zinc-100 font-normal'
                  } ${isIllustrationMode ? 'max-h-[120px]' : ''}`}
                  style={{ scrollbarWidth: 'none' }}
                >
                  {formatRitualText(ritual.description, activeAccentColor)}
                </div>

                {/* MODIFICATIONS (DISCENTE / VERDADEIRO EM PD): INCREASED LEGIBILITY */}
                {ritual.modifications && ritual.modifications.length > 0 && (
                  <div
                    className={`mt-2 space-y-2 pt-2 border-t ${
                      isLight ? 'border-zinc-300' : 'border-zinc-800/90'
                    }`}
                  >
                    {ritual.modifications.map((mod) => (
                      <div
                        key={mod.id}
                        className={`rounded p-2 relative overflow-hidden border ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-300 shadow-2xs'
                            : 'bg-black/70 border-zinc-800/90'
                        }`}
                      >
                        {/* Accent marker on left */}
                        <div
                          className="absolute top-0 bottom-0 left-0 w-1"
                          style={{ backgroundColor: activeAccentColor }}
                        />

                        {/* Modification Header */}
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1 pl-1.5">
                          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                            <span style={{ color: activeAccentColor }}>
                              ✦ {mod.name || 'Aprimoramento'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                isLight
                                  ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                                  : 'bg-white/10 text-zinc-100 border-white/20'
                              }`}
                            >
                              {mod.cost}
                            </span>
                          </div>
                          {mod.requirement && (
                            <span
                              className={`text-[9.5px] italic truncate max-w-[170px] ${
                                isLight ? 'text-zinc-600' : 'text-zinc-400'
                              }`}
                            >
                              {mod.requirement}
                            </span>
                          )}
                        </div>

                        {/* Modification Text */}
                        <div
                          className={`text-[12px] pl-1.5 leading-snug ${
                            isLight ? 'text-zinc-800' : 'text-zinc-200'
                          }`}
                        >
                          {formatRitualText(mod.text, activeAccentColor)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD FOOTER: CLEANED, NO UNWANTED LABELS */}
              <div
                className={`pt-2 border-t shrink-0 ${
                  isLight ? 'border-zinc-300' : 'border-zinc-800/70'
                }`}
              >
                {ritual.theme.showFlavorText && ritual.flavorText && (
                  <p
                    className={`text-[10px] italic text-center font-serif leading-tight px-3 mb-1 line-clamp-2 ${
                      isLight ? 'text-zinc-600' : 'text-zinc-400'
                    }`}
                  >
                    &ldquo;{healCorruptedCharacters(ritual.flavorText)}&rdquo;
                  </p>
                )}

                {!ritual.theme.hideBottomFooter && (
                  <div
                    className={`flex items-center justify-between text-[9px] font-mono tracking-widest uppercase px-1 ${
                      isLight ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    <span className="font-semibold">
                      {ritual.theme.bottomFooterLeft !== undefined ? ritual.theme.bottomFooterLeft : 'ORDEM PARANORMAL'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: activeAccentColor }}
                      />
                      <span className="font-bold" style={{ color: activeAccentColor }}>
                        {ritual.theme.bottomFooterCenter !== undefined ? ritual.theme.bottomFooterCenter : elementConfig.name.toUpperCase()}
                      </span>
                    </span>
                    <span>
                      {ritual.theme.bottomFooterRight !== undefined ? ritual.theme.bottomFooterRight : `CARD ${romanNumerals[ritual.circle]}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* BACK VIEW (VERSO) - CLEANED OF UNWANTED DECORATIVE TEXTS */
            /* ======================================================== */
            <div
              className="relative z-10 flex flex-col h-full items-center justify-between text-center p-3.5 overflow-hidden bg-white text-zinc-950"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Top Classified Header Banner (CUSTOMIZÁVEL / REMOVÍVEL) */}
              {showTopHeader && (
                <div className="w-full border-b border-zinc-300 pb-2 mb-1 z-10 shrink-0">
                  <div className="inline-block px-3 py-1 rounded text-[9.5px] font-mono uppercase tracking-widest font-bold shadow-xs border bg-red-50 text-red-950 border-red-300">
                    {rawHeaderLabel}
                  </div>
                </div>
              )}

              {/* Back Artwork Layer with Exclusive Paranormal Glow Effect */}
              {showArtworkOnBack && ritual.artwork && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <div
                    className="w-full h-full relative transition-all duration-300"
                    style={{
                      opacity: ritual.artwork.opacity ?? (ritual.theme.backArtGlow ? 0.8 : 0.45),
                      mixBlendMode: ritual.artwork.blendMode === 'normal'
                        ? 'multiply'
                        : ritual.artwork.blendMode,
                    }}
                  >
                    <img
                      src={ritual.artwork.url}
                      alt=""
                      className="w-full h-full transition-all duration-300"
                      style={{
                        objectFit: ritual.artwork.fit || 'cover',
                        objectPosition: `50% ${ritual.artwork.positionY ?? 50}%`,
                        transform: `scale(${ritual.artwork.scale ?? 1})`,
                        filter: isBack && ritual.theme.backArtGlow ? backArtGlowStyle.filter : undefined,
                      }}
                    />
                    <div
                      className="absolute inset-0 transition-opacity duration-300 bg-white/30"
                    />
                  </div>

                  {/* Exclusive Back Art Glow Aura Halo Frame (Official Ordem Paranormal Element Glow) */}
                  {isBack && ritual.theme.backArtGlow && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-300"
                      style={{
                        boxShadow: backArtGlowStyle.boxShadow,
                        filter: backArtGlowStyle.filter,
                      }}
                    />
                  )}
                </div>
              )}

              {/* Center Sigil & Inscriptions */}
              <div className="my-auto flex flex-col items-center justify-center relative z-10 w-full">
                <div
                  className="relative flex items-center justify-center transition-all duration-200"
                  style={{
                    opacity:
                      typeof ritual.theme.backSigilOpacity === 'number'
                        ? ritual.theme.backSigilOpacity
                        : 1,
                    filter: ritual.theme.backSigilGlow
                      ? `drop-shadow(0 0 14px ${activeAccentColor}) drop-shadow(0 0 28px ${elementConfig.glowColor})`
                      : undefined,
                  }}
                >
                  {ritual.theme.customBackLogoUrl || ritual.theme.backSigilStyle === 'ordo-realitas' ? (
                    /* Ordo Realitas Official / Custom User Logo with Imposing Scale & No Dashed Circle */
                    <div className="relative p-1 flex flex-col items-center justify-center">
                      <div className="w-48 h-48 sm:w-52 sm:h-52 max-w-[215px] max-h-[215px] flex items-center justify-center mb-2 relative select-none pointer-events-none">
                        <img
                          src={ritual.theme.customBackLogoUrl || ORDO_REALITAS_LOGO}
                          alt="Ordo Realitas Logo"
                          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                          style={{
                            filter: 'contrast(135%) brightness(0.95)',
                            mixBlendMode: 'multiply',
                          }}
                        />
                      </div>
                    </div>
                  ) : ritual.theme.cleanBackSymbolOnly ? (
                    /* Clean Symbol Only - No concentric rings, no complex runes, no dashed circle */
                    <div className="relative p-2 flex items-center justify-center">
                      <OccultSigil
                        element={ritual.element}
                        symbolPreset={ritual.symbolPreset}
                        customIconUrl={effectiveElementIcon}
                        customIconFilter={ritual.theme.customIconFilter}
                        customIconInvert={ritual.theme.customIconInvert}
                        cardMode={ritual.theme.cardMode}
                        isLightBackground={true}
                        size={210}
                        color={activeAccentColor}
                        glow={ritual.theme.backSigilGlow || ritual.theme.accentGlow}
                      />
                    </div>
                  ) : ritual.theme.backSigilStyle === 'element' ? (
                    /* Clean Element Sigil - No dashed circle */
                    <div className="relative p-2 flex items-center justify-center">
                      <OccultSigil
                        element={ritual.element}
                        symbolPreset={ritual.symbolPreset}
                        customIconUrl={effectiveElementIcon}
                        customIconFilter={ritual.theme.customIconFilter}
                        customIconInvert={ritual.theme.customIconInvert}
                        cardMode={ritual.theme.cardMode}
                        isLightBackground={true}
                        size={210}
                        color={activeAccentColor}
                        glow={ritual.theme.backSigilGlow || ritual.theme.accentGlow}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <GrandOccultSeal
                        size={220}
                        color={activeAccentColor}
                        cardMode={ritual.theme.cardMode}
                        glow={ritual.theme.backSigilGlow || ritual.theme.accentGlow}
                      />
                    </div>
                  )}
                </div>

                {/* Custom Occult Center Inscription */}
                <div className="mt-4 max-w-[300px]">
                  <p className="font-title text-xs md:text-sm tracking-widest uppercase leading-relaxed font-bold text-zinc-950 drop-shadow-xs">
                    {sanitizeTextForCustomFont(
                      ritual.theme.backQuoteText ||
                        'A Realidade é uma membrana frágil diante do Outro Lado.'
                    )}
                  </p>
                </div>
              </div>

              {/* Bottom Classification Stamp (CUSTOMIZÁVEL / REMOVÍVEL) */}
              {!ritual.theme.hideBottomFooter && (
                <div className="w-full pt-2 border-t border-zinc-300 flex items-center justify-between text-[9px] font-mono tracking-widest uppercase shrink-0 text-zinc-600">
                  <span>{ritual.theme.bottomFooterLeft !== undefined ? ritual.theme.bottomFooterLeft : 'ARQUIVO DA ORDEM'}</span>
                  <span className="font-bold text-red-700">{ritual.theme.bottomFooterCenter !== undefined ? ritual.theme.bottomFooterCenter : 'CONFIDENCIAL'}</span>
                  <span>{ritual.theme.bottomFooterRight !== undefined ? ritual.theme.bottomFooterRight : 'SETOR OCULTO'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
