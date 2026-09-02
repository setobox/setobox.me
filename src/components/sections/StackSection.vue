<script setup lang="ts">
/**
 * StackSection - roles as a honeycomb, then the tech list as a physics word
 * cloud.
 *
 * The honeycomb is a flex wrap with negative row margin and alternate-row
 * offset rather than a grid: a real interlocking honeycomb has half-column
 * offsets that CSS grid cannot express without one column per half-step.
 */
import { computed, useTemplateRef } from "vue";
import FallingText from "@/components/bits/FallingText.vue";
import HexTile from "@/components/ui/HexTile.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import { scrollReveal, useGSAP } from "@/composables/useGSAP";
import { roles, stack } from "@/data/profile";

const root = useTemplateRef<HTMLElement>("root");

/** Falling words: the tech list as a physics word cloud. */
const stackText = computed(() => stack.map((t) => t.name).join(" "));
const highlightedStack = computed(() => stack.filter((t) => t.key).map((t) => t.name));

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    scrollReveal(".role-tile", {
      trigger: ".role-comb",
      scale: 0.2,
      rotate: -60,
      duration: 0.75,
      ease: "back.out(1.7)",
      stagger: { each: 0.08, from: "center" },
      start: "top 86%",
    });
  },
  { scope: root },
);
</script>

<template>
  <section ref="root" id="stack" class="section-y">
    <div class="container-page">
      <SectionHeading title="TECH STACK" kicker="what the box is made of" icon="i-lucide-cpu" />

      <!-- Roles honeycomb -->
      <div class="role-comb mt-16 flex flex-wrap justify-center gap-x-2 gap-y-0 lg:mt-24">
        <div
          v-for="(role, i) in roles"
          :key="role.name"
          class="role-tile"
          :class="i % 2 === 1 ? 'mt-[-14px] sm:mt-16' : ''"
        >
          <HexTile :label="role.name" :icon="role.icon" accent :size="112" />
        </div>
      </div>

      <!-- Tech word cloud: physics-driven falling words. -->
      <div class="stack-field mt-20 sm:mt-24">
        <div
          class="cut-14 mx-auto h-[320px] w-full max-w-4xl border border-silver-700/70 bg-void-800/50 backdrop-blur-sm sm:h-[420px]"
        >
          <FallingText
            :text="stackText"
            :highlight-words="highlightedStack"
            trigger="scroll"
            :gravity="0.4"
            font-size="1.8rem"
            :mouse-constraint-stiffness="1"
          />
        </div>
      </div>
    </div>
  </section>
</template>
