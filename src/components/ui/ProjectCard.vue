<script setup lang="ts">
/**
 * ProjectCard - a chamfered "box" panel: cover on one side, copy on the other,
 * alternating sides down the list.
 *
 * Layers, outermost in: AnimatedContent (scroll reveal) > Magnet (cursor pull)
 * > SpotlightCard (highlight) > the panel. Each does one thing, so any of them
 * can be dropped without touching the others.
 */
import { computed } from "vue";
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import LoadingImg from "@/components/bits/LoadingImg.vue";
import Magnet from "@/components/bits/Magnet.vue";
import SpotlightCard from "@/components/bits/SpotlightCard.vue";
import type { Project } from "@/data/projects";

interface Props {
  project: Project;
  /** Flip the cover to the right and reverse the reveal direction. */
  flip?: boolean;
}

const props = withDefaults(defineProps<Props>(), { flip: false });

/**
 * Deterministic hue from the title, so the procedural fallback cover is stable
 * across reloads instead of flickering to a new colour each mount.
 */
const hue = computed(() => {
  let h = 0;
  for (const ch of props.project.title) h = (h * 31 + ch.charCodeAt(0)) % 360;
  // Bias into the violet/magenta/cyan arc of the palette.
  return 200 + (h % 130);
});
</script>

<template>
  <AnimatedContent
    :distance="70"
    direction="horizontal"
    :reverse="flip"
    :duration="1.1"
    :threshold="0.14"
  >
    <Magnet :padding="200" :disabled="false" :magnet-strength="30" w-full>
      <SpotlightCard
        class="cut-18 group border border-silver-700/80 bg-void-800/80 backdrop-blur-md transition-all duration-500 ease-hex hover:border-violet-500/70"
      >
        <div
          class="relative z-2 flex flex-col md:flex-row"
          :class="{ 'md:flex-row-reverse': flip }"
        >
          <!-- Cover -->
          <div
            class="relative aspect-16/10 w-full shrink-0 overflow-hidden md:aspect-auto md:min-h-[260px] md:w-[min(36vw,440px)]"
          >
            <LoadingImg
              :src="project.cover"
              :alt="`${project.title} cover`"
              img-class="transition-transform duration-700 ease-hex group-hover:scale-105"
            >
              <!-- Procedural fallback: a hexagon field in the project's own hue. -->
              <div
                class="absolute inset-0 h-full w-full transition-transform duration-700 ease-hex group-hover:scale-105"
                :style="{
                  background: `radial-gradient(120% 120% at 25% 15%, hsl(${hue} 80% 42% / 55%), transparent 60%), radial-gradient(100% 100% at 85% 90%, hsl(${hue + 60} 85% 50% / 40%), transparent 55%), #0A0722`,
                }"
              >
                <div class="grid h-full w-full place-items-center">
                  <span
                    class="i-lucide-hexagon text-6xl opacity-25"
                    :style="{ color: `hsl(${hue} 90% 75%)` }"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </LoadingImg>
            <!-- Colour wash that clears on hover. -->
            <div
              class="pointer-events-none absolute inset-0 bg-void-900/55 transition-opacity duration-700 ease-hex group-hover:opacity-0"
            />
          </div>

          <!-- Copy -->
          <div
            class="flex flex-1 flex-col gap-4 border-t-2 border-silver-700/70 p-6 md:border-t-0 md:p-8"
            :class="flip ? 'md:border-r-2' : 'md:border-l-2'"
          >
            <a :href="project.href" target="_blank" rel="noopener noreferrer" class="block">
              <div class="flex gap-4 w-fit cursor-target">
                <span
                  class="font-display text-3xl font-light uppercase tracking-[0.06em] text-silver-50 transition-all duration-300 group-hover:glow-14 hovertrans md:text-4xl"
                >
                  {{ project.title }}
                </span>
                <span
                  class="i-lucide-arrow-up-right shrink-0 text-xl text-silver-500 transition-all duration-400 ease-hex group-hover:translate-x-1 group-hover:text-violet-300"
                  aria-hidden="true"
                />
              </div>
            </a>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in project.tags"
                :key="tag"
                class="cut-tr-6 border border-violet-500/40 bg-violet-600/12 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-violet-200"
              >
                {{ tag }}
              </span>
            </div>

            <div class="space-y-2 border-t border-silver-700/60 pt-4">
              <p v-for="(d, i) in project.desc" :key="i" class="body-text text-sm md:text-base">
                {{ d }}
              </p>
            </div>

            <p
              class="mt-auto pt-4 font-mono text-[0.66rem] uppercase tracking-[0.24em] text-silver-500"
            >
              Started {{ project.date }}
            </p>
          </div>
        </div>
      </SpotlightCard>
    </Magnet>
  </AnimatedContent>
</template>
