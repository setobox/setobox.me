<script setup lang="ts">
/**
 * NowCard - a compact cover card for the "recently listening / playing" rows:
 * cover with a shimmering skeleton, hover wash that clears, and a title +
 * subtitle over a chamfered panel.
 */
import LoadingImg from "@/components/bits/LoadingImg.vue";

interface Props {
  title: string;
  cover: string;
  href: string;
  /** Artist (listening) or note (playing). */
  subtitle?: string;
  /** Fallback glyph while the cover is missing or loading. */
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  icon: "i-lucide-sparkles",
});
</script>

<template>
  <a
    :href="props.href"
    target="_blank"
    rel="noopener noreferrer"
    class="cursor-target hovertrans group relative block cut-14 overflow-hidden border border-silver-700/70 bg-void-800/60 backdrop-blur-sm"
  >
    <div class="relative aspect-square w-full overflow-hidden">
      <LoadingImg :src="props.cover" :alt="props.title">
        <div class="absolute inset-0 grid place-items-center bg-void-700">
          <span :class="props.icon" class="text-3xl text-silver-500" aria-hidden="true" />
        </div>
      </LoadingImg>
      <div
        class="pointer-events-none absolute inset-0 bg-void-900/45 transition-opacity duration-500 group-hover:opacity-0"
      />
    </div>

    <div class="p-3">
      <p
        class="truncate font-display text-sm uppercase tracking-[0.06em] text-silver-100 group-hover:glow-12"
      >
        {{ props.title }}
      </p>
      <p
        v-if="props.subtitle"
        class="truncate font-mono text-[0.68rem] uppercase tracking-[0.12em] text-silver-400"
      >
        {{ props.subtitle }}
      </p>
    </div>

    <span
      class="i-lucide-arrow-up-right absolute right-3 top-3 text-silver-500 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
      aria-hidden="true"
    />
  </a>
</template>
