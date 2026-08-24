<script setup lang="ts">
/**
 * Magnet - the slot drifts toward the cursor while it is within `padding` of
 * the element, then springs back on exit.
 *
 * Listens on the window rather than the element so the pull begins *before*
 * the cursor arrives, which is what makes it feel magnetic rather than like a
 * hover state.
 */
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  /** Activation distance outside the element's bounds, px. */
  padding?: number;
  /** Larger divides the pull down - 40 is subtle, 10 is aggressive. */
  magnetStrength?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  padding: 140,
  magnetStrength: 34,
  disabled: false,
});

const root = useTemplateRef<HTMLDivElement>("root");
const active = ref(false);
const offset = ref({ x: 0, y: 0 });
let reduced = false;

function onMove(event: PointerEvent) {
  const el = root.value;
  if (!el || props.disabled || reduced) return;

  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const withinX = Math.abs(event.clientX - cx) < rect.width / 2 + props.padding;
  const withinY = Math.abs(event.clientY - cy) < rect.height / 2 + props.padding;

  if (withinX && withinY) {
    active.value = true;
    offset.value = {
      x: (event.clientX - cx) / props.magnetStrength,
      y: (event.clientY - cy) / props.magnetStrength,
    };
  } else if (active.value) {
    active.value = false;
    offset.value = { x: 0, y: 0 };
  }
}

onMounted(() => {
  reduced = prefersReducedMotion();
  if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });
});

onUnmounted(() => window.removeEventListener("pointermove", onMove));
</script>

<template>
  <!-- Block, not inline-block: as a layout wrapper it has to fill its grid or
       flex cell, otherwise sibling cards shrink to their own content width and
       end up visibly different sizes. -->
  <div ref="root" class="relative block h-full">
    <div
      class="will-change-transform"
      :style="{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: active
          ? 'transform 0.35s cubic-bezier(0.215, 0.61, 0.355, 1)'
          : 'transform 0.7s cubic-bezier(0.215, 0.61, 0.355, 1)',
      }"
    >
      <slot />
    </div>
  </div>
</template>
