<script setup lang="ts">
/**
 * TargetCursor - replaces the pointer with a hexagon reticle whose four
 * corner brackets snap open around anything carrying `.cursor-target`.
 *
 * Only mounted for fine pointers; touch devices keep their native behaviour
 * and never pay for the listeners.
 */
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { gsap, prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  /** Seconds for one idle rotation of the reticle. */
  spinDuration?: number;
  /** Padding between a snapped target's bounds and the brackets, px. */
  targetPadding?: number;
}

const props = withDefaults(defineProps<Props>(), {
  spinDuration: 8,
  targetPadding: 8,
});

const root = useTemplateRef<HTMLDivElement>("root");
const dot = useTemplateRef<HTMLDivElement>("dot");
const enabled = ref(false);

const cornerRefs: (HTMLElement | null)[] = [];
const setCorner = (el: unknown, i: number) => {
  cornerRefs[i] = (el as HTMLElement | null) ?? null;
};

let spin: gsap.core.Tween | null = null;
let activeTarget: Element | null = null;
const HOME = 22; // resting bracket offset from centre, px

function moveTo(x: number, y: number) {
  gsap.to(root.value, {
    x,
    y,
    duration: 0.16,
    ease: "power3.out",
    overwrite: "auto",
  });
}

function onMove(event: PointerEvent) {
  moveTo(event.clientX, event.clientY);
}

/** Snap the brackets to a target's bounding box. */
function snap(target: Element) {
  const rect = target.getBoundingClientRect();
  const c = root.value?.getBoundingClientRect();
  if (!c) return;

  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;
  const p = props.targetPadding;

  const positions = [
    { x: rect.left - cx - p, y: rect.top - cy - p }, // tl
    { x: rect.right - cx + p, y: rect.top - cy - p }, // tr
    { x: rect.right - cx + p, y: rect.bottom - cy + p }, // br
    { x: rect.left - cx - p, y: rect.bottom - cy + p }, // bl
  ];

  spin?.pause();
  gsap.to(root.value, { rotate: 0, duration: 0.3, ease: "power3.out" });
  gsap.to(dot.value, { scale: 0, opacity: 0, duration: 0.2 });

  cornerRefs.forEach((el, i) => {
    if (!el) return;
    gsap.to(el, { ...positions[i], duration: 0.3, ease: "power3.out" });
  });
}

function release() {
  const offsets = [
    { x: -HOME, y: -HOME },
    { x: HOME, y: -HOME },
    { x: HOME, y: HOME },
    { x: -HOME, y: HOME },
  ];

  cornerRefs.forEach((el, i) => {
    if (!el) return;
    gsap.to(el, { ...offsets[i], duration: 0.35, ease: "power3.out" });
  });

  gsap.to(dot.value, { scale: 1, opacity: 1, duration: 0.25 });
  spin?.play();
}

function onOver(event: PointerEvent) {
  const target = (event.target as Element | null)?.closest(".cursor-target");

  if (target === activeTarget) return;

  activeTarget = target ?? null;
  if (activeTarget) snap(activeTarget);
  else release();
}

function onDown() {
  gsap.to(root.value, { scale: 0.82, duration: 0.15, ease: "power2.out" });
}

function onUp() {
  gsap.to(root.value, { scale: 1, duration: 0.25, ease: "back.out(2)" });
}

function onScroll() {
  // A snapped target moves with the page, so re-measure while it is held.
  if (activeTarget) snap(activeTarget);
}

onMounted(() => {
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine || prefersReducedMotion()) return;

  enabled.value = true;
  document.documentElement.classList.add("has-target-cursor");

  gsap.set(root.value, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
  release();

  spin = gsap.to(root.value, {
    rotate: 360,
    duration: props.spinDuration,
    ease: "none",
    repeat: -1,
  });

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  document.documentElement.classList.remove("has-target-cursor");
  spin?.kill();
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerover", onOver);
  window.removeEventListener("pointerdown", onDown);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div
    v-show="enabled"
    ref="root"
    class="pointer-events-none fixed left-0 top-0 z-9999 h-0 w-0 mix-blend-difference"
    aria-hidden="true"
  >
    <!-- Centre reticle: a small hexagon rather than a dot, to keep the motif. -->
    <div
      ref="dot"
      class="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 bg-white hex-point"
    />
    <div
      v-for="(rot, i) in [0, 90, 180, 270]"
      :key="i"
      :ref="(el) => setCorner(el, i)"
      class="absolute h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 border-l-2 border-t-2 border-white"
      :style="{ rotate: `${rot}deg` }"
    />
  </div>
</template>

<style>
/*
 * Unscoped on purpose: the native cursor has to be suppressed document-wide,
 * and only while this component is actually mounted.
 */
html.has-target-cursor,
html.has-target-cursor * {
  cursor: none !important;
}
</style>
