'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/app/_components/ui/button';
import { ImageUploader } from './image-uploader';
import { PaletteDisplay } from './palette-display';
import { PalettePreview } from './palette-preview';
import { generateRandomPalette, extractColorsFromImage } from '../_lib/color-utils';
import type { ColorPalette } from '../_types/color';
import { Download, Shuffle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      const extractedPalette = await extractColorsFromImage(file);
      setPalette(extractedPalette);
      
      // Track analytics
      fetch('/api/tools/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'color-palette-generator',
          action: 'image_upload',
          metadata: { 
            fileSize: file.size,
            fileType: file.type,
            colorsExtracted: extractedPalette.colors.length
          }
        })
      }).catch(console.error);
      
      toast.success('Colors extracted successfully!');
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast.error('Failed to extract colors from image');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleGenerateRandom = useCallback(() => {
    const randomPalette = generateRandomPalette();
    setPalette(randomPalette);
    setUploadedImage(null);
    
    // Track analytics
    fetch('/api/tools/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'color-palette-generator',
        action: 'random_generate',
        metadata: { 
          harmonyType: randomPalette.name,
          colorsGenerated: randomPalette.colors.length
        }
      })
    }).catch(console.error);
    
    toast.success('Random palette generated!');
  }, []);

  const handleExportPalette = useCallback(async () => {
    if (!paletteRef.current || !palette) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(paletteRef.current, {
        backgroundColor: '#111827',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `color-palette-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Palette exported successfully!');
    } catch (error) {
      console.error('Error exporting palette:', error);
      toast.error('Failed to export palette');
    }
  }, [palette]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to SiteAgent</span>
              </Link>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Color Palette Generator
              </h1>
              <p className="text-gray-400 mt-2">
                Extract colors from images or generate random harmonious palettes
              </p>
            </div>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
              <h2 className="text-xl font-semibold mb-6">Upload Image or Generate Random</h2>
              
              <div className="space-y-6">
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  isProcessing={isProcessing}
                  uploadedImage={uploadedImage}
                />
                
                <div className="flex items-center">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="px-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>
                
                <Button
                  onClick={handleGenerateRandom}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Generate Random Palette
                </Button>
              </div>
            </div>

            {/* Export Controls */}
            {palette && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8">
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                <Button
                  onClick={handleExportPalette}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export as PNG
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Palette Display */}
          <div className="space-y-8">
            {palette ? (
              <div ref={paletteRef}>
                <PaletteDisplay palette={palette} />
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
                <div className="text-gray-400">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No palette generated yet</h3>
                  <p className="text-sm">Upload an image or generate a random palette to get started</p>
                </div>
              </div>
            )}

            {/* Live Preview */}
            {palette && (
              <PalettePreview palette={palette} />
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 bg-gray-900/30 rounded-2xl border border-gray-800 p-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">How to Use the Color Palette Generator</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create beautiful color schemes for your design projects in seconds
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
              <p className="text-gray-400 text-sm">
                Upload any JPG or PNG image to extract its dominant colors automatically
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Copy Colors</h3>
              <p className="text-gray-400 text-sm">
                Click on any color to copy its HEX or RGB code to your clipboard
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Export & Use</h3>
              <p className="text-gray-400 text-sm">
                Export your palette as a PNG image or use the preview to see it in action
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl border border-blue-500/20 p-12">
          <h2 className="text-2xl font-bold mb-4">Need an AI Chatbot for Your Website?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            SiteAgent helps you add intelligent AI chatbots to your website in minutes. 
            Boost engagement and automate customer support.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started with SiteAgent
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
} 