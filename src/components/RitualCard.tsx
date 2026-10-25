import React from 'react';
import { Ritual, ELEMENT_CONFIGS, ElementConfig } from '../types';
import { OccultSigil, GrandOccultSeal } from './OccultSigil';
import { formatRitualText } from '../utils/textFormatter';
import { Clock, Compass, Target, Hourglass, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface RitualCardProps {
  ritual: Ritual;
  viewSide?: 'front' | 'back';
  isFlipped?: boolean;
  scale?: number;
  id?: string;
  className?: string;
}

export const RitualCard: React.FC<RitualCardProps> = ({
  ritual,
  viewSide = 'front',
  isFlipped = false,
  scale = 1,
  id = 'ritual-card-canvas',
  className = '',
}) => {
  const elementConfig: ElementConfig =
    ritual.element === 'custom'
      ? {
          id: 'custom',
          name: ritual.customElementName || 'Custom',
          concept: 'Elemento Oculto',
          primaryColor: ritual.customElementColor || '#10b981',
          secondaryColor: '#047857',
          glowColor: `${ritual.customElementColor || '#10b981'}66`,
          textColor: '#ffffff',
          borderColor: ritual.customElementColor || '#10b981',
        }
      : ELEMENT_CONFIGS[ritual.element];

  const romanNumerals: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
  };

  const currentSide = isFlipped ? (viewSide === 'front' ? 'back' : 'front') : viewSide;

  // Background styling based on theme
  const getBgClass = () => {
    switch (ritual.theme.bgTone) {
      case 'charcoal':
        return 'bg-[#0d0d12]';
      case 'parchment':
        return 'bg-[#08080b] bg-[radial-gradient(#1e1e28_1px,transparent_1px)] [background-size:16px_16px]';
      case 'black':
      default:
        return 'bg-[#030305]';
    }
  };

  // Border style classes
  const getOuterBorderClass = () => {
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

  // Card dimensions: 63mm x 88mm ratio = 1 : 1.3968.
  // Base desktop preview: 420px x 586px
  return (
    <div
      id={id}
      className={`relative select-none transition-all duration-300 ${className}`}
      style={{
        width: `${420 * scale}px`,
        height: `${586 * scale}px`,
        transformOrigin: 'top center',
      }}
    >
      <div
        className={`w-full h-full p-2.5 transition-all relative overflow-hidden flex flex-col justify-between ${getBgClass()} ${getCornerClass()} border-2 ${getOuterBorderClass()}`}
        style={{
          boxShadow: ritual.theme.accentGlow
            ? `0 0 25px ${elementConfig.glowColor}, inset 0 0 30px rgba(0,0,0,0.9)`
            : '0 10px 30px rgba(0,0,0,0.85), inset 0 0 25px rgba(0,0,0,0.95)',
        }}
      >
        {/* Decorative Corner Ornaments (Corner Crosshairs) */}
        <div className="absolute top-2 left-2 text-zinc-400 opacity-60 text-[9px] font-mono leading-none pointer-events-none">
          ┼
        </div>
        <div className="absolute top-2 right-2 text-zinc-400 opacity-60 text-[9px] font-mono leading-none pointer-events-none">
          ┼
        </div>
        <div className="absolute bottom-2 left-2 text-zinc-400 opacity-60 text-[9px] font-mono leading-none pointer-events-none">
          ┼
        </div>
        <div className="absolute bottom-2 right-2 text-zinc-400 opacity-60 text-[9px] font-mono leading-none pointer-events-none">
          ┼
        </div>

        {/* Inner Hairline Double Border Box */}
        <div
          className={`w-full h-full p-3.5 flex flex-col justify-between relative border border-zinc-400/40 ${getInnerCornerClass()} bg-black/40`}
          style={{
            borderColor:
              ritual.theme.borderStyle === 'gold-accent'
                ? 'rgba(234, 179, 8, 0.4)'
                : 'rgba(212, 212, 216, 0.35)',
          }}
        >
          {/* Subtle Element Watermark in the background */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden transition-opacity"
            style={{ opacity: ritual.theme.watermarkOpacity }}
          >
            {ritual.theme.backSigilStyle === 'grand-seal' ? (
              <GrandOccultSeal size={320} color={elementConfig.primaryColor} />
            ) : (
              <OccultSigil element={ritual.element} size={280} color={elementConfig.primaryColor} />
            )}
          </div>

          {/* ======================================================== */}
          {/* FRONT VIEW */}
          {/* ======================================================== */}
          {currentSide === 'front' ? (
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* TOP HEADER */}
              <div className="border-b border-zinc-700/60 pb-2.5">
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Element Sigil */}
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 bg-black/80 shadow-inner">
                    <OccultSigil
                      element={ritual.element}
                      size={28}
                      color={elementConfig.primaryColor}
                      glow={ritual.theme.accentGlow}
                    />
                  </div>

                  {/* Center: Title & Subtitle */}
                  <div className="flex-1 text-center px-1">
                    <h2
                      className="font-cinzel text-lg font-bold tracking-wider text-white uppercase drop-shadow-md truncate"
                      style={{
                        letterSpacing: '0.08em',
                        textShadow: ritual.theme.accentGlow
                          ? `0 0 10px ${elementConfig.glowColor}`
                          : undefined,
                      }}
                      title={ritual.name}
                    >
                      {ritual.name || 'Nome do Ritual'}
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-widest uppercase font-semibold text-zinc-400 mt-0.5">
                      <span style={{ color: elementConfig.primaryColor }}>
                        {elementConfig.name}
                      </span>
                      <span className="text-zinc-600">/</span>
                      <span>{ritual.circle}º Círculo</span>
                    </div>
                  </div>

                  {/* Right: Circle Tier Badge */}
                  <div
                    className="shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-full border border-zinc-700 bg-black/80 shadow-inner"
                    style={{
                      borderColor: elementConfig.borderColor,
                    }}
                  >
                    <span
                      className="font-cinzel text-xs font-bold leading-none"
                      style={{ color: elementConfig.primaryColor }}
                    >
                      {romanNumerals[ritual.circle] || 'I'}
                    </span>
                    <span className="text-[7.5px] uppercase tracking-tighter text-zinc-400 font-mono mt-0.5">
                      Grau
                    </span>
                  </div>
                </div>

                {/* ATTRIBUTES / CASTING COST ROW */}
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 grid grid-cols-5 gap-1 text-center bg-black/60 rounded px-1.5 py-1.5 border border-zinc-800">
                  {/* Execução */}
                  <div className="flex flex-col items-center">
                    <span className="flex items-center gap-0.5 text-[8.5px] font-mono uppercase tracking-wider text-zinc-400">
                      <Zap className="w-2.5 h-2.5 text-zinc-400" />
                      Exec
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-100 truncate w-full mt-0.5" title={ritual.execution}>
                      {ritual.execution || 'Padrão'}
                    </span>
                  </div>

                  {/* Alcance */}
                  <div className="flex flex-col items-center border-l border-zinc-800/80 pl-1">
                    <span className="flex items-center gap-0.5 text-[8.5px] font-mono uppercase tracking-wider text-zinc-400">
                      <Compass className="w-2.5 h-2.5 text-zinc-400" />
                      Alc
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-100 truncate w-full mt-0.5" title={ritual.range}>
                      {ritual.range || 'Toque'}
                    </span>
                  </div>

                  {/* Alvo / Área */}
                  <div className="flex flex-col items-center border-l border-zinc-800/80 pl-1">
                    <span className="flex items-center gap-0.5 text-[8.5px] font-mono uppercase tracking-wider text-zinc-400">
                      <Target className="w-2.5 h-2.5 text-zinc-400" />
                      Alvo
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-100 truncate w-full mt-0.5" title={ritual.target}>
                      {ritual.target || '1 criatura'}
                    </span>
                  </div>

                  {/* Duração */}
                  <div className="flex flex-col items-center border-l border-zinc-800/80 pl-1">
                    <span className="flex items-center gap-0.5 text-[8.5px] font-mono uppercase tracking-wider text-zinc-400">
                      <Hourglass className="w-2.5 h-2.5 text-zinc-400" />
                      Dur
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-100 truncate w-full mt-0.5" title={ritual.duration}>
                      {ritual.duration || 'Instantânea'}
                    </span>
                  </div>

                  {/* Custo PE Base */}
                  <div className="flex flex-col items-center border-l border-zinc-800/80 pl-1">
                    <span
                      className="flex items-center gap-0.5 text-[8.5px] font-mono uppercase tracking-wider font-bold"
                      style={{ color: elementConfig.primaryColor }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Custo
                    </span>
                    <span
                      className="text-[10px] font-bold font-mono truncate w-full mt-0.5"
                      style={{ color: elementConfig.primaryColor }}
                      title={ritual.basePe}
                    >
                      {ritual.basePe || '1 PE'}
                    </span>
                  </div>
                </div>

                {/* Resistência / DT bar if specified */}
                {ritual.resistance && ritual.resistance !== 'Nenhuma' && (
                  <div className="mt-1.5 flex items-center justify-between px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[9.5px]">
                    <span className="flex items-center gap-1 text-zinc-400 font-mono">
                      <ShieldAlert className="w-2.5 h-2.5 text-zinc-400" />
                      Resistência:
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {ritual.resistance}
                    </span>
                  </div>
                )}
              </div>

              {/* CARD MAIN BODY */}
              <div className="flex-1 my-2 overflow-hidden flex flex-col justify-start">
                <div className="text-[11px] text-zinc-200 leading-snug overflow-y-auto pr-1">
                  {formatRitualText(ritual.description, elementConfig.primaryColor)}
                </div>

                {/* MODIFICATIONS (DISCENTE / VERDADEIRO) */}
                {ritual.modifications && ritual.modifications.length > 0 && (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-zinc-800/90">
                    {ritual.modifications.map((mod) => (
                      <div
                        key={mod.id}
                        className="rounded bg-black/70 border border-zinc-800/90 p-1.5 relative overflow-hidden"
                      >
                        {/* Subtle accent hairline marker on left */}
                        <div
                          className="absolute top-0 bottom-0 left-0 w-0.5"
                          style={{ backgroundColor: elementConfig.primaryColor }}
                        />

                        {/* Modification Header */}
                        <div className="flex items-center justify-between text-[10px] font-mono mb-0.5 pl-1">
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            <span style={{ color: elementConfig.primaryColor }}>
                              ✦ {mod.name || 'Aprimoramento'}
                            </span>
                            <span className="text-zinc-200 bg-white/10 px-1 py-0.2 rounded text-[9px] border border-white/15">
                              {mod.cost}
                            </span>
                          </div>
                          {mod.requirement && (
                            <span className="text-[8.5px] text-zinc-400 italic truncate max-w-[150px]">
                              {mod.requirement}
                            </span>
                          )}
                        </div>

                        {/* Modification Text */}
                        <div className="text-[10px] text-zinc-300 pl-1 leading-tight">
                          {formatRitualText(mod.text, elementConfig.primaryColor)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD FOOTER */}
              <div className="pt-2 border-t border-zinc-800/70">
                {ritual.theme.showFlavorText && ritual.flavorText && (
                  <p className="text-[9.5px] italic text-zinc-400 text-center font-serif leading-tight px-2 mb-1.5 line-clamp-2">
                    &ldquo;{ritual.flavorText}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between text-[8px] font-mono tracking-widest uppercase text-zinc-400 px-1">
                  <span>ORDEM PARANORMAL</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ backgroundColor: elementConfig.primaryColor }}
                    />
                    {elementConfig.name.toUpperCase()}
                  </span>
                  <span>CARD Nº {ritual.circle}0{ritual.id.slice(0, 2).toUpperCase()}</span>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* BACK VIEW (VERSO) */
            /* ======================================================== */
            <div className="relative z-10 flex flex-col h-full items-center justify-between text-center p-3">
              {/* Back Top Seal / Occult Inscription */}
              <div className="w-full flex items-center justify-between border-b border-zinc-800/70 pb-2">
                <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400">
                  SIGILLUM PARANORMALIS
                </span>
                <span className="font-cinzel text-xs text-zinc-300 tracking-wider">
                  {elementConfig.name.toUpperCase()}
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400">
                  CIRCULUS {romanNumerals[ritual.circle]}
                </span>
              </div>

              {/* Large Center Sigil & Inscriptions */}
              <div className="my-auto flex flex-col items-center justify-center relative">
                {ritual.theme.backSigilStyle === 'element' ? (
                  <div className="relative">
                    <OccultSigil
                      element={ritual.element}
                      size={200}
                      color={elementConfig.primaryColor}
                      glow={ritual.theme.accentGlow}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-36 h-36 rounded-full border border-dashed border-zinc-700/60" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <GrandOccultSeal
                      size={210}
                      color={
                        ritual.theme.borderStyle === 'gold-accent'
                          ? '#fbbf24'
                          : '#e2e8f0'
                      }
                      element={ritual.element}
                    />
                  </div>
                )}

                {/* Occult Center Inscription */}
                <div className="mt-4 max-w-[280px]">
                  <p
                    className="font-cinzel text-[11px] tracking-widest text-zinc-300 uppercase leading-relaxed font-semibold"
                    style={{
                      textShadow: ritual.theme.accentGlow
                        ? `0 0 8px ${elementConfig.glowColor}`
                        : undefined,
                    }}
                  >
                    {ritual.theme.backQuoteText ||
                      'A Realidade é uma membrana frágil diante do Outro Lado.'}
                  </p>
                </div>
              </div>

              {/* Back Bottom Inscription */}
              <div className="w-full pt-2 border-t border-zinc-800/70 flex items-center justify-between text-[8px] font-mono tracking-widest text-zinc-400 uppercase">
                <span>ESTUDOS OCULTISTAS</span>
                <span className="text-zinc-400">✦ ✦ ✦</span>
                <span>MEMBRANA CORROMPIDA</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
