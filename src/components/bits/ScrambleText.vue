<script setup lang="ts">
/**
 * ScrambleText - resolves from random glyphs into the real string when it
 * scrolls into view, and re-scrambles on hover.
 *
 * Characters settle left-to-right on a per-character delay, so the word looks
 * like it is being decrypted rather than simply faded in.
 */
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  text: string;
  /** Milliseconds between scramble frames. */
  speed?: number;
  /** Frames each character churns before it locks. */
  churn?: number;
  /** Re-run the effect on pointer enter. */
  scrambleOnHover?: boolean;
  chars?: string;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 32,
  churn: 8,
  scrambleOnHover: true,
  chars: "!<>-_\\/[]{}=+*^?#01",
});

const root = useTemplateRef<HTMLSpanElement>("root");
const shown = ref("");
let frame = 0;
let timer = 0;
let observer: IntersectionObserver | null = null;

function randomChar() {
  return props.chars[Math.floor(Math.random() * props.chars.length)] ?? "#";
}

function run() {
  window.clearInterval(timer);
  frame = 0;

  timer = window.setInterval(() => {
    frame += 1;
    let out = "";
    let settled = true;

    for (let i = 0; i < props.text.length; i++) {
      const char = props.text[i]!;
      // Whitespace never scrambles - it would make the word change width.
      if (char === " ") {
        out += " ";
        continue;
      }
      // Each character locks `churn` frames after the one before it.
      if (frame > i + props.churn) {
        out += char;
      } else {
        out += randomChar();
        settled = false;
      }
    }

    shown.value = out;
    if (settled) window.clearInterval(timer);
  }, props.speed);
}

onMounted(() => {
  if (prefersReducedMotion()) {
    shown.value = props.text;
    return;
  }

  shown.value = props.text.replace(/\S/g, () => randomChar());

  const el = root.value;
  if (!el) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer?.disconnect();
      run();
    },
    { threshold: 0.4 },
  );
  observer.observe(el);
});

onUnmounted(() => {
  window.clearInterval(timer);
  observer?.disconnect();
});
</script>

<template>
  <span
    ref="root"
    class="inline-block"
    @pointerenter="scrambleOnHover && !prefersReducedMotion() && run()"
    >{{ shown }}</span
  >
</template>
