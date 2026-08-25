<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
  type CSSProperties,
} from "vue";

interface ElectricBorderProps {
  color?: string;
  speed?: number;
  chaos?: number;
  /** Stroke width of the lightning line; the glow layers scale with it. */
  thickness?: number;
  borderRadius?: number;
  /** Draw a pointy-top hexagon outline instead of a rounded rectangle. */
  hexagon?: boolean;
  className?: string;
  style?: CSSProperties;
}

const props = withDefaults(defineProps<ElectricBorderProps>(), {
  color: "#28FF85",
  speed: 1,
  chaos: 0.12,
  thickness: 1,
  borderRadius: 24,
  hexagon: false,
});

function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const containerRef = useTemplateRef<HTMLDivElement>("containerRef");
const animationRef = ref<number | null>(null);
const timeRef = ref(0);
const lastFrameTimeRef = ref(0);

function random(x: number): number {
  return (Math.sin(x * 12.9898) * 43758.5453) % 1;
}

function noise2D(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const a = random(i + j * 57);
  const b = random(i + 1 + j * 57);
  const c = random(i + (j + 1) * 57);
  const d = random(i + 1 + (j + 1) * 57);

  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function octavedNoise(
  x: number,
  octaves: number,
  lacunarity: number,
  gain: number,
  baseAmplitude: number,
  baseFrequency: number,
  time: number,
  seed: number,
  baseFlatness: number,
): number {
  let y = 0;
  let amplitude = baseAmplitude;
  let frequency = baseFrequency;

  for (let i = 0; i < octaves; i++) {
    let octaveAmplitude = amplitude;
    if (i === 0) {
      octaveAmplitude *= baseFlatness;
    }
    y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return y;
}

function getCornerPoint(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  arcLength: number,
  progress: number,
): { x: number; y: number } {
  const angle = startAngle + progress * arcLength;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}
function getRoundedRectPoint(
  t: number,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number,
): { x: number; y: number } {
  const straightWidth = width - 2 * radius;
  const straightHeight = height - 2 * radius;
  const cornerArc = (Math.PI * radius) / 2;
  const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
  const distance = t * totalPerimeter;

  let accumulated = 0;

  if (distance <= accumulated + straightWidth) {
    const progress = (distance - accumulated) / straightWidth;
    return { x: left + radius + progress * straightWidth, y: top };
  }
  accumulated += straightWidth;

  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(
      left + width - radius,
      top + radius,
      radius,
      -Math.PI / 2,
      Math.PI / 2,
      progress,
    );
  }
  accumulated += cornerArc;

  if (distance <= accumulated + straightHeight) {
    const progress = (distance - accumulated) / straightHeight;
    return { x: left + width, y: top + radius + progress * straightHeight };
  }
  accumulated += straightHeight;

  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(
      left + width - radius,
      top + height - radius,
      radius,
      0,
      Math.PI / 2,
      progress,
    );
  }
  accumulated += cornerArc;

  if (distance <= accumulated + straightWidth) {
    const progress = (distance - accumulated) / straightWidth;
    return { x: left + width - radius - progress * straightWidth, y: top + height };
  }
  accumulated += straightWidth;

  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(
      left + radius,
      top + height - radius,
      radius,
      Math.PI / 2,
      Math.PI / 2,
      progress,
    );
  }
  accumulated += cornerArc;

  if (distance <= accumulated + straightHeight) {
    const progress = (distance - accumulated) / straightHeight;
    return { x: left, y: top + height - radius - progress * straightHeight };
  }
  accumulated += straightHeight;

  const progress = (distance - accumulated) / cornerArc;
  return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
}
// Only change vs the rounded rectangle: the path is walked around six straight
// edges instead of four sides plus four arcs. The vertex fractions match the
// `hex-point` clip-path so the outline lines up with hexagon-clipped content.
const HEX_VERTICES: ReadonlyArray<readonly [number, number]> = [
  [0.5, 0],
  [0.9866, 0.25],
  [0.9866, 0.75],
  [0.5, 1],
  [0.0134, 0.75],
  [0.0134, 0.25],
];

function getHexagonPoint(
  t: number,
  left: number,
  top: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const points = HEX_VERTICES.map(([fx, fy]) => ({
    x: left + fx * width,
    y: top + fy * height,
  }));

  const lengths: number[] = [];
  let totalPerimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const from = points[i]!;
    const to = points[(i + 1) % points.length]!;
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    lengths.push(length);
    totalPerimeter += length;
  }

  const distance = t * totalPerimeter;
  let accumulated = 0;

  for (let i = 0; i < points.length; i++) {
    const length = lengths[i]!;
    if (distance <= accumulated + length || i === points.length - 1) {
      const progress = length === 0 ? 0 : (distance - accumulated) / length;
      const from = points[i]!;
      const to = points[(i + 1) % points.length]!;
      return {
        x: from.x + progress * (to.x - from.x),
        y: from.y + progress * (to.y - from.y),
      };
    }
    accumulated += length;
  }

  return points[0]!;
}

function resolveBorderRadius(
  borderRadius: CSSProperties["borderRadius"] | number | undefined,
  maxRadius: number,
  width: number,
  height: number,
): number {
  if (typeof borderRadius === "number") {
    return Math.min(borderRadius, maxRadius);
  }

  if (typeof borderRadius === "string") {
    const parsed = Number.parseFloat(borderRadius);
    if (Number.isFinite(parsed)) {
      if (borderRadius.includes("%")) {
        return Math.min(maxRadius, (parsed / 100) * Math.min(width, height));
      }

      return Math.min(parsed, maxRadius);
    }
  }

  return Math.min(props.borderRadius, maxRadius);
}
let cleanup: (() => void) | null = null;
function setupCanvas() {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const octaves = 10;
  const lacunarity = 1.6;
  const gain = 0.7;
  const amplitude = props.chaos;
  const frequency = 10;
  const baseFlatness = 0;
  const displacement = 60;
  const borderOffset = 60;

  const updateSize = () => {
    const rect = container.getBoundingClientRect();
    const width = rect.width + borderOffset * 2;
    const height = rect.height + borderOffset * 2;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    return { width, height };
  };

  let { width, height } = updateSize();
  let lastDpr = Math.min(window.devicePixelRatio || 1, 2);

  const drawElectricBorder = (currentTime: number) => {
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (dpr !== lastDpr) {
      lastDpr = dpr;
      const newSize = updateSize();
      width = newSize.width;
      height = newSize.height;
    }

    const deltaTime = (currentTime - lastFrameTimeRef.value) / 1000;
    timeRef.value += deltaTime * props.speed;
    lastFrameTimeRef.value = currentTime;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const scale = displacement;
    const left = borderOffset;
    const top = borderOffset;
    const borderWidth = width - 2 * borderOffset;
    const borderHeight = height - 2 * borderOffset;
    const maxRadius = Math.min(borderWidth, borderHeight) / 2;
    const radius = resolveBorderRadius(
      props.style?.borderRadius ?? props.borderRadius,
      maxRadius,
      borderWidth,
      borderHeight,
    );

    // A hexagon has no corner arcs, so its perimeter comes from the straight
    // edges alone; the rectangle keeps the arc term.
    const approximatePerimeter = props.hexagon
      ? 2 * (borderWidth + borderHeight)
      : 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
    const sampleCount = Math.floor(approximatePerimeter / 2);

    ctx.beginPath();

    for (let i = 0; i <= sampleCount; i++) {
      const progress = i / sampleCount;

      const point = props.hexagon
        ? getHexagonPoint(progress, left, top, borderWidth, borderHeight)
        : getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);

      const xNoise = octavedNoise(
        progress * 8,
        octaves,
        lacunarity,
        gain,
        amplitude,
        frequency,
        timeRef.value,
        0,
        baseFlatness,
      );
      const yNoise = octavedNoise(
        progress * 8,
        octaves,
        lacunarity,
        gain,
        amplitude,
        frequency,
        timeRef.value,
        1,
        baseFlatness,
      );

      const displacedX = point.x + xNoise * scale;
      const displacedY = point.y + yNoise * scale;

      if (i === 0) {
        ctx.moveTo(displacedX, displacedY);
      } else {
        ctx.lineTo(displacedX, displacedY);
      }
    }

    ctx.closePath();
    ctx.stroke();

    animationRef.value = requestAnimationFrame(drawElectricBorder);
  };

  const resizeObserver = new ResizeObserver(() => {
    const newSize = updateSize();
    width = newSize.width;
    height = newSize.height;
  });
  resizeObserver.observe(container);

  animationRef.value = requestAnimationFrame(drawElectricBorder);

  cleanup = () => {
    if (animationRef.value) {
      cancelAnimationFrame(animationRef.value);
    }
    resizeObserver.disconnect();
  };
}
watch(
  () => [
    props.color,
    props.speed,
    props.chaos,
    props.thickness,
    props.borderRadius,
    props.hexagon,
    props.style?.borderRadius,
    octavedNoise,
    getRoundedRectPoint,
  ],
  () => {
    cleanup?.();
    requestAnimationFrame(() => {
      setupCanvas();
    });
  },
);

onMounted(() => {
  setupCanvas();
});

onBeforeUnmount(() => {
  cleanup?.();
});

const wrapperStyle = computed<CSSProperties>(() => ({
  "--electric-border-color": props.color,
  borderRadius: `${props.borderRadius}px`,
  ...props.style,
}));

// Only change vs the rounded rectangle: the glow layers are clipped to a
// hexagon, since `border-radius` cannot describe that outline.
const shapeClass = computed(() => (props.hexagon ? "hex-point" : "rounded-[inherit]"));

// The glow strokes read twice as thick as the lightning line, which is the
// ratio the original hardcoded 1px / 2px pair had.
const glowWidth = computed(() => props.thickness * 2);
</script>

<template>
  <div
    ref="containerRef"
    :class="['relative overflow-visible isolate', className]"
    :style="wrapperStyle"
  >
    <div
      class="top-1/2 left-1/2 z-2 absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      <canvas ref="canvasRef" class="block" />
    </div>

    <div :class="['z-0 absolute inset-0 pointer-events-none', shapeClass]">
      <!-- Only change vs the rounded rectangle: a clipped CSS border loses its
           diagonal edges, so the two static glow strokes are SVG polygons. -->
      <svg
        v-if="hexagon"
        class="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 115.47"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="50,0 98.66,28.87 98.66,86.6 50,115.47 1.34,86.6 1.34,28.87"
          :stroke="hexToRgba(color, 0.6)"
          :stroke-width="glowWidth"
          vector-effect="non-scaling-stroke"
          style="filter: blur(1px)"
        />
        <polygon
          points="50,0 98.66,28.87 98.66,86.6 50,115.47 1.34,86.6 1.34,28.87"
          :stroke="color"
          :stroke-width="glowWidth"
          vector-effect="non-scaling-stroke"
          style="filter: blur(4px)"
        />
      </svg>

      <template v-else>
        <div
          class="absolute inset-0 rounded-[inherit] pointer-events-none"
          :style="{
            border: `${glowWidth}px solid ${hexToRgba(color, 0.6)}`,
            filter: 'blur(1px)',
          }"
        />
        <div
          class="absolute inset-0 rounded-[inherit] pointer-events-none"
          :style="{
            border: `${glowWidth}px solid ${color}`,
            filter: 'blur(4px)',
          }"
        />
      </template>

      <div
        :class="['-z-[1] absolute inset-0 opacity-30 scale-110 pointer-events-none', shapeClass]"
        :style="{
          filter: 'blur(32px)',
          background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
        }"
      />
    </div>

    <div :class="['z-[1] relative', shapeClass]">
      <slot />
    </div>
  </div>
</template>
