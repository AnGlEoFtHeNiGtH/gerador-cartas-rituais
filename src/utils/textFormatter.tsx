import React from 'react';

/**
 * Formats rich text in ritual descriptions:
 * - **bold**
 * - *italic*
 * - Dice formulas like 1d6, 3d8+5, 15d8
 * - Specific RPG terms like DT, PD, PE, PV, RD
 */
export function formatRitualText(text: string, accentColor?: string): React.ReactNode {
  if (!text) return null;

  // Split lines first
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-justify">
      {lines.map((line, lineIndex) => {
        if (!line.trim()) return <div key={lineIndex} className="h-1" />;

        // Tokenize formatting: **bold**, *italic*, dice formulas [xdy+z], RPG tokens (DT, PD, PV, etc.)
        const tokens: React.ReactNode[] = [];
        let remaining = line;
        let tokenKey = 0;

        // Regular expression for bold, italic, dice notation and RPG tokens including PD
        const regex =
          /(\*\*([^*]+)\*\*|\*([^*]+)\*|(\b\d+d\d+(?:\s*[+-]\s*\d+)?\b)|(\b(?:DT|PD|PE|PV|RD|Defesa|Sanidade)\b))/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(remaining)) !== null) {
          // Push text before match
          if (match.index > lastIndex) {
            tokens.push(remaining.substring(lastIndex, match.index));
          }

          if (match[2]) {
            // **bold**
            tokens.push(
              <strong key={tokenKey++} className="font-bold text-white tracking-wide">
                {match[2]}
              </strong>
            );
          } else if (match[3]) {
            // *italic*
            tokens.push(
              <em key={tokenKey++} className="italic text-zinc-300">
                {match[3]}
              </em>
            );
          } else if (match[4]) {
            // Dice formula (e.g. 2d6, 3d8+3)
            tokens.push(
              <span
                key={tokenKey++}
                className="font-mono-code font-bold px-1 py-0.2 rounded text-[0.92em] bg-white/10 text-white border border-white/20 inline-block shadow-xs"
                style={{
                  color: accentColor || '#f8fafc',
                  borderColor: accentColor ? `${accentColor}55` : 'rgba(255,255,255,0.2)',
                }}
              >
                {match[4]}
              </span>
            );
          } else if (match[5]) {
            // RPG Stat token (DT, PD, PE, PV, etc.)
            tokens.push(
              <span
                key={tokenKey++}
                className="font-semibold text-zinc-100 tracking-wider text-[0.95em]"
              >
                {match[5]}
              </span>
            );
          }

          lastIndex = match.index + match[0].length;
        }

        // Push trailing text
        if (lastIndex < remaining.length) {
          tokens.push(remaining.substring(lastIndex));
        }

        return (
          <p key={lineIndex} className="text-zinc-200">
            {tokens}
          </p>
        );
      })}
    </div>
  );
}
