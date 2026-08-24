<script setup lang="ts">
/**
 * HeroSection - full-viewport headline with a hexagon ring behind it.
 *
 * The two headline lines are split into words and revealed on a stagger, then
 * the ring, typewriter and scroll cue land in sequence. One timeline drives all
 * of it so the rhythm stays fixed regardless of how long the fonts took.
 */
import { computed, useTemplateRef } from "vue";
import TextType from "@/components/bits/TextType.vue";
import { useSmoothScroll } from "@/composables/useSmoothScroll";
import { gsap, useGSAP } from "@/composables/useGSAP";
import { profile, site } from "@/data/profile";

const root = useTemplateRef<HTMLElement>("root");
const { scrollTo } = useSmoothScroll();

/** Words carry their own spans so GSAP can stagger them individually. */
const lines = computed(() => profile.headline.map((line) => line.split(" ")));

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    const tl = gsap.timeline({ delay: 0.35 });

    tl.from(".hero-word", {
      yPercent: 118,
      opacity: 0,
      duration: 1.05,
      ease: "expo.out",
      stagger: 0.085,
    })
      .from(
        ".hero-ring",
        { scale: 0.55, opacity: 0, rotate: -75, duration: 1.6, ease: "expo.out" },
        0.15,
      )
      .from(".hero-meta", { y: 24, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.7")
      .from(".hero-cue", { y: -14, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.4");

    // Slow drift on the ring once it has settled, so the hero is never static.
    gsap.to(".hero-ring", {
      rotate: 360,
      duration: 90,
      ease: "none",
      repeat: -1,
      delay: 2,
    });

    // Parallax the headline out as the next section arrives.
    gsap.to(".hero-inner", {
      yPercent: -14,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: {
        trigger: root.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  },
  { scope: root },
);

function next() {
  scrollTo(window.innerHeight, { duration: 1 });
}
</script>

<template>
  <section
    ref="root"
    class="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5"
  >
    <!-- Concentric hexagon rings behind the type. -->
    <div
      class="hero-ring pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(86vw,min(74vh,660px))] -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" fill="none" class="h-full w-full">
        <g stroke-linejoin="round">
          <polygon
            points="100,8 180,54 180,146 100,192 20,146 20,54"
            stroke="#8B5CF6"
            stroke-width="0.5"
            opacity="0.35"
          />
          <polygon
            points="100,28 163,64 163,136 100,172 37,136 37,64"
            stroke="#4CD9F5"
            stroke-width="0.4"
            stroke-dasharray="3 6"
            opacity="0.4"
          />
          <polygon
            points="100,52 142,76 142,124 100,148 58,124 58,76"
            stroke="#FF2E9E"
            stroke-width="0.35"
            opacity="0.25"
          />
        </g>
      </svg>
    </div>

    <div class="hero-inner relative z-2 flex w-full max-w-6xl flex-col items-center">
      <h1
        class="text-center font-display font-light uppercase leading-[1.04] tracking-[0.01em] text-silver-50 text-[clamp(1.85rem,7.8vw,5.4rem)]"
        translate="no"
      >
        <span v-for="(line, li) in lines" :key="li" class="block overflow-hidden py-[0.06em]">
          <span
            v-for="(word, wi) in line"
            :key="wi"
            class="hero-word inline-block will-change-transform"
            :class="{ 'text-violet-300': li === 1 && wi === line.length - 1 }"
          >
            {{ word }}<span v-if="wi < line.length - 1">&nbsp;</span>
          </span>
        </span>
      </h1>

      <div class="hero-meta mt-9 flex flex-col items-center gap-5">
        <!-- Fixed width, left-aligned: sizing to the current text would make
             the panel breathe in and out on every keystroke. Width is set from
             the longest string in the set. -->
        <div
          class="cut-10 w-[min(88vw,20rem)] border border-silver-700/80 bg-void-800/60 px-4 py-2.5 text-left backdrop-blur-sm"
        >
          <TextType :text="[...profile.typed]" class="font-mono text-xs text-cyan-200 sm:text-sm" />
        </div>

        <p
          class="max-w-md text-center font-mono text-[0.62rem] uppercase tracking-[0.34em] text-silver-400"
        >
          {{ site.tagline }}
        </p>
      </div>
    </div>

    <!-- Scroll cue. -->
    <button
      type="button"
      class="hero-cue cursor-target absolute bottom-9 left-1/2 z-2 flex -translate-x-1/2 flex-col items-center gap-2 text-silver-500 transition-colors duration-300 hover:text-violet-300"
      aria-label="Scroll to next section"
      @click="next"
    >
      <span class="font-mono text-[0.6rem] uppercase tracking-[0.3em]">scroll</span>
      <span class="i-lucide-chevron-down animate-bounce text-2xl" aria-hidden="true" />
    </button>
  </section>
</template>
