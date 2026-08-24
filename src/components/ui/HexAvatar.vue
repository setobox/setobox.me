<script setup lang="ts">
/**
 * HexAvatar - the portrait, clipped to a hexagon and ringed by two
 * counter-rotating hex outlines plus an orbiting node.
 *
 * The rings are separate elements rather than a single decorated one because
 * they rotate at different rates in opposite directions - the visual reason
 * the frame reads as machinery rather than a border.
 */
import { ref, useTemplateRef } from "vue";
import { gsap, useGSAP } from "@/composables/useGSAP";

interface Props {
  src: string;
  alt?: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "",
  size: 300,
});

const root = useTemplateRef<HTMLDivElement>("root");
const loaded = ref(false);

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    gsap.to(".hex-ring-outer", {
      rotate: 360,
      duration: 26,
      ease: "none",
      repeat: -1,
    });
    // The inner ring stays fixed and concentric with the portrait. Rotating
    // both produced two hexagons at unrelated angles, which read as clutter
    // rather than machinery - one moving ring against one static edge is
    // legible.
    gsap.to(".hex-ring-inner", {
      opacity: 0.75,
      duration: 3.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    // The orbit node rides its own wrapper so its counter-rotation keeps the
    // node itself upright.
    gsap.to(".hex-orbit", {
      rotate: 360,
      duration: 11,
      ease: "none",
      repeat: -1,
    });
  },
  { scope: root },
);
</script>

<template>
  <div
    ref="root"
    class="relative shrink-0"
    :style="{ width: `${props.size}px`, height: `${props.size * 1.1547}px` }"
  >
    <!-- Outer ring, drawn as an SVG so the stroke stays even at every vertex. -->
    <svg
      class="hex-ring-outer absolute -inset-[7%] origin-center"
      viewBox="0 0 100 115.47"
      fill="none"
      aria-hidden="true"
    >
      <polygon
        points="50,1 98,28.6 98,86.8 50,114.4 2,86.8 2,28.6"
        stroke="url(#ring-grad)"
        stroke-width="1"
        stroke-dasharray="14 9"
        opacity="0.75"
      />
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#4CD9F5" />
          <stop offset="0.5" stop-color="#8B5CF6" />
          <stop offset="1" stop-color="#FF2E9E" />
        </linearGradient>
      </defs>
    </svg>

    <svg
      class="hex-ring-inner absolute -inset-[2%] origin-center"
      viewBox="0 0 100 115.47"
      fill="none"
      aria-hidden="true"
    >
      <polygon
        points="50,1 98,28.6 98,86.8 50,114.4 2,86.8 2,28.6"
        stroke="#8B5CF6"
        stroke-width="0.8"
        opacity="0.45"
      />
    </svg>

    <!-- Orbiting node. -->
    <div class="hex-orbit pointer-events-none absolute inset-0 origin-center">
      <div
        class="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 hex-point bg-cyan-400 shadow-[0_0_12px_#4CD9F5]"
      />
    </div>

    <!-- The portrait. -->
    <div class="absolute inset-0 hex-point overflow-hidden bg-void-800">
      <img
        :src="props.src"
        :alt="props.alt"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-all duration-700 ease-hex"
        :class="loaded ? 'scale-100 opacity-100 blur-0' : 'scale-110 opacity-0 blur-lg'"
        @load="loaded = true"
      />
      <!-- Colour wash that clears on hover, matching the reference site's
           grayscale-to-colour reveal but tinted to the Silver Wolf palette. -->
      <div
        class="pointer-events-none absolute inset-0 bg-violet-700/25 mix-blend-multiply transition-opacity duration-700 ease-hex hover:opacity-0"
      />
    </div>
  </div>
</template>
