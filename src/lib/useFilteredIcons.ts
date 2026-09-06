import { useMemo } from "react";
import { icons, type Icon } from "../data/icons.generated";

export function useFilteredIcons(categories: ReadonlySet<string>, query: string): Icon[] {
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (categories.size === 0 && !needle) return icons;
    return icons.filter(
      (icon) =>
        (categories.size === 0 || categories.has(icon.category)) &&
        (!needle || icon.name.toLowerCase().includes(needle))
    );
  }, [categories, query]);
}
