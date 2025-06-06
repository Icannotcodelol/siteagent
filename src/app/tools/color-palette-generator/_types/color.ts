export interface Color {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  name?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  source: 'image' | 'random';
  createdAt: Date;
}

export interface PaletteExportOptions {
  format: 'png' | 'svg' | 'json';
  includePreview?: boolean;
  includeMetadata?: boolean;
} 