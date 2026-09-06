import { motion, useReducedMotion } from "motion/react";
import { CELL, NONE } from "../lib/motion";
import { CategoryFilter } from "./CategoryFilter";
import { SearchBar } from "./SearchBar";
import { MoonIcon } from "./ui/moon";
import { SunIcon } from "./ui/sun";
import { useIconHover } from "../lib/useIconHover";

const X_PATH =
  "M12.6 0h2.44L9.7 6.13 16 14.46h-4.95l-3.85-5.04-4.44 5.04H.32l5.72-6.55L0 0h5.08l3.5 4.63L12.6 0Zm-.87 12.98h1.35L4.34 1.4H2.86l8.87 11.58Z";

type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  selectedCategories: ReadonlySet<string>;
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function Header({
  query,
  onQueryChange,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const reduced = useReducedMotion();
  const themeIcon = useIconHover();

  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="mr-auto flex shrink-0 items-center gap-3">
        <img
          src={theme === "dark" ? "/assets/Brand/logo-dark.png" : "/assets/Brand/logo-light.png"}
          alt="Objectly"
          width={124}
          height={32}
          className="h-8 w-[124px] shrink-0 object-contain"
        />
        <motion.a
          href="https://x.com/pixelyokai"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Objectly on X"
          whileHover={reduced ? undefined : { scale: 1.15, rotate: -6 }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          transition={reduced ? NONE : CELL}
          className="grid h-7 w-7 place-items-center rounded-lg text-neutral-400 transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
            <path d={X_PATH} />
          </svg>
        </motion.a>
      </div>

      <div className="order-last w-full sm:order-none sm:w-auto">
        <SearchBar value={query} onChange={onQueryChange} />
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          whileHover={reduced ? undefined : { scale: 1.08 }}
          transition={reduced ? NONE : CELL}
          {...themeIcon.hoverProps}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/90 shadow-surface backdrop-blur-md dark:bg-white/[0.08] dark:shadow-surface-dark"
        >
          {theme === "dark" ? (
            <MoonIcon ref={themeIcon.ref} size={18} className="p-0 text-neutral-400" />
          ) : (
            <SunIcon ref={themeIcon.ref} size={18} className="p-0 text-neutral-400" />
          )}
        </motion.button>
        <CategoryFilter selected={selectedCategories} onToggle={onToggleCategory} onClear={onClearCategories} />
      </div>
    </header>
  );
}
