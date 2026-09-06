import { memo, useState } from "react";
import type { Icon } from "../data/icons.generated";

type IconCardProps = {
  icon: Icon;
  isMoving: boolean;
  onSelect: (icon: Icon) => void;
};

// CSS-only hover: hundreds of these are mounted at once, so Motion springs here
// would cost the grid its drag performance.
export const IconCard = memo(function IconCard({ icon, isMoving, onSelect }: IconCardProps) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => !isMoving && onSelect(icon)}
      className={`group absolute inset-1 flex items-center justify-center rounded-2xl transition-transform duration-150 ${
        isMoving ? "" : "hover:scale-[1.04]"
      }`}
    >
      {failed ? (
        <span className="px-2 text-center text-xs text-neutral-400">{icon.name}</span>
      ) : (
        <img
          src={icon.previewSrc}
          alt={icon.name}
          width={160}
          height={160}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
      <span
        className={`pointer-events-none absolute bottom-1 max-w-full truncate rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-neutral-700 opacity-0 shadow-surface transition-opacity duration-150 dark:bg-neutral-800/90 dark:text-neutral-200 ${
          isMoving ? "" : "group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        {icon.name}
      </span>
    </button>
  );
});
