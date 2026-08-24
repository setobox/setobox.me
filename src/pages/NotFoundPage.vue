<script setup lang="ts">
import { useTemplateRef } from "vue";
import ScrambleText from "@/components/bits/ScrambleText.vue";
import { gsap, useGSAP } from "@/composables/useGSAP";

const root = useTemplateRef<HTMLElement>("root");

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    // Plays on mount rather than on scroll, so a plain `from` is safe here -
    // there is no refresh window in which it could be invalidated.
    gsap.from(".nf-hex", {
      scale: 0,
      opacity: 0,
      rotate: -140,
      duration: 0.9,
      ease: "back.out(2)",
      stagger: { each: 0.06, from: "random" },
    });
    // Slow tumble on the broken lattice, so the page reads as adrift.
    gsap.to(".nf-hex", {
      rotate: "random(-24, 24)",
      y: "random(-10, 10)",
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: { each: 0.15, from: "random" },
    });
  },
  { scope: root },
);
</script>

<template>
  <section ref="root" class="grid min-h-[100svh] place-items-center px-5 pt-24">
    <div class="flex flex-col items-center gap-8 text-center">
      <!-- A honeycomb with a hole in it. The gap is drawn as an outline layer
           plus an inset fill layer, because `border` + `clip-path` would clip
           the border itself and leave four disconnected segments. -->
      <div class="flex gap-1.5" aria-hidden="true">
        <span
          v-for="i in 7"
          :key="i"
          class="nf-hex relative h-8 w-9"
          :class="i % 2 === 0 ? 'mt-5' : ''"
        >
          <span
            class="absolute inset-0 hex-point"
            :class="i === 4 ? 'bg-magenta-500' : 'bg-silver-700'"
          />
          <span v-if="i === 4" class="absolute inset-[2px] hex-point bg-void-900" />
        </span>
      </div>

      <h1
        class="font-display text-[clamp(4rem,18vw,10rem)] font-light leading-none text-silver-50"
        translate="no"
      >
        <span class="glitch" data-text="404">404</span>
      </h1>

      <p class="font-mono text-xs uppercase tracking-[0.3em] text-violet-300">
        <ScrambleText text="BOX NOT FOUND" />
      </p>
      <p class="body-text max-w-sm text-sm">
        这个格子是空的……也许它还没有被造出来，或者已经被搬走了。
      </p>

      <RouterLink to="/" class="cursor-target btn-hex">
        <span class="i-lucide-hexagon text-sm" aria-hidden="true" />
        Back to home
      </RouterLink>
    </div>
  </section>
</template>
