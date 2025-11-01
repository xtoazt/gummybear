import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const DAISYUI_THEMES = [
  "monochrome",
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
] as const;

export function ThemeSwitcher() {
  const { currentTheme, changeTheme: changeThemeHook } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const changeTheme = (theme: string) => {
    changeThemeHook(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-sm btn-ghost gap-2"
      >
        <span className="text-lg">🎨</span>
        <span className="hidden sm:inline">{currentTheme}</span>
      </motion.button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-12 z-50 w-64 max-h-96 overflow-y-auto rounded-lg bg-base-100 shadow-2xl border border-base-300 p-2"
          >
            <div className="text-xs font-semibold text-base-content/60 px-2 py-1 mb-1 uppercase tracking-wide">
              Choose Theme ({DAISYUI_THEMES.length} available)
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-80 overflow-y-auto custom-scrollbar">
              {DAISYUI_THEMES.map((theme) => (
                <motion.button
                  key={theme}
                  onClick={() => changeTheme(theme)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`btn btn-xs justify-start ${
                    currentTheme === theme 
                      ? 'btn-primary btn-active' 
                      : 'btn-ghost'
                  }`}
                >
                  <span className="capitalize text-xs">{theme}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

