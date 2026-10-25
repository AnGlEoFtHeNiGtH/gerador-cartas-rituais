import React from 'react';

/**
 * Formats rich text in ritual descriptions:
 * - **bold**
 * - *italic*
 * - Dice formulas like 1d6, 3d8+5, 15d8
 * - Specific RPG terms like DT, PD, PV, RD (exclusivamente PD)
 */
export function formatRitualText(text: string, accentColor?: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-justify font-polymath">
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
