import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import ThiingsGrid, { type ItemConfig } from "./ThiingsGrid";
import { IconCard } from "./IconCard";
import type { Icon } from "../data/icons.generated";

const useGridSize = () => {
  const [size, setSize] = useState(() => (window.innerWidth < 640 ? 150 : 210));

  useEffect(() => {
    const onResize = () => setSize(window.innerWidth < 640 ? 150 : 210);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
};

// Swapping filteredIcons repaints every cell at once, which reads as a hard cut.
// One WAAPI cross-fade on the wrapper covers the swap without touching the cells,
// so the grid keeps its per-cell render path free of animation work.
function useFilterCrossfade(icons: Icon[]) {
  const [shown, setShown] = useState(icons);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (icons === shown) return;
    const wrapper = wrapperRef.current;
    if (reduced || !wrapper) return setShown(icons);

    let cancelled = false;
    const out = wrapper.animate(
      [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.985)" }],
      { duration: 130, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }
    );

    out.finished
      .then(() => {
        if (cancelled) return;
        setShown(icons);
        wrapper.animate(
          [{ opacity: 0, transform: "scale(1.008)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
        );
        out.cancel();
      })
      .catch(() => {}); // cancel() rejects finished; nothing to do

    // A fast typist can change the filter mid-fade; drop the stale animation
    // rather than stacking a second one on the same element.
    return () => {
      cancelled = true;
      out.cancel();
    };
  }, [icons, shown, reduced]);

  return { shown, wrapperRef };
}

type IconGridProps = {
  icons: Icon[];
  onSelect: (icon: Icon) => void;
};

export function IconGrid({ icons, onSelect }: IconGridProps) {
  const gridSize = useGridSize();
  const { shown, wrapperRef } = useFilterCrossfade(icons);

  // The modulo tiling is what makes a finite set feel infinite; filtering just
  // swaps the array and the same mechanism keeps working.
  const renderItem = useCallback(
    ({ gridIndex, isMoving }: ItemConfig) => (
      <IconCard icon={shown[((gridIndex % shown.length) + shown.length) % shown.length]} isMoving={isMoving} onSelect={onSelect} />
    ),
    [shown, onSelect]
  );

  // The wrapper stays mounted either way so the crossfade also covers the
  // transition into and out of the empty state.
  return (
    <div ref={wrapperRef} className="h-full w-full">
      {shown.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <p className="text-base font-medium text-neutral-800 dark:text-neutral-100">No icons match that name</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Try a different search or clear your filters.</p>
        </div>
      ) : (
        <ThiingsGrid gridSize={gridSize} renderItem={renderItem} className="h-full w-full" />
      )}
    </div>
  );
}
