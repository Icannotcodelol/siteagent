"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface FontOption {
  name: string;
  value: string;
  preview?: string;
}

interface FontCategory {
  category: string;
  fonts: FontOption[];
}

const fontCategories: FontCategory[] = [
  {
    category: "Modern Sans-Serif",
    fonts: [
      { name: "Inter (Recommended)", value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", preview: "Modern & Clean" },
      { name: "Roboto", value: "'Roboto', sans-serif", preview: "Google's Robot Font" },
      { name: "Open Sans", value: "'Open Sans', sans-serif", preview: "Friendly & Approachable" },
      { name: "Lato", value: "'Lato', sans-serif", preview: "Warm & Humanist" },
      { name: "Montserrat", value: "'Montserrat', sans-serif", preview: "Urban & Geometric" },
      { name: "Nunito", value: "'Nunito', sans-serif", preview: "Rounded & Friendly" },
      { name: "Source Sans Pro", value: "'Source Sans Pro', sans-serif", preview: "Adobe's Clean Font" },
      { name: "Poppins", value: "'Poppins', sans-serif", preview: "Circular & Modern" },
    ]
  },
  {
    category: "Professional",
    fonts: [
      { name: "Arial", value: "Arial, Helvetica, sans-serif", preview: "Classic & Universal" },
      { name: "Helvetica", value: "Helvetica, Arial, sans-serif", preview: "Swiss Precision" },
      { name: "Verdana", value: "Verdana, Geneva, sans-serif", preview: "Screen Optimized" },
      { name: "Tahoma", value: "Tahoma, Geneva, sans-serif", preview: "Microsoft Classic" },
      { name: "Segoe UI", value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", preview: "Windows Modern" },
    ]
  },
  {
    category: "Serif",
    fonts: [
      { name: "Georgia", value: "Georgia, serif", preview: "Elegant & Readable" },
      { name: "Times New Roman", value: "'Times New Roman', Times, serif", preview: "Traditional News" },
      { name: "Merriweather", value: "'Merriweather', serif", preview: "Modern Serif" },
      { name: "Playfair Display", value: "'Playfair Display', serif", preview: "High Fashion" },
      { name: "Crimson Text", value: "'Crimson Text', serif", preview: "Book Typography" },
    ]
  },
  {
    category: "Monospace",
    fonts: [
      { name: "Courier New", value: "'Courier New', Courier, monospace", preview: "Classic Typewriter" },
      { name: "Monaco", value: "Monaco, 'Lucida Console', monospace", preview: "Apple Developer" },
      { name: "Fira Code", value: "'Fira Code', 'SF Mono', Monaco, monospace", preview: "Modern Code Font" },
      { name: "Source Code Pro", value: "'Source Code Pro', monospace", preview: "Adobe Code Font" },
    ]
  },
  {
    category: "Display & Creative",
    fonts: [
      { name: "Comfortaa", value: "'Comfortaa', cursive", preview: "Rounded & Playful" },
      { name: "Quicksand", value: "'Quicksand', sans-serif", preview: "Friendly Display" },
      { name: "Raleway", value: "'Raleway', sans-serif", preview: "Elegant & Thin" },
      { name: "Oswald", value: "'Oswald', sans-serif", preview: "Bold & Condensed" },
      { name: "Dancing Script", value: "'Dancing Script', cursive", preview: "Handwritten Style" },
    ]
  }
];

interface FontDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export default function FontDropdown({ label, value, onChange, description }: FontDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current selected font
  const getCurrentFont = () => {
    for (const category of fontCategories) {
      const font = category.fonts.find(f => f.value === value);
      if (font) return font;
    }
    return { name: "Custom Font", value, preview: "Custom Selection" };
  };

  const currentFont = getCurrentFont();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontSelect = (font: FontOption) => {
    onChange(font.value);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
      
      <div className="relative">
        {/* Selected Font Display */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div
                  className="text-white font-medium text-sm truncate"
                  style={{ fontFamily: currentFont.value }}
                >
                  {currentFont.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {currentFont.preview}
                </div>
              </div>
            </div>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            {fontCategories.map((category) => (
              <div key={category.category} className="border-b border-gray-700 last:border-b-0">
                <div className="px-4 py-2 bg-gray-750">
                  <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    {category.category}
                  </h4>
                </div>
                <div className="py-1">
                  {category.fonts.map((font) => {
                    const isSelected = font.value === value;
                    return (
                      <button
                        key={font.value}
                        onClick={() => handleFontSelect(font)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                          isSelected ? 'bg-purple-600/20 border-r-2 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm truncate ${
                              isSelected ? 'text-purple-300' : 'text-white'
                            }`}
                            style={{ fontFamily: font.value }}
                          >
                            {font.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: font.value }}>
                            {font.preview || "The quick brown fox jumps"}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckIcon className="h-4 w-4 text-purple-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 