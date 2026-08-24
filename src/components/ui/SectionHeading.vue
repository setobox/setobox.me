<script setup lang="ts">
/**
 * SectionHeading - the `- ABOUT -` style rule used between sections.
 *
 * The dashes are hexagons here: a rule-hexagon-title-hexagon-rule lockup.
 *
 * Laid out as an explicit `1fr auto 1fr` grid rather than flex: with flex, a
 * `whitespace-nowrap` title wide enough to overflow collapses both `flex-1`
 * rules to zero and pushes the whole row past the container, which made the
 * two rules visibly different lengths.
 */
import AnimatedContent from "@/components/bits/AnimatedContent.vue";
import ScrambleText from "@/components/bits/ScrambleText.vue";

interface Props {
  title: string;
  /** Small mono kicker above the title. */
  kicker?: string;
  /** Lucide class for the glyph set beside the title. */
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  kicker: "",
  icon: "i-lucide-hexagon",
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
          <span
            class="i-lucide-hexagon hidden shrink-0 text-sm text-magenta-400 sm:block"
            aria-hidden="true"
          />
          <h2 class="h-section flex items-center gap-3">
            <ScrambleText :text="props.title" :churn="6" />
            <span
              :class="props.icon"
              class="shrink-0 text-[0.7em] text-violet-400"
              aria-hidden="true"
            />
          </h2>
          <span
            class="i-lucide-hexagon hidden shrink-0 text-sm text-cyan-400 sm:block"
            aria-hidden="true"
          />
        </div>

        <span
          class="h-px w-full bg-gradient-to-l from-transparent to-silver-700"
          aria-hidden="true"
        />
      </div>
    </div>
  </AnimatedContent>
</template>
