/**
 * Utilitário de Processamento de Imagens e Tratamento Automático de Transparência
 * Converte imagens com fundo preto ou escuro em PNGs com canal alfa transparente limpo.
 * Evita caixas pretas ao redor de ilustrações, símbolos e logos em cartas claras e escuras.
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  removeBlackBg?: boolean;
  autoDetectBlackBg?: boolean;
  threshold?: number; // Limiar de brilho para considerar preto (padrão: 42)
  feather?: number; // Suavização de borda anti-aliasing (padrão: 26)
}

/**
 * Detecta se uma imagem possui bordas/fundo predominantemente preto ou muito escuro.
 * Analisa amostras nas 4 bordas e cantos do Canvas.
 */
export function detectHasDarkBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold = 42
): boolean {
  if (width <= 0 || height <= 0) return false;

  const samplePoints: [number, number][] = [
    // Cantos exatos
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    // Bordas superiores e inferiores
    [Math.floor(width * 0.25), 0],
    [Math.floor(width * 0.5), 0],
    [Math.floor(width * 0.75), 0],
    [Math.floor(width * 0.25), height - 1],
    [Math.floor(width * 0.5), height - 1],
    [Math.floor(width * 0.75), height - 1],
    // Bordas laterais
    [0, Math.floor(height * 0.25)],
    [0, Math.floor(height * 0.5)],
    [0, Math.floor(height * 0.75)],
    [width - 1, Math.floor(height * 0.25)],
    [width - 1, Math.floor(height * 0.5)],
    [width - 1, Math.floor(height * 0.75)],
  ];

  let darkOpaqueCount = 0;
  let totalChecked = 0;

  for (const [x, y] of samplePoints) {
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const a = pixel[3];

      // Se já é transparente, não é uma caixa preta opaca
      if (a < 180) continue;

      totalChecked++;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const maxChannel = Math.max(r, g, b);

      if (luminance <= threshold + 10 && maxChannel <= threshold + 15) {
        darkOpaqueCount++;
      }
    } catch {
      // Ignora erros de amostragem fora dos limites
    }
  }

  // Se a maioria das bordas opacas for preta/escura, a imagem possui fundo preto
  return totalChecked >= 6 && darkOpaqueCount / totalChecked >= 0.65;
}

/**
 * Remove pixels pretos ou quase pretos diretamente no buffer ImageData do Canvas,
 * aplicando suavização de borda (feathering) para evitar bordas serrilhadas.
 */
export function removeBlackPixelsFromImageData(
  imageData: ImageData,
  threshold = 42,
  feather = 26
): void {
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Se já é totalmente transparente, pula
    if (a === 0) continue;

    // Luminância perceptiva do pixel (ITU-R BT.709)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const maxChannel = Math.max(r, g, b);

    // O valor escuro considera tanto a luminância quanto o canal máximo (evita apagar cores vivas saturadas)
    const darkVal = Math.max(luminance, maxChannel);

    if (darkVal <= threshold) {
      // Preto sólido / ruído de compressão escuro -> 100% transparente
      data[i + 3] = 0;
    } else if (darkVal < threshold + feather) {
      // Zona de transição (anti-aliasing suave para borda não pixelada)
      const ratio = (darkVal - threshold) / feather;
      data[i + 3] = Math.round(a * Math.pow(ratio, 1.25));
    }
  }
}

/**
 * Processa um arquivo (File) vindo de <input type="file">.
 * - Redimensiona proporcionalmente para otimizar desempenho e caber em decks.
 * - Detecta ou força remoção de fundo preto convertendo em transparência alfa.
 * - SEMPRE gera saída 'image/png' com canal alfa intacto (32-bit RGBA).
 */
export function processUploadedImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    maxWidth = 950,
    maxHeight = 950,
    removeBlackBg = false,
    autoDetectBlackBg = true,
    threshold = 42,
    feather = 26,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // Redimensionamento proporcional respeitando limites máximos
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Limpa o canvas para garantir transparência absoluta no canal alfa
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Verifica se deve remover o fundo preto (ou se os cantos foram detectados como pretos)
          const shouldClean =
            removeBlackBg ||
            (autoDetectBlackBg && detectHasDarkBackground(ctx, width, height, threshold));

          if (shouldClean) {
            const imgData = ctx.getImageData(0, 0, width, height);
            removeBlackPixelsFromImageData(imgData, threshold, feather);
            ctx.putImageData(imgData, 0, 0);
          }

          // SEMPRE exportar como image/png para manter transparência alfa de 32 bits
          const outputDataUrl = canvas.toDataURL('image/png');
          resolve(outputDataUrl);
        } catch (err) {
          console.warn('Erro ao processar imagem no canvas, usando original:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Converte qualquer URL de imagem (ou DataURL existente) removendo pixels pretos de fundo
 * e retornando uma versão transparente limpa em PNG.
 */
export function removeBlackFromDataUrl(
  imageUrl: string,
  threshold = 42,
  feather = 26
): Promise<string> {
  return new Promise((resolve) => {
    if (!imageUrl || !imageUrl.trim()) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, img.naturalWidth || img.width);
        canvas.height = Math.max(1, img.naturalHeight || img.height);

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        removeBlackPixelsFromImageData(imgData, threshold, feather);
        ctx.putImageData(imgData, 0, 0);

        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Não foi possível processar transparência da imagem (CORS ou erro de canvas):', e);
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

/**
 * Atalho para limpeza imediata de fundo preto em qualquer imagem já carregada.
 */
export const cleanImageTransparency = (imageUrl: string): Promise<string> => {
  return removeBlackFromDataUrl(imageUrl, 42, 26);
};
