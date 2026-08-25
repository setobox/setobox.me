<script setup lang="ts">
/**
 * MarqueeDivider - two counter-rotating bands of oversized outline type,
 * used to separate the major sections.
 */
import ScrollVelocity from "@/components/bits/ScrollVelocity.vue";

interface Props {
  texts: [string, string];
}

defineProps<Props>();
</script>

<template>
  <div class="relative overflow-hidden py-6" aria-hidden="true">
    <ScrollVelocity
      :texts="texts"
      :velocity="60"
      :damping="50"
      :stiffness="400"
      :velocity-mapping="{ input: [0, 1000], output: [0, 5] }"
      class-name="font-display font-light uppercase text-[clamp(2.6rem,9vw,7rem)] leading-[1.15] tracking-[0.02em] text-stroke-silver-200"
    />
    <!-- Fade the bands into the page edges so they read as a texture rather 
         than a hard-cropped element. -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 w-[14vw] bg-gradient-to-r from-void-900 to-transparent"
    />
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-[14vw] bg-gradient-to-l from-void-900 to-transparent"
    />
  </div>
</template>
