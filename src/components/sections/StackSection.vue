<script setup lang="ts">
/**
 * StackSection - roles as a honeycomb, then the tech list as a hexagon field.
 *
 * The honeycomb is a flex wrap with negative row margin and alternate-row
 * offset rather than a grid: a real interlocking honeycomb has half-column
 * offsets that CSS grid cannot express without one column per half-step.
 */
import { useTemplateRef } from "vue";
import HexTile from "@/components/ui/HexTile.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import { scrollReveal, useGSAP } from "@/composables/useGSAP";
import { roles, stack } from "@/data/profile";

const root = useTemplateRef<HTMLElement>("root");

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

    // Ripple outward from the centre of the field, the way the anime.js dot
    // matrix does - it makes a flat list of names feel like a system booting.
    scrollReveal(".stack-tile", {
      trigger: ".stack-field",
      scale: 0.2,
      duration: 0.6,
      ease: "back.out(1.5)",
      stagger: { each: 0.028, from: "center", grid: "auto" },
      start: "top 88%",
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

      <!-- Tech field -->
      <div class="stack-field mt-20 flex flex-wrap justify-center gap-x-1.5 gap-y-1 sm:mt-24">
        <div
          v-for="(tech, i) in stack"
          :key="tech.name"
          class="stack-tile"
          :class="i % 2 === 1 ? 'mt-11' : ''"
        >
          <HexTile :label="tech.name" :accent="tech.key" :size="88" />
        </div>
      </div>
    </div>
  </section>
</template>
