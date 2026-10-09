<script setup lang="ts">
/**
 * HexLoader - the boot screen.
 *
 * A honeycomb plate covers the viewport: each hexagon draws its own outline on
 * from a random dash phase, the lattice brightens, then individual tiles fade
 * away in a shuffled order, opening hexagonal windows onto the page beneath.
 * A few tiles lose only their fill first, keeping an outline until their turn.
 *
 * Tiling happens in viewBox units with `preserveAspectRatio="xMinYMin slice"`,
 * so 1000 units always map to `max(vw, vh)` px. The visible region is therefore
 * never wider or taller than the viewBox itself - filling 1000x1000 covers any
 * viewport at any size with ~90 cells, and no resize bookkeeping.
 *
 * The page opens after the lattice has assembled; it deliberately does not
 * wait for web fonts or the window load event. Both can be delayed by the
 * network and would make a cosmetic loading screen hold back first content.
 */
import { ref, useTemplateRef } from "vue";
import { gsap, useGSAP } from "@/composables/useGSAP";

const emit = defineEmits<{ reveal: []; done: [] }>();

/** viewBox extent, and the tiling extent - see the note above. */
const VIEW = 1000;

const root = useTemplateRef<HTMLDivElement>("root");
const hidden = ref(false);

/**
 * Cells shrink on ultrawide screens, where `slice` scales off the width and the
 * default radius would leave only a handful of very large rows.
 *
 * Sampled once: re-tiling mid-boot would swap nodes out from under the running
 * timeline, and the plate covers every viewport size either way.
 */
const radius = (window.innerWidth / window.innerHeight > 2 ? 1.1 : 1.5) * 50;

/** Flat-to-flat width of a pointy-top hexagon; rows nest at 3/4 of its height. */
const stepX = Math.sqrt(3) * radius;
/** Shaved under 1.5 so neighbours overlap and no seam shows between cells. */
const stepY = 1.49 * radius;
/**
 * Outline length. Paired with an equal gap in `strokeDasharray`, so a dash
 * offset anywhere in `[-perimeter, perimeter]` leaves the hexagon partly drawn
 * and animating the offset to 0 draws it on.
 */
const perimeter = 6 * radius;

const points = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI / 3) * i - Math.PI / 2;
  return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
}).join(" ");

const cells = Array.from({ length: Math.ceil(VIEW / stepY) + 1 }, (_, row) =>
  Array.from({ length: Math.ceil(VIEW / stepX) + 1 }, (_, col) => ({
    // Odd rows sit flush, even rows are pushed half a cell to interlock.
    x: col * stepX + (row % 2 ? 0 : stepX / 2),
    y: row * stepY,
  })),
).flat();

function finish() {
  hidden.value = true;
  emit("done");
}

useGSAP(
  ({ reduced }) => {
    const timeline = gsap.timeline({ onComplete: finish });

    if (reduced) {
      gsap.set(".loader-hex", { strokeDashoffset: 0 });
      timeline.to(
        root.value,
        {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.inOut",
          onStart: () => emit("reveal"),
        },
        0.2,
      );
      return;
    }

    gsap.set(".loader-hex", {
      // GSAP cannot interpolate UnoCSS's computed oklab token: it would
      // start the colour tween from transparent black and hide the drawing.
      stroke: "#8B5CF6",
      fillOpacity: 1,
      transformOrigin: "50% 50%",
      strokeDashoffset: () => gsap.utils.random(-perimeter, perimeter),
      autoAlpha: 0,
      scale: 0,
    });

    // Bound the whole stagger so ultrawide layouts with more cells take
    // the same time, and finish assembling before the exit starts.
    timeline.to(".loader-hex", {
      strokeDashoffset: 0,
      autoAlpha: 1,
      scale: 1,
      duration: 0.45,
      ease: "power2.out",
      stagger: { amount: 0.65, from: "start" },
    });
    timeline.to(".loader-hex", { stroke: "#C1A5FF", duration: 0.7, ease: "sine.inOut" }, 0.4);

    // The assembled tiles cover the viewport, so removing their solid backing
    // reveals nothing yet. Each tile then uncovers its own patch of the page.
    timeline.addLabel("reveal", "+=0.2");
    timeline.set(".loader-ground", { autoAlpha: 0 }, "reveal");
    timeline.to(
      ".loader-hex",
      {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.inOut",
        stagger: { amount: 0.75, from: "random" },
        onStart: () => emit("reveal"),
      },
      "reveal",
    );

    // Pick a small visible subset, since the square SVG extends offscreen.
    // Animate only fill-opacity on the same label: each outline keeps its
    // original fade slot, and this shorter effect cannot extend the exit.
    const tiles = gsap.utils.toArray<SVGUseElement>(".loader-hex");
    const viewportScale = Math.max(window.innerWidth, window.innerHeight) / VIEW;
    const visibleTiles = tiles.filter((_, index) => {
      const cell = cells[index];
      return (
        cell &&
        cell.x < window.innerWidth / viewportScale &&
        cell.y < window.innerHeight / viewportScale
      );
    });
    const hollowTiles = gsap.utils
      .shuffle(visibleTiles)
      .slice(0, Math.max(2, Math.round(visibleTiles.length * 0.12)));
    timeline.to(
      hollowTiles,
      {
        fillOpacity: 0,
        duration: 0.16,
        ease: "sine.out",
        stagger: { amount: 0.16 },
      },
      "reveal",
    );
  },
  { scope: root },
);
</script>

<template>
  <div
    v-if="!hidden"
    ref="root"
    class="fixed inset-0 z-9500 overflow-hidden"
    role="status"
    aria-label="正在加载页面"
  >
    <div class="loader-ground absolute inset-0 bg-void-950" />

    <svg
      class="absolute inset-0 h-full w-full"
      :viewBox="`0 0 ${VIEW} ${VIEW}`"
      preserveAspectRatio="xMinYMin slice"
      :style="{ strokeDasharray: `${perimeter} ${perimeter}` }"
      aria-hidden="true"
    >
      <defs>
        <polygon id="loader-hex-cell" :points="points" fill="#03020A" />
      </defs>
      <use
        v-for="(cell, i) in cells"
        :key="i"
        class="loader-hex stroke-violet-500 [stroke-width:0.6] [stroke-opacity:0.9] [will-change:transform,opacity,stroke,stroke-dashoffset]"
        href="#loader-hex-cell"
        :x="cell.x"
        :y="cell.y"
      />
    </svg>
  </div>
</template>
