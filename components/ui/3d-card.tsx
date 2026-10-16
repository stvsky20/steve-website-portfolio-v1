"use client";

// Adapted from Aceternity UI's free 3D Card container:
// https://ui.aceternity.com/components/3d-card-effect
// Adds fine-pointer/reduced-motion guards and limits rotation for legibility.
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function CardContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="aceternity-perspective"
      onPointerMove={(event) => {
        if (
          event.pointerType !== "mouse" ||
          !containerRef.current ||
          !window.matchMedia(
            "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
          ).matches
        )
          return;
        const { left, top, width, height } =
          event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - left - width / 2) / width) * 6;
        const y = (-(event.clientY - top - height / 2) / height) * 6;
        containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
      }}
      onPointerLeave={() => {
        if (containerRef.current)
          containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
      }}
    >
      <div ref={containerRef} className={cn("aceternity-card", className)}>
        {children}
      </div>
    </div>
  );
}
