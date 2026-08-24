<script setup lang="ts">
/**
 * HexTile - one cell of the honeycomb. Renders a hexagon outline with a
 * hexagon fill inside it, so hover can light the fill without the 1px edge
 * disappearing under it.
 *
 * A hexagon border cannot come from `border` + `clip-path` (the clip eats the
 * border), hence the two stacked clipped layers.
 */
interface Props {
  label: string;
  icon?: string;
  /** Accent variant for the tiles worth calling out. */
  accent?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "",
  accent: false,
  size: 104,
});
</script>

<template>
  <div
    class="group relative cursor-target"
    :style="{ width: `${props.size}px`, height: `${props.size * 1.1547}px` }"
  >
    <!-- Outline layer. -->
    <div
      class="absolute inset-0 hex-point transition-colors duration-400 ease-hex"
      :class="
        accent
          ? 'bg-violet-500/70 group-hover:bg-magenta-400'
          : 'bg-silver-600 group-hover:bg-cyan-400/80'
      "
    />
    <!-- Fill layer, inset by the outline width. -->
    <div
      class="absolute inset-[1.5px] hex-point flex flex-col items-center justify-center gap-1 transition-all duration-400 ease-hex"
      :class="
        accent ? 'bg-void-700 group-hover:bg-violet-700/50' : 'bg-void-800 group-hover:bg-void-600'
      "
    >
      <span
        v-if="icon"
        :class="icon"
        class="text-lg transition-colors duration-400"
        :aria-hidden="true"
      />
      <span
        class="px-2 text-center font-mono text-[0.66rem] uppercase leading-tight tracking-[0.1em] transition-colors duration-400"
        :class="
          accent
            ? 'text-violet-200 group-hover:text-white'
            : 'text-silver-200 group-hover:text-cyan-200'
        "
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
