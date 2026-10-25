import React from 'react';
import { ElementId } from '../types';

interface OccultSigilProps {
  element: ElementId;
  className?: string;
  size?: number;
  color?: string;
  glow?: boolean;
}

export const OccultSigil: React.FC<OccultSigilProps> = ({
  element,
  className = '',
  size = 48,
  color,
  glow = false,
}) => {
  const filterId = `sigil-glow-${element}-${Math.random().toString(36).substr(2, 6)}`;

  // Default color based on element
  const defaultColors: Record<ElementId, string> = {
    sangue: '#e11d48',
    morte: '#e2e8f0',
    energia: '#c084fc',
    conhecimento: '#fbbf24',
    medo: '#38bdf8',
    custom: '#10b981',
  };

  const activeColor = color || defaultColors[element] || '#ffffff';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-all ${className}`}
      style={{
        filter: glow ? `drop-shadow(0 0 6px ${activeColor}88)` : undefined,
      }}
    >
      <defs>
        {glow && (
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Render Element-Specific Sigils */}
      {element === 'sangue' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer ritual ring with spikes */}
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          
          {/* Sangue core: Organic thorned heart & tendril spikes */}
          <path
            d="M50 20 C35 15 20 30 20 48 C20 68 45 84 50 86 C55 84 80 68 80 48 C80 30 65 15 50 20 Z"
            fill={activeColor}
            fillOpacity="0.15"
            strokeWidth="2.5"
          />
          {/* Internal organic piercing spears */}
          <path d="M50 12 L50 78" strokeWidth="2.5" />
          <path d="M50 32 L30 52 L50 62 L70 52 Z" fill={activeColor} fillOpacity="0.25" strokeWidth="2" />
          <path d="M26 36 L38 48" strokeWidth="2" />
          <path d="M74 36 L62 48" strokeWidth="2" />
          {/* Blood droplets / thorn accents */}
          <circle cx="50" cy="85" r="2.5" fill={activeColor} />
          <circle cx="32" cy="65" r="2" fill={activeColor} />
          <circle cx="68" cy="65" r="2" fill={activeColor} />
        </g>
      )}

      {element === 'morte' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer ring */}
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          
          {/* Entropic spiral of death and time */}
          <path
            d="M 50,50 
               A 6,6 0 0,1 44,44 
               A 12,12 0 0,1 56,38 
               A 18,18 0 0,1 68,56 
               A 24,24 0 0,1 44,74 
               A 30,30 0 0,1 20,44 
               A 36,36 0 0,1 56,14"
            fill="none"
            strokeWidth="2.8"
          />
          {/* Subtle hourglass / distortion axis */}
          <line x1="26" y1="26" x2="74" y2="74" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
          <line x1="74" y1="26" x2="26" y2="74" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
          <circle cx="50" cy="50" r="3.5" fill={activeColor} />
          <circle cx="56" cy="14" r="2.5" fill={activeColor} />
          <circle cx="20" cy="44" r="2.5" fill={activeColor} />
        </g>
      )}

      {element === 'energia' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer chaotic hex/ring */}
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="36" strokeWidth="2" strokeDasharray="12 4" />

          {/* Jagged chaotic lightning fractures */}
          <polygon
            points="50,14 62,34 52,38 72,56 54,58 64,86 38,52 48,48 28,34 44,32"
            fill={activeColor}
            fillOpacity="0.2"
            strokeWidth="2.5"
          />
          {/* Chaotic crossing vectors */}
          <line x1="16" y1="50" x2="84" y2="50" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          <line x1="32" y1="20" x2="68" y2="80" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="50" cy="14" r="2.5" fill={activeColor} />
          <circle cx="64" cy="86" r="2.5" fill={activeColor} />
          <circle cx="28" cy="34" r="2.5" fill={activeColor} />
        </g>
      )}

      {element === 'conhecimento' && (
        <g stroke={activeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Concentric order circles */}
          <circle cx="50" cy="50" r="43" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" strokeWidth="1.8" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="28" strokeWidth="1.5" opacity="0.7" />

          {/* The All-Seeing Eye of Knowledge */}
          <path
            d="M 18,50 Q 50,22 82,50 Q 50,78 18,50 Z"
            fill={activeColor}
            fillOpacity="0.15"
            strokeWidth="2.5"
          />
          {/* Central Iris & Sigil pupil */}
          <circle cx="50" cy="50" r="12" strokeWidth="2" fill={activeColor} fillOpacity="0.2" />
          <circle cx="50" cy="50" r="5" fill={activeColor} />
          {/* Geometric cardinal axis & runes */}
          <line x1="50" y1="12" x2="50" y2="88" strokeWidth="1.5" opacity="0.8" />
          <line x1="12" y1="50" x2="88" y2="50" strokeWidth="1.5" opacity="0.8" />
          <circle cx="50" cy="18" r="2" fill={activeColor} />
          <circle cx="50" cy="82" r="2" fill={activeColor} />
          <circle cx="18" cy="50" r="2" fill={activeColor} />
          <circle cx="82" cy="50" r="2" fill={activeColor} />
        </g>
      )}

      {element === 'medo' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Broken outer rim */}
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="14 8" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />

          {/* Abyssal Rift / Shattered cosmic eye */}
          <path
            d="M50 14 C30 25 15 45 22 70 C28 85 45 88 50 86 C55 88 72 85 78 70 C85 45 70 25 50 14 Z"
            fill={activeColor}
            fillOpacity="0.12"
            strokeWidth="2.5"
          />
          {/* Shattered fissure lightning */}
          <path
            d="M50 18 L46 38 L55 52 L44 68 L50 82"
            strokeWidth="2.5"
          />
          <path d="M46 38 L34 46" strokeWidth="1.8" />
          <path d="M55 52 L68 48" strokeWidth="1.8" />
          <circle cx="50" cy="50" r="3" fill={activeColor} />
          <circle cx="50" cy="18" r="2.5" fill={activeColor} />
          <circle cx="50" cy="82" r="2.5" fill={activeColor} />
        </g>
      )}

      {element === 'custom' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="5 3" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          {/* Custom Mystic Glyph: Octagram */}
          <polygon
            points="50,16 61,35 84,35 66,49 72,71 50,58 28,71 34,49 16,35 39,35"
            fill={activeColor}
            fillOpacity="0.2"
            strokeWidth="2.2"
          />
          <circle cx="50" cy="50" r="7" strokeWidth="2" />
          <circle cx="50" cy="50" r="3" fill={activeColor} />
        </g>
      )}
    </svg>
  );
};

// Grand Paranormal Seal (Used for Card Back and decorative watermarks)
export const GrandOccultSeal: React.FC<{
  size?: number;
  className?: string;
  color?: string;
  element?: ElementId;
}> = ({ size = 220, className = '', color = '#e2e8f0', element }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* Outer concentric ritual borders */}
        <circle cx="100" cy="100" r="95" strokeWidth="2" opacity="0.8" />
        <circle cx="100" cy="100" r="91" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="100" cy="100" r="85" strokeWidth="1.5" opacity="0.7" />
        <circle cx="100" cy="100" r="81" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />

        {/* 16 Runic tick marks along the circumference */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 85 * Math.cos(rad);
          const y1 = 100 + 85 * Math.sin(rad);
          const x2 = 100 + 95 * Math.cos(rad);
          const y2 = 100 + 95 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth="1.2"
              opacity="0.65"
            />
          );
        })}

        {/* Pentagonal interlocking stars symbolizing the 5 elements */}
        <polygon
          points="100,24 172,76 144,162 56,162 28,76"
          strokeWidth="1.5"
          fill="none"
          opacity="0.55"
        />
        <polygon
          points="100,176 28,124 56,38 144,38 172,124"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />

        {/* Intersecting central circle */}
        <circle cx="100" cy="100" r="54" strokeWidth="1.8" opacity="0.75" />
        <circle cx="100" cy="100" r="48" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <circle cx="100" cy="100" r="28" strokeWidth="1.5" opacity="0.85" />

        {/* Diagonal axis rays */}
        <line x1="20" y1="20" x2="180" y2="180" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <line x1="180" y1="20" x2="20" y2="180" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <line x1="100" y1="10" x2="100" y2="190" strokeWidth="1.2" opacity="0.5" />
        <line x1="10" y1="100" x2="190" y2="100" strokeWidth="1.2" opacity="0.5" />

        {/* 5 Outer Element Nodes */}
        <circle cx="100" cy="24" r="5" strokeWidth="1.5" fill="#000000" />
        <circle cx="172" cy="76" r="5" strokeWidth="1.5" fill="#000000" />
        <circle cx="144" cy="162" r="5" strokeWidth="1.5" fill="#000000" />
        <circle cx="56" cy="162" r="5" strokeWidth="1.5" fill="#000000" />
        <circle cx="28" cy="76" r="5" strokeWidth="1.5" fill="#000000" />

        {/* Center node with subtle glow core */}
        <circle cx="100" cy="100" r="10" strokeWidth="1.8" fill="#000000" />
        <circle cx="100" cy="100" r="4" fill={color} />
      </g>
    </svg>
  );
};
