<script setup lang="ts">
/**
 * SiteNav - fixed header plus the mobile drawer.
 *
 * The bar hides on downward scroll and returns on upward, so the hero and the
 * long marquee sections are never cropped by it. Threshold is deliberately
 * above the hero fold: hiding it inside the first viewport reads as a glitch.
 */
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import { gsap, useGSAP } from "@/composables/useGSAP";
import { navItems, site } from "@/data/profile";

const open = ref(false);
const hidden = ref(false);
const scrolled = ref(false);
const route = useRoute();
const props = defineProps<{ ready: boolean }>();
const root = useTemplateRef<HTMLElement>("root");

let lastY = 0;

useGSAP(
  () => {
    gsap.set(root.value, { autoAlpha: props.ready ? 1 : 0 });
    if (!props.ready) {
      watch(
        () => props.ready,
        (ready) => {
          if (ready) gsap.to(root.value, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
        },
      );
    }
  },
  { scope: root },
);

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

function onScroll() {
  const y = window.scrollY;
  scrolled.value = y > 40;
  // Only start hiding past one viewport, and ignore sub-6px jitter.
  if (y > window.innerHeight * 0.9 && Math.abs(y - lastY) > 6) {
    hidden.value = y > lastY;
  } else if (y <= window.innerHeight * 0.9) {
    hidden.value = false;
  }
  lastY = y;
}

// Lock the page while the drawer is up, otherwise the content behind scrolls.
watch(open, (v) => {
  document.body.style.overflow = v ? "hidden" : "";
});

watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);

onMounted(() => {
  lastY = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  document.body.style.overflow = "";
});
</script>

<template>
  <!-- Desktop / tablet bar -->
  <header
    ref="root"
    class="fixed inset-x-0 top-0 z-1000 transition-all duration-500 ease-hex"
    :class="[
      hidden ? '-translate-y-full' : 'translate-y-0',
      scrolled
        ? 'border-b border-silver-800/80 bg-void-900/80 backdrop-blur-xl'
        : 'border-b border-transparent',
    ]"
  >
    <nav class="w-full px-5 sm:px-6 lg:px-8 flex items-center justify-between py-2.5">
      <RouterLink to="/" class="cursor-target group flex items-center gap-2.5">
        <img
          src="/hexagon-white.svg"
          alt=""
          class="h-8 w-8 transition-transform duration-500 ease-hex group-hover:rotate-90"
        />
        <span
          class="font-display text-2xl font-medium uppercase tracking-[0.2em] text-silver-50 transition-all duration-300 group-hover:glow-12"
          translate="no"
        >
          {{ site.short }}
        </span>
      </RouterLink>

      <ul class="hidden items-center gap-1 md:flex">
        <li v-for="item in navItems" :key="item.href">
          <a
            v-if="isExternal(item.href)"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="cursor-target link-glow hovertrans inline-flex items-center gap-1.5 px-4 py-2 font-display text-md uppercase tracking-[0.14em] text-silver-200 hover:glow-12"
          >
            {{ item.text }}
            <span class="i-lucide-external-link text-xs opacity-60" aria-hidden="true" />
          </a>
          <RouterLink
            v-else
            :to="item.href"
            class="cursor-target link-glow hovertrans relative inline-block px-4 py-2 font-display text-md uppercase tracking-[0.14em] text-silver-200 hover:glow-22"
            active-class="text-violet-400"
          >
            {{ item.text }}
          </RouterLink>
        </li>
      </ul>

      <button
        type="button"
        class="cursor-target -mr-2 p-2 text-silver-100 md:hidden"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        aria-label="Toggle navigation"
        @click="open = !open"
      >
        <span :class="open ? 'i-lucide-x' : 'i-lucide-menu'" class="text-2xl" aria-hidden="true" />
      </button>
    </nav>
  </header>

  <!-- Mobile drawer -->
  <Transition
    enter-active-class="transition-transform duration-500 ease-hex"
    leave-active-class="transition-transform duration-400 ease-hex"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="open"
      id="mobile-nav"
      class="fixed inset-0 z-999 flex flex-col bg-void-900/50 backdrop-blur-xl md:hidden"
    >
      <ul class="flex flex-1 flex-col justify-center gap-2 px-8">
        <li v-for="(item, i) in navItems" :key="item.href">
          <a
            v-if="isExternal(item.href)"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 border-b border-silver-800 py-5 font-display text-2xl uppercase tracking-[0.12em] text-silver-100"
          >
            <span class="font-mono text-xs text-violet-400">0{{ i + 1 }}</span>
            {{ item.text }}
            <span class="i-lucide-external-link ml-auto text-base opacity-50" aria-hidden="true" />
          </a>
          <RouterLink
            v-else
            :to="item.href"
            class="flex items-center gap-4 border-b border-silver-800 py-5 font-display text-2xl uppercase tracking-[0.12em] text-silver-100"
            active-class="text-violet-300"
          >
            <span class="font-mono text-xs text-violet-400">0{{ i + 1 }}</span>
            {{ item.text }}
          </RouterLink>
        </li>
      </ul>
      <p
        class="pb-10 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-silver-500"
      >
        Creating &#9671; Designing
      </p>
    </div>
  </Transition>
</template>
