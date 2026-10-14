'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import {
    themes,
    ThemeValue,
    generateThemeCSSVars,
    COLOR_THEME_STORAGE_KEY,
    DEFAULT_COLOR_THEME,
} from '@/lib/themes';

/**
 * Paleta de cores (ocean, sunset, ...). É um eixo separado do modo claro/escuro,
 * que fica com o next-themes; por isso este provider continua existindo.
 */
interface CustomThemeContextType {
    currentTheme: ThemeValue;
    setTheme: (theme: ThemeValue) => void;
    availableThemes: typeof themes;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener('storage', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

function readSavedTheme(): ThemeValue {
    try {
        const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
        if (saved && saved in themes) return saved as ThemeValue;
    } catch {
        // localStorage indisponível: usa o padrão
    }
    return DEFAULT_COLOR_THEME;
}

function saveTheme(theme: ThemeValue) {
    try {
        localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
    } catch {
        // localStorage indisponível: o tema vale só nesta sessão
    }
    listeners.forEach((listener) => listener());
}

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    // resolvedTheme já resolve 'system' e acompanha a preferência do sistema
    const { resolvedTheme } = useTheme();
    const currentTheme = useSyncExternalStore(subscribe, readSavedTheme, () => DEFAULT_COLOR_THEME);

    // Aplica as variáveis CSS no root quando a paleta ou o modo mudam
    // (no primeiro load o script inline do layout já aplicou, evitando flash)
    useEffect(() => {
        if (!resolvedTheme) return;

        const cssVars = generateThemeCSSVars(themes[currentTheme], resolvedTheme === 'dark');
        const root = document.documentElement;
        Object.entries(cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        document.body.style.letterSpacing = 'var(--tracking-normal)';
    }, [currentTheme, resolvedTheme]);

    return (
        <CustomThemeContext.Provider
            value={{
                currentTheme,
                setTheme: saveTheme,
                availableThemes: themes,
            }}
        >
            {children}
        </CustomThemeContext.Provider>
    );
}

export function useCustomTheme() {
    const context = useContext(CustomThemeContext);
    if (!context) {
        throw new Error('useCustomTheme must be used within a CustomThemeProvider');
    }
    return context;
}
