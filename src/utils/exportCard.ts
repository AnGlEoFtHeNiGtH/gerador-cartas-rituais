import { toPng } from 'html-to-image';

/**
 * Exports a DOM node (the card container) as a high-resolution PNG image
 */
export async function exportCardAsPng(
  elementId: string,
  filename: string,
  pixelRatio: number = 2.5
): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    const dataUrl = await toPng(node, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: 'transparent',
      filter: (domNode) => {
        // Exclude elements marked no-export
        if (domNode instanceof HTMLElement && domNode.classList.contains('no-export')) {
          return false;
        }
        return true;
      },
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Failed to export card as PNG:', error);
    return false;
  }
}

/**
 * Formats a title into a clean filename
 */
export function sanitizeFilename(name: string, suffix: string = 'card'): string {
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${clean || 'ritual'}-${suffix}`;
}
