import { toPng } from 'html-to-image';

/**
 * Exports a DOM node (the card container) as a high-resolution PNG image
 * with robust timeout protection and DOM element validation.
 */
export async function exportCardAsPng(
  elementId: string,
  filename: string,
  pixelRatio: number = 2.5
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`[Export] Element with id "${elementId}" not found in DOM.`);
    return false;
  }

  // Ensure element has valid layout dimensions
  if (node.offsetWidth === 0 || node.offsetHeight === 0) {
    console.warn(`[Export] Element "${elementId}" has 0 width or height.`);
  }

  try {
    // Ensure document fonts are resolved before capturing to guarantee full glyph fidelity
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
      } catch {
        // Silently continue if font API throws
      }
    }

    // 15 seconds timeout safeguard to prevent async freezes if fonts or assets stall
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Tempo limite de exportação excedido (15s) para ${elementId}`));
      }, 15000);
      // Allow timer to not block node shutdown if applicable
      if (typeof timer.unref === 'function') timer.unref();
    });

    const exportPromise = toPng(node, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: 'transparent',
      filter: (domNode) => {
        // Exclude elements marked no-export or no-print
        if (domNode instanceof HTMLElement) {
          if (domNode.classList.contains('no-export') || domNode.classList.contains('no-print')) {
            return false;
          }
        }
        return true;
      },
      // Guarantee scrollbars are hidden and crisp text anti-aliasing during canvas capture
      style: {
        overflow: 'hidden',
        scrollbarWidth: 'none',
        textRendering: 'optimizeLegibility',
      },
    });

    const dataUrl = await Promise.race([exportPromise, timeoutPromise]);

    if (!dataUrl || dataUrl.length < 100) {
      throw new Error('DataURL gerada vazia ou inválida');
    }

    // Create and click download link cleanly
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    
    // Clean up DOM node link
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 200);

    return true;
  } catch (error) {
    console.error('[Export] Falha ao exportar carta como PNG:', error);
    return false;
  }
}

/**
 * Formats a title into a clean filename
 */
export function sanitizeFilename(name: string, suffix: string = 'card'): string {
  const clean = (name || 'ritual')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${clean || 'ritual'}-${suffix}`;
}

/**
 * Safe local storage setter to prevent QuotaExceededError crashes
 */
export function safeSaveToLocalStorage(key: string, data: unknown): { success: boolean; error?: string } {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[Storage] Failed to save key "${key}":`, errorMsg);
    return { success: false, error: errorMsg };
  }
}
