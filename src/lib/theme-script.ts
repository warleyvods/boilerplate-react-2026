import { themes, generateThemeCSSVars, COLOR_THEME_STORAGE_KEY, DEFAULT_COLOR_THEME } from './themes';

/**
 * Script inline que roda ANTES do React para aplicar a paleta salva sem "flash".
 * As variáveis de cada paleta são geradas a partir de themes.ts (fonte única).
 * A classe `dark` fica a cargo do next-themes.
 */
export function createThemeScript() {
    const cssVarsByTheme = Object.fromEntries(
        Object.entries(themes).map(([name, theme]) => [
            name,
            { light: generateThemeCSSVars(theme, false), dark: generateThemeCSSVars(theme, true) },
        ])
    );

    return `(function () {
  try {
    var themes = ${JSON.stringify(cssVarsByTheme)};
    var name = localStorage.getItem(${JSON.stringify(COLOR_THEME_STORAGE_KEY)});
    if (!themes[name]) name = ${JSON.stringify(DEFAULT_COLOR_THEME)};
    var mode = localStorage.getItem('theme');
    var isDark = mode === 'dark' || (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var vars = themes[name][isDark ? 'dark' : 'light'];
    var root = document.documentElement;
    Object.keys(vars).forEach(function (key) { root.style.setProperty(key, vars[key]); });
  } catch (e) {}
})();`;
}
