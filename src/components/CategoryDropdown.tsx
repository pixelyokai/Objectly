import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, EXIT, NONE, NUDGE, OPEN, SLIDE } from "../lib/motion";
import { CheckIcon } from "./ui/check";
import { ChevronDownIcon } from "./ui/chevron-down";
import { useIconHover } from "../lib/useIconHover";

const ROW_H = 32;
const TYPEAHEAD_MS = 600;

type DropdownItem = { value: string; label: string; selected: boolean };

type CategoryDropdownProps = {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  triggerLabel?: string;
};

export function CategoryDropdown({ items, onSelect, triggerLabel = "Categories" }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const reduced = useReducedMotion();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });
  const chevron = useIconHover();

  useEffect(() => {
    if (!open) return setActiveIndex(-1);

    const onPointerDown = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onBlur = () => setOpen(false);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("blur", onBlur);
    };
  }, [open]);

  const move = (delta: number) =>
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return items.length - 1;
      if (next >= items.length) return 0;
      return next;
    });

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        return move(1);
      case "ArrowUp":
        event.preventDefault();
        return move(-1);
      case "Home":
        event.preventDefault();
        return setActiveIndex(0);
      case "End":
        event.preventDefault();
        return setActiveIndex(items.length - 1);
      case "Enter":
      case " ":
        event.preventDefault();
        if (activeIndex >= 0) onSelect(items[activeIndex].value);
        return;
      case "Escape":
      case "Tab":
        return setOpen(false);
    }

    if (event.key.length !== 1) return;
    const now = Date.now();
    typeahead.current.buffer = now - typeahead.current.at > TYPEAHEAD_MS ? event.key : typeahead.current.buffer + event.key;
    typeahead.current.at = now;
    const match = items.findIndex((item) => item.label.toLowerCase().startsWith(typeahead.current.buffer.toLowerCase()));
    if (match >= 0) setActiveIndex(match);
  };

  const panelMotion = useMemo(
    () =>
      reduced
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: NONE }
        : {
            initial: { opacity: 0, scale: 0.94, y: -8, filter: "blur(4px)" },
            animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
            exit: { opacity: 0, scale: 0.97, y: -6, filter: "blur(2px)", transition: { duration: 0.12, ease: EXIT } },
            transition: { ...OPEN, opacity: { duration: 0.12, ease: EASE } },
          },
    [reduced]
  );

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        {...chevron.hoverProps}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-b from-white to-black/[0.04] pl-3 pr-2 optical-center text-[13px] font-medium leading-none text-zinc-900 shadow-surface backdrop-blur-md dark:from-white/10 dark:to-white/[0.04] dark:text-neutral-100 dark:shadow-surface-dark"
      >
        <span>{triggerLabel}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduced ? NONE : NUDGE} className="flex">
          <ChevronDownIcon ref={chevron.ref} size={14} className="p-0 text-neutral-500 dark:text-neutral-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            {...panelMotion}
            id={listId}
            role="listbox"
            aria-label="Filter by pack"
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            style={{ transformOrigin: "top left" }}
            className="absolute right-0 top-[calc(100%+6px)] z-40 w-[220px] overflow-hidden rounded-lg bg-white/70 py-1 shadow-panel backdrop-blur-md dark:bg-white/[0.08] dark:shadow-panel-dark"
          >
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-1 top-1 rounded bg-black/[0.06] dark:bg-white/[0.10]"
              style={{ height: ROW_H }}
              animate={{ y: activeIndex * ROW_H, opacity: activeIndex < 0 ? 0 : 1 }}
              transition={reduced ? NONE : SLIDE}
            />
            {items.map((item, index) => (
              <li
                key={item.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={item.selected}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => onSelect(item.value)}
                className="relative flex h-8 cursor-pointer items-center justify-between px-3 optical-center text-[14px] leading-none text-neutral-800 dark:text-neutral-100"
              >
                <span className={item.selected ? "font-medium" : undefined}>{item.label}</span>
                {item.selected && <CheckIcon size={16} className="p-0 text-neutral-800 dark:text-neutral-200" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
