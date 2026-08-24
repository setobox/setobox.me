<script setup lang="ts">
/**
 * ContactSection - email call-to-action plus the featured social links, each
 * in a chamfered box with an electric border on the primary one.
 */
import { useTemplateRef } from "vue";
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import ElectricBorder from "@/components/bits/ElectricBorder.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import TiltedCard from "@/components/bits/TiltedCard.vue";
import { scrollReveal, useGSAP } from "@/composables/useGSAP";
import { profile, socials } from "@/data/profile";

const root = useTemplateRef<HTMLElement>("root");
const featured = socials.filter((s) => s.featured);

useGSAP(
  ({ reduced }) => {
    if (reduced) return;

    scrollReveal(".contact-link", {
      trigger: ".contact-grid",
      y: 30,
      duration: 0.8,
      stagger: 0.09,
      start: "top 92%",
    });
  },
  { scope: root },
);
</script>

<template>
  <section ref="root" id="contact" class="section-y">
    <div class="container-page">
      <SectionHeading title="CONTACT" kicker="open a channel" icon="i-lucide-message-circle" />

      <div class="mx-auto mt-16 max-w-4xl lg:mt-24">
        <!-- Primary: email -->
        <AnimatedContent :distance="40" :duration="1" :threshold="0.12">
          <TiltedCard :max="6">
            <a
              :href="`mailto:${profile.email}`"
              class="group relative block cut-20 border border-violet-500/40 bg-void-800/70 p-8 backdrop-blur-md sm:p-12"
            >
              <ElectricBorder color="#8B5CF6" :chaos="0.3" :speed="0.8" :radius="0" />
              <div class="relative z-2 flex flex-col items-center gap-4 text-center">
                <span
                  class="i-lucide-mail text-4xl text-violet-300 transition-transform duration-500 ease-hex group-hover:scale-110"
                  aria-hidden="true"
                />
                <p class="label-mono">drop a line</p>
                <p
                  class="cursor-target break-all font-display text-xl tracking-[0.04em] text-silver-50 transition-all duration-300 group-hover:glow-16 sm:text-3xl"
                >
                  {{ profile.email }}
                </p>
                <p class="body-text max-w-md text-sm">……</p>
              </div>
            </a>
          </TiltedCard>
        </AnimatedContent>

        <!-- Secondary: featured socials -->
        <div class="contact-grid mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            v-for="s in featured"
            :key="s.name"
            :href="s.href"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-link cursor-target group flex items-center gap-3 cut-12 border border-silver-700/80 bg-void-800/60 px-5 py-4 backdrop-blur-sm transition-all duration-400 ease-hex hover:border-purple-400/70 hover:bg-void-700/70"
          >
            <span
              :class="s.icon"
              class="text-lg text-silver-300 transition-colors duration-400 group-hover:text-purple-300"
              aria-hidden="true"
            />
            <span
              class="font-display text-sm uppercase tracking-[0.14em] text-silver-200 transition-colors duration-400 group-hover:text-white"
            >
              {{ s.name }}
            </span>
            <span
              class="i-lucide-arrow-up-right ml-auto text-sm text-silver-600 transition-all duration-400 ease-hex group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-300"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
