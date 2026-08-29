import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';
import { LanguageCode, LanguageOption } from '../../types';
import {
  LanguageService,
  SUPPORTED_LANGUAGES,
} from '../../services/LanguageService';

interface LanguageSwitcherProps {
  variant?: 'header' | 'topbar' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'topbar',
  className = '',
}) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() =>
    LanguageService.getCurrentLanguage()
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.code) {
        setCurrentLang(e.detail.code);
      }
    };
    window.addEventListener('infonews:language-changed', handleLangChange);
    return () =>
      window.removeEventListener('infonews:language-changed', handleLangChange);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setCurrentLang(code);
    LanguageService.setLanguage(code);
    setIsOpen(false);
  };

  const activeOption = LanguageService.getLanguageOption(currentLang);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Hidden Google Translate Hook Container */}
      <div id="google_translate_element" className="hidden" />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg transition-all cursor-pointer select-none active:scale-95 ${
          variant === 'topbar'
            ? 'px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-2xs shrink-0'
            : variant === 'header'
            ? 'px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs'
            : 'w-full justify-between px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200'
        }`}
        title="भाषा बदला (Change Language)"
      >
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-red-400 shrink-0 animate-spin-slow" />
          <span className="hidden xs:inline">{activeOption.flagOrIcon}</span>
          <span className="font-bold truncate max-w-[50px] xs:max-w-none">{activeOption.name}</span>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180 text-red-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 sm:w-56 max-w-[calc(100vw-24px)] rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-scaleUp text-xs text-slate-800">
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Globe className="h-3 w-3 text-red-600" />
              भाषा निवडा (Select Language)
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              ६ भाषा
            </span>
          </div>

          <div className="space-y-1 mt-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-red-50 text-red-900 font-black'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flagOrIcon}</span>
                    <div>
                      <span className="block font-bold text-xs leading-tight">
                        {lang.name}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {lang.englishName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500">
                      {lang.scriptLabel}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 px-2 text-[10px] text-slate-400 text-center">
            🌐 Powered by InfoNews & Neural Translation
          </div>
        </div>
      )}
    </div>
  );
};
