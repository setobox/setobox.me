<script setup lang="ts">
/**
 * AboutPage - the long-form version: portrait, full info table, roles,
 * interests, and every link (not just the featured ones).
 */
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import ElectricBorder from "@/components/bits/ElectricBorder.vue";
import FadeContent from "@/components/bits/FadeContent.vue";
import HexTile from "@/components/ui/HexTile.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import TextType from "@/components/bits/TextType.vue";
import { infoRows, profile, roles, socials, stack } from "@/data/profile";

const detailRows = [
  ...infoRows,
  { label: "A.K.A.", value: profile.aka.join(" / "), icon: "i-lucide-layers" },
  { label: "EMAIL", value: profile.email, icon: "i-lucide-mail" },
];
</script>

<template>
  <div class="pt-28 md:pt-36">
    <div class="container-page">
      <SectionHeading title="ABOUT" kicker="the long version" icon="i-lucide-user" />

      <!-- Portrait + identity table -->
      <div class="mt-16 flex flex-col gap-12 lg:mt-20 lg:flex-row lg:gap-16">
        <FadeContent :blur="true" :duration="1000" :delay="100">
          <ElectricBorder
            color="#8B5CF6"
            :chaos="0.04"
            :speed="1"
            :thickness="3"
            hexagon
            class-name="mx-auto h-[300px] w-[260px] lg:mx-0"
          >
            <div class="h-[300px] w-[260px] hex-point overflow-hidden bg-void-800">
              <img
                :src="profile.avatar"
                :alt="`${profile.handle} avatar`"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </ElectricBorder>
        </FadeContent>

        <div class="flex-1">
          <dl class="grid gap-x-8 sm:grid-cols-2">
            <div
              v-for="row in detailRows"
              :key="row.label"
              class="group flex flex-col gap-1 border-b border-silver-800/80 py-4 transition-colors duration-400 hover:border-cyan-500/50"
            >
              <dt
                class="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.26em] text-violet-300"
              >
                <span :class="row.icon" class="text-xs" aria-hidden="true" />
                {{ row.label }}
              </dt>
              <dd
                class="break-all font-display text-base tracking-[0.03em] text-silver-100 text-glow"
              >
                {{ row.value }}
              </dd>
            </div>
          </dl>

          <AnimatedContent :distance="26" :duration="0.9" class="mt-8">
            <div class="cut-14 border border-silver-800 bg-void-800/50 p-6 backdrop-blur-sm">
              <p class="label-mono mb-4">
                <span class="i-lucide-terminal text-xs" aria-hidden="true" />
                introduction
              </p>
              <p
                v-for="(line, i) in profile.intro"
                :key="i"
                class="body-text text-sm leading-loose"
              >
                {{ line }}
              </p>
            </div>
          </AnimatedContent>
        </div>
      </div>

      <!-- Roles -->
      <div class="mt-24">
        <SectionHeading title="ROLES" kicker="hats worn" icon="i-lucide-wand-sparkles" />
        <div class="mt-12 flex flex-wrap justify-center gap-x-2">
          <div v-for="(role, i) in roles" :key="role.name" :class="i % 2 === 1 ? 'sm:mt-16' : ''">
            <HexTile :label="role.name" :icon="role.icon" accent :size="110" />
          </div>
        </div>
      </div>

      <!-- Stack -->
      <div class="mt-24">
        <SectionHeading title="STACK" kicker="tools of trade" icon="i-lucide-cpu" />
        <div class="mt-12 flex flex-wrap justify-center gap-x-1.5">
          <div v-for="(tech, i) in stack" :key="tech.name" :class="i % 2 === 1 ? 'mt-11' : ''">
            <HexTile :label="tech.name" :accent="tech.key" :size="86" />
          </div>
        </div>
      </div>

      <!-- Interests -->
      <div class="mt-24">
        <SectionHeading title="INTERESTS" kicker="off the clock" icon="i-lucide-sparkles" />
        <AnimatedContent :distance="30" :duration="0.9" class="mt-12">
          <div
            class="mx-auto max-w-3xl cut-16 border border-silver-800 bg-void-800/50 p-8 backdrop-blur-sm"
          >
            <p class="body-text leading-loose">喜欢新奇的事物，痴迷于技术与艺术的结合。</p>
            <p class="body-text leading-loose">......</p>
            <p class="mt-6 font-mono text-xs text-cyan-200">
              <TextType :text="['// coding.', '// learning.', '// exploring.', '// exercising.']" />
            </p>
          </div>
        </AnimatedContent>
      </div>

      <!-- All links -->
      <div class="mt-24 pb-8">
        <SectionHeading title="ELSEWHERE" kicker="find me around" icon="i-lucide-globe" />
        <div class="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a
            v-for="s in socials"
            :key="s.name"
            :href="s.href"
            target="_blank"
            rel="noopener noreferrer"
            class="cursor-target group flex items-center gap-3 cut-12 border border-silver-700/80 bg-void-800/60 px-5 py-4 backdrop-blur-sm transition-all duration-400 ease-hex hover:border-violet-400/70 hover:bg-void-700/70"
          >
            <span
              :class="s.icon"
              class="text-lg text-silver-300 transition-colors duration-400 group-hover:text-violet-300"
              aria-hidden="true"
            />
            <span
              class="font-display text-sm uppercase tracking-[0.14em] text-silver-200 group-hover:text-white"
            >
              {{ s.name }}
            </span>
            <span
              class="i-lucide-arrow-up-right ml-auto text-sm text-silver-600 transition-all duration-400 ease-hex group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-300"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
