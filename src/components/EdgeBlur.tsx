const EDGES = [
  { position: "inset-x-0 top-0 h-16 min-[390px]:h-24", direction: "to bottom" },
  { position: "inset-x-0 bottom-0 h-16 min-[390px]:h-24", direction: "to top" },
  { position: "inset-y-0 left-0 w-12 min-[390px]:w-20", direction: "to right" },
  { position: "inset-y-0 right-0 w-12 min-[390px]:w-20", direction: "to left" },
];

// Sits inside the rounded container so the blur follows its corners rather than
// the viewport. Pointer-events stay off so the grid drags through it; with no
// backdrop-filter support the strips are empty transparent divs, never blocks.
export function EdgeBlur() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {EDGES.map(({ position, direction }) => {
        const mask = `linear-gradient(${direction}, black, transparent)`;
        return (
          <div
            key={direction}
            className={`absolute ${position} supports-[backdrop-filter]:backdrop-blur-[7px] min-[390px]:supports-[backdrop-filter]:backdrop-blur-[10px]`}
            // translateZ promotes each strip to its own compositor layer so the
            // backdrop-filter is not re-rasterised against the grid every frame.
            style={{ maskImage: mask, WebkitMaskImage: mask, transform: "translateZ(0)" }}
          />
        );
      })}
    </div>
  );
}
