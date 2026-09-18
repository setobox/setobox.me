<script setup lang="ts">
/**
 * SectionHeading - the `- ABOUT -` style rule used between sections.
 *
 * Laid out as an explicit `1fr auto 1fr` grid rather than flex: with flex, a
 * `whitespace-nowrap` title wide enough to overflow collapses both `flex-1`
 * rules to zero and pushes the whole row past the container, which made the
 * two rules visibly different lengths.
 */
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import DecryptedText from "@/components/bits/DecryptedText.vue";

interface Props {
  title: string;
  /** Small mono kicker above the title. */
  kicker?: string;
  /** Lucide class for the glyph set beside the title. */
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  kicker: "",
  icon: "",
});
</script>

<template>
  <AnimatedContent :distance="40" :duration="1" :threshold="0.1">
    <div class="flex flex-col items-center gap-3">
      <p v-if="kicker" class="label-mono flex items-center gap-1.5">
        <span class="i-lucide-chevron-right text-xs" aria-hidden="true" />
        {{ kicker }}
      </p>

      <div class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
        <span
          class="h-px w-full bg-gradient-to-r from-transparent to-silver-700"
          aria-hidden="true"
        />

        <div class="flex min-w-0 items-center gap-3 sm:gap-4">
          <h2
            class="font-display font-light uppercase tracking-[0.12em] text-silver-50 text-[clamp(2.6rem,10vw,7rem)] leading-none flex items-center gap-3"
          >
            <DecryptedText
              :text="props.title"
              :max-iterations="10"
              animate-on="view"
              class="text-glow"
            />
            <span
              v-if="props.icon"
              :class="props.icon"
              class="shrink-0 text-[0.7em] text-violet-400"
              aria-hidden="true"
            />
          </h2>
        </div>

        <span
          class="h-px w-full bg-gradient-to-l from-transparent to-silver-700"
          aria-hidden="true"
        />
      </div>
    </div>
  </AnimatedContent>
</template>
