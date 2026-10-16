"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export function Orbital({ paused }: { paused: boolean }) {
  const sculpture = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <div
      ref={stage}
      className={`orbital-stage ${paused || !inView || !tabVisible ? "is-paused" : ""}`}
      onPointerMove={(event) => {
        if (
          paused ||
          event.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        if (sculpture.current)
          sculpture.current.style.transform = `rotateX(${-y * 16}deg) rotateY(${x * 20}deg)`;
      }}
      onPointerLeave={() => {
        if (sculpture.current)
          sculpture.current.style.transform = "rotateX(0deg) rotateY(0deg)";
      }}
    >
      <div className="stage-grid" aria-hidden="true" />
      <div className="stage-coordinates" aria-hidden="true">
        <span>FIG. 01</span>
        <span>IDEAS IN ORBIT</span>
      </div>
      <div className="orbital-sculpture" ref={sculpture} aria-hidden="true">
        <div className="sculpture-spin">
          <div className="orbital-ring ring-one" />
          <div className="orbital-ring ring-two" />
          <div className="orbital-ring ring-three" />
          <div className="orbital-ring ring-four" />
          <div className="orbital-core">
            <span />
          </div>
          <div className="satellite satellite-one" />
          <div className="satellite satellite-two" />
        </div>
      </div>
      <div className="sculpture-shadow" aria-hidden="true" />
      <span className="stage-label">
        <span className="small-cross">+</span> A LITTLE CURIOSITY GOES A LONG
        WAY
      </span>
    </div>
  );
}
