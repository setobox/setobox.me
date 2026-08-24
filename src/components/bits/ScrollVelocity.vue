<script setup lang="ts">
/**
 * ScrollVelocity - marquee rows whose speed and direction bend with scroll.
 *
 * Each row drifts at a constant base velocity; scrolling adds a spring-damped
 * boost, and scrolling *up* flips the direction. Rows alternate their base
 * direction so the block reads as counter-rotating bands.
 *
 * The x offset is wrapped against the measured width of a single copy, so the
 * loop is seamless at any font size without hardcoding a duplicate count.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  texts?: string[];
  /** Base drift in px/s. */
  velocity?: number;
  className?: string;
  /** 0-1000; higher settles the velocity boost faster. */
  damping?: number;
  /** 0-1000; higher makes the boost react more sharply to scroll. */
  stiffness?: number;
  /** Scroll speed (px/s) mapped onto a velocity multiplier. */
  velocityMapping?: { input: [number, number]; output: [number, number] };
}

const props = withDefaults(defineProps<Props>(), {
  texts: () => [],
  velocity: 90,
  className: "",
  damping: 50,
  stiffness: 400,
  velocityMapping: () => ({ input: [0, 1000], output: [0, 4] }),
});

// Function refs rather than `ref="name"`: the copies live in a nested v-for, so
// a shared string ref would flatten every row's copies into one array. We only
// need the *first* copy of each row to measure against.
const rows: (HTMLElement | null)[] = [];
const firstCopies: (HTMLElement | null)[] = [];

const setRow = (el: unknown, i: number) => {
  rows[i] = (el as HTMLElement | null) ?? null;
};
const setCopy = (el: unknown, i: number) => {
  firstCopies[i] = (el as HTMLElement | null) ?? null;
};

const offsets = ref<number[]>([]);
const copyWidths = ref<number[]>([]);
const copyCounts = ref<number[]>([]);

const directions: number[] = [];
let rafId = 0;
let resizeObserver: ResizeObserver | null = null;
let scrollVelocity = 0;
let smoothVelocity = 0;
let velocityFactor = 0;
let lastScrollY = 0;
let lastScrollT = 0;
let lastFrameT = 0;

const transforms = computed(() =>
  props.texts.map((_, i) => {
    const w = copyWidths.value[i] ?? 0;
    if (w === 0) return "translateX(0px)";
    // Wrap into [-w, 0) so the strip never runs out of copies.
    const v = offsets.value[i] ?? 0;
    return `translateX(${(((v % w) + w) % w) - w}px)`;
  }),
);

function measure() {
  const widths = copyWidths.value.slice();
  const counts = copyCounts.value.slice();

  props.texts.forEach((_, i) => {
    const copy = firstCopies[i];
    const row = rows[i];
    if (!copy || !row) return;

    const single = copy.offsetWidth;
    if (single === 0) return;

    widths[i] = single;
    // Enough copies to cover the row twice over, so wrapping is invisible.
    counts[i] = Math.max(Math.ceil((row.offsetWidth * 2.2) / single), 4);
  });

  copyWidths.value = widths;
  copyCounts.value = counts;
}

function frame(now: number) {
  rafId = requestAnimationFrame(frame);
  if (lastFrameT === 0) lastFrameT = now;
  const dt = Math.min(now - lastFrameT, 50);
  lastFrameT = now;

  // Spring-damp the raw scroll velocity into something usable.
  smoothVelocity += (scrollVelocity - smoothVelocity) * (props.stiffness / 1000);
  smoothVelocity *= 1 - props.damping / 1000;

  const { input, output } = props.velocityMapping;
  const span = input[1] - input[0] || 1;
  const norm = Math.min(Math.max((Math.abs(smoothVelocity) - input[0]) / span, 0), 1);
  velocityFactor = (output[0] + norm * (output[1] - output[0])) * (smoothVelocity < 0 ? -1 : 1);

  const next = offsets.value.slice();
  props.texts.forEach((_, i) => {
    // Odd rows travel the other way, giving the counter-rotating band effect.
    const base = i % 2 === 0 ? props.velocity : -props.velocity;

    if (velocityFactor < 0) directions[i] = -1;
    else if (velocityFactor > 0) directions[i] = 1;

    const dir = directions[i] ?? 1;
    next[i] = (next[i] ?? 0) + dir * base * (dt / 1000) * (1 + Math.abs(velocityFactor));
  });
  offsets.value = next;
}

function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const dt = now - lastScrollT;
  if (dt > 0) scrollVelocity = ((y - lastScrollY) / dt) * 1000;
  lastScrollY = y;
  lastScrollT = now;
}

onMounted(() => {
  const n = props.texts.length;
  offsets.value = Array.from({ length: n }, () => 0);
  copyWidths.value = Array.from({ length: n }, () => 0);
  copyCounts.value = Array.from({ length: n }, () => 6);
  for (let i = 0; i < n; i++) directions[i] = 1;

  measure();
  // Re-measure once webfonts land; Orbitron changes widths substantially.
  document.fonts?.ready.then(measure).catch(() => {});

  resizeObserver = new ResizeObserver(() => measure());
  for (const el of firstCopies) if (el) resizeObserver.observe(el);

  if (!prefersReducedMotion()) {
    lastScrollY = window.scrollY;
    lastScrollT = performance.now();
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(frame);
  }
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <section class="select-none" aria-hidden="true">
    <div
      v-for="(text, index) in texts"
      :key="index"
      :ref="(el) => setRow(el, index)"
      class="relative overflow-hidden"
    >
      <div
        class="flex whitespace-nowrap will-change-transform"
        :style="{ transform: transforms[index] }"
      >
        <span
          v-for="copy in copyCounts[index] ?? 6"
          :key="copy"
          :ref="copy === 1 ? (el) => setCopy(el, index) : undefined"
          class="flex-shrink-0"
          :class="className"
          translate="no"
        >
          {{ text }}&nbsp;
        </span>
      </div>
    </div>
  </section>
</template>
