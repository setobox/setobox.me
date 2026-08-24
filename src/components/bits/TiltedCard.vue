<script setup lang="ts">
/**
 * TiltedCard - 3D tilt toward the cursor with a travelling sheen.
 *
 * Rotation is written straight to inline style on pointermove rather than
 * tweened: a tween would lag the cursor by its own duration, and the CSS
 * transition on the element already supplies the smoothing.
 */
import { ref, useTemplateRef } from "vue";
import { prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  /** Maximum rotation on either axis, degrees. */
  max?: number;
  /** Scale applied while hovered. */
  scale?: number;
  /** Show the moving specular highlight. */
  glare?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  max: 9,
  scale: 1.02,
  glare: true,
});

const root = useTemplateRef<HTMLDivElement>("root");
const rx = ref(0);
const ry = ref(0);
const hovering = ref(false);
const glarePos = ref({ x: 50, y: 50 });

function onMove(event: PointerEvent) {
  const el = root.value;
  if (!el || prefersReducedMotion()) return;

  const rect = el.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width;
  const py = (event.clientY - rect.top) / rect.height;

  // Invert Y so the card tips *away* from the cursor, which is what reads as
  // the surface being pushed.
  ry.value = (px - 0.5) * 2 * props.max;
  rx.value = -(py - 0.5) * 2 * props.max;
  glarePos.value = { x: px * 100, y: py * 100 };
}

function onEnter() {
  hovering.value = true;
}

function onLeave() {
  hovering.value = false;
  rx.value = 0;
  ry.value = 0;
}
</script>

<template>
  <div
    ref="root"
    class="persp-900"
    @pointermove="onMove"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <div
      class="preserve-3d relative will-change-transform"
      :style="{
        transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${hovering ? props.scale : 1})`,
        transition: hovering
          ? 'transform 0.15s ease-out'
          : 'transform 0.7s cubic-bezier(0.215, 0.61, 0.355, 1)',
      }"
    >
      <slot />
      <div
        v-if="glare"
        class="pointer-events-none absolute inset-0 z-2 transition-opacity duration-500"
        :style="{
          opacity: hovering ? 0.5 : 0,
          background: `radial-gradient(340px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.14), transparent 60%)`,
        }"
      />
    </div>
  </div>
</template>
