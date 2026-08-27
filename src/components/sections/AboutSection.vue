<script setup lang="ts">
/**
 * AboutSection - hexagon portrait beside a stack of label/value rows.
 *
 * Rows animate as one staggered group via a single ScrollTrigger rather than
 * per-row AnimatedContent wrappers: five triggers on five adjacent elements
 * would fire almost simultaneously anyway, and one costs a fifth as much.
 */
import { useTemplateRef } from "vue";
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import FadeContent from "@/components/bits/FadeContent.vue";
import HexAvatar from "@/components/ui/HexAvatar.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import { scrollReveal, useGSAP } from "@/composables/useGSAP";
import { infoRows, profile } from "@/data/profile";

interface Props {
  intro?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  intro: true,
});

const root = useTemplateRef<HTMLElement>("root");

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    scrollReveal(".info-row", {
      trigger: ".info-stack",
      x: 34,
      stagger: 0.1,
      start: "top 88%",
    });

    if (props.intro) {
      scrollReveal(".intro-line", {
        trigger: ".intro-block",
        y: 22,
        duration: 0.8,
        start: "top 90%",
      });
    }
  },
  { scope: root },
);
</script>

<template>
  <section ref="root" id="about" class="section-y">
    <div class="container-page">
      <SectionHeading title="ABOUT" kicker="who is behind the box" icon="i-lucide-box" />

      <div
        class="mt-16 flex flex-col items-center gap-12 lg:mt-24 lg:flex-row lg:items-start lg:gap-20"
      >
        <FadeContent :blur="true" :duration="1000" :delay="120">
          <HexAvatar :src="profile.avatar" :alt="`${profile.handle} avatar`" :size="270" />
        </FadeContent>

        <div class="flex flex-1 flex-col gap-10">
          <!-- Info rows -->
          <dl class="info-stack flex flex-col">
            <div
              v-for="row in infoRows"
              :key="row.label"
              class="info-row group flex items-center gap-4 border-b border-silver-800/80 py-3.5 transition-colors duration-400 hover:border-violet-500/50"
            >
              <span
                :class="row.icon"
                class="shrink-0 text-base text-silver-600 transition-colors duration-400 group-hover:text-violet-400"
                aria-hidden="true"
              />
              <dt
                class="w-24 shrink-0 font-mono text-base uppercase tracking-[0.14em] text-violet-300 sm:w-28"
              >
                {{ row.label }}
              </dt>
              <dd
                class="font-display text-base tracking-[0.04em] text-silver-100 transition-all duration-300 group-hover:glow-10 sm:text-lg"
              >
                {{ row.value }}
              </dd>
            </div>

            <div
              class="info-row group flex items-center gap-4 border-b border-silver-800/80 py-3.5"
            >
              <span class="i-lucide-layers shrink-0 text-base text-silver-600" aria-hidden="true" />
              <dt
                class="w-24 shrink-0 font-mono text-base uppercase tracking-[0.24em] text-violet-300 sm:w-28"
              >
                A.K.A.
              </dt>
              <dd class="flex flex-wrap gap-2">
                <span
                  v-for="alias in profile.aka"
                  :key="alias"
                  class="cut-tr-5 border border-cyan-500/35 bg-cyan-500/8 px-2 py-0.5 text-sm text-cyan-200"
                >
                  {{ alias }}
                </span>
              </dd>
            </div>
          </dl>

          <!-- Intro prose -->
          <AnimatedContent v-if="intro" :distance="30" :duration="0.9" :threshold="0.1">
            <div
              class="intro-block relative cut-14 border border-silver-800 bg-void-800/50 p-6 backdrop-blur-sm sm:p-8"
            >
              <span
                class="i-lucide-quote absolute -top-3 left-6 bg-void-900 px-1 text-lg text-violet-500"
                aria-hidden="true"
              />
              <p
                v-for="(line, i) in profile.intro"
                :key="i"
                class="intro-line body-text text-sm leading-loose sm:text-base"
              >
                {{ line }}
              </p>
            </div>
          </AnimatedContent>
        </div>
      </div>
    </div>
  </section>
</template>
