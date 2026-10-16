import * as THREE from "../vendor/three.module.js";
import { applyScriptedView } from "./scene-control.js";
import { sampleStory } from "./story-path.js";
import { scrubPosition } from "./scroll-scrub.js";
import { educationReveal } from "./education-motion.js";
import { scrollTransmission, transmissionPhases } from "./transmission.js";
import { createChapterRoute } from "./chapter-route.js";

export function createStory({
  camera,
  controls,
  journeys,
  state,
  reduce,
  requestFrame,
  cancelCamera,
}) {
  const story = document.querySelector("#station-story");
  const station = document.querySelector("#station");
  const chapters = [...document.querySelectorAll(".story-chapter")];
  // Keep navigation above the independently scrolling reading cards.
  const header = document.querySelector(".header");
  const progress = document.querySelector(".chapter-progress");
  const chapterRoute = createChapterRoute(progress);
  const pause = chapterRoute.pause;
  pause.addEventListener("click", () =>
    document.querySelector("#pause").click(),
  );
  story.prepend(header);
  story.append(progress);
  let stops = [],
    current = "introduction",
    lastScroll = window.scrollY;
  let visualScroll = null,
    scrubMoving = false,
    snapScroll = true,
    storyHeight = 0;
  let origin = 0,
    chapterStarts = [];
  function measure() {
    const h = station.clientHeight,
      mobile = station.clientWidth < 650;
    origin = story.getBoundingClientRect().top + window.scrollY;
    storyHeight = story.getBoundingClientRect().height;
    snapScroll = true;
    chapterStarts = chapters.map((section) => ({
      id: section.dataset.chapter,
      at:
        section.getBoundingClientRect().top +
        window.scrollY -
        origin -
        h * 0.42,
    }));
    const views = mobile
      ? [
          [
            [25, 14, 36],
            [3.8, 11.5, 0],
          ],
          [
            [36, 23, 42],
            [3.1, 11.2, 0],
          ],
          [
            [1.8, 4.1, 10.5],
            [1.8, 2.4, 2.8],
          ],
          [
            [-6.9, 5.5, 13.5],
            [-6.9, 3.5, -0.2],
          ],
          [
            [-15.9, 5.4, 13.5],
            [-15.9, 3.0, -2],
          ],
          [
            [25, 15, 39],
            [3, 10.5, 0],
          ],
        ]
      : [
          [
            [19, 8.5, 26],
            [-3, 7.2, 0],
          ],
          [
            [24, 12, 30],
            [-4.7, 6.7, 0],
          ],
          [
            [1.8, 3.4, 6.5],
            [1.8, 2.55, 2.8],
          ],
          [
            [-6.9, 4.6, 9.8],
            [-9, 2.8, 0],
          ],
          [
            [-15.9, 4.2, 5.8],
            [-17.4, 3, -2],
          ],
          [
            [23, 16, 28],
            [-3, 4.5, 1],
          ],
        ];
    const positions = [
      0,
      h * 0.55,
      ...chapterStarts.map((chapter) => chapter.at),
    ];
    stops = views.map(([position, target], i) => ({
      at: positions[i],
      position: new THREE.Vector3(...position),
      target: new THREE.Vector3(...target),
    }));
    // Keep the core still for inspection after its parts have separated.
    stops.splice(4, 0, {
      at: stops[4].at - h * 1.2,
      position: stops[3].position.clone(),
      target: stops[3].target.clone(),
    });
    requestFrame();
  }
  function onScroll() {
    // Explicit exploration yields back to the narrative when the reader scrolls.
    if (Math.abs(window.scrollY - lastScroll) > 3) {
      if (!journeys.active) {
        state.exploring = false;
        station.classList.remove("exploring");
        document.querySelector("#explore-message").hidden = true;
        document.querySelector(".introduction").inert = false;
        controls.enabled = false;
        cancelCamera();
      }
    }
    lastScroll = window.scrollY;
    requestFrame();
  }
  function update(dt = 0) {
    const target = Math.max(0, window.scrollY - origin);
    const sample = scrubPosition(
      visualScroll,
      target,
      dt,
      snapScroll ||
        reduce.matches ||
        state.exploring ||
        (journeys.active && !journeys.scrollDriven),
    );
    visualScroll = sample.position;
    scrubMoving = sample.moving;
    snapScroll = false;
    const scroll = visualScroll;
    current = "introduction";
    for (const chapter of chapterStarts)
      if (scroll >= chapter.at) current = chapter.id;
    station.dataset.chapter = current;
    story.dataset.chapter = current;
    const finished = storyHeight - scroll < station.clientHeight * 0.5;
    header.hidden = finished;
    progress.hidden = finished;
    const beyond = chapterStarts.find((chapter) => chapter.id === "beyond");
    const h = station.clientHeight;
    const flightProgress = scrollTransmission(scroll, beyond.at + h * 0.42, h);
    if (current === "beyond" && !finished && !state.exploring) {
      if (!journeys.active || journeys.scrollDriven)
        journeys.scrubFlight(flightProgress, stops[stops.length - 1]);
    } else if (journeys.scrollDriven) journeys.returnStation(true);
    const entry = transmissionPhases(
      reduce.matches ? (journeys.active ? 1 : 0) : flightProgress,
    ).entry;
    const launch = document.querySelector(".beyond-launch");
    launch.hidden =
      current !== "beyond" ||
      finished ||
      state.exploring ||
      entry === 1 ||
      (journeys.active && !journeys.scrollDriven);
    launch.style.opacity = String(1 - entry);
    launch.inert = entry > 0.5;
    station.style.setProperty("--uplink-entry", String(entry));
    const journeyNav = document.querySelector("#journey-nav");
    journeyNav.style.opacity = journeys.scrollDriven ? String(entry) : "";
    journeyNav.inert = journeys.scrollDriven && entry < 0.5;
    progress.style.opacity = current === "beyond" ? String(1 - entry) : "";
    story.classList.toggle(
      "story-interacting",
      (journeys.active && (!journeys.scrollDriven || entry === 1)) ||
        state.exploring,
    );
    const active = [
      "introduction",
      "projects",
      "stack",
      "education",
      "beyond",
    ].indexOf(current);
    chapterRoute.update(active, state.paused, reduce.matches);
    if (journeys.active || state.exploring) return;
    const point = sampleStory(stops, scroll, reduce.matches);
    camera.position.lerpVectors(
      stops[point.from].position,
      stops[point.to].position,
      point.mix,
    );
    controls.target.lerpVectors(
      stops[point.from].target,
      stops[point.to].target,
      point.mix,
    );
    controls.enabled = false;
    controls.enableDamping = false;
    controls.minDistance = 3;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;
    applyScriptedView(camera, controls, camera.position, controls.target);
  }
  document.addEventListener("station:rewind-flight", () => {
    const beyond = chapterStarts.find((chapter) => chapter.id === "beyond");
    window.scrollTo({
      top: origin + beyond.at + station.clientHeight * 0.42,
      behavior: "instant",
    });
    snapScroll = true;
    update();
    requestFrame();
  });
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    link.addEventListener("click", (event) => {
      // Navigation is an explicit destination jump, rather than a wheel gesture.
      snapScroll = true;
      if (journeys.active) journeys.returnStation(true);
      // Direct Stack navigation lands at the fully disassembled inspection
      // pose. Wheel scrolling still reveals and reassembles the core normally.
      if (link.getAttribute("href") === "#stack") {
        event.preventDefault();
        const stack = chapterStarts.find((chapter) => chapter.id === "stack");
        window.scrollTo({
          top: origin + stack.at + station.clientHeight * 1.24,
          behavior: "instant",
        });
        if (location.hash !== "#stack") history.pushState(null, "", "#stack");
        update();
        requestFrame();
      }
      // A sticky element is already in view; its hash alone cannot rewind it.
      if (link.getAttribute("href") === "#station") {
        event.preventDefault();
        window.scrollTo({ top: origin, behavior: "instant" });
        if (location.hash !== "#station")
          history.pushState(null, "", "#station");
        update();
        requestFrame();
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        [
          "PageDown",
          "PageUp",
          "Home",
          "End",
          "ArrowDown",
          "ArrowUp",
          " ",
        ].includes(event.key) &&
        !event.target.closest("input,textarea,select,[contenteditable]")
      )
        snapScroll = true;
    },
    { passive: true },
  );
  new ResizeObserver(measure).observe(story);
  window.addEventListener("resize", measure, { passive: true });
  measure();
  document.body.classList.add("story-enabled");
  return {
    update,
    get moving() {
      return scrubMoving;
    },
    get chapter() {
      return current;
    },
    get stackDeparting() {
      const next = chapterStarts.find((chapter) => chapter.id === "education");
      return (
        (visualScroll ?? window.scrollY - origin) >
        next.at - station.clientHeight * 0.456
      );
    },
    get educationReveal() {
      const start = chapterStarts.find(
        (chapter) => chapter.id === "education",
      ).at;
      const end = chapterStarts.find((chapter) => chapter.id === "beyond").at;
      return educationReveal(
        visualScroll ?? window.scrollY - origin,
        start,
        end,
        station.clientHeight,
        reduce.matches,
      );
    },
    get stackProgress() {
      const chapter = chapterStarts.find((chapter) => chapter.id === "stack");
      const h = station.clientHeight;
      const start = chapter.at + h * 0.42;
      return Math.max(
        0,
        Math.min(
          1,
          ((visualScroll ?? window.scrollY - origin) - start + h * 0.05) /
            (h * 0.85),
        ),
      );
    },
  };
}
