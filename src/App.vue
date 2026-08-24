<script setup lang="ts">
/**
 * App shell: fixed backdrop, overlays, nav, routed page, footer.
 *
 * The backdrop and cursor live here rather than per-page so they persist across
 * route changes - re-mounting a 1200-cell canvas on every navigation would be
 * both a visible flash and a needless rebuild.
 */
import { onMounted, ref, useTemplateRef } from "vue";
import HexGrid from "@/components/bits/HexGrid.vue";
import HexLoader from "@/components/ui/HexLoader.vue";
import SiteFooter from "@/components/ui/SiteFooter.vue";
import SiteNav from "@/components/ui/SiteNav.vue";
import TargetCursor from "@/components/bits/TargetCursor.vue";
import { refreshScrollTriggers } from "@/composables/useGSAP";
import { useSmoothScroll } from "@/composables/useSmoothScroll";

const grid = useTemplateRef<InstanceType<typeof HexGrid>>("grid");
const booted = ref(false);
const { start } = useSmoothScroll();

function onLoaderDone() {
  booted.value = true;
  // Ripple the backdrop outward from centre as the shell is revealed.
  grid.value?.pulse();
  // Reveal changed layout heights; recompute every trigger once it settles.
  refreshScrollTriggers(240);
}

onMounted(() => {
  start();
});
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 -z-10 bg-void-900">
    <HexGrid
      ref="grid"
      :radius="9"
      :gap="26"
      base-color="#2b2062"
      active-color="#C1A5FF"
      :proximity="180"
      :shock-radius="230"
      :shock-strength="16"
    />
    <!-- Soft glows over the lattice, so the grid never reads as flat graph
         paper. -->
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
  <TargetCursor :spin-duration="9" />
  <HexLoader @done="onLoaderDone" />

  <SiteNav />

  <main class="relative overflow-x-clip">
    <RouterView v-slot="{ Component }">
      <Transition name="route" mode="out-in" @after-enter="refreshScrollTriggers(80)">
        <component :is="Component" :key="$route.path" />
      </Transition>
    </RouterView>
  </main>

  <SiteFooter />
</template>
