import React, { useRef } from "react";

/**
 * Wraps content in a 3D tilt that follows the pointer (desktop only —
 * touch devices have no hover, so they keep the plain layout).
 */
export default function TiltCard({ children, className = "", max = 8 }) {
  const ref = useRef(null);

  const move = (e) => {
    const el = ref.current;
    // Only a real pointing device tilts the card — touches scroll straight past.
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg)`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={reset} className={`tilt ${className}`}>
      {children}
      <span aria-hidden className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}