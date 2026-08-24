<script setup lang="ts"></script>

<template>
  <footer class="relative mt-20 border-t border-silver-800 bg-void-900/70 backdrop-blur-md">
    <!-- Hexagon tape running along the top edge. -->
    <div
      class="pointer-events-none absolute -top-[9px] left-0 flex w-full justify-center gap-2.5 overflow-hidden"
      aria-hidden="true"
    >
      <span
        v-for="i in 11"
        :key="i"
        class="h-[18px] w-4 shrink-0 hex-point"
        :class="i % 4 === 0 ? 'bg-magenta-500/70' : 'bg-silver-700/80'"
      />
    </div>

    <div class="container-page border-t border-silver-800/70 py-6">
      <p class="text-center uppercase text-silver-300">2020 - PRESENT &copy; SETOBOX</p>
      <p class="text-center text-silver-300">
        <a
          href="https://icp.gov.moe/?keyword=20232190"
          target="_blank"
          rel="noreferrer"
          class="hover:text-ink-100 focus-ring"
        >
          萌ICP备20232190号
        </a>
      </p>
    </div>
  </footer>
</template>
