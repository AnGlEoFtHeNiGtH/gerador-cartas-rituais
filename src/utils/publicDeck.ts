import { Ritual } from '../types';
import { healCorruptedCharacters } from './textFormatter';
import { safeSaveToLocalStorage } from './exportCard';

export const PUBLIC_DECK_STORAGE_KEY = 'grimorio_paranormal_public_deck_v1';

// Initial curated community rituals for the public deck
const INITIAL_PUBLIC_RITUALS: Ritual[] = [
  {
    id: 'pub-amaldicoar-arma-seed',
    name: 'Amaldiçoar Arma',
    element: 'sangue',
    symbolPreset: 'default',
    circle: 1,
    execution: 'Padrão',
    range: 'Toque',
    target: '1 arma corpo a corpo ou de disparo',
    duration: 'Cena',
    basePd: '1 PD',
    resistance: 'Nenhuma',
    description:
      'Você infunde a arma tocada com fluidos rubros e ódio primal. A arma goteja sangue espesso e passa a causar **+1d6 pontos de dano do elemento Sangue**. Se usada contra seres de Conhecimento, a margem de ameaça aumenta em +1.',
    modifications: [
      {
        id: 'pub-mod-1',
        name: 'Discente',
        cost: '+2 PD',
        requirement: 'Requer 2º Círculo',
        text: 'Muda o bônus de dano para **+2d6 pontos de dano de Sangue** e o alcance para **Curto (9m)**, permitindo arremessar ou encantar à distância.',
      },
      {
        id: 'pub-mod-2',
        name: 'Verdadeiro',
        cost: '+5 PD',
        requirement: 'Requer 3º Círculo e Afinidade',
        text: 'Muda o bônus de dano para **+4d6 de Sangue** e o efeito pode afetar até **duas armas** simultaneamente pela cena inteira.',
      },
    ],
    flavorText: 'O metal sedento estremece e pulsa como uma artéria aberta.',
    theme: {
      cardMode: 'dark',
      cornerStyle: 'chamfer',
      borderStyle: 'double-silver',
      bgTone: 'black',
      watermarkOpacity: 0.12,
      showFlavorText: true,
      accentGlow: true,
      backQuoteText: 'A Realidade não suporta a manifestação do Outro Lado.',
      backSigilStyle: 'grand-seal',
    },
    author: 'Agente Ocultista da Ordem',
    isPublic: true,
    publishedAt: 1714100000000,
    createdAt: 1714100000000,
    updatedAt: 1714100000000,
  },
  {
    id: 'pub-ectoplasma-seed',
    name: 'Ectoplasma',
    element: 'morte',
    symbolPreset: 'default',
    circle: 1,
    execution: 'Padrão',
    range: 'Curto (9m)',
    target: '1 criatura ou objeto',
    duration: 'Sustentada',
    basePd: '1 PD',
    resistance: 'Reflexos anula',
    description:
      'Você expele uma massa gelatinosa acinzentada que brota do chão ou de suas mãos. A substância envolve o alvo, reduzindo seu deslocamento pela metade e aplicando a condição **Vulnerável**. Se o alvo falhar por 5 ou mais, fica imóvel.',
    modifications: [
      {
        id: 'pub-mod-3',
        name: 'Discente',
        cost: '+2 PD',
        requirement: 'Requer 2º Círculo',
        text: 'O ectoplasma endurece com aspecto de lodo espesso. Além dos efeitos normais, causa **2d8 pontos de dano de Morte** por rodada em que o alvo permanecer contido.',
      },
      {
        id: 'pub-mod-4',
        name: 'Verdadeiro',
        cost: '+5 PD',
        requirement: 'Requer 3º Círculo',
        text: 'Afeta uma área de até 6m de raio no solo. O terreno se torna difícil e qualquer criatura na área no início de seu turno deve passar no teste de resistência ou será paralisada pelo lodo do Tempo.',
      },
    ],
    flavorText: 'O tempo se arrasta e congela sob a gosma do Lodo.',
    theme: {
      cardMode: 'dark',
      cornerStyle: 'sharp',
      borderStyle: 'runic',
      bgTone: 'charcoal',
      watermarkOpacity: 0.15,
      showFlavorText: true,
      accentGlow: true,
      backQuoteText: 'O lodo consome o que o tempo esqueceu.',
      backSigilStyle: 'element',
    },
    author: 'Equipe de Contenção de Morte',
    isPublic: true,
    publishedAt: 1714110000000,
    createdAt: 1714110000000,
    updatedAt: 1714110000000,
  },
  {
    id: 'pub-cicatrizacao-seed',
    name: 'Cicatrização Acelerada',
    element: 'sangue',
    symbolPreset: 'biohazard',
    circle: 1,
    execution: 'Padrão',
    range: 'Toque',
    target: '1 ser vivo voluntário',
    duration: 'Instantânea',
    basePd: '1 PD',
    resistance: 'Nenhuma',
    description:
      'Ao tocar as feridas abertas do alvo, seus tecidos musculares e pele se fecham com violência visceral. O alvo recupera **3d8+3 pontos de vida (PV)** instantaneamente. O alvo sofre 1 ponto de envelhecimento celular biológico.',
    modifications: [
      {
        id: 'pub-mod-5',
        name: 'Discente',
        cost: '+2 PD',
        requirement: 'Requer 2º Círculo',
        text: 'A cura aumenta para **5d8+5 PV** e estanca qualquer condição de Sangramento ativa no alvo.',
      },
      {
        id: 'pub-mod-6',
        name: 'Verdadeiro',
        cost: '+5 PD',
        requirement: 'Requer 3º Círculo e Afinidade',
        text: 'A cura se torna brutal: restaura **8d8+10 PV** e remove condições debilitantes como Fraco, Lento ou Cego de origem física.',
      },
    ],
    flavorText: 'A carne se costura antes mesmo que o grito termine.',
    theme: {
      cardMode: 'dark',
      cornerStyle: 'rounded',
      borderStyle: 'gold-accent',
      bgTone: 'black',
      watermarkOpacity: 0.14,
      showFlavorText: true,
      accentGlow: true,
      backQuoteText: 'Dor e cura são duas faces da mesma pulsação.',
      backSigilStyle: 'grand-seal',
    },
    author: 'Médico de Campo da Ordem',
    isPublic: true,
    publishedAt: 1714120000000,
    createdAt: 1714120000000,
    updatedAt: 1714120000000,
  },
  {
    id: 'pub-chamas-caos-seed',
    name: 'Chamas do Caos',
    element: 'energia',
    symbolPreset: 'lightning',
    circle: 2,
    execution: 'Padrão',
    range: 'Médio (18m)',
    target: 'Esfera com 4,5m de raio',
    duration: 'Instantânea',
    basePd: '3 PD',
    resistance: 'Reflexos reduz à metade',
    description:
      'Uma explosão estocástica de faíscas roxas e chamas descontroladas irrompe no ponto escolhido, causando **6d6 pontos de dano de Energia**. Dispositivos eletrônicos menores na área sofrem curto-circuito temporário.',
    modifications: [
      {
        id: 'pub-mod-7',
        name: 'Discente',
        cost: '+3 PD',
        requirement: 'Requer 3º Círculo',
        text: 'Aumenta o dano para **10d6 de Energia** e deixa o solo incandescente por 1 rodada, causando 2d6 a quem cruzar a área.',
      },
    ],
    flavorText: 'A entropia dança com cores que os olhos humanos não deveriam enxergar.',
    theme: {
      cardMode: 'dark',
      cornerStyle: 'chamfer',
      borderStyle: 'double-silver',
      bgTone: 'black',
      watermarkOpacity: 0.15,
      showFlavorText: true,
      accentGlow: true,
      backQuoteText: 'O Caos não se contém; ele apenas se transforma.',
      backSigilStyle: 'grand-seal',
    },
    author: 'Especialista em Energia Quântica',
    isPublic: true,
    publishedAt: 1714130000000,
    createdAt: 1714130000000,
    updatedAt: 1714130000000,
  },
  {
    id: 'pub-terceiro-olho-seed',
    name: 'Compreensão Paranormal',
    element: 'conhecimento',
    symbolPreset: 'eye',
    circle: 1,
    execution: 'Movimento',
    range: 'Pessoal',
    target: 'Você',
    duration: 'Cena',
    basePd: '1 PD',
    resistance: 'Nenhuma',
    description:
      'Símbolos dourados e sussurros antigos inundam seus olhos e mente. Você ganha visão no escuro total (mesmo sobrenatural), enxerga criaturas invisíveis e recebe **+5 em testes de Investigação e Ocultismo**.',
    modifications: [
      {
        id: 'pub-mod-8',
        name: 'Discente',
        cost: '+2 PD',
        requirement: 'Requer 2º Círculo',
        text: 'Você também decifra qualquer escrita em línguas mortas ou códigos criptografados instantaneamente.',
      },
    ],
    flavorText: 'Saber demais é o primeiro passo para o esquecimento.',
    theme: {
      cardMode: 'dark',
      cornerStyle: 'chamfer',
      borderStyle: 'gold-accent',
      bgTone: 'parchment',
      watermarkOpacity: 0.12,
      showFlavorText: true,
      accentGlow: true,
      backQuoteText: 'Saber tudo é perder tudo o que restou de si mesmo.',
      backSigilStyle: 'grand-seal',
    },
    author: 'Arquivista do Veríssimo',
    isPublic: true,
    publishedAt: 1714140000000,
    createdAt: 1714140000000,
    updatedAt: 1714140000000,
  },
];

/**
 * Normalizes a ritual object ensuring accent healing and required fields.
 */
function normalizeRitual(r: Ritual): Ritual {
  return {
    ...r,
    name: healCorruptedCharacters(r.name || 'Ritual Sem Nome'),
    description: healCorruptedCharacters(r.description || ''),
    execution: healCorruptedCharacters(r.execution || 'Padrão'),
    range: healCorruptedCharacters(r.range || 'Toque'),
    target: healCorruptedCharacters(r.target || '1 alvo'),
    duration: healCorruptedCharacters(r.duration || 'Instantânea'),
    resistance: healCorruptedCharacters(r.resistance || 'Nenhuma'),
    flavorText: healCorruptedCharacters(r.flavorText || ''),
    basePd: r.basePd || (r as unknown as { basePe?: string }).basePe || '1 PD',
    author: healCorruptedCharacters(r.author || 'Agente Paranormal'),
    isPublic: true,
    modifications: (r.modifications || []).map((m) => ({
      ...m,
      name: healCorruptedCharacters(m.name || ''),
      text: healCorruptedCharacters(m.text || ''),
      requirement: healCorruptedCharacters(m.requirement || ''),
      cost: (m.cost || '+2 PD').replace(/PE/g, 'PD'),
    })),
    theme: {
      ...r.theme,
      backQuoteText: healCorruptedCharacters(
        r.theme?.backQuoteText || 'A Realidade resiste ao Outro Lado.'
      ),
    },
  };
}

/**
 * Loads the public deck from localStorage, initializing with community presets if not yet set.
 */
export function getPublicRituals(): Ritual[] {
  try {
    if (typeof window === 'undefined') return INITIAL_PUBLIC_RITUALS;
    const raw = localStorage.getItem(PUBLIC_DECK_STORAGE_KEY);
    if (!raw) {
      // Seed initial collection
      const seeded = INITIAL_PUBLIC_RITUALS.map(normalizeRitual);
      safeSaveToLocalStorage(PUBLIC_DECK_STORAGE_KEY, seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeRitual);
    }

    // If empty array, re-seed
    const seeded = INITIAL_PUBLIC_RITUALS.map(normalizeRitual);
    safeSaveToLocalStorage(PUBLIC_DECK_STORAGE_KEY, seeded);
    return seeded;
  } catch (err) {
    console.warn('[PublicDeck] Error reading public rituals, falling back to initial presets:', err);
    return INITIAL_PUBLIC_RITUALS.map(normalizeRitual);
  }
}

/**
 * Publishes a ritual into the public deck.
 * Generates a new unique public ID and stamps publication metadata.
 */
export function publishRitualToPublicDeck(
  ritual: Ritual,
  authorName: string = 'Agente Paranormal'
): { success: boolean; ritual: Ritual; message: string } {
  try {
    const currentList = getPublicRituals();
    
    // Create an independent public clone
    const publicId = `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const publicRitual: Ritual = {
      ...normalizeRitual(ritual),
      id: publicId,
      author: healCorruptedCharacters(authorName.trim() || 'Agente Paranormal'),
      isPublic: true,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add to the top of the community deck
    const updatedList = [publicRitual, ...currentList.filter((item) => item.id !== publicId)];
    const saveResult = safeSaveToLocalStorage(PUBLIC_DECK_STORAGE_KEY, updatedList);

    if (!saveResult.success) {
      return {
        success: false,
        ritual: publicRitual,
        message: 'Não foi possível salvar no armazenamento público (limite de espaço atingido).',
      };
    }

    // Notify any listening components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('public-deck-updated', { detail: { ritual: publicRitual } }));
    }

    return {
      success: true,
      ritual: publicRitual,
      message: `✦ Ritual "${publicRitual.name}" publicado com sucesso no Grimório Público!`,
    };
  } catch (err) {
    console.error('[PublicDeck] Error publishing ritual:', err);
    return {
      success: false,
      ritual,
      message: 'Erro inesperado ao publicar ritual no Grimório Público.',
    };
  }
}

/**
 * Deletes a ritual from the public deck (Administrator moderation privilege).
 */
export function deleteRitualFromPublicDeck(ritualId: string): { success: boolean; message: string } {
  try {
    const currentList = getPublicRituals();
    const target = currentList.find((r) => r.id === ritualId);
    const updatedList = currentList.filter((r) => r.id !== ritualId);
    
    safeSaveToLocalStorage(PUBLIC_DECK_STORAGE_KEY, updatedList);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('public-deck-updated', { detail: { deletedId: ritualId } }));
    }

    return {
      success: true,
      message: `✦ Ritual "${target?.name || 'selecionado'}" excluído do Grimório Público pelo Administrador.`,
    };
  } catch (err) {
    console.error('[PublicDeck] Error deleting ritual from public deck:', err);
    return {
      success: false,
      message: 'Erro ao remover ritual do Grimório Público.',
    };
  }
}

/**
 * Resets the public deck to the standard community presets (Administrator action).
 */
export function resetPublicDeckToDefault(): Ritual[] {
  const seeded = INITIAL_PUBLIC_RITUALS.map(normalizeRitual);
  safeSaveToLocalStorage(PUBLIC_DECK_STORAGE_KEY, seeded);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('public-deck-updated', { detail: { reset: true } }));
  }
  return seeded;
}
