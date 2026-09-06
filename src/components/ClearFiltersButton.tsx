import { AnimatePresence } from "motion/react";
import { MotionButton } from "./MotionButton";
import { ArrowLeftIcon } from "./ui/arrow-left";
import { useIconHover } from "../lib/useIconHover";

type ClearFiltersButtonProps = {
  visible: boolean;
  onClear: () => void;
};

// The wrapper owns the centering transform so Motion's inline transform on the
// button doesn't fight Tailwind's translate utility.
export function ClearFiltersButton({ visible, onClear }: ClearFiltersButtonProps) {
  const icon = useIconHover();

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
      <AnimatePresence>
        {visible && (
          <MotionButton
            key="clear"
            onClick={onClear}
            {...icon.hoverProps}
            className="pointer-events-auto pl-2.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <ArrowLeftIcon ref={icon.ref} size={14} className="p-0 text-neutral-500 dark:text-neutral-400" />
            Back to all icons
          </MotionButton>
        )}
      </AnimatePresence>
    </div>
  );
}
