import chroma from 'chroma-js';
import type { Color, ColorPalette } from '../_types/color';

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Create Color object from hex
export function createColorFromHex(hex: string, name?: string): Color {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    hex,
    rgb,
    hsl,
    name,
  };
}

// Extract colors from uploaded image using canvas sampling
export async function extractColorsFromImage(file: File): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const img = new Image();
        img.onload = async () => {
          try {
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            // Scale down image for faster processing
            const maxSize = 200;
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Extract dominant colors using canvas pixel sampling
            const colors = extractDominantColors(ctx, canvas.width, canvas.height);

            const palette: ColorPalette = {
              id: `palette_${Date.now()}`,
              name: `Palette from ${file.name}`,
              colors: colors.slice(0, 6), // Limit to 6 colors
              source: 'image',
              createdAt: new Date(),
            };

            resolve(palette);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Extract dominant colors from canvas using pixel sampling and clustering
function extractDominantColors(ctx: CanvasRenderingContext2D, width: number, height: number): Color[] {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const colors: { [key: string]: number } = {};

  // Sample every 4th pixel for good coverage without being too slow
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const alpha = pixels[i + 3];

    // Skip transparent pixels
    if (alpha < 128) continue;

    // Skip pixels that are too close to pure white or black edges
    if ((r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5)) {
      continue;
    }

    // Use moderate quantization - group similar colors together
    const quantizedR = Math.min(255, Math.round(r / 32) * 32);
    const quantizedG = Math.min(255, Math.round(g / 32) * 32);
    const quantizedB = Math.min(255, Math.round(b / 32) * 32);

    // Create a proper hex color
    const hex = '#' + [quantizedR, quantizedG, quantizedB]
      .map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
      .join('');
    
    colors[hex] = (colors[hex] || 0) + 1;
  }

  // Calculate total pixels sampled for threshold
  const totalPixels = Object.values(colors).reduce((sum, count) => sum + count, 0);
  const minThreshold = Math.max(2, Math.floor(totalPixels * 0.02)); // At least 2% to avoid noise

  // Sort colors by frequency and convert to Color objects
  const sortedColors = Object.entries(colors)
    .filter(([, count]) => count >= minThreshold)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([hex]) => createColorFromHex(hex));

  return sortedColors;
}

// Generate harmonious colors based on a base color
export function generateHarmoniousColors(baseHex: string, count: number): Color[] {
  const colors: Color[] = [];
  const baseColor = chroma(baseHex);

  // Generate analogous colors
  for (let i = 0; i < count; i++) {
    const hue = (baseColor.get('hsl.h') + (i * 30)) % 360;
    const saturation = Math.max(0.3, baseColor.get('hsl.s') + (Math.random() - 0.5) * 0.3);
    const lightness = Math.max(0.2, Math.min(0.8, baseColor.get('hsl.l') + (Math.random() - 0.5) * 0.4));

    const newColor = chroma.hsl(hue, saturation, lightness);
    colors.push(createColorFromHex(newColor.hex()));
  }

  return colors;
}

// Generate a completely random harmonious palette
export function generateRandomPalette(): ColorPalette {
  const baseHue = Math.random() * 360;
  const colors: Color[] = [];

  // Generate colors with various harmony rules
  const harmonyTypes = ['analogous', 'complementary', 'triadic', 'monochromatic'];
  const selectedHarmony = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];

  switch (selectedHarmony) {
    case 'analogous':
      for (let i = 0; i < 5; i++) {
        const hue = (baseHue + i * 30) % 360;
        const saturation = 0.6 + Math.random() * 0.3;
        const lightness = 0.4 + Math.random() * 0.4;
        const color = chroma.hsl(hue, saturation, lightness);
        colors.push(createColorFromHex(color.hex()));
      }
      break;

    case 'complementary':
      const complementaryHue = (baseHue + 180) % 360;
      [baseHue, complementaryHue].forEach((hue) => {
        for (let i = 0; i < 2; i++) {
          const saturation = 0.5 + Math.random() * 0.4;
          const lightness = 0.3 + Math.random() * 0.5;
          const color = chroma.hsl(hue, saturation, lightness);
          colors.push(createColorFromHex(color.hex()));
        }
      });
      // Add neutral
      colors.push(createColorFromHex(chroma.hsl(baseHue, 0.1, 0.5).hex()));
      break;

    case 'triadic':
      [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360].forEach((hue) => {
        const saturation = 0.6 + Math.random() * 0.3;
        const lightness = 0.4 + Math.random() * 0.4;
        const color = chroma.hsl(hue, saturation, lightness);
        colors.push(createColorFromHex(color.hex()));
      });
      // Add variations
      for (let i = 0; i < 2; i++) {
        const hue = baseHue + Math.random() * 60 - 30;
        const saturation = 0.3 + Math.random() * 0.4;
        const lightness = 0.3 + Math.random() * 0.5;
        const color = chroma.hsl(hue, saturation, lightness);
        colors.push(createColorFromHex(color.hex()));
      }
      break;

    case 'monochromatic':
      for (let i = 0; i < 5; i++) {
        const saturation = 0.4 + Math.random() * 0.5;
        const lightness = 0.2 + (i * 0.15);
        const color = chroma.hsl(baseHue, saturation, lightness);
        colors.push(createColorFromHex(color.hex()));
      }
      break;
  }

  return {
    id: `palette_${Date.now()}`,
    name: `Random ${selectedHarmony} palette`,
    colors: colors.slice(0, 5),
    source: 'random',
    createdAt: new Date(),
  };
}

// Copy color to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Get contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  return chroma.contrast(color1, color2);
}

// Get readable text color for a background
export function getReadableTextColor(backgroundColor: string): string {
  const contrast = chroma.contrast(backgroundColor, '#ffffff');
  return contrast > 4.5 ? '#ffffff' : '#000000';
} 