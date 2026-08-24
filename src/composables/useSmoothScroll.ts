import Lenis from "lenis";
import { onScopeDispose, ref, shallowRef } from "vue";
import { gsap, prefersReducedMotion, ScrollTrigger } from "./useGSAP";

const lenis = shallowRef<Lenis | null>(null);
const ready = ref(false);

/**
 * Single app-wide Lenis instance, driven by GSAP's ticker so smooth scroll and
 * ScrollTrigger share one clock — running two RAF loops makes pinned sections
 * jitter by a frame.
 *
 * Disabled outright under `prefers-reduced-motion`; native scrolling stays.
 */
export function useSmoothScroll() {
  function start() {
    if (lenis.value || prefersReducedMotion()) {
      ready.value = true;
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    // Wrapped rather than passed by reference so the call site is explicit
    // about not carrying `this` across.
    instance.on("scroll", () => ScrollTrigger.update());

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Deliberately NO ScrollTrigger.scrollerProxy here. Lenis in its default
    // mode scrolls the real window rather than transforming a wrapper, so
    // ScrollTrigger's native scroll reading is already correct. Registering a
    // proxy on document.body made ScrollTrigger compute max-scroll against
    // Lenis's animated value instead, which pushed the last triggers on a long
    // page past reachable scroll - they never fired at all.
    lenis.value = instance;
    ready.value = true;

    onScopeDispose(() => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis.value = null;
      ready.value = false;
    });
  }

  /** Scroll to an element or absolute offset. Falls back to native behaviour. */
  function scrollTo(
    target: string | number | HTMLElement,
    options: { offset?: number; duration?: number } = {},
  ) {
    const { offset = 0, duration = 1.2 } = options;

    if (lenis.value) {
      lenis.value.scrollTo(target, { offset, duration });
      return;
    }

    if (typeof target === "number") {
      window.scrollTo({ top: target + offset, behavior: "smooth" });
      return;
    }

    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY + offset,
      behavior: "smooth",
    });
  }

  function stop() {
    lenis.value?.stop();
  }

  function resume() {
    lenis.value?.start();
  }

  return { lenis, ready, start, scrollTo, stop, resume };
}
