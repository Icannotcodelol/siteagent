'use client';

import { Button } from '@/app/_components/ui/button';
import { Star, Heart, Share2, ShoppingCart } from 'lucide-react';
import type { ColorPalette } from '../_types/color';
import { getReadableTextColor } from '../_lib/color-utils';

interface PalettePreviewProps {
  palette: ColorPalette;
}

export function PalettePreview({ palette }: PalettePreviewProps) {
  const [primary, secondary, accent, neutral, ...otherColors] = palette.colors;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
        <p className="text-gray-400 text-sm">
          See how your palette looks in real UI elements
        </p>
      </div>

      <div className="space-y-8">
        {/* Website Header Preview */}
        <div className="rounded-lg overflow-hidden border border-gray-700">
          <div 
            className="p-6"
            style={{ backgroundColor: primary?.hex || '#1f2937' }}
          >
            <div className="flex items-center justify-between">
              <div 
                className="text-xl font-bold"
                style={{ color: getReadableTextColor(primary?.hex || '#1f2937') }}
              >
                Your Brand
              </div>
              <div className="flex items-center space-x-6">
                {['Home', 'About', 'Services', 'Contact'].map((item) => (
                  <span 
                    key={item}
                    className="text-sm opacity-80 hover:opacity-100 cursor-pointer"
                    style={{ color: getReadableTextColor(primary?.hex || '#1f2937') }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="rounded-lg p-6 border"
            style={{ 
              backgroundColor: secondary?.hex || '#374151',
              borderColor: accent?.hex || '#6b7280'
            }}
          >
            <div className="space-y-4">
              <h4 
                className="text-lg font-semibold"
                style={{ color: getReadableTextColor(secondary?.hex || '#374151') }}
              >
                Featured Product
              </h4>
              <div 
                className="h-32 rounded-md"
                style={{ backgroundColor: neutral?.hex || '#9ca3af' }}
              />
              <p 
                className="text-sm opacity-80"
                style={{ color: getReadableTextColor(secondary?.hex || '#374151') }}
              >
                This is a sample description showing how text looks on your secondary color.
              </p>
              <Button 
                className="w-full text-sm font-medium rounded-md px-4 py-2 transition-colors"
                style={{ 
                  backgroundColor: accent?.hex || '#3b82f6',
                  color: getReadableTextColor(accent?.hex || '#3b82f6')
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: neutral?.hex || '#6b7280' }}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star 
                  className="w-5 h-5" 
                  style={{ color: accent?.hex || '#fbbf24' }}
                  fill={accent?.hex || '#fbbf24'}
                />
                <Star 
                  className="w-5 h-5" 
                  style={{ color: accent?.hex || '#fbbf24' }}
                  fill={accent?.hex || '#fbbf24'}
                />
                <Star 
                  className="w-5 h-5" 
                  style={{ color: accent?.hex || '#fbbf24' }}
                  fill={accent?.hex || '#fbbf24'}
                />
                <Star 
                  className="w-5 h-5" 
                  style={{ color: accent?.hex || '#fbbf24' }}
                  fill={accent?.hex || '#fbbf24'}
                />
                <Star 
                  className="w-5 h-5" 
                  style={{ color: accent?.hex || '#fbbf24' }}
                  fill={accent?.hex || '#fbbf24'}
                />
              </div>
              
              <h4 
                className="text-lg font-semibold"
                style={{ color: getReadableTextColor(neutral?.hex || '#6b7280') }}
              >
                Customer Review
              </h4>
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: getReadableTextColor(neutral?.hex || '#6b7280') }}
              >
                "Amazing quality and fantastic customer service. The colors work perfectly together and create a very professional look."
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <span 
                  className="text-sm font-medium"
                  style={{ color: getReadableTextColor(neutral?.hex || '#6b7280') }}
                >
                  Sarah Johnson
                </span>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 opacity-60" />
                  <Share2 className="w-4 h-4 opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Button Group Preview */}
        <div>
          <h5 className="text-sm font-medium text-gray-400 mb-4">Button Variations</h5>
          <div className="flex flex-wrap gap-3">
            <Button
              className="px-6 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: primary?.hex || '#3b82f6',
                color: getReadableTextColor(primary?.hex || '#3b82f6')
              }}
            >
              Primary
            </Button>
            <Button
              className="px-6 py-2 rounded-md text-sm font-medium border transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: secondary?.hex || '#6b7280',
                color: secondary?.hex || '#6b7280'
              }}
            >
              Secondary
            </Button>
            <Button
              className="px-6 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: accent?.hex || '#10b981',
                color: getReadableTextColor(accent?.hex || '#10b981')
              }}
            >
              Accent
            </Button>
            {otherColors[0] && (
              <Button
                className="px-6 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: otherColors[0].hex,
                  color: getReadableTextColor(otherColors[0].hex)
                }}
              >
                Custom
              </Button>
            )}
          </div>
        </div>

        {/* Color Bar */}
        <div>
          <h5 className="text-sm font-medium text-gray-400 mb-4">Color Harmony</h5>
          <div className="h-8 rounded-lg overflow-hidden flex shadow-lg">
            {palette.colors.map((color, index) => (
              <div
                key={index}
                className="flex-1 relative group"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                <div className="absolute bottom-1 left-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-75 px-1 py-0.5 rounded text-white">
                  {color.hex.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 