# Color Palette Generator Tool

A free, fast, and user-friendly color palette generator for the SiteAgent website.

## Features

### Core Features
- **Image-Based Palette Extraction**: Upload JPG/PNG images to extract dominant colors using advanced canvas-based color sampling
- **Random Palette Generator**: Generate harmonious color schemes using color theory (analogous, complementary, triadic, monochromatic)
- **Live Preview**: See your palette in action with sample UI elements
- **Copy Functionality**: One-click copy for HEX, RGB, and HSL color codes
- **Export Options**: Export palettes as PNG images

### Technical Features
- **Canvas-based Color Extraction**: Custom algorithm for robust color detection
- **Color Harmony Algorithms**: Based on HSL color theory for pleasing combinations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Analytics Tracking**: Built-in usage analytics for optimization

## File Structure

```
src/app/tools/color-palette-generator/
├── page.tsx                     # Main page with SEO metadata
├── _components/
│   ├── color-palette-generator.tsx # Main component
│   ├── image-uploader.tsx          # Drag & drop image upload
│   ├── palette-display.tsx         # Color swatches with copy functionality
│   └── palette-preview.tsx         # Live UI preview
├── _lib/
│   └── color-utils.ts              # Color extraction and generation utilities
├── _types/
│   └── color.ts                    # TypeScript type definitions
└── README.md                       # This file
```

## Color Extraction Algorithm

The tool uses a custom canvas-based color extraction method:

1. **Image Processing**: Scales down images for performance
2. **Pixel Sampling**: Samples every 4th pixel for speed
3. **Color Quantization**: Groups similar colors to reduce noise
4. **Frequency Analysis**: Sorts colors by occurrence
5. **Harmony Enhancement**: Generates additional harmonious colors if needed

## Color Harmony Types

- **Analogous**: Colors adjacent on the color wheel
- **Complementary**: Colors opposite on the color wheel
- **Triadic**: Three colors evenly spaced on the color wheel
- **Monochromatic**: Variations of a single hue

## Dependencies

- `chroma-js`: Color manipulation and harmony generation
- `html2canvas`: PNG export functionality
- `lucide-react`: Icons
- `react-hot-toast`: User notifications

## SEO Optimization

- Comprehensive metadata and Open Graph tags
- Structured data markup (WebApplication schema)
- Canonical URLs
- Optimized for "color palette generator" keywords
- Fast loading and responsive design

## Analytics Integration

The tool tracks the following events:
- Image uploads (with file size and type)
- Random palette generations (with harmony type)
- Export actions
- Copy actions

## Performance Considerations

- Image scaling for faster processing
- Efficient pixel sampling algorithm
- Lazy loading of heavy libraries (html2canvas)
- Optimized color calculations

## Usage Example

```typescript
import { ColorPaletteGenerator } from './_components/color-palette-generator';

export default function Page() {
  return <ColorPaletteGenerator />;
}
```

## Future Enhancements

- Color blindness simulation
- Additional export formats (SVG, JSON, CSS)
- Palette history and favorites
- Advanced color theory options
- Integration with design tools APIs 