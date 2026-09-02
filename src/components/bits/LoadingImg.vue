<script setup lang="ts">
/**
 * LoadingImg - image with a shimmering skeleton placeholder and a slot-based
 * fallback for the missing/error case.
 *
 * `src` empty or failing to load shows the `#fallback` slot, so a broken or
 * hotlink-blocked image degrades to something intentional instead of a broken
 * image icon.
 */
import { ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    /** Extra classes for the <img> (e.g. hover scale / object-fit tweaks). */
    imgClass?: string;
  }>(),
  { src: "", alt: "", imgClass: "" },
);

const loaded = ref(false);
const failed = ref(false);

watch(
  () => props.src,
  () => {
    loaded.value = false;
    failed.value = false;
  },
);
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <!-- Shimmering skeleton while the image is still loading. -->
    <div v-if="!loaded && !failed" class="skeleton absolute inset-0" aria-hidden="true" />

    <img
      v-if="props.src && !failed"
      :src="props.src"
      :alt="props.alt"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover transition-opacity duration-700"
      :class="[loaded ? 'opacity-100' : 'opacity-0', props.imgClass]"
      @load="loaded = true"
      @error="failed = true"
    />

    <slot v-if="failed || !props.src" />
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(110deg, #0a0722 8%, #161141 18%, #0a0722 33%);
  background-size: 200% 100%;
  animation: loadingimg-shimmer 1.4s linear infinite;
}

@keyframes loadingimg-shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
