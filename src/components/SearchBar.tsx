import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { EASE } from "../lib/motion";
import { SearchIcon } from "./ui/search";
import { XIcon } from "./ui/x";
import { useIconHover } from "../lib/useIconHover";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();
  const clearIcon = useIconHover();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      // box-shadow only, so the expanding focus ring costs no layout. The dark
      // variant needs its own rule or dark:shadow-surface-dark wins over it.
      style={{ transition: reduced ? "none" : `box-shadow 150ms cubic-bezier(${EASE.join(",")})` }}
      className="flex h-8 w-full items-center gap-1.5 rounded-lg bg-white/90 px-2.5 shadow-surface backdrop-blur-md focus-within:shadow-[0_0_0_1px_#0C39F3,0_0_0_4px_rgb(12_57_243/0.16)] dark:bg-white/[0.08] dark:shadow-surface-dark dark:focus-within:shadow-[0_0_0_1px_#4B6BFF,0_0_0_4px_rgb(75_107_255/0.24)] sm:w-[280px]"
    >
      <SearchIcon size={16} className="p-0 text-neutral-400" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search"
        aria-label="Search icons"
        className="min-w-0 flex-1 bg-transparent optical-center text-[13px] leading-none text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          {...clearIcon.hoverProps}
          aria-label="Clear search"
          className="grid h-4 w-4 shrink-0 place-items-center rounded-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <XIcon ref={clearIcon.ref} size={14} className="p-0" />
        </button>
      ) : (
        <kbd className="grid h-4 w-4 shrink-0 place-items-center rounded-sm bg-black/[0.04] text-[12px] font-medium leading-none text-black/55 ring-1 ring-inset ring-black/10 dark:bg-white/10 dark:text-white/60 dark:ring-white/10">
          /
        </kbd>
      )}
    </div>
  );
}
