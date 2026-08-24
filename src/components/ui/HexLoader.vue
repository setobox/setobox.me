<script setup lang="ts">
/**
 * HexLoader - the boot screen. Seven hexagons assemble into a honeycomb while
 * a counter runs to 100, then the whole plate wipes away.
 *
 * Waits on `document.fonts.ready` as well as `window.load`: Orbitron arriving
 * late would otherwise reflow the hero headline right after the reveal, which
 * is the most visible moment on the page.
 */
import { onMounted, ref, useTemplateRef } from "vue";
import { gsap, prefersReducedMotion } from "@/composables/useGSAP";

const emit = defineEmits<{ done: [] }>();

const root = useTemplateRef<HTMLDivElement>("root");
const hidden = ref(false);
const percent = ref(0);

// Centre plus a ring of six: the classic honeycomb unit.
const cells = [
  { x: 0, y: 0 },
  { x: 0, y: -1 },
  { x: 0.866, y: -0.5 },
  { x: 0.866, y: 0.5 },
  { x: 0, y: 1 },
  { x: -0.866, y: 0.5 },
  { x: -0.866, y: -0.5 },
];

function finish() {
  hidden.value = true;
  emit("done");
}

onMounted(async () => {
  if (prefersReducedMotion()) {
    percent.value = 100;
    finish();
    return;
  }

  const tl = gsap.timeline();

  tl.from(".loader-cell", {
    scale: 0,
    opacity: 0,
    rotate: -120,
    duration: 0.7,
    ease: "back.out(2)",
    stagger: { each: 0.075, from: "center" },
  }).to(
    ".loader-cell",
    {
      opacity: 0.35,
      duration: 0.9,
      ease: "sine.inOut",
      stagger: { each: 0.09, from: "center", yoyo: true, repeat: -1 },
    },
    "-=0.2",
  );

  // Run the counter to 92 and hold; the last 8 belong to real readiness so the
  // number never sits at 100 while the page is still blocked.
  const counter = { v: 0 };
  gsap.to(counter, {
    v: 92,
    duration: 1.5,
    ease: "power1.out",
    onUpdate: () => {
      percent.value = Math.round(counter.v);
    },
  });

  const settled = Promise.all([
    document.fonts?.ready.catch(() => undefined) ?? Promise.resolve(),
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener("load", () => resolve(), { once: true }),
        ),
    // Floor, so the assemble animation is never cut off mid-stagger.
    new Promise<void>((resolve) => setTimeout(resolve, 1300)),
  ]);

  await settled;

  gsap.to(counter, {
    v: 100,
    duration: 0.3,
    ease: "power2.out",
    onUpdate: () => {
      percent.value = Math.round(counter.v);
    },
  });

  gsap
    .timeline({ onComplete: finish })
    .to(".loader-cell", {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      stagger: { each: 0.04, from: "edges" },
      delay: 0.3,
    })
    .to(".loader-text", { opacity: 0, y: -14, duration: 0.3 }, "<")
    .to(root.value, { yPercent: -100, duration: 0.75, ease: "expo.inOut" }, "-=0.1");
});
</script>

<template>
  <div
    v-if="!hidden"
    ref="root"
    class="fixed inset-0 z-9500 grid place-items-center bg-void-950"
    role="status"
    aria-live="polite"
    :aria-label="`Loading ${percent} percent`"
  >
    <div class="flex flex-col items-center gap-10">
      <div class="relative h-[132px] w-[132px]">
        <div
          v-for="(cell, i) in cells"
          :key="i"
          class="loader-cell absolute h-[38px] w-[44px] hex-point"
          :class="i === 0 ? 'bg-magenta-500' : 'bg-violet-500'"
          :style="{
            left: `${50 + cell.x * 34}%`,
            top: `${50 + cell.y * 30}%`,
            transform: 'translate(-50%, -50%)',
          }"
        />
      </div>

      <div class="loader-text flex flex-col items-center gap-3">
        <p class="font-display text-sm uppercase tracking-[0.5em] text-silver-300" translate="no">
          SETOBOX
        </p>
        <p class="font-mono text-xs tracking-[0.3em] text-violet-300">
          {{ String(percent).padStart(3, "0") }}%
        </p>
        <div class="h-[2px] w-40 overflow-hidden bg-silver-800">
          <div
            class="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-magenta-400 transition-[width] duration-200 ease-out"
            :style="{ width: `${percent}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
