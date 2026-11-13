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

export type CardCategory = 'ritual' | 'mundano' | 'paranormal' | 'amaldicoado';

export type MundaneSubcategory = 'arma' | 'protecao' | 'acessorio' | 'utilitario' | 'municao' | 'paranormal';

export interface MundaneSubcategoryConfig {
  id: MundaneSubcategory;
  name: string;
  concept: string;
}

export const MUNDANE_SUBCATEGORIES: Record<MundaneSubcategory, MundaneSubcategoryConfig> = {
  arma: {
    id: 'arma',
    name: 'Arma',
    concept: 'Armas de fogo, corpo a corpo e disparo',
  },
  protecao: {
    id: 'protecao',
    name: 'Proteção',
    concept: 'Armaduras leves, pesadas e escudos',
  },
  acessorio: {
    id: 'acessorio',
    name: 'Acessório',
    concept: 'Vestimentas, mochilas e itens de uso geral',
  },
  utilitario: {
    id: 'utilitario',
    name: 'Utilitário',
    concept: 'Ferramentas, kits de perícia e itens táticos',
  },
  municao: {
    id: 'municao',
    name: 'Munição',
    concept: 'Balas curtas, longas, cartuchos e flechas',
  },
  paranormal: {
    id: 'paranormal',
    name: 'Item Paranormal',
    concept: 'Artefatos, componentes de ocultismo e amaldiçoados',
  },
};

export type ItemCategoryTier = '0' | 'I' | 'II' | 'III' | 'IV';

export interface ArsenalItemArtwork {
  url: string;
  fit?: 'cover' | 'contain';
  scale?: number;
  positionY?: number;
  opacity?: number;
}

export interface ArsenalItemTheme {
  borderStyle?: 'rustic-tactical' | 'black-distressed' | 'clean-ordo' | 'worn-investigator' | 'dossier-thick-black';
  borderVariant?: 'distressed' | 'clean' | 'worn';
  parchmentTone?: 'classic-aged' | 'off-white' | 'tactical-dark' | 'blood-stained';
  cardMode?: CardMode;
  itemCode?: string;
  backQuoteText?: string;
  topHeaderLabel?: string; // Texto superior livremente editável
  customBackLogoUrl?: string; // Logo personalizada no verso
  hideTopHeader?: boolean; // Oculta faixa superior decorativa
  hideBottomFooter?: boolean; // Oculta faixa inferior do rodapé
  bottomFooterLeft?: string; // Texto do rodapé à esquerda
  bottomFooterCenter?: string; // Texto do rodapé ao centro
  bottomFooterRight?: string; // Texto do rodapé à direita
}

export interface ArsenalItem {
  id: string;
  name: string;
  itemType?: CardCategory;
  category?: CardCategory;
  subcategory: MundaneSubcategory;
  categoryTier?: ItemCategoryTier;
  tier?: ItemCategoryTier;
  inventorySlots?: number;
  spaces?: number;
  itemCode?: string;
  
  // Weapon specific
  weaponDamage?: string;
  weaponCritical?: string;
  weaponRange?: string;
  weaponDamageType?: string;
  weaponGrip?: string;

  // Protection specific
  protectionDefense?: string;
  protectionPenalty?: string;
  protectionType?: string;

  // Curse / Paranormal specific
  showElementBadge?: boolean;
  element?: ElementId;
  curseName?: string;
  curseCost?: string;
  cursePassiveEffect?: string;

  // Description & Lore
  description: string;
  flavorText?: string;

  // Tracker / Cargas
  showUseTracker: boolean;
  maxUses: number;
  currentUses: number;

  // Artwork & Visuals
  artwork?: ArsenalItemArtwork;
  theme?: ArsenalItemTheme;

  // Metadata
  author?: string;
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Modification {
  id: string;
  name: string; // e.g., "Discente", "Verdadeiro", "Especial"
  cost: string; // e.g., "+2 PD", "+5 PD"
  requirement?: string; // e.g., "Requer 2º Círculo", "Requer Afinidade"
  text: string;
}

export type CornerStyle = 'chamfer' | 'sharp' | 'rounded';
export type BorderStyle = 'double-silver' | 'runic' | 'gold-accent' | 'pure-minimal' | 'dossier-thick-black';
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
  backSigilStyle: 'element' | 'grand-seal' | 'ordo-realitas';
  cleanBackSymbolOnly?: boolean; // Oculta anéis rúnicos e padrões complexos no verso da carta
  hideElementSymbol?: boolean; // Oculta o ícone circular do elemento no topo da frente da carta (foco total na arte)
  backSigilGlow?: boolean; // Ativa brilho luminoso/aura na cor do elemento no símbolo do verso
  backSigilOpacity?: number; // Opacidade do símbolo do verso (0.0 a 1.0)
  backArtGlow?: boolean; // Efeito de brilho (glow) exclusivo na Arte & Ilustração do verso da carta com cores oficiais do elemento
  customIconFilter?: CustomIconFilter;
  customIconInvert?: boolean;
  topHeaderLabel?: string; // Texto superior da carta customizável
  customBackLogoUrl?: string; // Logo personalizada no verso
  hideTopHeader?: boolean; // Oculta faixa superior do cabeçalho
  hideBottomFooter?: boolean; // Oculta dados/faixa do rodapé
  bottomFooterLeft?: string; // Texto do rodapé à esquerda
  bottomFooterCenter?: string; // Texto do rodapé ao centro
  bottomFooterRight?: string; // Texto do rodapé à direita
}

export interface Ritual {
  id: string;
  name: string;
  element: ElementId;
  cardCategory?: CardCategory;
  mundaneSubcategory?: MundaneSubcategory;
  curseName?: string;
  curseCost?: string;
  cursePassiveEffect?: string;
  itemCategory?: string;
  inventorySlots?: number;
  weaponDamage?: string;
  weaponCritical?: string;
  weaponRange?: string;
  weaponDamageType?: string;
  weaponGrip?: string;
  protectionDefense?: string;
  protectionPenalty?: string;
  protectionType?: string;
  showUseTracker?: boolean;
  maxUses?: number;
  currentUses?: number;
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
  author?: string; // Nome do autor / agente paranormal que publicou
  isPublic?: boolean; // Se a carta está no Grimório Público
  publishedAt?: number; // Timestamp de publicação
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

export interface BackArtGlowStyle {
  colorName: string;
  primaryGlowRgba: string;
  filter: string;
  boxShadow: string;
}

// Mapeamento Oficial de Cores do Universo Ordem Paranormal para o Glow Exclusivo da Arte do Verso
export const OFFICIAL_BACK_ART_GLOW: Record<ElementId, BackArtGlowStyle> = {
  // Sangue: Vermelho carmesim vibrante
  sangue: {
    colorName: 'Vermelho Carmesim Vibrante',
    primaryGlowRgba: 'rgba(220, 38, 38, 0.85)',
    filter: 'drop-shadow(0 0 18px rgba(220, 38, 38, 0.85)) drop-shadow(0 0 36px rgba(220, 38, 38, 0.65))',
    boxShadow: '0 0 32px rgba(220, 38, 38, 0.85), inset 0 0 28px rgba(220, 38, 38, 0.6)',
  },
  // Morte: Preto profundo espectral com aura de transição escura/cinza espectral
  morte: {
    colorName: 'Preto Profundo Espectral',
    primaryGlowRgba: 'rgba(10, 10, 15, 0.95)',
    filter: 'drop-shadow(0 0 20px rgba(10, 10, 15, 0.95)) drop-shadow(0 0 35px rgba(30, 41, 59, 0.9)) drop-shadow(0 0 50px rgba(148, 163, 184, 0.5))',
    boxShadow: '0 0 30px rgba(10, 10, 15, 0.95), 0 0 45px rgba(51, 65, 85, 0.65), inset 0 0 30px rgba(10, 10, 15, 0.95)',
  },
  // Energia: Roxo / magenta caótico e elétrico
  energia: {
    colorName: 'Roxo / Magenta Caótico e Elétrico',
    primaryGlowRgba: 'rgba(168, 85, 247, 0.85)',
    filter: 'drop-shadow(0 0 18px rgba(168, 85, 247, 0.85)) drop-shadow(0 0 36px rgba(168, 85, 247, 0.65))',
    boxShadow: '0 0 32px rgba(168, 85, 247, 0.85), inset 0 0 28px rgba(168, 85, 247, 0.6)',
  },
  // Conhecimento: Amarelo ouro / dourado radiante
  conhecimento: {
    colorName: 'Amarelo Ouro / Dourado Radiante',
    primaryGlowRgba: 'rgba(234, 179, 8, 0.85)',
    filter: 'drop-shadow(0 0 18px rgba(234, 179, 8, 0.85)) drop-shadow(0 0 36px rgba(234, 179, 8, 0.65))',
    boxShadow: '0 0 32px rgba(234, 179, 8, 0.85), inset 0 0 28px rgba(234, 179, 8, 0.6)',
  },
  // Medo: Branco / ciano espectral e ectoplásmico
  medo: {
    colorName: 'Branco / Ciano Espectral e Ectoplásmico',
    primaryGlowRgba: 'rgba(164, 242, 244, 0.85)',
    filter: 'drop-shadow(0 0 18px rgba(164, 242, 244, 0.85)) drop-shadow(0 0 36px rgba(56, 189, 248, 0.7))',
    boxShadow: '0 0 32px rgba(164, 242, 244, 0.85), inset 0 0 28px rgba(56, 189, 248, 0.55)',
  },
  // Personalizado
  custom: {
    colorName: 'Personalizado',
    primaryGlowRgba: 'rgba(16, 185, 129, 0.85)',
    filter: 'drop-shadow(0 0 18px rgba(16, 185, 129, 0.85)) drop-shadow(0 0 36px rgba(16, 185, 129, 0.65))',
    boxShadow: '0 0 32px rgba(16, 185, 129, 0.85), inset 0 0 28px rgba(16, 185, 129, 0.55)',
  },
};

export const getOfficialBackArtGlow = (element: ElementId, customColor?: string): BackArtGlowStyle => {
  if (element === 'custom' && customColor) {
    return {
      colorName: 'Elemento Customizado',
      primaryGlowRgba: customColor,
      filter: `drop-shadow(0 0 18px ${customColor}) drop-shadow(0 0 36px ${customColor}aa)`,
      boxShadow: `0 0 32px ${customColor}, inset 0 0 28px ${customColor}99`,
    };
  }
  return OFFICIAL_BACK_ART_GLOW[element] || OFFICIAL_BACK_ART_GLOW.sangue;
};

export {
  MORTE_SIMBOLO_PADRAO,
  SANGUE_SIMBOLO_PADRAO,
  CONHECIMENTO_SIMBOLO_PADRAO,
  MEDO_SIMBOLO_PADRAO,
  ENERGIA_SIMBOLO_PADRAO,
  OFFICIAL_ELEMENT_SYMBOLS,
  ELEMENT_SYMBOLS_LIST,
  getElementDefaultSymbol,
} from './data/elementSymbols';

