<script setup lang="ts">
/**
 * SiteNav - fixed header plus the mobile drawer.
 *
 * The bar hides on downward scroll and returns on upward, so the hero and the
 * long marquee sections are never cropped by it. Threshold is deliberately
 * above the hero fold: hiding it inside the first viewport reads as a glitch.
 */
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { navItems, site } from "@/data/profile";

const open = ref(false);
const hidden = ref(false);
const scrolled = ref(false);
const route = useRoute();

let lastY = 0;

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
    class="fixed inset-x-0 top-0 z-1000 transition-all duration-500 ease-hex"
    :class="[
      hidden ? '-translate-y-full' : 'translate-y-0',
      scrolled
        ? 'border-b border-silver-800/80 bg-void-900/80 backdrop-blur-xl'
        : 'border-b border-transparent',
    ]"
  >
    <nav class="container-page flex items-center justify-between py-3.5">
      <RouterLink to="/" class="cursor-target group flex items-center gap-2.5">
        <img
          src="/hexagon-icon-white.svg"
          alt=""
          class="h-6 w-6 transition-transform duration-500 ease-hex group-hover:rotate-90"
        />
        <span
          class="font-display text-base font-medium uppercase tracking-[0.2em] text-silver-50 transition-all duration-300 group-hover:glow-12"
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
            class="cursor-target link-glow inline-flex items-center gap-1.5 px-4 py-2 font-display text-sm uppercase tracking-[0.14em] text-silver-200"
          >
            {{ item.text }}
            <span class="i-lucide-external-link text-xs opacity-60" aria-hidden="true" />
          </a>
          <RouterLink
            v-else
            :to="item.href"
            class="cursor-target link-glow relative inline-block px-4 py-2 font-display text-sm uppercase tracking-[0.14em] text-silver-200"
            active-class="text-violet-300"
          >
            {{ item.text }}
            <!-- Hexagon marker instead of the usual underline. -->
            <span
              v-if="route.path === item.href"
              class="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 hex-point bg-magenta-400"
              aria-hidden="true"
            />
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
      class="fixed inset-0 z-999 flex flex-col bg-void-900/98 backdrop-blur-xl md:hidden"
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
