export type ElementId = 'sangue' | 'morte' | 'energia' | 'conhecimento' | 'medo' | 'custom';

export type CircleTier = 1 | 2 | 3 | 4;

export type SigilSymbolPreset =
  | 'default'
  | 'skull'
  | 'eye'
  | 'spiral'
  | 'biohazard'
  | 'flame'
  | 'lightning'
  | 'pentagram'
  | 'hourglass'
  | 'rift'
  | 'dagger'
  | 'moon'
  | 'ouroboros';

export interface Modification {
  id: string;
  name: string; // e.g., "Discente", "Verdadeiro", "Especial"
  cost: string; // e.g., "+2 PD", "+5 PD"
  requirement?: string; // e.g., "Requer 2º Círculo", "Requer Afinidade"
  text: string;
}

export type CornerStyle = 'chamfer' | 'sharp' | 'rounded';
export type BorderStyle = 'double-silver' | 'runic' | 'gold-accent' | 'pure-minimal';
export type BgTone = 'black' | 'charcoal' | 'parchment' | 'light-pure' | 'light-parchment';
export type CardMode = 'dark' | 'light';
export type CustomIconFilter = 'auto' | 'silhouette' | 'monochrome' | 'invert' | 'original';

export interface RitualArtwork {
  url: string; // Base64 data URL or web image URL
  mode: 'background' | 'illustration' | 'back-cover'; // 'background' = ambient watermark, 'illustration' = framed artwork box, 'back-cover' = back cover art
  opacity: number; // 0.1 to 1.0
  scale: number; // 0.5 to 2.0
  fit: 'cover' | 'contain';
  positionY: number; // 0 to 100%
  showOnFront: boolean;
  showOnBack: boolean;
  blendMode: 'normal' | 'luminosity' | 'overlay' | 'screen' | 'multiply';
}

export interface CardThemeOptions {
  cardMode?: CardMode; // 'dark' (padrão paranormal escuro) ou 'light' (modo claro de alto contraste)
  themeMode?: CardMode; // Backward compatibility alias
  cornerStyle: CornerStyle;
  borderStyle: BorderStyle;
  bgTone: BgTone;
  watermarkOpacity: number; // 0.05 to 0.4
  showFlavorText: boolean;
  accentGlow: boolean;
  backQuoteText: string;
  backSigilStyle: 'element' | 'grand-seal';
  cleanBackSymbolOnly?: boolean; // Oculta anéis rúnicos e padrões complexos no verso da carta
  customIconFilter?: CustomIconFilter;
  customIconInvert?: boolean;
}

export interface Ritual {
  id: string;
  name: string;
  element: ElementId;
  customElementName?: string;
  customElementColor?: string;
  symbolPreset?: SigilSymbolPreset;
  customElementIcon?: string; // Base64 data URL or SVG/PNG link
  circle: CircleTier;
  execution: string;
  range: string;
  target: string;
  duration: string;
  basePd: string; // e.g., "1 PD", "3 PD", "6 PD", "10 PD"
  resistance?: string;
  description: string;
  modifications: Modification[];
  flavorText?: string;
  theme: CardThemeOptions;
  artwork?: RitualArtwork;
  createdAt: number;
  updatedAt: number;
}

export interface ElementConfig {
  id: ElementId;
  name: string;
  concept: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  textColor: string;
  borderColor: string;
  // Complementary color for light mode cards
  lightPrimaryColor: string;
  lightTextColor: string;
  lightBorderColor: string;
}

export const ELEMENT_CONFIGS: Record<ElementId, ElementConfig> = {
  sangue: {
    id: 'sangue',
    name: 'Sangue',
    concept: 'Sentimento, Dor, Paixão e Corpo',
    primaryColor: '#e11d48', // rose/red
    secondaryColor: '#881337',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    textColor: '#fecdd3',
    borderColor: '#e11d48',
    lightPrimaryColor: '#be123c',
    lightTextColor: '#881337',
    lightBorderColor: '#be123c',
  },
  morte: {
    id: 'morte',
    name: 'Morte',
    concept: 'Tempo, Entropia, Cinzas e Espirais',
    primaryColor: '#f1f5f9', // silver/bone white
    secondaryColor: '#475569',
    glowColor: 'rgba(241, 245, 249, 0.35)',
    textColor: '#f8fafc',
    borderColor: '#94a3b8',
    lightPrimaryColor: '#334155',
    lightTextColor: '#0f172a',
    lightBorderColor: '#475569',
  },
  energia: {
    id: 'energia',
    name: 'Energia',
    concept: 'Caos, Eletricidade, Luz e Mutação',
    primaryColor: '#c084fc', // purple/violet
    secondaryColor: '#7e22ce',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    textColor: '#f3e8ff',
    borderColor: '#a855f7',
    lightPrimaryColor: '#7e22ce',
    lightTextColor: '#581c87',
    lightBorderColor: '#7e22ce',
  },
  conhecimento: {
    id: 'conhecimento',
    name: 'Conhecimento',
    concept: 'Razão, Equilíbrio, Mente e Sigilos',
    primaryColor: '#fbbf24', // golden amber
    secondaryColor: '#b45309',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    textColor: '#fef3c7',
    borderColor: '#f59e0b',
    lightPrimaryColor: '#b45309',
    lightTextColor: '#78350f',
    lightBorderColor: '#b45309',
  },
  medo: {
    id: 'medo',
    name: 'Medo',
    concept: 'O Desconhecido, o Impossível e o Vazio',
    primaryColor: '#38bdf8', // ethereal cyan
    secondaryColor: '#0369a1',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    textColor: '#e0f2fe',
    borderColor: '#0284c7',
    lightPrimaryColor: '#0369a1',
    lightTextColor: '#0c4a6e',
    lightBorderColor: '#0284c7',
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    concept: 'Elemento Customizado',
    primaryColor: '#10b981', // emerald
    secondaryColor: '#047857',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    textColor: '#d1fae5',
    borderColor: '#10b981',
    lightPrimaryColor: '#047857',
    lightTextColor: '#064e3b',
    lightBorderColor: '#047857',
  },
};
