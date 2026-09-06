import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

const PROXY_SPAN = 2_000_000;
const CENTER = PROXY_SPAN / 2;
const RECENTER_THRESHOLD = PROXY_SPAN / 4;

// ThiingsGrid applies raw wheel deltas straight to its transform, which reads as
// stepped. Wheel input is captured here and run through Lenis instead — one
// instance per axis, each scrolling an offscreen proxy — and Lenis's eased output
// is re-emitted as wheel deltas. ThiingsGrid itself stays unmodified.
export function SmoothWheel({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reduced) return;

    const proxies = { x: createProxy("x"), y: createProxy("y") };
    // Append before seeding the scroll position: a detached element cannot
    // scroll, and a proxy left at 0 makes the first delta a CENTER-sized jump.
    host.append(proxies.x.wrapper, proxies.y.wrapper);
    proxies.x.wrapper.scrollLeft = CENTER;
    proxies.y.wrapper.scrollTop = CENTER;

    const lenis = {
      x: new Lenis({ ...proxies.x, orientation: "horizontal", smoothWheel: false, autoRaf: true, lerp: 0.09 }),
      y: new Lenis({ ...proxies.y, orientation: "vertical", smoothWheel: false, autoRaf: true, lerp: 0.09 }),
    };

    const target = { x: lenis.x.animatedScroll, y: lenis.y.animatedScroll };
    const last = { ...target };
    let synthetic = false;

    const emit = (axis: "x" | "y") => (instance: Lenis) => {
      const delta = instance.animatedScroll - last[axis];
      last[axis] = instance.animatedScroll;
      if (delta === 0) return;

      synthetic = true;
      host.firstElementChild?.dispatchEvent(
        new WheelEvent("wheel", {
          deltaX: axis === "x" ? delta : 0,
          deltaY: axis === "y" ? delta : 0,
          bubbles: true,
          cancelable: true,
        })
      );
      synthetic = false;

      // Keep the proxy far from either end so scrollTo never clamps mid-gesture.
      if (Math.abs(instance.animatedScroll - CENTER) > RECENTER_THRESHOLD && !instance.isScrolling) {
        target[axis] = CENTER;
        last[axis] = CENTER;
        instance.scrollTo(CENTER, { immediate: true });
      }
    };

    lenis.x.on("scroll", emit("x"));
    lenis.y.on("scroll", emit("y"));

    const onWheel = (event: WheelEvent) => {
      if (synthetic) return;
      event.preventDefault();
      event.stopPropagation();
      target.x += event.deltaX;
      target.y += event.deltaY;
      lenis.x.scrollTo(target.x, { lerp: 0.09 });
      lenis.y.scrollTo(target.y, { lerp: 0.09 });
    };

    host.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => {
      host.removeEventListener("wheel", onWheel, { capture: true });
      lenis.x.destroy();
      lenis.y.destroy();
      proxies.x.wrapper.remove();
      proxies.y.wrapper.remove();
    };
  }, [reduced]);

  return (
    <div ref={hostRef} className="h-full w-full">
      {children}
    </div>
  );
}

function createProxy(axis: "x" | "y") {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.tabIndex = -1;
  wrapper.style.cssText = `position:absolute;width:1px;height:1px;overflow:${
    axis === "x" ? "auto hidden" : "hidden auto"
  };opacity:0;pointer-events:none;top:0;left:0`;

  const content = document.createElement("div");
  content.style.cssText = axis === "x" ? `width:${PROXY_SPAN}px;height:1px` : `width:1px;height:${PROXY_SPAN}px`;
  wrapper.append(content);

  return { wrapper, content };
}
