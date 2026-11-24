import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';

/** Day/night switch. Shows the mode you'll switch *to*, and reports the current state via aria-pressed. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { m } = useI18n();
  const isDark = theme === 'dark';
  const label = isDark ? m.header.themeToLight : m.header.themeToDark;
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={m.header.nightMode}
      title={label}
    >
      {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
    </button>
  );
}
