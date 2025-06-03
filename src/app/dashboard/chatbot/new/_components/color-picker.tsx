"use client";

import { HexColorPicker } from "react-colorful";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  description?: string;
}

export default function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open) {
        const target = e.target as Node;
        // Check if click is outside both the wrapper AND the popover
        const isOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(target);
        const isOutsidePopover = popoverRef.current && !popoverRef.current.contains(target);
        
        if (isOutsideWrapper && isOutsidePopover) {
          setOpen(false);
        }
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left });
    }
  }, [open]);

  const handleHexInput = (hex: string) => {
    if (!hex.startsWith("#")) hex = `#${hex}`;
    onChange(hex);
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}

      <div className="flex items-center space-x-3 relative">
        <button
          type="button"
          aria-label={`Choose ${label}`}
          onClick={() => setOpen((prev) => !prev)}
          className="w-12 h-12 rounded-lg border border-gray-600 flex-shrink-0"
          style={{ backgroundColor: value || "#9333ea" }}
          ref={buttonRef}
        />

        {/* Hex input */}
        <input
          type="text"
          value={value || "#9333ea"}
          onChange={(e) => handleHexInput(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-mono placeholder-gray-500"
          placeholder="#000000"
        />

        {/* Popover */}
        {open && createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[9999] rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-xl w-56"
            style={{ top: position.top, left: position.left }}
          >
            <HexColorPicker color={value || "#9333ea"} onChange={onChange} />
          </div>,
          document.body
        )}
      </div>
    </div>
  );
} 