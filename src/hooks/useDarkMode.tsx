/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('elo-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement; // applies to <html>
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('elo-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('elo-theme', 'light');
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode: () => setIsDarkMode(prev => !prev)
  };
}
