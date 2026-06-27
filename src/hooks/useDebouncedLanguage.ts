import { useEffect, useState } from 'react';
import { detectLanguage, getMonacoLanguage } from '@/utils/languageDetection';

export function useDebouncedLanguage(code: string, delay = 300) {
  const [detected, setDetected] = useState('javascript');
  useEffect(() => {
    if (code.trim().length < 30) return;
    const t = setTimeout(() => {
      const lang = detectLanguage(code);
      if (lang && lang !== 'general') setDetected(lang);
    }, delay);
    return () => clearTimeout(t);
  }, [code, delay]);
  return { language: detected, monaco: getMonacoLanguage(detected) };
}
