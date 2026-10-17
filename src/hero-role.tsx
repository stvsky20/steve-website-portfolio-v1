"use client";

import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { CodeBlockIcon } from "@phosphor-icons/react/dist/csr/CodeBlock";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";

const roles = [
  "Software Engineer",
  "Project Manager",
  "UI/UX Designer",
  "Web Developer",
];

const roleIcons: Record<string, typeof CodeBlockIcon> = {
  "Software Engineer": CodeBlockIcon,
  "Project Manager": KanbanIcon,
  "UI/UX Designer": PenNibIcon,
  "Web Developer": GlobeIcon,
};
function renderRoleIcon(word: string) {
  const Icon = roleIcons[word];
  return Icon ? (
    <Icon
      weight="fill"
      className="hero-role-icon"
      aria-hidden="true"
      focusable="false"
    />
  ) : null;
}

function playTitleFlip() {
  document.dispatchEvent(
    new CustomEvent("station:sound", { detail: { type: "flip" } }),
  );
}

function HeroRole() {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const station = document.querySelector("#station");
    const welcome = document.querySelector<HTMLDialogElement>("#audio-welcome");
    const pause = document.querySelector("#pause");
    function sync() {
      setPaused(
        document.hidden ||
          Boolean(welcome?.open) ||
          pause?.getAttribute("aria-pressed") === "true" ||
          Boolean(
            station?.getAttribute("data-chapter") &&
            station?.getAttribute("data-chapter") !== "introduction",
          ),
      );
    }
    const observer = new MutationObserver(sync);
    if (station)
      observer.observe(station, {
        attributes: true,
        attributeFilter: ["data-chapter"],
      });
    if (pause)
      observer.observe(pause, {
        attributes: true,
        attributeFilter: ["aria-pressed"],
      });
    if (welcome)
      observer.observe(welcome, {
        attributes: true,
        attributeFilter: ["open"],
      });
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <LayoutTextFlip
      text=""
      words={roles}
      duration={1800}
      onWordChange={playTitleFlip}
      renderIcon={renderRoleIcon}
      paused={paused}
      className="hero-role-word"
    />
  );
}

const host = document.querySelector("#hero-role");
if (host) createRoot(host).render(<HeroRole />);
