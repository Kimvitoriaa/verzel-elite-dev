'use client';

import { useState, useEffect } from 'react';

export default function AccessibilityBar() {
  const [highContrast, setHighContrast] = useState(false);
  const [focusedMode, setFocusedMode] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (highContrast) {
      root.classList.add('contrast-125', 'brightness-90');
    } else {
      root.classList.remove('contrast-125', 'brightness-90');
    }

    if (focusedMode) {
      root.classList.add('grayscale');
    } else {
      root.classList.remove('grayscale');
    }

    if (largeText) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '';
    }
  }, [highContrast, focusedMode, largeText]);

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-300 py-2 px-4 flex flex-wrap items-center justify-between gap-2 z-50 relative">
      <span className="font-semibold text-purple-400">♿ Acessibilidade:</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`px-2 py-1 rounded transition ${
            highContrast ? 'bg-purple-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          {highContrast ? '✓ Sensibilidade à Luz (Ativo)' : 'Sensibilidade à Luz'}
        </button>

        <button
          onClick={() => setFocusedMode(!focusedMode)}
          className={`px-2 py-1 rounded transition ${
            focusedMode ? 'bg-purple-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          {focusedMode ? '✓ Modo Focado/Autismo (Ativo)' : 'Modo Focado/Autismo'}
        </button>

        <button
          onClick={() => setLargeText(!largeText)}
          className={`px-2 py-1 rounded transition ${
            largeText ? 'bg-purple-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          {largeText ? '✓ Baixa Visão (A+)' : 'Baixa Visão (A+)'}
        </button>
      </div>
    </div>
  );
}