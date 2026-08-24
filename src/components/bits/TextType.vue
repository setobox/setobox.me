<script setup lang="ts">
/**
 * TextType - typewriter that cycles through a list of strings.
 *
 * Drives a single reactive string with `setTimeout` rather than one timer per
 * character, so pausing or unmounting mid-word cancels exactly one handle.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import { prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  text: string[];
  /** Milliseconds per character typed. */
  typingSpeed?: number;
  /** Milliseconds per character deleted. */
  deletingSpeed?: number;
  /** Milliseconds held at the end of a complete string. */
  pauseDuration?: number;
  showCursor?: boolean;
  cursorChar?: string;
  /** Stop after the last string rather than looping. */
  once?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  typingSpeed: 62,
  deletingSpeed: 28,
  pauseDuration: 1900,
  showCursor: true,
  cursorChar: "_",
  once: false,
});

const shown = ref("");
const index = ref(0);
const deleting = ref(false);
const done = ref(false);

let timer = 0;

const current = computed(() => props.text[index.value % props.text.length] ?? "");

function tick() {
  const full = current.value;

  if (!deleting.value) {
    if (shown.value.length < full.length) {
      shown.value = full.slice(0, shown.value.length + 1);
      timer = window.setTimeout(tick, props.typingSpeed);
      return;
    }

    const isLast = index.value === props.text.length - 1;
    if (props.once && isLast) {
      done.value = true;
      return;
    }

    deleting.value = true;
    timer = window.setTimeout(tick, props.pauseDuration);
    return;
  }

  if (shown.value.length > 0) {
    shown.value = full.slice(0, shown.value.length - 1);
    timer = window.setTimeout(tick, props.deletingSpeed);
    return;
  }

  deleting.value = false;
  index.value = (index.value + 1) % props.text.length;
  timer = window.setTimeout(tick, props.typingSpeed * 3);
}

onMounted(() => {
  // Reduced motion gets the finished first string, no animation.
  if (prefersReducedMotion()) {
    shown.value = props.text[0] ?? "";
    done.value = true;
    return;
  }
  timer = window.setTimeout(tick, 420);
});

onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <span class="inline-flex items-baseline">
    <span>{{ shown }}</span>
    <span
      v-if="showCursor && !done"
      class="ml-[0.12em] text-violet-400"
      :class="{ 'animate-flicker': true }"
      aria-hidden="true"
      >{{ cursorChar }}</span
    >
  </span>
</template>
