<script setup lang="ts">
/**
 * HexGrid - the site's backdrop.
 *
 * A honeycomb of hexagons on a single canvas. The cursor lights nearby cells
 * and, when moved fast enough, fires a shockwave that shoves them outward
 * before GSAP eases each one home. Hexagon = box = the Setobox mark, so the
 * background carries the same motif as the logo.
 *
 * One canvas, no DOM node per cell - a 1920x1080 viewport is ~1.2k cells,
 * well past the point where individual elements stop being viable.
 */
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { gsap, prefersReducedMotion } from "@/composables/useGSAP";

interface Props {
  /** Circumradius of each hexagon, px. */
  radius?: number;
  /** Extra gap between hexagons on top of tight honeycomb packing, px. */
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  /** Cursor distance, px, at which a cell reaches full activation. */
  proximity?: number;
  /** Pointer speed, px/s, that triggers a shockwave. */
  speedTrigger?: number;
  /** Radius of the shockwave, px. */
  shockRadius?: number;
  /** Push distance at the shockwave epicentre, px. */
  shockStrength?: number;
  /** Seconds for a displaced cell to return. */
  returnDuration?: number;
  /** Draw filled hexagons instead of outlines. */
  filled?: boolean;
  lineWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  radius: 9,
  gap: 22,
  baseColor: "#151032",
  activeColor: "#8B5CF6",
  proximity: 170,
  speedTrigger: 1000,
  shockRadius: 220,
  shockStrength: 14,
  returnDuration: 1.4,
  filled: false,
  lineWidth: 1.2,
});

interface Cell {
  cx: number;
  cy: number;
  ox: number; // offset from home, animated by GSAP
  oy: number;
}

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const wrapRef = useTemplateRef<HTMLDivElement>("wrapRef");
const reduced = ref(false);

let cells: Cell[] = [];
let ctx: CanvasRenderingContext2D | null = null;
let rafId = 0;
let resizeObserver: ResizeObserver | null = null;
let dpr = 1;

const pointer = { x: -9999, y: -9999, lastX: 0, lastY: 0, lastT: 0, speed: 0 };
let lastShockT = 0;

/** Pre-computed unit hexagon vertices (pointy-top), reused every frame. */
const unitHex = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return [Math.cos(a), Math.sin(a)] as const;
});

const baseRGB = computed(() => hexToRgb(props.baseColor));
const activeRGB = computed(() => hexToRgb(props.activeColor));

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [255, 255, 255];
  return [Number.parseInt(m[1]!, 16), Number.parseInt(m[2]!, 16), Number.parseInt(m[3]!, 16)];
}

function buildGrid() {
  const canvas = canvasRef.value;
  const wrap = wrapRef.value;
  if (!canvas || !wrap) return;

  const { width, height } = wrap.getBoundingClientRect();
  if (width === 0 || height === 0) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Pointy-top honeycomb: columns sit sqrt(3)*r apart, rows 1.5*r, and odd
  // rows shift half a column so the cells interlock.
  const r = props.radius;
  const stepX = Math.sqrt(3) * r + props.gap;
  const stepY = 1.5 * r + props.gap * 0.86;

  const cols = Math.ceil(width / stepX) + 2;
  const rows = Math.ceil(height / stepY) + 2;

  const startX = (width - (cols - 1) * stepX) / 2;
  const startY = (height - (rows - 1) * stepY) / 2;

  const next: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      next.push({
        cx: startX + col * stepX + (row % 2 ? stepX / 2 : 0),
        cy: startY + row * stepY,
        ox: 0,
        oy: 0,
      });
    }
  }
  cells = next;
}

function tracePath(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath();
  for (let i = 0; i < 6; i++) {
    const v = unitHex[i]!;
    const px = x + v[0] * r;
    const py = y + v[1] * r;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
}

function draw() {
  rafId = requestAnimationFrame(draw);
  const c = ctx;
  if (!c) return;

  c.clearRect(0, 0, c.canvas.width / dpr, c.canvas.height / dpr);

  const prox = props.proximity;
  const proxSq = prox * prox;
  const base = baseRGB.value;
  const active = activeRGB.value;
  c.lineWidth = props.lineWidth;

  for (const cell of cells) {
    const x = cell.cx + cell.ox;
    const y = cell.cy + cell.oy;

    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const dSq = dx * dx + dy * dy;

    // Squared falloff so the lit pool has a soft edge, not a hard disc.
    let t = 0;
    if (dSq < proxSq) {
      t = 1 - Math.sqrt(dSq) / prox;
      t *= t;
    }

    const style =
      t > 0.002
        ? `rgb(${Math.round(base[0] + (active[0] - base[0]) * t)} ${Math.round(
            base[1] + (active[1] - base[1]) * t,
          )} ${Math.round(base[2] + (active[2] - base[2]) * t)})`
        : `rgb(${base[0]} ${base[1]} ${base[2]})`;

    tracePath(c, x, y, props.radius * (1 + t * 0.5));

    if (props.filled || t > 0.55) {
      c.fillStyle = style;
      c.fill();
    } else {
      c.strokeStyle = style;
      c.stroke();
    }
  }
}

function onPointerMove(event: PointerEvent) {
  const wrap = wrapRef.value;
  if (!wrap) return;

  const rect = wrap.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const now = performance.now();

  const dt = Math.max(now - pointer.lastT, 1);
  pointer.speed = (Math.hypot(x - pointer.lastX, y - pointer.lastY) / dt) * 1000;

  pointer.x = x;
  pointer.y = y;
  pointer.lastX = x;
  pointer.lastY = y;
  pointer.lastT = now;

  // Rate-limit shockwaves. A fast drag would otherwise fire one per frame and
  // leave every cell permanently mid-tween.
  if (pointer.speed > props.speedTrigger && now - lastShockT > 400) {
    lastShockT = now;
    shock(x, y);
  }
}

function shock(x: number, y: number) {
  const rad = props.shockRadius;
  for (const cell of cells) {
    const dx = cell.cx - x;
    const dy = cell.cy - y;
    const d = Math.hypot(dx, dy);
    if (d >= rad || d === 0) continue;

    const falloff = 1 - d / rad;
    const push = props.shockStrength * falloff * falloff * 4;

    gsap.killTweensOf(cell);
    gsap.to(cell, {
      ox: (dx / d) * push,
      oy: (dy / d) * push,
      duration: 0.22,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(cell, {
          ox: 0,
          oy: 0,
          duration: props.returnDuration,
          ease: "elastic.out(1, 0.55)",
        });
      },
    });
  }
}

function onPointerLeave() {
  pointer.x = -9999;
  pointer.y = -9999;
}

/** Ripple outward from a point. Used as a page-load flourish. */
function pulse(x?: number, y?: number) {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  shock(x ?? rect.width / 2, y ?? rect.height / 2);
}

defineExpose({ pulse });

onMounted(() => {
  reduced.value = prefersReducedMotion();

  buildGrid();
  draw();

  const wrap = wrapRef.value;
  if (wrap) {
    resizeObserver = new ResizeObserver(() => buildGrid());
    resizeObserver.observe(wrap);
  }

  if (!reduced.value) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerleave", onPointerLeave);
  for (const cell of cells) gsap.killTweensOf(cell);
  cells = [];
});
</script>

<template>
  <div ref="wrapRef" class="absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="block h-full w-full" aria-hidden="true" />
  </div>
</template>
