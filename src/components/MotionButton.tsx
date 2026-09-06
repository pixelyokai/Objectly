import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { NONE, NUDGE } from "../lib/motion";

const VARIANTS = {
  primary:
    "bg-[linear-gradient(180deg,#0C39F3_0%,rgb(12_57_243/0.88)_100%)] text-white shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_1px_rgb(12_57_243/0.20)]",
  secondary:
    "bg-gradient-to-b from-white to-black/[0.04] text-zinc-900 shadow-surface dark:from-white/10 dark:to-white/[0.04] dark:text-neutral-100 dark:shadow-surface-dark",
};

type MotionButtonProps = ComponentProps<typeof motion.button> & { variant?: keyof typeof VARIANTS };

export function MotionButton({ variant = "secondary", className = "", ...props }: MotionButtonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileHover={reduced ? undefined : { scale: 1.02 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={reduced ? NONE : NUDGE}
      // leading-none + items-center: the default 20px line box sits the label a
      // pixel low against Open Runde's metrics.
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 optical-center text-[13px] font-medium leading-none backdrop-blur-md ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
