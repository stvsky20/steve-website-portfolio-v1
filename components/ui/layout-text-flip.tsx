"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface LayoutTextFlipProps {
  text?: string;
  words?: string[];
  duration?: number;
  className?: string;
  paused?: boolean;
  onWordChange?: (word: string, index: number) => void;
  renderIcon?: (word: string, index: number) => ReactNode;
}

export function LayoutTextFlip({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className,
  paused = false,
  onWordChange,
  renderIcon,
}: LayoutTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const previousIndex = useRef(0);

  useEffect(() => {
    if (paused || reducedMotion || words.length < 2) return;
    const interval = window.setInterval(
      () => setCurrentIndex((index) => (index + 1) % words.length),
      Math.max(1000, duration),
    );
    return () => window.clearInterval(interval);
  }, [duration, words.length, paused, reducedMotion]);

  useEffect(() => {
    if (previousIndex.current === currentIndex) return;
    previousIndex.current = currentIndex;
    if (!paused && !reducedMotion && words.length)
      onWordChange?.(
        words[currentIndex % words.length],
        currentIndex % words.length,
      );
  }, [currentIndex, onWordChange, paused, reducedMotion, words]);

  if (!words.length) return null;
  const index = reducedMotion ? 0 : currentIndex % words.length;
  return (
    <>
      {/* Read all roles once rather than announcing each automatic change. */}
      <span className="sr-only">
        {[text, words.join(", ")].filter(Boolean).join(" ")}
      </span>
      {text && (
        <motion.span
          aria-hidden="true"
          layout={!reducedMotion}
          className="text-2xl font-bold tracking-tight drop-shadow-lg md:text-4xl"
        >
          {text}
        </motion.span>
      )}
      <motion.span
        aria-hidden="true"
        layout={!reducedMotion && !paused}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "relative inline-block w-fit overflow-hidden rounded-md border border-transparent bg-white px-4 py-2 font-sans text-2xl font-bold tracking-tight text-black shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg md:text-4xl dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10",
          className,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={
              reducedMotion
                ? false
                : {
                    transform: "translateY(-40px)",
                    filter: "blur(10px)",
                    opacity: 0,
                  }
            }
            animate={{
              transform: "translateY(0px)",
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{
              transform: reducedMotion ? "translateY(0px)" : "translateY(50px)",
              filter: reducedMotion ? "blur(0px)" : "blur(10px)",
              opacity: 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.28,
              ease: [0.23, 1, 0.32, 1],
            }}
            className={cn(
              "layout-flip-active inline-flex items-center whitespace-nowrap",
              renderIcon && "gap-2.5",
            )}
          >
            {renderIcon?.(words[index], index)}
            <span>{words[index]}</span>
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}
