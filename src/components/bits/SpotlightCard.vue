<script setup lang="ts">
/**
 * SpotlightCard - a panel with a radial highlight that tracks the cursor.
 *
 * Position is handed to CSS as custom properties and the gradient lives in a
 * pseudo-element, so pointer moves never touch Vue's reactivity or trigger a
 * re-render - only a compositor repaint.
 */
import { useTemplateRef } from "vue";

interface Props {
  spotlightColor?: string;
  /** Diameter of the highlight, px. */
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  spotlightColor: "rgba(139, 92, 246, 0.22)",
  size: 460,
});

const root = useTemplateRef<HTMLDivElement>("root");

function onMove(event: PointerEvent) {
  const el = root.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function onEnter() {
  root.value?.style.setProperty("--spot-opacity", "1");
}

function onLeave() {
  root.value?.style.setProperty("--spot-opacity", "0");
}
</script>

<template>
  <div
    ref="root"
    class="spotlight relative overflow-hidden"
    :style="{
      '--spot-color': props.spotlightColor,
      '--spot-size': `${props.size}px`,
    }"
    @pointermove="onMove"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <slot />
  </div>
</template>

<style scoped>
.spotlight {
  --mx: 50%;
  --my: 50%;
  --spot-opacity: 0;
}

.spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: var(--spot-opacity);
  transition: opacity 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
  background: radial-gradient(
    var(--spot-size) circle at var(--mx) var(--my),
    var(--spot-color),
    transparent 65%
  );
}
</style>
