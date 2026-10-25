export type ElementId = 'sangue' | 'morte' | 'energia' | 'conhecimento' | 'medo' | 'custom';

export type CircleTier = 1 | 2 | 3 | 4;

export interface Modification {
  id: string;
  name: string; // e.g., "Discente", "Verdadeiro", "Especial"
  cost: string; // e.g., "+2 PE", "+5 PE"
  requirement?: string; // e.g., "Requer 3º círculo", "Requer Afinidade"
  text: string;
}

export type CornerStyle = 'chamfer' | 'sharp' | 'rounded';
export type BorderStyle = 'double-silver' | 'runic' | 'gold-accent' | 'pure-minimal';
export type BgTone = 'black' | 'charcoal' | 'parchment';

export interface CardThemeOptions {
  cornerStyle: CornerStyle;
  borderStyle: BorderStyle;
  bgTone: BgTone;
  watermarkOpacity: number; // 0.05 to 0.4
  showFlavorText: boolean;
  accentGlow: boolean;
  backQuoteText: string;
  backSigilStyle: 'element' | 'grand-seal';
}

export interface Ritual {
  id: string;
  name: string;
  element: ElementId;
  customElementName?: string;
  customElementColor?: string;
  circle: CircleTier;
  execution: string;
  range: string;
  target: string;
  duration: string;
  basePe: string;
  resistance?: string;
  description: string;
  modifications: Modification[];
  flavorText?: string;
  theme: CardThemeOptions;
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
  },
};
