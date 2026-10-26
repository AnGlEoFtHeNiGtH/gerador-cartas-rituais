import React from 'react';

/**
 * Heals known character corruption patterns caused by legacy non-Unicode 8-bit fonts
 * (e.g. Cyrillic/Greek substitutions like "Vocк" -> "Você", "caυtica" -> "caótica", "padrro" -> "padrão").
 */
export function healCorruptedCharacters(text: string): string {
  if (!text) return '';

  return text
    // Replace Cyrillic 'к' (0xEA in win1251) where 'ê' was intended
    .replace(/\bVocк\b/g, 'Você')
    .replace(/\bvocк\b/g, 'você')
    .replace(/resistкncia/gi, (m) => m[0] === 'R' ? 'Resistência' : 'resistência')
    .replace(/permanкncia/gi, (m) => m[0] === 'P' ? 'Permanência' : 'permanência')
    .replace(/apкndice/gi, 'apêndice')
    .replace(/experiкncia/gi, 'experiência')
    .replace(/violкncia/gi, 'violência')
    .replace(/essкncia/gi, 'essência')
    .replace(/consequкncia/gi, 'consequência')
    .replace(/iminкncia/gi, 'iminência')
    .replace(/\balкm\b/gi, (m) => m[0] === 'A' ? 'Além' : 'além')
    .replace(/\btambкm\b/gi, (m) => m[0] === 'T' ? 'Também' : 'também')
    .replace(/\bninguкm\b/gi, (m) => m[0] === 'N' ? 'Ninguém' : 'ninguém')
    .replace(/\btrкs\b/gi, (m) => m[0] === 'T' ? 'Três' : 'três')

    // Replace Greek 'υ' / Cyrillic 'у' (0xF3) where 'ó' was intended
    .replace(/ca[υу]tica/gi, (m) => m[0] === 'C' ? 'Caótica' : 'caótica')
    .replace(/ca[υу]tico/gi, (m) => m[0] === 'C' ? 'Caótico' : 'caótico')
    .replace(/\bap[υу]s\b/gi, (m) => m[0] === 'A' ? 'Após' : 'após')
    .replace(/\bs[υу]\b/g, 'só')
    .replace(/\bS[υу]\b/g, 'Só')
    .replace(/\bn[υу]s\b/gi, (m) => m[0] === 'N' ? 'Nós' : 'nós')
    .replace(/\bv[υу]s\b/gi, (m) => m[0] === 'V' ? 'Vós' : 'vós')
    .replace(/pr[υу]prio/gi, (m) => m[0] === 'P' ? 'Próprio' : 'próprio')
    .replace(/pr[υу]pria/gi, (m) => m[0] === 'P' ? 'Própria' : 'própria')
    .replace(/m[υу]vel/gi, (m) => m[0] === 'M' ? 'Móvel' : 'móvel')
    .replace(/pr[υу]ximo/gi, (m) => m[0] === 'P' ? 'Próximo' : 'próximo')
    .replace(/pr[υу]xima/gi, (m) => m[0] === 'P' ? 'Próxima' : 'próxima')

    // Replace 'ro' (0xE3) endings where 'ão' was intended
    .replace(/\bpadrro\b/gi, (m) => m[0] === 'P' ? 'Padrão' : 'padrão')
    .replace(/açro\b/gi, (m) => m[0] === 'A' ? 'Ação' : 'ação')
    .replace(/açres\b/gi, (m) => m[0] === 'A' ? 'Ações' : 'ações')
    .replace(/reaçro\b/gi, (m) => m[0] === 'R' ? 'Reação' : 'reação')
    .replace(/reaçres\b/gi, (m) => m[0] === 'R' ? 'Reações' : 'reações')
    .replace(/condiçro\b/gi, (m) => m[0] === 'C' ? 'Condição' : 'condição')
    .replace(/condiçres\b/gi, (m) => m[0] === 'C' ? 'Condições' : 'condições')
    .replace(/duraçro\b/gi, (m) => m[0] === 'D' ? 'Duração' : 'duração')
    .replace(/execuçro\b/gi, (m) => m[0] === 'E' ? 'Execução' : 'execução')
    .replace(/maldiçro\b/gi, (m) => m[0] === 'M' ? 'Maldição' : 'maldição')
    .replace(/ilusro\b/gi, (m) => m[0] === 'I' ? 'Ilusão' : 'ilusão')
    .replace(/visro\b/gi, (m) => m[0] === 'V' ? 'Visão' : 'visão')
    .replace(/invocaçro\b/gi, (m) => m[0] === 'I' ? 'Invocação' : 'invocação')
    .replace(/evocaçro\b/gi, (m) => m[0] === 'E' ? 'Evocação' : 'evocação')
    .replace(/transmutaçro\b/gi, (m) => m[0] === 'T' ? 'Transmutação' : 'transmutação')
    .replace(/regeneraçro\b/gi, (m) => m[0] === 'R' ? 'Regeneração' : 'regeneração')
    .replace(/sustentaçro\b/gi, (m) => m[0] === 'S' ? 'Sustentação' : 'sustentação')
    .replace(/detonaçro\b/gi, (m) => m[0] === 'D' ? 'Detonação' : 'detonação')
    .replace(/deflagraçro\b/gi, (m) => m[0] === 'D' ? 'Deflagração' : 'deflagração')
    .replace(/concentraçro\b/gi, (m) => m[0] === 'C' ? 'Concentração' : 'concentração')
    .replace(/conjuraçro\b/gi, (m) => m[0] === 'C' ? 'Conjuração' : 'conjuração')
    .replace(/percepçro\b/gi, (m) => m[0] === 'P' ? 'Percepção' : 'percepção')
    .replace(/investigaçro\b/gi, (m) => m[0] === 'I' ? 'Investigação' : 'investigação')
    .replace(/\bnro\b/gi, (m) => m[0] === 'N' ? 'Não' : 'não')
    .replace(/\bsro\b/gi, (m) => m[0] === 'S' ? 'São' : 'são')
    .replace(/\bestro\b/gi, (m) => m[0] === 'E' ? 'Estão' : 'estão')
    .replace(/\bserro\b/gi, (m) => m[0] === 'S' ? 'Serão' : 'serão')
    .replace(/\bentro\b/gi, (m) => m[0] === 'E' ? 'Então' : 'então')
    .replace(/\bchro\b/gi, (m) => m[0] === 'C' ? 'Chão' : 'chão')
    .replace(/\bmro\b/gi, (m) => m[0] === 'M' ? 'Mão' : 'mão')
    .replace(/\bmros\b/gi, (m) => m[0] === 'M' ? 'Mãos' : 'mãos')

    // Generic fallback for any remaining stray Cyrillic 'к' or Greek 'υ' inside Latin words
    .replace(/([a-zA-ZáàãâéèíóôõúçÁÀÃÂÉÈÍÓÔÕÚÇ])к/g, '$1ê')
    .replace(/к([a-zA-ZáàãâéèíóôõúçÁÀÃÂÉÈÍÓÔÕÚÇ])/g, 'ê$1')
    .replace(/([a-zA-ZáàãâéèíóôõúçÁÀÃÂÉÈÍÓÔÕÚÇ])[υу]/g, '$1ó')
    .replace(/[υу]([a-zA-ZáàãâéèíóôõúçÁÀÃÂÉÈÍÓÔÕÚÇ])/g, 'ó$1');
}

/**
 * Sanitizes text specifically for custom display fonts (such as Westsac / Optima)
 * that have an incomplete or corrupted internal cmap table for Latin Extended glyphs.
 * Automatically replaces accented characters and cedillas with safe clean ASCII equivalents,
 * preventing corrupted symbols (like "Vocк", "caυtica", "padrro") from ever appearing in custom fonts.
 */
export function sanitizeTextForCustomFont(text: string): string {
  if (!text) return '';
  const healed = healCorruptedCharacters(text);
  return healed
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/[áàãâä]/g, 'a')
    .replace(/[ÁÀÃÂÄ]/g, 'A')
    .replace(/[éèêë]/g, 'e')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[íìîï]/g, 'i')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[óòõôö]/g, 'o')
    .replace(/[ÓÒÕÔÖ]/g, 'O')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ÚÙÛÜ]/g, 'U');
}

/**
 * Formats rich text in ritual descriptions:
 * - **bold**
 * - *italic*
 * - Dice formulas like 1d6, 3d8+5, 15d8
 * - Specific RPG terms like DT, PD, PV, RD (exclusivamente PD)
 */
export function formatRitualText(text: string, accentColor?: string): React.ReactNode {
  if (!text) return null;

  const cleanText = healCorruptedCharacters(text);
  const lines = cleanText.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-justify font-body">
      {lines.map((line, lineIndex) => {
        if (!line.trim()) return <div key={lineIndex} className="h-1" />;

        const tokens: React.ReactNode[] = [];
        let remaining = line;
        let tokenKey = 0;

        // Regular expression for bold, italic, dice notation and RPG tokens strictly using PD
        const regex =
          /(\*\*([^*]+)\*\*|\*([^*]+)\*|(\b\d+d\d+(?:\s*[+-]\s*\d+)?\b)|(\b(?:DT|PD|PV|RD|Defesa|Sanidade)\b))/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(remaining)) !== null) {
          if (match.index > lastIndex) {
            tokens.push(remaining.substring(lastIndex, match.index));
          }

          if (match[2]) {
            tokens.push(
              <strong key={tokenKey++} className="font-extrabold tracking-wide text-current">
                {match[2]}
              </strong>
            );
          } else if (match[3]) {
            tokens.push(
              <em key={tokenKey++} className="italic opacity-90">
                {match[3]}
              </em>
            );
          } else if (match[4]) {
            tokens.push(
              <span
                key={tokenKey++}
                className="font-mono-code font-bold px-1 py-0.2 rounded text-[0.92em] bg-black/10 dark:bg-white/10 border border-current/25 inline-block shadow-xs"
                style={{
                  color: accentColor,
                }}
              >
                {match[4]}
              </span>
            );
          } else if (match[5]) {
            tokens.push(
              <span
                key={tokenKey++}
                className="font-bold tracking-wider text-[0.95em] text-current underline decoration-current/30 underline-offset-2"
              >
                {match[5]}
              </span>
            );
          }

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < remaining.length) {
          tokens.push(remaining.substring(lastIndex));
        }

        return (
          <p key={lineIndex} className="text-current leading-relaxed">
            {tokens}
          </p>
        );
      })}
    </div>
  );
}
