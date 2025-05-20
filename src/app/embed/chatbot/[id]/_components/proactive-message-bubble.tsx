'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'

interface ProactiveMessageBubbleProps {
  messageContent: string
  onClose: () => void
  onClick: () => void
  isVisible: boolean
  bubbleColor?: string | null
}

export default function ProactiveMessageBubble({
  messageContent,
  onClose,
  onClick,
  isVisible,
  bubbleColor,
}: ProactiveMessageBubbleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Ensure this only runs on the client
    setMounted(true)
  }, [])

  if (!mounted || !isVisible) {
    return null
  }

  // Determine text color based on bubbleColor for contrast
  let textColorClassName = 'text-gray-800 dark:text-gray-100'; // Default
  let closeButtonBgClass = 'bg-gray-200 dark:bg-gray-700';
  let closeButtonTextClass = 'text-gray-600 dark:text-gray-400';
  let closeButtonHoverBgClass = 'hover:bg-gray-300 dark:hover:bg-gray-600';
  let closeButtonHoverTextClass = 'hover:text-gray-800 dark:hover:text-gray-200';


  if (bubbleColor) {
    try {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      const rgbColor = hexToRgb(bubbleColor);
      if (rgbColor) {
        const luminance = (0.299 * rgbColor.r + 0.587 * rgbColor.g + 0.114 * rgbColor.b) / 255;
        if (luminance > 0.5) { // Light background
          textColorClassName = 'text-black';
          closeButtonBgClass = 'bg-gray-300'; // Lighter close button for light bg
          closeButtonTextClass = 'text-gray-700';
          closeButtonHoverBgClass = 'hover:bg-gray-400';
          closeButtonHoverTextClass = 'hover:text-black';
        } else { // Dark background
          textColorClassName = 'text-white';
          closeButtonBgClass = 'bg-gray-700'; // Darker close button for dark bg (or keep default dark theme)
          closeButtonTextClass = 'text-gray-300';
          closeButtonHoverBgClass = 'hover:bg-gray-600';
          closeButtonHoverTextClass = 'hover:text-white';
        }
      }
    } catch (e) {
      console.error("Error processing bubble color for text contrast", e);
      // Fallback to defaults if color string is invalid
    }
  }

  const bubbleStyle = {
    opacity: 1,
    transform: 'translateY(0)',
    backgroundColor: bubbleColor || undefined, // Use bubbleColor if provided
  };

  const Bubble = (
    <div
      className={`fixed bottom-24 right-5 z-[2147483647] max-w-xs cursor-pointer rounded-lg p-4 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl ${!bubbleColor ? 'bg-white dark:bg-gray-800' : ''}`}
      style={bubbleStyle} // Apply dynamic style for background color
      onClick={onClick}
      role="alertdialog"
      aria-labelledby="proactive-message-content"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className={`absolute -right-1 -top-1 rounded-full p-0.5 ${closeButtonBgClass} ${closeButtonTextClass} ${closeButtonHoverBgClass} ${closeButtonHoverTextClass}`}
        aria-label="Close proactive message"
      >
        <XIcon size={16} />
      </button>
      <p id="proactive-message-content" className={`text-sm whitespace-pre-wrap ${textColorClassName}`}>
        {messageContent}
      </p>
    </div>
  )

  // Use portal to render at document.body to avoid stacking context issues
  return createPortal(Bubble, document.body)
} 