<script setup lang="ts">
/**
 * AnimatedContent - slides its slot in from a direction when scrolled into
 * view (or immediately, with `alwaysPlay`).
 *
 * The workhorse reveal used across every section. Wraps rather than decorates
 * so the animated element is always a plain div GSAP fully owns - animating
 * content elements directly fights whatever transform they already carry.
 */
import { useTemplateRef } from "vue";
import { gsap, useGSAP } from "@/composables/useGSAP";

interface Props {
  distance?: number;
  direction?: "vertical" | "horizontal";
  /** Come from the opposite side (up instead of down, left instead of right). */
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  /** Starting scale. 1 disables the scale part of the reveal. */
  scale?: number;
  /** Fraction of the viewport the element must reach before playing, 0-1. */
  threshold?: number;
  delay?: number;
  /** Play on mount instead of waiting for scroll. */
  alwaysPlay?: boolean;
  blur?: number;
}

const props = withDefaults(defineProps<Props>(), {
  distance: 60,
  direction: "vertical",
  reverse: false,
  duration: 1,
  ease: "power3.out",
  initialOpacity: 0,
  animateOpacity: true,
  scale: 1,
  threshold: 0.12,
  delay: 0,
  alwaysPlay: false,
  blur: 0,
});

const root = useTemplateRef<HTMLDivElement>("root");

useGSAP(
  ({ reduced }) => {
    const el = root.value;
    if (!el) return;

    // Under reduced motion, jump straight to the resting state so content is
    // never left invisible.
    if (reduced) {
      gsap.set(el, { clearProps: "all", opacity: 1 });
      return;
    }

    const axis = props.direction === "horizontal" ? "x" : "y";
    const offset = props.reverse ? -props.distance : props.distance;

    gsap.set(el, {
      [axis]: offset,
      scale: props.scale,
      opacity: props.animateOpacity ? props.initialOpacity : 1,
      filter: props.blur ? `blur(${props.blur}px)` : "none",
    });

    gsap.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: props.duration,
      ease: props.ease,
      delay: props.delay,
      // Clear inline transforms afterwards so hover effects on children are
      // not fighting a leftover matrix.
      clearProps: "filter",
      ...(props.alwaysPlay
        ? {}
        : {
            scrollTrigger: {
              trigger: el,
              start: `top ${(1 - props.threshold) * 100}%`,
              toggleActions: "play none none none",
              once: true,
            },
          }),
    });
  },
  { scope: root },
);
</script>

<template>
  <div ref="root" class="will-change-transform">
    <slot />
  </div>
</template>
