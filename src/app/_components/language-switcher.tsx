"use client";

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
]

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')

  useEffect(() => {
    // Detect current language from URL
    const pathSegments = pathname.split('/')
    const langCode = pathSegments[1]
    
    if (LANGUAGES.find(lang => lang.code === langCode)) {
      setCurrentLang(langCode)
    } else {
      setCurrentLang('en')
    }
  }, [pathname])

  const handleLanguageChange = (langCode: string) => {
    // Set language preference cookie
    document.cookie = `language-preference=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}`
    
    // Redirect to the new language version
    const pathSegments = pathname.split('/')
    const currentLangCode = pathSegments[1]
    
    if (LANGUAGES.find(lang => lang.code === currentLangCode)) {
      // Replace current language with new language
      pathSegments[1] = langCode === 'en' ? '' : langCode
      const newPath = pathSegments.filter(Boolean).join('/')
      router.push(`/${newPath}`)
    } else {
      // Add language prefix
      if (langCode === 'en') {
        router.push(pathname)
      } else {
        router.push(`/${langCode}${pathname}`)
      }
    }
    
    setIsOpen(false)
  }

  const currentLanguage = LANGUAGES.find(lang => lang.code === currentLang) || LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3
                    ${currentLang === lang.code ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700'}
                  `}
                  role="menuitem"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 