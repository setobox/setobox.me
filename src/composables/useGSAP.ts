import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onScopeDispose, type Ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

// Dev-only handle so scroll-reveal geometry can be inspected from the console
// (or a headless probe) without shipping anything to production.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__gsap = { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };

/** True when the visitor has asked the OS to cut animation down. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface UseGSAPOptions {
  /** Element the animation is scoped to. Selectors inside resolve within it. */
  scope?: Ref<HTMLElement | null | undefined>;
  /**
   * Skip the callback entirely under `prefers-reduced-motion`. Leave `false`
   * for animations that also set a final resting state.
   */
  skipOnReducedMotion?: boolean;
}

/**
 * Runs `setup` inside a `gsap.context()` on mount and reverts it when the
 * owning scope is disposed — which kills every tween and ScrollTrigger the
 * callback created, with no bookkeeping at the call site.
 *
 * ```ts
 * const root = useTemplateRef<HTMLElement>('root')
 * useGSAP(({ ctx }) => {
 *   gsap.from('.row', { y: 40, opacity: 0, stagger: 0.08 })
 * }, { scope: root })
 * ```
 */
export function useGSAP(
  setup: (context: { ctx: gsap.Context; self: HTMLElement | null; reduced: boolean }) => void,
  options: UseGSAPOptions = {},
): void {
  let ctx: gsap.Context | undefined;

  onMounted(() => {
    const reduced = prefersReducedMotion();
    if (reduced && options.skipOnReducedMotion) return;

    const self = options.scope?.value ?? null;
    ctx = gsap.context((c) => setup({ ctx: c, self, reduced }), self ?? undefined);
  });

  onScopeDispose(() => {
    ctx?.revert();
    ctx = undefined;
  });
}

/**
 * `ScrollTrigger.refresh()` after layout-affecting async work (fonts, images,
 * route transitions). Debounced so a burst of loads costs one recalculation.
 */
export function refreshScrollTriggers(delay = 120): void {
  window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

export interface ScrollRevealOptions {
  /** Element that drives the trigger. Defaults to the animated targets. */
  trigger?: gsap.DOMTarget;
  y?: number;
  x?: number;
  scale?: number;
  rotate?: number;
  /** Starting opacity. */
  opacity?: number;
  duration?: number;
  ease?: string;
  stagger?: number | gsap.StaggerVars;
  /** ScrollTrigger `start`. */
  start?: string;
  delay?: number;
}

/**
 * Staggered scroll reveal: `set()` the start state, then `to()` the rest state.
 *
 * Deliberately NOT `gsap.from()`. A ScrollTrigger-driven `from` tween carries
 * `immediateRender: true`, so any later `ScrollTrigger.refresh()` - which a
 * window resize, a webfont landing, or the `load` event will all cause -
 * invalidates it and re-applies the *start* state. Once such a tween has
 * completed it has already been auto-removed from the root timeline, so it can
 * never play forward again and the content stays permanently invisible.
 *
 * With `set` + `to`, an invalidate re-records start values from the element's
 * current state, so the worst case is a no-op rather than hidden content. This
 * is the same shape `AnimatedContent` uses.
 */
export function scrollReveal(
  targets: gsap.DOMTarget,
  options: ScrollRevealOptions = {},
): gsap.core.Tween {
  const {
    trigger = targets,
    y = 0,
    x = 0,
    scale = 1,
    rotate = 0,
    opacity = 0,
    duration = 0.85,
    ease = "power3.out",
    stagger = 0.08,
    start = "top 88%",
    delay = 0,
  } = options;

  gsap.set(targets, { opacity, y, x, scale, rotate });

  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    rotate: 0,
    duration,
    ease,
    stagger,
    delay,
    scrollTrigger: { trigger, start, once: true },
  });
}
