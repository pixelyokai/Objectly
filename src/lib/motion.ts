export const EASE = [0.23, 1, 0.32, 1] as const; // entry / general
export const EXIT = [0.4, 0, 1, 1] as const; // exit only — faster out than in

export const OPEN = { type: "spring", stiffness: 620, damping: 38, mass: 0.6 } as const;
export const SLIDE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
export const NUDGE = { type: "spring", stiffness: 700, damping: 46, mass: 0.5 } as const;
export const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const;
export const NONE = { duration: 0 } as const;
