import React from 'react';
import { ElementId, SigilSymbolPreset, CustomIconFilter, CardMode } from '../types';

export interface SigilPresetInfo {
  id: SigilSymbolPreset;
  name: string;
  category: string;
}

export const SIGIL_PRESETS: SigilPresetInfo[] = [
  { id: 'default', name: 'Sigilo Primordial', category: 'Padrão' },
  { id: 'skull', name: 'Crânio Cadavérico', category: 'Morte' },
  { id: 'eye', name: 'Olho da Verdade', category: 'Conhecimento' },
  { id: 'spiral', name: 'Espiral do Tempo', category: 'Morte' },
  { id: 'biohazard', name: 'Vísceras & Espinhos', category: 'Sangue' },
  { id: 'flame', name: 'Chama Oculta', category: 'Energia' },
  { id: 'lightning', name: 'Fenda de Choque', category: 'Energia' },
  { id: 'pentagram', name: 'Estrela Rúnica', category: 'Ocultismo' },
  { id: 'hourglass', name: 'Ampulheta', category: 'Morte' },
  { id: 'rift', name: 'Abismo / Ruptura', category: 'Medo' },
  { id: 'dagger', name: 'Adaga de Sangue', category: 'Sangue' },
  { id: 'moon', name: 'Eclipse Sombrio', category: 'Medo' },
  { id: 'ouroboros', name: 'Serpente Ouroboros', category: 'Eternidade' },
];

interface OccultSigilProps {
  element: ElementId;
  symbolPreset?: SigilSymbolPreset;
  customIconUrl?: string;
  customIconFilter?: CustomIconFilter;
  customIconInvert?: boolean;
  cardMode?: CardMode;
  className?: string;
  size?: number;
  color?: string;
  glow?: boolean;
}

export const OccultSigil: React.FC<OccultSigilProps> = ({
  element,
  symbolPreset = 'default',
  customIconUrl,
  customIconFilter = 'auto',
  customIconInvert = false,
  cardMode = 'dark',
  className = '',
  size = 48,
  color,
  glow = false,
}) => {
  const filterId = `sigil-glow-${element}-${Math.random().toString(36).substr(2, 6)}`;

  // Default color based on element and mode
  const defaultDarkColors: Record<ElementId, string> = {
    sangue: '#e11d48',
    morte: '#e2e8f0',
    energia: '#c084fc',
    conhecimento: '#fbbf24',
    medo: '#38bdf8',
    custom: '#10b981',
  };

  const defaultLightColors: Record<ElementId, string> = {
    sangue: '#be123c',
    morte: '#1e293b',
    energia: '#7e22ce',
    conhecimento: '#b45309',
    medo: '#0369a1',
    custom: '#047857',
  };

  const activeColor =
    color ||
    (cardMode === 'light' ? defaultLightColors[element] : defaultDarkColors[element]) ||
    (cardMode === 'light' ? '#000000' : '#ffffff');

  // Handle Universal Custom Image Icon Upload
  if (customIconUrl) {
    // Generate CSS filters and blend modes based on filter selection & light/dark card mode
    let filterStyle = '';
    let blendModeStyle: React.CSSProperties['mixBlendMode'] = 'normal';

    if (customIconInvert) {
      filterStyle += ' invert(1)';
    }

    switch (customIconFilter) {
      case 'silhouette':
        // Mask with element color silhouette
        filterStyle += ' brightness(0) saturate(100%)';
        break;
      case 'monochrome':
        filterStyle += ' grayscale(100%) contrast(120%)';
        break;
      case 'invert':
        filterStyle += ' invert(100%)';
        break;
      case 'auto':
      default:
        // Automatically harmonize white/black backgrounds
        if (cardMode === 'light') {
          // On light mode cards, multiply blending cleanly drops white backgrounds!
          blendModeStyle = 'multiply';
          filterStyle += ' contrast(115%)';
        } else {
          // On dark mode cards, if the image has a white background, invert or screen it
          blendModeStyle = 'screen';
          filterStyle += ' contrast(110%)';
        }
        break;
      case 'original':
        // No extra filtering
        break;
    }

    return (
      <div
        className={`relative shrink-0 flex items-center justify-center overflow-hidden rounded-full ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          filter: glow ? `drop-shadow(0 0 6px ${activeColor}88)` : undefined,
        }}
      >
        <img
          src={customIconUrl}
          alt="Símbolo Personalizado"
          className="w-full h-full object-contain p-0.5"
          style={{
            filter: filterStyle.trim() || undefined,
            mixBlendMode: blendModeStyle,
          }}
        />
      </div>
    );
  }

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

      {/* ======================================================== */}
      {/* 1. ALTERNATIVE PRESET SYMBOLS (WHEN NOT 'DEFAULT') */}
      {/* ======================================================== */}
      {symbolPreset === 'skull' && (
        <g stroke={activeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          {/* Cranium */}
          <path
            d="M32 50 C28 35 38 22 50 22 C62 22 72 35 68 50 C68 58 63 64 61 68 L39 68 C37 64 32 58 32 50 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.25 : 0.18}
          />
          <circle cx="43" cy="45" r="4.5" fill={activeColor} />
          <circle cx="57" cy="45" r="4.5" fill={activeColor} />
          <polygon points="50,53 47,60 53,60" fill={activeColor} />
          <path d="M42 68 L42 76 L58 76 L58 68" strokeWidth="2.2" />
          <line x1="47" y1="68" x2="47" y2="76" strokeWidth="1.8" />
          <line x1="53" y1="68" x2="53" y2="76" strokeWidth="1.8" />
        </g>
      )}

      {symbolPreset === 'eye' && (
        <g stroke={activeColor} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.7" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" strokeDasharray="6 3" />
          <path
            d="M 18,50 Q 50,22 82,50 Q 50,78 18,50 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.25 : 0.18}
          />
          <circle cx="50" cy="50" r="12" strokeWidth="2" fill={activeColor} fillOpacity={0.25} />
          <circle cx="50" cy="50" r="5" fill={activeColor} />
          <line x1="50" y1="12" x2="50" y2="22" strokeWidth="2" />
          <line x1="50" y1="78" x2="50" y2="88" strokeWidth="2" />
          <line x1="12" y1="50" x2="22" y2="50" strokeWidth="2" />
          <line x1="78" y1="50" x2="88" y2="50" strokeWidth="2" />
        </g>
      )}

      {symbolPreset === 'spiral' && (
        <g stroke={activeColor} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <path
            d="M 50,50 
               A 6,6 0 0,1 44,44 
               A 12,12 0 0,1 56,38 
               A 18,18 0 0,1 68,56 
               A 24,24 0 0,1 44,74 
               A 30,30 0 0,1 20,44 
               A 36,36 0 0,1 56,14"
            fill="none"
          />
          <circle cx="50" cy="50" r="3" fill={activeColor} />
          <circle cx="56" cy="14" r="2.5" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'biohazard' && (
        <g stroke={activeColor} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <path
            d="M50 22 C36 16 22 30 22 47 C22 66 45 82 50 84 C55 82 78 66 78 47 C78 30 64 16 50 22 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.28 : 0.2}
          />
          <path d="M50 14 L50 82" strokeWidth="2.4" />
          <path d="M30 40 L70 60" strokeWidth="2" />
          <path d="M70 40 L30 60" strokeWidth="2" />
          <circle cx="50" cy="84" r="2.5" fill={activeColor} />
          <circle cx="30" cy="40" r="2" fill={activeColor} />
          <circle cx="70" cy="40" r="2" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'flame' && (
        <g stroke={activeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" strokeDasharray="8 3" />
          <path
            d="M50 16 C50 16 30 40 30 56 C30 68 39 78 50 78 C61 78 70 68 70 56 C70 42 56 34 56 34 C56 34 62 46 56 52 C50 58 42 52 42 46 C42 36 50 16 50 16 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.28 : 0.22}
          />
          <circle cx="50" cy="62" r="3" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'lightning' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="36" strokeWidth="2" strokeDasharray="10 4" />
          <polygon
            points="50,14 62,36 50,40 70,58 52,60 62,86 38,54 48,50 30,36 46,34"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.28 : 0.22}
          />
          <circle cx="50" cy="14" r="2.5" fill={activeColor} />
          <circle cx="62" cy="86" r="2.5" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'pentagram' && (
        <g stroke={activeColor} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.7" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <polygon
            points="50,17 60,38 83,38 64,52 71,74 50,60 29,74 36,52 17,38 40,38"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.25 : 0.18}
          />
          <circle cx="50" cy="50" r="8" strokeWidth="1.5" opacity="0.8" />
          <circle cx="50" cy="50" r="3" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'hourglass' && (
        <g stroke={activeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <line x1="30" y1="24" x2="70" y2="24" strokeWidth="3" />
          <line x1="30" y1="76" x2="70" y2="76" strokeWidth="3" />
          <path
            d="M34 26 L66 26 L52 48 L66 74 L34 74 L48 48 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.25 : 0.18}
          />
          <circle cx="50" cy="50" r="2" fill={activeColor} />
          <circle cx="50" cy="66" r="3" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'rift' && (
        <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="14 8" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <path
            d="M50 14 C30 25 15 45 22 70 C28 85 45 88 50 86 C55 88 72 85 78 70 C85 45 70 25 50 14 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.24 : 0.16}
          />
          <path d="M50 18 L46 38 L55 52 L44 68 L50 82" strokeWidth="2.6" />
          <circle cx="50" cy="50" r="3" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'dagger' && (
        <g stroke={activeColor} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <path
            d="M50 16 L56 46 L64 48 L64 54 L54 54 L54 74 L50 82 L46 74 L46 54 L36 54 L36 48 L44 46 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.28 : 0.22}
          />
          <line x1="50" y1="16" x2="50" y2="54" strokeWidth="1.8" />
          <circle cx="50" cy="82" r="2" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'moon' && (
        <g stroke={activeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.7" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" />
          <path
            d="M50 20 C66 20 80 34 80 50 C80 66 66 80 50 80 C40 80 32 75 26 67 C36 71 48 68 56 60 C64 52 66 40 60 28 C57 23 54 21 50 20 Z"
            fill={activeColor}
            fillOpacity={cardMode === 'light' ? 0.3 : 0.25}
          />
          <circle cx="40" cy="46" r="3" fill={activeColor} />
        </g>
      )}

      {symbolPreset === 'ouroboros' && (
        <g stroke={activeColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.6" />
          <circle cx="50" cy="50" r="37" strokeWidth="2" strokeDasharray="12 4" />
          <circle cx="50" cy="50" r="26" strokeWidth="3" />
          <circle cx="50" cy="50" r="16" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <polygon points="50,20 56,26 48,28" fill={activeColor} />
          <circle cx="50" cy="50" r="4" fill={activeColor} />
        </g>
      )}

      {/* ======================================================== */}
      {/* 2. CANONICAL ELEMENT SIGILS (DEFAULT PRESET) */}
      {/* ======================================================== */}
      {symbolPreset === 'default' && (
        <>
          {element === 'sangue' && (
            <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="50" cy="50" r="37" strokeWidth="2" />
              <path
                d="M50 20 C35 15 20 30 20 48 C20 68 45 84 50 86 C55 84 80 68 80 48 C80 30 65 15 50 20 Z"
                fill={activeColor}
                fillOpacity={cardMode === 'light' ? 0.22 : 0.15}
                strokeWidth="2.5"
              />
              <path d="M50 12 L50 78" strokeWidth="2.5" />
              <path d="M50 32 L30 52 L50 62 L70 52 Z" fill={activeColor} fillOpacity={0.25} strokeWidth="2" />
              <path d="M26 36 L38 48" strokeWidth="2" />
              <path d="M74 36 L62 48" strokeWidth="2" />
              <circle cx="50" cy="85" r="2.5" fill={activeColor} />
              <circle cx="32" cy="65" r="2" fill={activeColor} />
              <circle cx="68" cy="65" r="2" fill={activeColor} />
            </g>
          )}

          {element === 'morte' && (
            <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
              <circle cx="50" cy="50" r="37" strokeWidth="2" />
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
              <line x1="26" y1="26" x2="74" y2="74" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
              <line x1="74" y1="26" x2="26" y2="74" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
              <circle cx="50" cy="50" r="3.5" fill={activeColor} />
              <circle cx="56" cy="14" r="2.5" fill={activeColor} />
              <circle cx="20" cy="44" r="2.5" fill={activeColor} />
            </g>
          )}

          {element === 'energia' && (
            <g stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.5" />
              <circle cx="50" cy="50" r="36" strokeWidth="2" strokeDasharray="12 4" />
              <polygon
                points="50,14 62,34 52,38 72,56 54,58 64,86 38,52 48,48 28,34 44,32"
                fill={activeColor}
                fillOpacity={cardMode === 'light' ? 0.26 : 0.2}
                strokeWidth="2.5"
              />
              <line x1="16" y1="50" x2="84" y2="50" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <line x1="32" y1="20" x2="68" y2="80" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
              <circle cx="50" cy="14" r="2.5" fill={activeColor} />
              <circle cx="64" cy="86" r="2.5" fill={activeColor} />
              <circle cx="28" cy="34" r="2.5" fill={activeColor} />
            </g>
          )}

          {element === 'conhecimento' && (
            <g stroke={activeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="50" cy="50" r="43" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="38" strokeWidth="1.8" strokeDasharray="6 3" />
              <circle cx="50" cy="50" r="28" strokeWidth="1.5" opacity="0.7" />
              <path
                d="M 18,50 Q 50,22 82,50 Q 50,78 18,50 Z"
                fill={activeColor}
                fillOpacity={cardMode === 'light' ? 0.22 : 0.15}
                strokeWidth="2.5"
              />
              <circle cx="50" cy="50" r="12" strokeWidth="2" fill={activeColor} fillOpacity={0.2} />
              <circle cx="50" cy="50" r="5" fill={activeColor} />
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
              <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="14 8" opacity="0.6" />
              <circle cx="50" cy="50" r="37" strokeWidth="2" />
              <path
                d="M50 14 C30 25 15 45 22 70 C28 85 45 88 50 86 C55 88 72 85 78 70 C85 45 70 25 50 14 Z"
                fill={activeColor}
                fillOpacity={cardMode === 'light' ? 0.22 : 0.12}
                strokeWidth="2.5"
              />
              <path d="M50 18 L46 38 L55 52 L44 68 L50 82" strokeWidth="2.5" />
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
              <polygon
                points="50,16 61,35 84,35 66,49 72,71 50,58 28,71 34,49 16,35 39,35"
                fill={activeColor}
                fillOpacity={0.2}
                strokeWidth="2.2"
              />
              <circle cx="50" cy="50" r="7" strokeWidth="2" />
              <circle cx="50" cy="50" r="3" fill={activeColor} />
            </g>
          )}
        </>
      )}
    </svg>
  );
};

// Grand Paranormal Seal (Used for Card Back and decorative watermarks)
export const GrandOccultSeal: React.FC<{
  size?: number;
  className?: string;
  color?: string;
  cardMode?: CardMode;
}> = ({ size = 220, className = '', color = '#e2e8f0', cardMode = 'dark' }) => {
  const strokeColor = color || (cardMode === 'light' ? '#18181b' : '#e2e8f0');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="100" cy="100" r="95" strokeWidth="2" opacity="0.8" />
        <circle cx="100" cy="100" r="91" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="100" cy="100" r="85" strokeWidth="1.5" opacity="0.7" />
        <circle cx="100" cy="100" r="81" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />

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

        <circle cx="100" cy="100" r="54" strokeWidth="1.8" opacity="0.75" />
        <circle cx="100" cy="100" r="48" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <circle cx="100" cy="100" r="28" strokeWidth="1.5" opacity="0.85" />

        <line x1="20" y1="20" x2="180" y2="180" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <line x1="180" y1="20" x2="20" y2="180" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <line x1="100" y1="10" x2="100" y2="190" strokeWidth="1.2" opacity="0.5" />
        <line x1="10" y1="100" x2="190" y2="100" strokeWidth="1.2" opacity="0.5" />

        <circle
          cx="100"
          cy="24"
          r="5"
          strokeWidth="1.5"
          fill={cardMode === 'light' ? '#ffffff' : '#000000'}
        />
        <circle
          cx="172"
          cy="76"
          r="5"
          strokeWidth="1.5"
          fill={cardMode === 'light' ? '#ffffff' : '#000000'}
        />
        <circle
          cx="144"
          cy="162"
          r="5"
          strokeWidth="1.5"
          fill={cardMode === 'light' ? '#ffffff' : '#000000'}
        />
        <circle
          cx="56"
          cy="162"
          r="5"
          strokeWidth="1.5"
          fill={cardMode === 'light' ? '#ffffff' : '#000000'}
        />
        <circle
          cx="28"
          cy="76"
          r="5"
          strokeWidth="1.5"
          fill={cardMode === 'light' ? '#ffffff' : '#000000'}
        />

        <circle
          cx="100"
          cy="100"
          r="10"
          strokeWidth="1.8"
          fill={cardMode === 'light' ? '#ffffff' : '#000000'}
        />
        <circle cx="100" cy="100" r="4" fill={strokeColor} />
      </g>
    </svg>
  );
};
