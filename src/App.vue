<script setup lang="ts">
/**
 * App shell: fixed backdrop, overlays, nav, routed page, footer.
 *
 * The backdrop and cursor live here rather than per-page so they persist across
 * route changes - re-mounting a 1200-cell canvas on every navigation would be
 * both a visible flash and a needless rebuild.
 */
import { onMounted, onBeforeUnmount, ref } from "vue";
import HexGrid from "@/components/bits/HexGrid.vue";
import HexLoader from "@/components/ui/HexLoader.vue";
import SiteFooter from "@/components/ui/SiteFooter.vue";
import SiteNav from "@/components/ui/SiteNav.vue";
import TargetCursor from "@/components/bits/TargetCursor.vue";
import { refreshScrollTriggers } from "@/composables/useGSAP";
import { useSmoothScroll } from "@/composables/useSmoothScroll";
import { useSEO } from "@/composables/useSEO";

const booted = ref(false);
const loaderActive = ref(true);
let loaderTimeout: ReturnType<typeof setTimeout> | undefined;
const { start } = useSmoothScroll();

// Dynamic SEO meta tags
useSEO();

function onLoaderDone() {
  loaderActive.value = false;
  booted.value = true;
  clearTimeout(loaderTimeout);
  // Reveal changed layout heights; recompute every trigger once it settles.
  refreshScrollTriggers(0);
}

function onLoaderReveal() {
  booted.value = true;
}

onMounted(() => {
  // Prevent a stalled opening animation from blocking the page.
  loaderTimeout = setTimeout(onLoaderDone, 6000);
  start();
});
onBeforeUnmount(() => clearTimeout(loaderTimeout));
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
    />
    <!-- Soft glows over the lattice, so the grid never reads as flat graph paper. -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(139,92,246,0.16),transparent_70%),radial-gradient(50%_40%_at_100%_100%,rgba(255,46,158,0.1),transparent_70%),radial-gradient(45%_35%_at_0%_60%,rgba(76,217,245,0.08),transparent_70%)]"
    />
  </div>

  <!-- Overlays -->
  <div
    class="pointer-events-none fixed inset-0 z-9000 bg-[image:repeating-linear-gradient(to_bottom,transparent_0,transparent_2px,rgba(0,0,0,0.42)_2px,rgba(0,0,0,0.42)_4px)] mix-blend-multiply opacity-35"
    aria-hidden="true"
  />
  <div
    class="pointer-events-none fixed inset-0 z-8900 bg-[radial-gradient(115%_105%_at_50%_50%,transparent_55%,rgba(3,2,10,0.75)_100%)]"
    aria-hidden="true"
  />
  <ClientOnly>
    <TargetCursor :spin-duration="4" />
    <HexLoader v-if="loaderActive" @reveal="onLoaderReveal" @done="onLoaderDone" />
  </ClientOnly>

  <SiteNav :ready="booted" />

  <main class="relative overflow-x-clip">
    <RouterView v-slot="{ Component }">
      <Transition name="route" mode="out-in" @after-enter="refreshScrollTriggers(80)">
        <component :is="Component" :key="$route.path" :booted="booted" />
      </Transition>
    </RouterView>
  </main>

  <SiteFooter />
</template>

<style scoped>
/* Route transition — a short chamfered wipe rather than a plain fade. */
.route-enter-active,
.route-leave-active {
  transition:
    opacity 0.45s cubic-bezier(0.215, 0.61, 0.355, 1),
    filter 0.45s cubic-bezier(0.215, 0.61, 0.355, 1),
    transform 0.45s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.route-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(24px);
}

.route-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(-24px);
}
</style>
