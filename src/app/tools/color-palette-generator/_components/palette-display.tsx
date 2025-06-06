'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';
import { copyToClipboard, getReadableTextColor } from '../_lib/color-utils';
import type { ColorPalette } from '../_types/color';
import toast from 'react-hot-toast';

interface PaletteDisplayProps {
  palette: ColorPalette;
}

interface ColorCardProps {
  color: {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    name?: string;
  };
  index: number;
}

function ColorCard({ color, index }: ColorCardProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  
  const textColor = getReadableTextColor(color.hex);

  const handleCopy = async (value: string, format: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopiedFormat(format);
      toast.success(`${format} copied to clipboard!`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div 
        className="h-32 relative group cursor-pointer transition-all duration-200 hover:h-36"
        style={{ backgroundColor: color.hex }}
        onClick={() => handleCopy(color.hex, 'HEX')}
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ color: textColor }}
        >
          <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2 flex items-center space-x-2">
            {copiedFormat === 'HEX' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {copiedFormat === 'HEX' ? 'Copied!' : 'Click to copy'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-400 mb-1">HEX</div>
            <Button
              onClick={() => handleCopy(color.hex, 'HEX')}
              variant="ghost"
              size="sm"
              className="w-full justify-between text-left p-2 h-auto font-mono text-sm bg-gray-700/50 hover:bg-gray-700"
            >
              <span className="text-gray-200">{color.hex.toUpperCase()}</span>
              {copiedFormat === 'HEX' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </Button>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-400 mb-1">RGB</div>
            <Button
              onClick={() => handleCopy(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, 'RGB')}
              variant="ghost"
              size="sm"
              className="w-full justify-between text-left p-2 h-auto font-mono text-sm bg-gray-700/50 hover:bg-gray-700"
            >
              <span className="text-gray-200">
                {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
              </span>
              {copiedFormat === 'RGB' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </Button>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-400 mb-1">HSL</div>
            <Button
              onClick={() => handleCopy(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, 'HSL')}
              variant="ghost"
              size="sm"
              className="w-full justify-between text-left p-2 h-auto font-mono text-sm bg-gray-700/50 hover:bg-gray-700"
            >
              <span className="text-gray-200">
                {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
              </span>
              {copiedFormat === 'HSL' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </Button>
          </div>

          {color.name && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-1">Name</div>
              <div className="text-sm text-gray-300">{color.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaletteDisplay({ palette }: PaletteDisplayProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">{palette.name}</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{palette.colors.length} colors</span>
          <span>•</span>
          <span className="capitalize">{palette.source}</span>
          <span>•</span>
          <span>{palette.createdAt.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Color Overview Bar */}
      <div className="mb-8">
        <div className="h-20 rounded-lg overflow-hidden flex">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="flex-1 cursor-pointer hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
          ))}
        </div>
      </div>

      {/* Individual Color Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {palette.colors.map((color, index) => (
          <ColorCard key={index} color={color} index={index} />
        ))}
      </div>
    </div>
  );
} 