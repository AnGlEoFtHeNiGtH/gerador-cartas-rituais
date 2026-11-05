import { ElementId } from '../types';

// ============================================================================
// ATIVOS OFICIAIS DOS 5 SÍMBOLOS PADRÃO DE ORDEM PARANORMAL
// ============================================================================

export const MORTE_SIMBOLO_PADRAO = '/assets/aistudio/MORTE_SIMBOLO_PADRAO_98d13a2a.png';
export const SANGUE_SIMBOLO_PADRAO = '/assets/aistudio/SANGUE_SIMBOLO_PADRAO_f98e84fc.png';
export const CONHECIMENTO_SIMBOLO_PADRAO = '/assets/aistudio/CONHECIMENTO_SIMBOLO_PADRAO_8a91af26.png';
export const MEDO_SIMBOLO_PADRAO = '/assets/aistudio/MEDO_SIMBOLO_PADRAO_b65a2d47.png';
export const ENERGIA_SIMBOLO_PADRAO = '/assets/aistudio/ENERGIA_SIMBOLO_PADRAO_b56fb228.png';

export interface OfficialElementSymbolItem {
  element: ElementId;
  name: string;
  tag: string;
  url: string;
  colorName: string;
  glowRgba: string;
  description: string;
}

// Dicionário canônico mapeando cada elemento ao seu símbolo padrão oficial
export const OFFICIAL_ELEMENT_SYMBOLS: Record<ElementId, string | undefined> = {
  sangue: SANGUE_SIMBOLO_PADRAO,
  morte: MORTE_SIMBOLO_PADRAO,
  energia: ENERGIA_SIMBOLO_PADRAO,
  conhecimento: CONHECIMENTO_SIMBOLO_PADRAO,
  medo: MEDO_SIMBOLO_PADRAO,
  custom: undefined,
};

// Lista estruturada para exibição no seletor nativo do EditorPanel
export const ELEMENT_SYMBOLS_LIST: OfficialElementSymbolItem[] = [
  {
    element: 'sangue',
    name: 'Sangue',
    tag: 'Sentimento & Dor',
    url: SANGUE_SIMBOLO_PADRAO,
    colorName: 'Vermelho Carmesim',
    glowRgba: 'rgba(220, 38, 38, 0.85)',
    description: 'Símbolo primal de Sangue: sentimentos intensos, dor e paixão',
  },
  {
    element: 'morte',
    name: 'Morte',
    tag: 'Tempo & Entropia',
    url: MORTE_SIMBOLO_PADRAO,
    colorName: 'Preto Espectral',
    glowRgba: 'rgba(10, 10, 15, 0.95)',
    description: 'Espiral temporal de Morte: entropia, lodo e distorção do tempo',
  },
  {
    element: 'energia',
    name: 'Energia',
    tag: 'Caos & Eletricidade',
    url: ENERGIA_SIMBOLO_PADRAO,
    colorName: 'Roxo Elétrico',
    glowRgba: 'rgba(168, 85, 247, 0.85)',
    description: 'Glifo caótico de Energia: transformação, eletricidade e calor',
  },
  {
    element: 'conhecimento',
    name: 'Conhecimento',
    tag: 'Razão & Saber',
    url: CONHECIMENTO_SIMBOLO_PADRAO,
    colorName: 'Dourado Radiante',
    glowRgba: 'rgba(234, 179, 8, 0.85)',
    description: 'Mandala rúnica de Conhecimento: lógica, equilíbrio e segredos',
  },
  {
    element: 'medo',
    name: 'Medo',
    tag: 'O Outro Lado',
    url: MEDO_SIMBOLO_PADRAO,
    colorName: 'Branco / Ciano Espectral',
    glowRgba: 'rgba(164, 242, 244, 0.85)',
    description: 'Ruptura ectoplásmica de Medo: a força primordial do Outro Lado',
  },
];

/**
 * Retorna o símbolo padrão canônico para um dado elemento de Ordem Paranormal.
 */
export const getElementDefaultSymbol = (element: ElementId): string | undefined => {
  return OFFICIAL_ELEMENT_SYMBOLS[element];
};
