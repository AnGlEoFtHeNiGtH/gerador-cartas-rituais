import React from 'react';
import { Ritual, ELEMENT_CONFIGS, ElementConfig } from '../types';
import { OccultSigil } from './OccultSigil';
import { formatRitualText, healCorruptedCharacters } from '../utils/textFormatter';
import { Compass, Target, Clock, Zap, ShieldAlert, Sparkles, Feather } from 'lucide-react';

interface LightPrintCardProps {
  ritual: Ritual;
  viewSide?: 'front' | 'back';
  scale?: number;
  id?: string;
  className?: string;
}

export const LightPrintCard: React.FC<LightPrintCardProps> = ({
  ritual,
  viewSide = 'front',
  scale = 1,
  id = 'light-print-card',
  className = '',
}) => {
  const baseConfig =
    ritual.element === 'custom'
      ? {
          id: 'custom' as const,
          name: ritual.customElementName || 'Custom',
          concept: 'Elemento Oculto',
          primaryColor: ritual.customElementColor || '#0f172a',
          secondaryColor: '#334155',
          glowColor: 'transparent',
          textColor: '#0f172a',
          borderColor: '#0f172a',
          lightPrimaryColor: '#0f172a',
          lightTextColor: '#0f172a',
          lightBorderColor: '#0f172a',
        }
      : ELEMENT_CONFIGS[ritual.element];

  const elementConfig: ElementConfig = baseConfig;
  const basePdValue =
    ritual.basePd || (ritual as unknown as { basePe?: string }).basePe || '1 PD';

  const romanNumerals: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
  };

  const ritualName = healCorruptedCharacters(ritual.name || '') || 'Nome do Ritual';
  const nameLen = ritualName.trim().length;
  let titleFontSizeClass = 'text-xl md:text-2xl';
  if (nameLen > 32) {
    titleFontSizeClass = 'text-sm md:text-base leading-tight';
  } else if (nameLen > 22) {
    titleFontSizeClass = 'text-base md:text-lg leading-tight';
  } else if (nameLen > 14) {
    titleFontSizeClass = 'text-lg md:text-xl leading-tight';
  }

  // Pure ink-saving investigation draft palette:
  // Dark navy/slate ink (#0f172a) on crisp white (#ffffff)
  const inkColor = '#0f172a';
  const blueprintAccent = '#1e3a8a';

  const baseWidth = 440;
  const baseHeight = 615;
  const isScaled = scale !== 1;

  return (
    <div
      id={id}
      className={`relative select-none font-body bg-white text-slate-900 transition-all ${className}`}
      style={{
        width: `${Math.round(baseWidth * scale)}px`,
        height: `${Math.round(baseHeight * scale)}px`,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer Stylized Draft Border with Corner Crosshairs */}
      <div
        className="w-[440px] h-[615px] p-3.5 bg-white border-2 border-slate-900 flex flex-col justify-between relative overflow-hidden box-border"
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: isScaled ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        {/* Investigation Draft Corner Accents */}
        <div className="absolute top-1.5 left-1.5 text-[11px] font-mono leading-none text-slate-600 pointer-events-none">
          ┌
        </div>
        <div className="absolute top-1.5 right-1.5 text-[11px] font-mono leading-none text-slate-600 pointer-events-none">
          ┐
        </div>
        <div className="absolute bottom-1.5 left-1.5 text-[11px] font-mono leading-none text-slate-600 pointer-events-none">
          └
        </div>
        <div className="absolute bottom-1.5 right-1.5 text-[11px] font-mono leading-none text-slate-600 pointer-events-none">
          ┘
        </div>

        {/* Inner Dashed Hairline Box */}
        <div className="w-full h-full p-3 border border-dashed border-slate-400/90 flex flex-col justify-between relative bg-white overflow-hidden">
          {/* ======================================================== */}
          {/* FACE 1: FRENTE LEVE (ECONOMIA DE TINTA / DRAFT LIMPO) */}
          {/* ======================================================== */}
          {viewSide === 'front' ? (
            <div className="flex flex-col h-full justify-between relative z-10">
              {/* TOP HEADER: LEFT-ALIGNED HIGHLIGHTED TITLE + TOP-RIGHT PD BADGE */}
              <div className="pb-2.5 border-b-2 border-slate-900">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Left-aligned Ritual Title Banner */}
                  <div className="flex-1 min-w-0">
                    {/* Category Kicker */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-slate-600 mb-0.5">
                      <span className="font-bold text-slate-900">
                        {elementConfig.name.toUpperCase()}
                      </span>
                      <span>·</span>
                      <span>{ritual.circle}º CÍRCULO (GRAU {romanNumerals[ritual.circle] || 'I'})</span>
                    </div>

                    {/* Ritual Title in Westsac Font with Highlighted Background and Unicode Fallback */}
                    <div className="bg-slate-900 text-white px-2.5 py-1 rounded-sm shadow-xs inline-block max-w-full">
                      <h2
                        className={`font-title ${titleFontSizeClass} font-bold tracking-wider uppercase line-clamp-2 break-words leading-snug`}
                        style={{
                          fontFamily: "'Westsac', 'Cinzel', 'Times New Roman', Georgia, serif",
                          letterSpacing: '0.04em',
                        }}
                        title={ritualName}
                      >
                        {ritualName}
                      </h2>
                    </div>
                  </div>

                  {/* Top-Right: PD Cost Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center border-2 border-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg shadow-xs min-w-[72px]">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 font-semibold leading-none">
                      CUSTO
                    </span>
                    <span className="font-title text-base md:text-lg font-bold text-slate-950 mt-0.5 leading-none">
                      {basePdValue}
                    </span>
                  </div>
                </div>

                {/* SIMPLIFIED & CLEAN ATTRIBUTES BAR */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-5 gap-1 text-center bg-slate-50/80 rounded-md p-1.5 border border-slate-200">
                  {/* Execução */}
                  <div className="flex flex-col items-center justify-center min-w-0 overflow-hidden">
                    <span className="flex items-center gap-1 text-[9.5px] font-mono uppercase font-semibold text-slate-500">
                      <Zap className="w-3 h-3 text-slate-700 shrink-0" />
                      Exec
                    </span>
                    <span
                      className="text-[11.5px] font-bold text-slate-900 truncate w-full mt-0.5"
                      title={healCorruptedCharacters(ritual.execution || '')}
                    >
                      {healCorruptedCharacters(ritual.execution || 'Padrão')}
                    </span>
                  </div>

                  {/* Alcance */}
                  <div className="flex flex-col items-center justify-center border-l border-slate-300 pl-1 min-w-0 overflow-hidden">
                    <span className="flex items-center gap-1 text-[9.5px] font-mono uppercase font-semibold text-slate-500">
                      <Compass className="w-3 h-3 text-slate-700 shrink-0" />
                      Alc
                    </span>
                    <span
                      className="text-[11.5px] font-bold text-slate-900 truncate w-full mt-0.5"
                      title={healCorruptedCharacters(ritual.range || '')}
                    >
                      {healCorruptedCharacters(ritual.range || 'Toque')}
                    </span>
                  </div>

                  {/* Alvo / Área */}
                  <div className="flex flex-col items-center justify-center border-l border-slate-300 pl-1 min-w-0 overflow-hidden">
                    <span className="flex items-center gap-1 text-[9.5px] font-mono uppercase font-semibold text-slate-500">
                      <Target className="w-3 h-3 text-slate-700 shrink-0" />
                      Alvo
                    </span>
                    <span
                      className="text-[11.5px] font-bold text-slate-900 truncate w-full mt-0.5"
                      title={healCorruptedCharacters(ritual.target || '')}
                    >
                      {healCorruptedCharacters(ritual.target || '1 criatura')}
                    </span>
                  </div>

                  {/* Duração */}
                  <div className="flex flex-col items-center justify-center border-l border-slate-300 pl-1 min-w-0 overflow-hidden">
                    <span className="flex items-center gap-1 text-[9.5px] font-mono uppercase font-semibold text-slate-500">
                      <Clock className="w-3 h-3 text-slate-700 shrink-0" />
                      Dur
                    </span>
                    <span
                      className="text-[11.5px] font-bold text-slate-900 truncate w-full mt-0.5"
                      title={healCorruptedCharacters(ritual.duration || '')}
                    >
                      {healCorruptedCharacters(ritual.duration || 'Instantânea')}
                    </span>
                  </div>

                  {/* Resistência */}
                  <div className="flex flex-col items-center justify-center border-l border-slate-300 pl-1 min-w-0 overflow-hidden">
                    <span className="flex items-center gap-1 text-[9.5px] font-mono uppercase font-semibold text-slate-500">
                      <ShieldAlert className="w-3 h-3 text-slate-700 shrink-0" />
                      Resist
                    </span>
                    <span
                      className="text-[11.5px] font-bold text-slate-900 truncate w-full mt-0.5"
                      title={healCorruptedCharacters(ritual.resistance || '')}
                    >
                      {healCorruptedCharacters(ritual.resistance || 'Nenhuma')}
                    </span>
                  </div>
                </div>
              </div>

              {/* MAIN BODY: SOBRE / EFEITO COM BORDAS ARREDONDADAS SUAVES */}
              <div className="flex-1 my-2 flex flex-col justify-between overflow-hidden">
                <div className="border border-slate-300 rounded-xl p-3 bg-white flex-1 flex flex-col overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider">
                      ✦ SOBRE O EFEITO DO RITUAL
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      REF: {ritual.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div
                    className="text-[13px] leading-relaxed text-slate-900 overflow-y-auto scrollbar-none pr-1"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {formatRitualText(ritual.description, inkColor)}
                  </div>
                </div>

                {/* Optional Flavor Quote */}
                {ritual.flavorText && (
                  <div className="mt-2 px-2 text-[10.5px] italic text-slate-600 font-serif leading-snug line-clamp-2">
                    &ldquo;{ritual.flavorText}&rdquo;
                  </div>
                )}
              </div>

              {/* CARD FOOTER: ELEMENT SYMBOL IN BOTTOM RIGHT CORNER (CLEAN MONOCHROME/AZULADO) */}
              <div className="pt-2 border-t-2 border-slate-900 flex items-end justify-between">
                {/* Dossier stamp & metadata */}
                <div className="flex flex-col text-[9px] font-mono text-slate-600 leading-tight">
                  <span className="font-bold text-slate-900 uppercase tracking-wider">
                    ORDEM PARANORMAL · FICHA DE CAMPO
                  </span>
                  <span>ARQUIVO INVESTIGATIVO · ELEMENTO {elementConfig.name.toUpperCase()}</span>
                  <span className="text-slate-400 mt-0.5">VERSÃO DE IMPRESSÃO LEVE (ECONOMIA DE TINTA)</span>
                </div>

                {/* Bottom Right: Element Symbol in clean monochrome/blueprint ink */}
                <div className="shrink-0 flex items-center justify-center p-1 border border-dashed border-slate-400 rounded-lg bg-slate-50">
                  <OccultSigil
                    element={ritual.element}
                    symbolPreset={ritual.symbolPreset}
                    customIconUrl={ritual.customElementIcon}
                    size={46}
                    color={blueprintAccent}
                    cardMode="light"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* FACE 2: VERSO LEVE (MODIFICAÇÕES DISCENTE E VERDADEIRO) */
            /* ======================================================== */
            <div className="flex flex-col h-full justify-between relative z-10">
              {/* TOP HEADER: MODIFICATIONS TITLE + TOP-RIGHT RITUAL SYMBOL */}
              <div className="pb-2.5 border-b-2 border-slate-900 flex items-start justify-between gap-3">
                {/* Left: Section Header & Ritual Context */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono tracking-wider uppercase text-slate-600 mb-0.5">
                    VERSO · APRIMORAMENTOS & GRAUS
                  </div>
                  <div className="bg-slate-900 text-white px-2.5 py-1 rounded-sm shadow-xs inline-block max-w-full">
                    <h2
                      className="font-title text-base md:text-lg font-bold tracking-wider uppercase truncate"
                      style={{ letterSpacing: '0.04em' }}
                    >
                      {ritualName}
                    </h2>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 font-semibold mt-1">
                    MODIFICAÇÕES DE PODER ({basePdValue} BASE)
                  </div>
                </div>

                {/* Top-Right: SÍMBOLO DO PRÓPRIO RITUAL (Substituição de selo genérico) */}
                <div
                  className="shrink-0 flex flex-col items-center justify-center border-2 border-slate-900 bg-slate-50 p-1.5 rounded-lg shadow-xs"
                  title="Símbolo do Próprio Ritual"
                >
                  <OccultSigil
                    element={ritual.element}
                    symbolPreset={ritual.symbolPreset}
                    customIconUrl={ritual.customElementIcon}
                    size={42}
                    color={inkColor}
                    cardMode="light"
                  />
                  <span className="text-[8px] font-mono uppercase text-slate-600 tracking-tighter mt-0.5">
                    RITUAL
                  </span>
                </div>
              </div>

              {/* MODIFICATIONS LIST: DISCENTE & VERDADEIRO WITH HIGHLIGHTED PD COSTS */}
              <div
                className="flex-1 my-2 flex flex-col gap-2.5 overflow-y-auto scrollbar-none"
                style={{ scrollbarWidth: 'none' }}
              >
                {ritual.modifications && ritual.modifications.length > 0 ? (
                  ritual.modifications.map((mod, idx) => (
                    <div
                      key={mod.id || idx}
                      className="border border-slate-400/90 rounded-xl p-3 bg-white flex flex-col justify-start relative shadow-2xs"
                    >
                      {/* Mod Header: Cost on Left, Name & Requirement */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          {/* Highlighted PD Cost on Left */}
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[11px] font-mono font-bold rounded shadow-xs">
                            {mod.cost}
                          </span>
                          <span className="font-title text-sm font-bold text-slate-900 tracking-wide uppercase">
                            {mod.name}
                          </span>
                        </div>

                        {mod.requirement && (
                          <span className="text-[9.5px] font-mono italic text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {mod.requirement}
                          </span>
                        )}
                      </div>

                      {/* Mod Effect Text in Optima LT Std Medium */}
                      <div className="text-[12.5px] leading-relaxed text-slate-900 font-medium">
                        {formatRitualText(mod.text, inkColor)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center text-slate-500 text-xs">
                    Nenhuma modificação cadastrada para este ritual.
                  </div>
                )}

                {/* Occult Field Notes Box (for filling with pen / campaign notes) */}
                <div className="border border-dashed border-slate-300 rounded-xl p-2.5 bg-slate-50/60 mt-auto">
                  <div className="flex items-center justify-between text-[9px] font-mono uppercase text-slate-500 mb-1">
                    <span className="flex items-center gap-1 font-bold">
                      <Feather className="w-3 h-3 text-slate-600" />
                      NOTAS DE INVESTIGAÇÃO & GASTO ADICIONAL
                    </span>
                    <span>ESPAÇO DO JOGADOR</span>
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <div className="border-b border-slate-300 border-dotted h-3 w-full" />
                    <div className="border-b border-slate-300 border-dotted h-3 w-full" />
                  </div>
                </div>
              </div>

              {/* VERSO FOOTER: OCCULT QUOTE & ARCHIVE STAMP */}
              <div className="pt-2 border-t-2 border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-600">
                <span className="italic font-serif line-clamp-1 max-w-[280px]">
                  &ldquo;{ritual.theme.backQuoteText || 'A Realidade resiste ao Outro Lado.'}&rdquo;
                </span>
                <span className="font-bold text-slate-900 uppercase">
                  PÁGINA 2 · VERSO
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
