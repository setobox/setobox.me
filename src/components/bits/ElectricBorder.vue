<script setup lang="ts">
/**
 * ElectricBorder - a border that crawls like a live circuit.
 *
 * Two counter-scrolling turbulence fields drive a displacement filter on the
 * outline. The scroll runs on SVG SMIL (`animate`) rather than JS: the filter
 * re-evaluates on the compositor either way, and SMIL keeps it off the main
 * thread entirely.
 *
 * Hexagon mode draws an SVG polygon rather than a CSS border, because
 * `border` + `clip-path` cannot produce a hexagon outline - the clip cuts
 * through the rectangular border and leaves four disconnected segments.
 *
 * `filterId` is per-instance; a shared id would make the second border on a
 * page silently inherit the first one's parameters.
 */
import { computed, useId } from "vue";

interface Props {
  color?: string;
  /** Multiplier on the turbulence scroll rate. */
  speed?: number;
  /** 0-1; how far the outline is allowed to wander off its path. */
  chaos?: number;
  thickness?: number;
  radius?: number;
  /** Draw a hexagon outline instead of a rounded rectangle. */
  hexagon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: "#4CD9F5",
  speed: 1,
  chaos: 0.35,
  thickness: 2,
  radius: 18,
  hexagon: false,
});

const uid = useId();
const filterId = computed(() => `eb-${uid}`);
const displace = computed(() => 20 * props.chaos);
const dur = computed(() => `${Math.max(6 / props.speed, 0.5)}s`);

/** Pointy-top hexagon inset by half the stroke so it is not clipped. */
const hexPoints = computed(() => {
  const i = props.thickness / 2;
  const w = 100;
  const h = 115.47;
  return [
    [w / 2, i],
    [w - i, h * 0.25],
    [w - i, h * 0.75],
    [w / 2, h - i],
    [i, h * 0.75],
    [i, h * 0.25],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
});
</script>

<template>
  <div class="pointer-events-none absolute inset-0">
    <svg class="absolute h-0 w-0" aria-hidden="true">
      <defs>
        <filter :id="filterId" x="-25%" y="-25%" width="150%" height="150%">
          <!-- A noise field scrolled vertically reads as current travelling
               along the edge, where static grain would just read as fuzz. -->
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="2"
            seed="3"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              :dur="dur"
              values="0.02;0.045;0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feOffset in="noise" dx="0" dy="0" result="scrolled">
            <animate attributeName="dy" :dur="dur" values="0;140;0" repeatCount="indefinite" />
          </feOffset>
          <feDisplacementMap
            in="SourceGraphic"
            in2="scrolled"
            :scale="displace"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>

    <!-- Hexagon: SVG polygon, so the outline is a real hexagon. -->
    <template v-if="hexagon">
      <svg
        class="absolute inset-0 h-full w-full"
        viewBox="0 0 100 115.47"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <!-- Steady copy keeps the shape legible under the crackle. -->
        <polygon
          :points="hexPoints"
          :stroke="color"
          :stroke-width="thickness"
          opacity="0.45"
          vector-effect="non-scaling-stroke"
        />
        <polygon
          :points="hexPoints"
          :stroke="color"
          :stroke-width="thickness"
          :filter="`url(#${filterId})`"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <!-- Glow follows the hexagon via the same clip, so no stray rectangle. -->
      <div class="absolute inset-0 hex-point" :style="{ boxShadow: `inset 0 0 30px ${color}3d` }" />
    </template>

    <!-- Rounded rectangle: CSS borders are exact here and cheaper than SVG. -->
    <template v-else>
      <div
        class="absolute inset-0"
        :style="{
          border: `${thickness}px solid ${color}`,
          borderRadius: `${radius}px`,
          opacity: 0.45,
        }"
      />
      <div
        class="absolute inset-0"
        :style="{
          border: `${thickness}px solid ${color}`,
          borderRadius: `${radius}px`,
          filter: `url(#${filterId})`,
        }"
      />
      <div
        class="absolute inset-0"
        :style="{
          borderRadius: `${radius}px`,
          boxShadow: `inset 0 0 26px ${color}33, 0 0 22px ${color}22`,
        }"
      />
    </template>
  </div>
</template>
