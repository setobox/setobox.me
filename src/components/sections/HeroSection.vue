<script setup lang="ts">
/**
 * HeroSection - full-viewport headline with a hexagon ring behind it.
 *
 * The headline lines use AnimatedContent so their entrance behavior stays
 * consistent with the rest of the site. The ring and scroll parallax remain
 * local GSAP effects because they are continuous scene motion.
 */
import { computed, useTemplateRef } from "vue";
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import { useSmoothScroll } from "@/composables/useSmoothScroll";
import { gsap, useGSAP } from "@/composables/useGSAP";
import { profile, site } from "@/data/profile";

const root = useTemplateRef<HTMLElement>("root");
const { scrollTo } = useSmoothScroll();
const props = defineProps<{ ready: boolean }>();

/** Words carry their own spans so GSAP can stagger them individually. */
const lines = computed(() => profile.headline.map((line) => line.split(" ")));
const firstLine = computed(() => lines.value[0] ?? []);
const secondLine = computed(() => lines.value[1] ?? []);

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    // .hero-cue bounces in after the headline has settled, then fades out as the user scrolls down.
    gsap.fromTo(
      ".hero-cue",
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 2.5,
      },
    );
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
    <!-- Background glow. -->
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(70vw,560px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.4)_0%,rgba(76,217,245,0.12)_45%,transparent_72%)] blur-[48px] mix-blend-screen"
      aria-hidden="true"
    />

    <div class="hero-inner relative z-2 flex w-full max-w-6xl flex-col items-center">
      <h1 class="sr-only">{{ site.identity }}</h1>
      <div
        class="w-full text-center font-display2 font-light uppercase leading-[1.04] tracking-[0.01em] text-silver-50 text-[clamp(1.5rem,5.5vw,7.5rem)]"
        translate="no"
      >
        <AnimatedContent
          :enabled="props.ready"
          :distance="100"
          direction="vertical"
          :reverse="false"
          :duration="1.1"
          ease="power3.out"
          :initial-opacity="0"
          :animate-opacity="true"
          :scale="1.1"
          :threshold="0.1"
          :delay="0.5"
        >
          <p class="overflow-hidden py-[0.06em]">
            <span v-for="(word, wi) in firstLine" :key="wi" class="text-glow">
              {{ word }}<span v-if="wi < firstLine.length - 1">&nbsp;</span>
            </span>
          </p>
        </AnimatedContent>
        <AnimatedContent
          :enabled="props.ready"
          :distance="100"
          direction="vertical"
          :reverse="false"
          :duration="1.5"
          ease="power3.out"
          :initial-opacity="0"
          :animate-opacity="true"
          :scale="1.2"
          :threshold="0.1"
          :delay="0.9"
        >
          <p class="overflow-hidden py-[0.06em]">
            <span
              v-for="(word, wi) in secondLine"
              :key="wi"
              :class="{ 'text-violet-300': wi === secondLine.length - 1 }"
              class="text-glow"
            >
              {{ word }}<span v-if="wi < secondLine.length - 1">&nbsp;</span>
            </span>
          </p>
        </AnimatedContent>
      </div>
    </div>

    <!-- Scroll cue. -->
    <a
      href="#about"
      class="hero-cue cursor-target absolute bottom-9 left-1/2 z-2 flex -translate-x-1/2 flex-col items-center gap-2 text-silver-500 transition-colors duration-300 hover:text-violet-300"
      aria-label="查看个人资料"
      @click.prevent="next"
    >
      <span class="i-lucide-chevron-down scroll-cue text-6xl" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.scroll-cue {
  animation: scroll-cue-pulse 4s ease-in-out infinite;
}

@keyframes scroll-cue-pulse {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.06);
  }
}
</style>
