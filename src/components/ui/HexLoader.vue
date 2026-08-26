<script setup lang="ts">
/**
 * HexLoader - the boot screen.
 *
 * A honeycomb plate covers the viewport: each hexagon draws its own outline on
 * from a random dash phase, the lattice breathes through a violet colour cycle,
 * then the cells collapse in random order to reveal the page underneath.
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
import { onMounted, ref, useTemplateRef } from "vue";
import { gsap, prefersReducedMotion } from "@/composables/useGSAP";

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

/** Floor, so the assemble animation is never cut off mid-stagger. */
function settled(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1300));
}

onMounted(async () => {
  if (prefersReducedMotion()) {
    gsap.set(".loader-hex", { strokeDashoffset: 0 });
    await settled();
    gsap.to(root.value, { autoAlpha: 0, duration: 0.35, onComplete: finish });
    return;
  }

  // `transformOrigin` at the bbox centre is each cell's own middle, so the
  // scale in and the collapse both happen about the hexagon, not the plate.
  gsap.set(".loader-hex", {
    transformOrigin: "50% 50%",
    strokeDashoffset: () => gsap.utils.random(-perimeter, perimeter),
    autoAlpha: 0,
    scale: 0,
  });

  gsap.to(".loader-hex", {
    strokeDashoffset: 0,
    autoAlpha: 1,
    scale: 1,
    duration: 0.45,
    ease: "power2.out",
    stagger: { each: 0.012, from: "start" },
  });

  // Colour cycle across the lattice in random order, held until the reveal.
  const pulse = gsap.timeline({ repeat: -1, yoyo: true, delay: 0.5 }).to(".loader-hex", {
    stroke: "#C1A5FF",
    duration: 0.7,
    ease: "power2.in",
    stagger: { each: 0.01, from: "random" },
  });

  await settled();

  gsap
    .timeline({ onComplete: finish, delay: 0.25 })
    .to(".loader-ground", { autoAlpha: 0, duration: 0.45 }, 0)
    .to(".loader-hex", {
      scale: 0,
      autoAlpha: 0,
      duration: 0.2,
      ease: "power2.in",
      stagger: { each: 0.006, from: "random" },
      onStart: () => {
        pulse.kill();
        emit("reveal");
      },
    });
});
</script>

<template>
  <div
    v-if="!hidden"
    ref="root"
    class="fixed inset-0 z-9500 overflow-hidden"
    role="status"
    aria-label="Loading"
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
        class="loader-hex"
        href="#loader-hex-cell"
        :x="cell.x"
        :y="cell.y"
      />
    </svg>
  </div>
</template>

<style scoped>
.loader-hex {
  stroke: #8b5cf6;
  stroke-width: 0.6;
  stroke-opacity: 0.9;
  will-change: transform, opacity, stroke, stroke-dashoffset;
}
</style>
