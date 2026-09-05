'use client'

import { useEffect, useId, useRef, useState } from 'react'

import type { LanguageSelectorProps } from '@/features/home'
import { supportedLanguages } from '@/shared/constants'
import type { SupportedLanguage } from '@/types'

const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch',
  fr: 'Francais',
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    supportedLanguages.indexOf(value)
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  function selectLanguage(language: SupportedLanguage) {
    onChange(language)
    setActiveIndex(supportedLanguages.indexOf(language))
    setIsOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => {
        const direction = event.key === 'ArrowDown' ? 1 : -1
        return (
          (current + direction + supportedLanguages.length) %
          supportedLanguages.length
        )
      })
      return
    }

    if ((event.key === 'Enter' || event.key === ' ') && isOpen) {
      event.preventDefault()
      selectLanguage(supportedLanguages[activeIndex] ?? value)
    }
  }

  return (
    <div ref={containerRef} className="relative z-30 w-full sm:w-45">
      <button
        type="button"
        aria-label="Select search language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen ? `${listboxId}-${supportedLanguages[activeIndex]}` : undefined
        }
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleKeyDown}
        className={`group flex min-h-12 w-full items-center rounded-full border bg-canvas px-4 text-left shadow-sm outline-none transition duration-200 hover:border-meadow/60 hover:shadow-md focus-visible:ring-4 focus-visible:ring-meadow/15 ${
          isOpen ? 'border-meadow ring-4 ring-meadow/10' : 'border-oat/70'
        }`}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-meadow/10 text-meadow transition group-hover:bg-meadow/15">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-[1.15rem]"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14.4 14.4 0 0 1 0 18M12 3a14.4 14.4 0 0 0 0 18" />
          </svg>
        </span>
        <span className="ml-3 min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">
            {languageNames[value]}
          </span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`ml-3 size-4 shrink-0 text-ink/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search language"
          className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-[1.25rem] border border-oat/70 bg-white/95 p-2 shadow-[0_18px_50px_rgba(25,54,45,0.18)] backdrop-blur-md"
        >
          {supportedLanguages.map((language, index) => {
            const isSelected = language === value
            const isActive = index === activeIndex

            return (
              <button
                key={language}
                id={`${listboxId}-${language}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectLanguage(language)}
                className={`flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm transition ${
                  isSelected
                    ? 'bg-ink font-semibold text-white shadow-sm'
                    : isActive
                      ? 'bg-oat/45 text-ink'
                      : 'text-ink/80 hover:bg-oat/35'
                }`}
              >
                <span
                  className={`mr-3 grid size-7 place-items-center rounded-lg text-[0.65rem] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-white/15 text-white'
                      : 'bg-canvas text-meadow'
                  }`}
                >
                  {language}
                </span>
                <span className="flex-1">{languageNames[language]}</span>
                {isSelected ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.292a1 1 0 0 1 .004 1.414l-8 8.05a1 1 0 0 1-1.42 0l-4-4.025a1 1 0 0 1 1.42-1.41L8 12.63l7.296-7.334a1 1 0 0 1 1.408-.004Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
