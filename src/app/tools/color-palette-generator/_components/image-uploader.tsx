'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
  uploadedImage?: string | null;
}

export function ImageUploader({ onImageUpload, isProcessing, uploadedImage }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      onImageUpload(imageFile);
    }
  }, [onImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (uploadedImage) {
    return (
      <div className="relative">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Uploaded Image</h3>
            <Button
              onClick={clearImage}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
        ${isDragOver 
          ? 'border-blue-400 bg-blue-400/5' 
          : 'border-gray-600 hover:border-gray-500'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-gray-800 rounded-xl flex items-center justify-center">
          {isProcessing ? (
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">
            {isProcessing ? 'Extracting colors...' : 'Upload an image'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {isProcessing 
              ? 'Please wait while we analyze your image'
              : 'Drag and drop an image here, or click to browse'
            }
          </p>
          <p className="text-gray-500 text-xs">
            Supports JPG, PNG • Max 10MB
          </p>
        </div>

        {!isProcessing && (
          <Button
            onClick={handleUploadClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        )}
      </div>
    </div>
  );
} 