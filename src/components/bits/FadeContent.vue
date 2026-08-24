<script setup lang="ts">
/**
 * FadeContent - blur-and-fade reveal on intersection.
 *
 * Deliberately CSS-transition based rather than GSAP: this is used on large
 * media panels where a compositor-only opacity/filter transition is cheaper
 * than a JS-driven tween, and there is no sequencing to coordinate.
 */
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  blur?: boolean;
  /** Milliseconds. */
  duration?: number;
  /** Milliseconds. */
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  easing?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blur: false,
  duration: 900,
  delay: 0,
  threshold: 0.1,
  initialOpacity: 0,
  easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
});

const root = useTemplateRef<HTMLDivElement>("root");
const shown = ref(false);
let observer: IntersectionObserver | null = null;
let timer = 0;

onMounted(() => {
  if (prefersReducedMotion()) {
    shown.value = true;
    return;
  }

  const el = root.value;
  if (!el) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer?.disconnect();
      timer = window.setTimeout(() => {
        shown.value = true;
      }, props.delay);
    },
    { threshold: props.threshold },
  );

  observer.observe(el);
});

onUnmounted(() => {
  observer?.disconnect();
  window.clearTimeout(timer);
});
</script>

<template>
  <div
    ref="root"
    :style="{
      opacity: shown ? 1 : props.initialOpacity,
      filter: blur ? (shown ? 'blur(0px)' : 'blur(12px)') : 'none',
      transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
      willChange: shown ? 'auto' : 'opacity, filter',
    }"
  >
    <slot />
  </div>
</template>
