import { useCallback, useRef, useState } from "react";
import { Header } from "./components/Header";
import { IconGrid } from "./components/IconGrid";
import { IconDrawer } from "./components/IconDrawer";
import { ClearFiltersButton } from "./components/ClearFiltersButton";
import { EdgeBlur } from "./components/EdgeBlur";
import { SmoothWheel } from "./components/SmoothWheel";
import { useDebounced } from "./lib/useDebounced";
import { useFilteredIcons } from "./lib/useFilteredIcons";
import { useTheme } from "./lib/useTheme";
import type { Icon } from "./data/icons.generated";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ReadonlySet<string>>(new Set());
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [theme, toggleTheme] = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);
  // The drawer portals into the rounded card rather than the body, so it slides
  // from the card's edge and is clipped by its corners instead of the viewport's.
  // State, not a ref: the portal target must be resolved on a render pass.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const debouncedQuery = useDebounced(query);
  const filteredIcons = useFilteredIcons(selectedCategories, debouncedQuery);
  const hasFilters = selectedCategories.size > 0 || query.trim() !== "";

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((current) => {
      const next = new Set(current);
      if (!next.delete(category)) next.add(category);
      return next;
    });
  }, []);

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setQuery("");
  };

  const exploreCategory = (category: string) => {
    setSelectedIcon(null);
    setSelectedCategories(new Set([category]));
    setQuery("");
  };

  return (
    <div className="h-full p-2">
      <div
        ref={setContainer}
        className="relative h-full overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.10)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.10)]"
      >
        <EdgeBlur />

        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col">
          <div className="pointer-events-auto">
            <Header
              query={query}
              onQueryChange={setQuery}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={() => setSelectedCategories(new Set())}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </div>
        </div>

        <div ref={gridRef} tabIndex={-1} className="absolute inset-0 z-0 outline-none">
          <SmoothWheel>
            <IconGrid icons={filteredIcons} onSelect={setSelectedIcon} />
          </SmoothWheel>
        </div>
      </div>

      <ClearFiltersButton visible={hasFilters} onClear={clearFilters} />
      <IconDrawer
        icon={selectedIcon}
        onClose={() => setSelectedIcon(null)}
        onExplore={exploreCategory}
        restoreFocusTo={gridRef}
        container={container}
      />
    </div>
  );
}
