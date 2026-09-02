<script setup lang="ts">
/**
 * App shell: fixed backdrop, overlays, nav, routed page, footer.
 *
 * The backdrop and cursor live here rather than per-page so they persist across
 * route changes - re-mounting a 1200-cell canvas on every navigation would be
 * both a visible flash and a needless rebuild.
 */
import { onMounted, ref } from "vue";
import HexGrid from "@/components/bits/HexGrid.vue";
import HexLoader from "@/components/ui/HexLoader.vue";
import SiteFooter from "@/components/ui/SiteFooter.vue";
import SiteNav from "@/components/ui/SiteNav.vue";
import TargetCursor from "@/components/bits/TargetCursor.vue";
import { refreshScrollTriggers } from "@/composables/useGSAP";
import { useSmoothScroll } from "@/composables/useSmoothScroll";
import { useSEO } from "@/composables/useSEO";

// Console easter egg.
console.log(
  "%c SETOBOX %c while(!dead) { time--; exp++; } ",
  "background:#8B5CF6;color:#fff;padding:2px 8px;border-radius:3px;font-weight:700;",
  "color:#4CD9F5;font-family:ui-monospace,monospace;",
);

const booted = ref(false);
const navReady = ref(false);
const { start } = useSmoothScroll();

// Dynamic SEO meta tags
useSEO();

function onLoaderDone() {
  // Reveal changed layout heights; recompute every trigger once it settles.
  refreshScrollTriggers(0);
}

function onLoaderReveal() {
  booted.value = true;
  navReady.value = true;
}

onMounted(() => {
  start();
});
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 -z-10 bg-void-900">
    <HexGrid
      :stroke="true"
      :hex-size="72"
      :gap="48"
      base-color="#020211"
      active-color="#a287db"
      :proximity="200"
      :shock-radius="300"
      :shock-strength="-5"
      :resistance="5000"
      :return-duration="0.3"
      class-name="custom-dot-grid"
    />
    <!-- Soft glows over the lattice, so the grid never reads as flat graph paper. -->
    <div
      class="pointer-events-none absolute inset-0"
      style="
        background:
          radial-gradient(60% 45% at 50% 0%, rgba(139, 92, 246, 0.16), transparent 70%),
          radial-gradient(50% 40% at 100% 100%, rgba(255, 46, 158, 0.1), transparent 70%),
          radial-gradient(45% 35% at 0% 60%, rgba(76, 217, 245, 0.08), transparent 70%);
      "
    />
  </div>

  <!-- Overlays -->
  <div class="scanlines" aria-hidden="true" />
  <div class="vignette" aria-hidden="true" />
  <TargetCursor :spin-duration="4" />
  <HexLoader @reveal="onLoaderReveal" @done="onLoaderDone" />

  <SiteNav :ready="navReady" />

  <main class="relative overflow-x-clip">
    <RouterView v-slot="{ Component }">
      <Transition name="route" mode="out-in" @after-enter="refreshScrollTriggers(80)">
        <component :is="Component" :key="$route.path" :booted="booted" />
      </Transition>
    </RouterView>
  </main>

  <SiteFooter />
</template>
