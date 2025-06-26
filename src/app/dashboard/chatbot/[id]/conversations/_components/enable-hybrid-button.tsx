'use client'

export default function EnableHybridButton() {
  const handleClick = () => {
    const toggle = document.querySelector('[data-hybrid-toggle]') as HTMLButtonElement
    toggle?.click()
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
    >
      Enable Hybrid Mode
    </button>
  )
} 