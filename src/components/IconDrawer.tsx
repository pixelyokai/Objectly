import type { RefObject } from "react";
import { Drawer } from "vaul";
import type { Icon } from "../data/icons.generated";
import { descriptions } from "../data/descriptions";
import { useDownload } from "../lib/useDownload";
import { useIconHover } from "../lib/useIconHover";
import { MotionButton } from "./MotionButton";
import { ArrowRightIcon } from "./ui/arrow-right";
import { DownloadIcon } from "./ui/download";
import { XIcon } from "./ui/x";

type IconDrawerProps = {
  icon: Icon | null;
  onClose: () => void;
  onExplore: (category: string) => void;
  restoreFocusTo: RefObject<HTMLElement | null>;
  container: HTMLElement | null;
};

// Controlled, not Drawer.Trigger — the trigger is a cell inside ThiingsGrid's
// virtualized renderer and can unmount while the drawer is open.
export function IconDrawer({ icon, onClose, onExplore, restoreFocusTo, container }: IconDrawerProps) {
  return (
    // autoFocus: vaul opts out of Radix's open-focus by default, which leaves focus
    // on the grid cell behind the drawer and defeats the focus trap.
    // container: portal into the rounded card so the drawer travels from the card's
    // bottom edge and is clipped by its corners, not the viewport's.
    <Drawer.Root
      autoFocus
      container={container}
      open={icon !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="drawer-overlay absolute inset-0 z-40 bg-black/25" />
        <Drawer.Content
          // Radix restores focus to the trigger, but the trigger is a virtualized
          // grid cell that has usually unmounted by now — send it to the grid instead.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocusTo.current?.focus();
          }}
          className="drawer-surface absolute inset-x-2 bottom-4 z-50 mx-auto max-w-[769px] rounded-xl bg-white shadow-surface outline-none dark:bg-neutral-800 dark:shadow-surface-dark"
        >
          {icon && <DrawerBody icon={icon} onClose={onClose} onExplore={onExplore} />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DrawerBody({ icon, onClose, onExplore }: { icon: Icon; onClose: () => void; onExplore: (category: string) => void }) {
  const { download, error } = useDownload();
  const downloadIcon = useIconHover();
  const exploreIcon = useIconHover();
  const closeIcon = useIconHover();
  const description =
    descriptions[icon.id] ?? `A 3D rendered ${icon.name.toLowerCase()} icon from the ${icon.category} pack.`;

  return (
    <>
      <div className="relative flex justify-end p-2">
        <div className="absolute left-1/2 top-3 h-2 w-12 -translate-x-1/2 rounded-full bg-black/10 dark:bg-white/15" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          {...closeIcon.hoverProps}
          className="grid h-9 w-9 place-items-center rounded-[10px] text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <XIcon ref={closeIcon.ref} size={20} className="p-0" />
        </button>
      </div>

      <div className="flex flex-col items-start gap-6 px-5 pb-8 pt-2 sm:flex-row sm:items-center sm:gap-8">
        <img
          src={icon.previewSrc}
          alt={icon.name}
          width={400}
          height={400}
          className="h-[280px] w-full shrink-0 rounded-lg bg-black/[0.04] object-contain p-4 dark:bg-white/[0.06] sm:h-[400px] sm:w-[400px]"
        />

        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="flex flex-col items-start gap-3">
            <span className="rounded-md border border-black/[0.08] bg-neutral-100 px-2 py-1 text-[12px] font-medium text-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-neutral-300">
              {icon.category}
            </span>
            <div className="flex flex-col gap-1">
              <Drawer.Title className="text-base font-medium text-neutral-800 dark:text-neutral-50">
                {icon.name}
              </Drawer.Title>
              <Drawer.Description className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {description}
              </Drawer.Description>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <MotionButton variant="primary" className="pl-2.5" {...downloadIcon.hoverProps} onClick={() => download(icon.id, icon.name)}>
              <DownloadIcon ref={downloadIcon.ref} size={16} className="p-0 text-white" />
              Download
            </MotionButton>
            <MotionButton className="pr-2.5" {...exploreIcon.hoverProps} onClick={() => onExplore(icon.category)}>
              Explore full pack
              <ArrowRightIcon ref={exploreIcon.ref} size={16} className="p-0 text-neutral-500 dark:text-neutral-400" />
            </MotionButton>
          </div>

          {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Free for commercial use. Attribution appreciated, not required.
          </p>
        </div>
      </div>
    </>
  );
}
