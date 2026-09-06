import { useRef } from "react";

type AnimatedIconHandle = { startAnimation: () => void; stopAnimation: () => void };

// lucide-animated icons animate on their own hover, which is a ~16px target
// inside a much larger control. Attaching a ref switches them to controlled mode,
// so the whole button can drive them instead.
export function useIconHover() {
  const ref = useRef<AnimatedIconHandle>(null);

  return {
    ref,
    hoverProps: {
      onMouseEnter: () => ref.current?.startAnimation(),
      onMouseLeave: () => ref.current?.stopAnimation(),
      onFocus: () => ref.current?.startAnimation(),
      onBlur: () => ref.current?.stopAnimation(),
    },
  };
}
