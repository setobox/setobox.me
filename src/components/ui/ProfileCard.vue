<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const DEFAULT_INNER_GRADIENT = "linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)";

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180,
} as const;

interface Props {
  avatarUrl?: string;
  iconUrl?: string;
  grainUrl?: string;
  innerGradient?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: "",
  iconUrl: "",
  grainUrl: "",
  behindGlowEnabled: true,
  className: "",
  enableTilt: true,
  enableMobileTilt: false,
  mobileTiltSensitivity: 5,
  name: "",
  title: "",
  handle: "",
  status: "",
  contactText: "",
  showUserInfo: true,
});

const emit = defineEmits<{ contactClick: [] }>();

const wrapRef = ref<HTMLDivElement | null>(null);
const shellRef = ref<HTMLDivElement | null>(null);
const enterTimerRef = ref<number | null>(null);
const leaveRafRef = ref<number | null>(null);

let tiltEngine: ReturnType<typeof createTiltEngine> | null = null;

function createTiltEngine() {
  let rafId: number | null = null;
  let running = false;
  let lastTs = 0;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  const DEFAULT_TAU = 0.14;
  const INITIAL_TAU = 0.6;
  let initialUntil = 0;

  const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const round = (v: number, precision = 3) => parseFloat(v.toFixed(precision));
  const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) =>
    round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

  const setVarsFromXY = (x: number, y: number) => {
    const shell = shellRef.value;
    const wrap = wrapRef.value;
    if (!shell || !wrap) return;

    const width = shell.clientWidth || 1;
    const height = shell.clientHeight || 1;

    const percentX = clamp((100 / width) * x);
    const percentY = clamp((100 / height) * y);

    const centerX = percentX - 50;
    const centerY = percentY - 50;

    const properties: Record<string, string> = {
      "--pointer-x": `${percentX}%`,
      "--pointer-y": `${percentY}%`,
      "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
      "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
      "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
      "--pointer-from-top": `${percentY / 100}`,
      "--pointer-from-left": `${percentX / 100}`,
      "--rotate-x": `${round(-(centerX / 5))}deg`,
      "--rotate-y": `${round(centerY / 4)}deg`,
    };

    for (const [k, v] of Object.entries(properties)) {
      wrap.style.setProperty(k, v);
    }
  };

  const step = (ts: number) => {
    if (!running) return;
    if (lastTs === 0) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
    const k = 1 - Math.exp(-dt / tau);

    currentX += (targetX - currentX) * k;
    currentY += (targetY - currentY) * k;

    setVarsFromXY(currentX, currentY);

    const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

    if (stillFar || document.hasFocus()) {
      rafId = requestAnimationFrame(step);
    } else {
      running = false;
      lastTs = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    lastTs = 0;
    rafId = requestAnimationFrame(step);
  };

  return {
    setImmediate(x: number, y: number) {
      currentX = x;
      currentY = y;
      setVarsFromXY(currentX, currentY);
    },
    setTarget(x: number, y: number) {
      targetX = x;
      targetY = y;
      start();
    },
    toCenter() {
      const shell = shellRef.value;
      if (!shell) return;
      this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
    },
    beginInitial(durationMs: number) {
      initialUntil = performance.now() + durationMs;
      start();
    },
    getCurrent() {
      return { x: currentX, y: currentY, tx: targetX, ty: targetY };
    },
    cancel() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      running = false;
      lastTs = 0;
    },
  };
}

const getOffsets = (evt: PointerEvent, el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
};

const handlePointerMove = (event: PointerEvent) => {
  const shell = shellRef.value;
  if (!shell || !tiltEngine || !props.enableTilt) return;
  const { x, y } = getOffsets(event, shell);
  tiltEngine.setTarget(x, y);
};

const handlePointerEnter = (event: PointerEvent) => {
  const shell = shellRef.value;
  if (!shell || !tiltEngine || !props.enableTilt) return;

  shell.classList.add("active");
  shell.classList.add("entering");
  if (enterTimerRef.value) window.clearTimeout(enterTimerRef.value);
  enterTimerRef.value = window.setTimeout(() => {
    shell.classList.remove("entering");
  }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

  const { x, y } = getOffsets(event, shell);
  tiltEngine.setTarget(x, y);
};

const handlePointerLeave = () => {
  const shell = shellRef.value;
  if (!shell || !tiltEngine || !props.enableTilt) return;

  tiltEngine.toCenter();

  const checkSettle = () => {
    const { x, y, tx, ty } = tiltEngine!.getCurrent();
    const settled = Math.hypot(tx - x, ty - y) < 0.6;
    if (settled) {
      shell.classList.remove("active");
      leaveRafRef.value = null;
    } else {
      leaveRafRef.value = requestAnimationFrame(checkSettle);
    }
  };
  if (leaveRafRef.value) cancelAnimationFrame(leaveRafRef.value);
  leaveRafRef.value = requestAnimationFrame(checkSettle);
};

const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
  const shell = shellRef.value;
  if (!shell || !tiltEngine || !props.enableTilt) return;

  const { beta, gamma } = event;
  if (beta == null || gamma == null) return;

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const centerX = shell.clientWidth / 2;
  const centerY = shell.clientHeight / 2;
  const x = clamp(centerX + gamma * props.mobileTiltSensitivity, 0, shell.clientWidth);
  const y = clamp(
    centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * props.mobileTiltSensitivity,
    0,
    shell.clientHeight,
  );

  tiltEngine.setTarget(x, y);
};

const cardStyle = computed(() => ({
  "--icon": props.iconUrl ? `url(${props.iconUrl})` : "none",
  "--grain": props.grainUrl ? `url(${props.grainUrl})` : "none",
  "--inner-gradient": props.innerGradient ?? DEFAULT_INNER_GRADIENT,
  "--behind-glow-color": props.behindGlowColor ?? "rgba(125, 190, 255, 0.67)",
  "--behind-glow-size": props.behindGlowSize ?? "50%",
}));

const handleContactClick = () => emit("contactClick");

const handleAvatarError = (event: Event) => {
  (event.target as HTMLImageElement).style.display = "none";
};

const handleMiniAvatarError = (event: Event) => {
  const t = event.target as HTMLImageElement;
  t.style.opacity = "0.5";
  t.src = props.avatarUrl;
};

let clickHandler: (() => void) | null = null;
let deviceOrientationBound = false;

onMounted(() => {
  if (!props.enableTilt) return;

  tiltEngine = createTiltEngine();

  const shell = shellRef.value;
  if (!shell) return;

  shell.addEventListener("pointerenter", handlePointerEnter);
  shell.addEventListener("pointermove", handlePointerMove);
  shell.addEventListener("pointerleave", handlePointerLeave);

  clickHandler = () => {
    if (!props.enableMobileTilt || location.protocol !== "https:") return;
    const anyMotion = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<string>;
    };
    if (anyMotion && typeof anyMotion.requestPermission === "function") {
      anyMotion
        .requestPermission()
        .then((state: string) => {
          if (state === "granted") {
            window.addEventListener("deviceorientation", handleDeviceOrientation);
            deviceOrientationBound = true;
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
      deviceOrientationBound = true;
    }
  };
  shell.addEventListener("click", clickHandler);

  const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
  const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
  tiltEngine.setImmediate(initialX, initialY);
  tiltEngine.toCenter();
  tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);
});

onUnmounted(() => {
  const shell = shellRef.value;
  if (shell) {
    shell.removeEventListener("pointerenter", handlePointerEnter);
    shell.removeEventListener("pointermove", handlePointerMove);
    shell.removeEventListener("pointerleave", handlePointerLeave);
    if (clickHandler) shell.removeEventListener("click", clickHandler);
    shell.classList.remove("entering");
  }
  if (deviceOrientationBound) {
    window.removeEventListener("deviceorientation", handleDeviceOrientation);
  }
  if (enterTimerRef.value) window.clearTimeout(enterTimerRef.value);
  if (leaveRafRef.value) cancelAnimationFrame(leaveRafRef.value);
  tiltEngine?.cancel();
});
</script>

<template>
  <div
    ref="wrapRef"
    class="pc-card-wrapper relative persp-500 touch-none"
    :class="className"
    :style="cardStyle"
  >
    <div
      v-if="behindGlowEnabled"
      class="pc-behind pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
      aria-hidden="true"
    />

    <div ref="shellRef" class="pc-card-shell relative z-1">
      <section
        class="pc-card relative grid h-[60svh] max-h-[380px] max-w-[calc(100vw-40px)] aspect-[0.718] overflow-hidden rounded-[var(--card-radius)] bg-black/90 backface-hidden xs:h-[70svh] xs:max-h-[450px] md:h-[80svh] md:max-h-[540px]"
      >
        <div
          class="pointer-events-none bg-[image:var(--inner-gradient)] absolute inset-0 grid [grid-area:1/-1] rounded-[var(--card-radius)] bg-black/90"
        >
          <div
            class="pc-shine pointer-events-none grid [grid-area:1/-1] rounded-[var(--card-radius)]"
            aria-hidden="true"
          />
          <div
            class="pc-glare pointer-events-none z-4 grid overflow-hidden [grid-area:1/-1] rounded-[var(--card-radius)] mix-blend-overlay"
            aria-hidden="true"
          />

          <div
            class="pc-avatar-content pointer-events-none grid overflow-visible [grid-area:1/-1] rounded-[var(--card-radius)] mix-blend-luminosity backface-hidden"
          >
            <img
              v-if="avatarUrl"
              class="avatar absolute bottom-[-1px] left-1/2 w-full origin-bottom rounded-[var(--card-radius)] backface-hidden will-change-transform"
              :src="avatarUrl"
              :alt="name ? `${name}的头像` : '用户头像'"
              loading="lazy"
              @error="handleAvatarError"
            />

            <div
              v-if="showUserInfo && (handle || status || contactText)"
              class="pointer-events-auto [--ui-inset:12px] xs:[--ui-inset:15px] md:[--ui-inset:20px] rounded-[max(0px,calc(var(--card-radius)-var(--ui-inset)+6px))] absolute inset-x-[var(--ui-inset)] bottom-[var(--ui-inset)] z-2 flex items-center justify-between border border-white/10 bg-white/10 px-2.5 py-2 backdrop-blur-[30px] xs:px-3 xs:py-2.5 md:px-3.5 md:py-3"
            >
              <div v-if="handle || status" class="flex items-center gap-2 xs:gap-2.5 md:gap-3">
                <div
                  v-if="miniAvatarUrl || avatarUrl"
                  class="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/10 xs:h-7 xs:w-7 md:h-12 md:w-12"
                >
                  <img
                    :src="miniAvatarUrl || avatarUrl"
                    :alt="name ? `${name}的头像` : '用户头像'"
                    class="h-full w-full rounded-full object-cover"
                    loading="lazy"
                    @error="handleMiniAvatarError"
                  />
                </div>
                <div class="flex flex-col items-start gap-1.5">
                  <div
                    v-if="handle"
                    class="text-xs font-medium leading-none text-white/90 xs:text-[13px] md:text-sm"
                  >
                    @{{ handle }}
                  </div>
                  <div v-if="status" class="text-xs leading-none text-white/70 md:text-sm">
                    {{ status }}
                  </div>
                </div>
              </div>
              <button
                v-if="contactText"
                class="pointer-events-auto min-h-11 cursor-pointer rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-[10px] transition-all duration-200 hover:-translate-y-px hover:border-white/40 md:px-4 md:py-3"
                @click="handleContactClick"
                type="button"
                :aria-label="name ? `联系${name}` : contactText"
              >
                {{ contactText }}
              </button>
            </div>
          </div>

          <div
            class="pc-content pointer-events-none relative z-5 grid max-h-full overflow-hidden [grid-area:1/-1] rounded-[var(--card-radius)] text-center mix-blend-luminosity"
          >
            <div
              v-if="name || title"
              class="absolute top-[1.5em] flex w-full flex-col xs:top-[2em] md:top-[3em]"
            >
              <h3
                v-if="name"
                class="m-0 bg-[linear-gradient(to_bottom,#fff,#6f6fbe)] bg-[length:1em_1.5em] bg-clip-text text-[min(3.5svh,2em)] font-semibold text-transparent xs:text-[min(4svh,2.5em)] md:text-[min(5svh,3em)]"
              >
                {{ name }}
              </h3>
              <p
                v-if="title"
                class="relative top-[-8px] mx-auto my-0 w-min whitespace-nowrap bg-[linear-gradient(to_bottom,#fff,#4a4ac0)] bg-[length:1em_1.5em] bg-clip-text text-xs font-semibold text-transparent xs:top-[-12px] xs:text-sm md:text-base"
              >
                {{ title }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pc-card-wrapper {
  --pointer-x: 50%;
  --pointer-y: 50%;
  --pointer-from-center: 0;
  --pointer-from-top: 0.5;
  --pointer-from-left: 0.5;
  --card-opacity: 0;
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  --background-x: 50%;
  --background-y: 50%;
  --grain: none;
  --icon: none;
  --behind-gradient: none;
  --behind-glow-color: rgba(125, 190, 255, 0.67);
  --behind-glow-size: 50%;
  --inner-gradient: none;
  --sunpillar-1: hsl(2, 100%, 73%);
  --sunpillar-2: hsl(53, 100%, 69%);
  --sunpillar-3: hsl(93, 100%, 69%);
  --sunpillar-4: hsl(176, 100%, 76%);
  --sunpillar-5: hsl(228, 100%, 74%);
  --sunpillar-6: hsl(283, 100%, 73%);
  --sunpillar-clr-1: var(--sunpillar-1);
  --sunpillar-clr-2: var(--sunpillar-2);
  --sunpillar-clr-3: var(--sunpillar-3);
  --sunpillar-clr-4: var(--sunpillar-4);
  --sunpillar-clr-5: var(--sunpillar-5);
  --sunpillar-clr-6: var(--sunpillar-6);
  --card-radius: 30px;

  transform: translate3d(0, 0, 0.1px);
}

.pc-behind {
  background: radial-gradient(
    circle at var(--pointer-x) var(--pointer-y),
    var(--behind-glow-color) 0%,
    transparent var(--behind-glow-size)
  );
  filter: blur(50px) saturate(1.1);
  opacity: calc(0.8 * var(--card-opacity));
}

.pc-card-wrapper:hover,
.pc-card-wrapper.active {
  --card-opacity: 1;
}

.pc-card {
  background-blend-mode: color-dodge, normal, normal, normal;
  box-shadow: rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px)
    calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px;
  transition: transform 1s ease;
  transform: translateZ(0) rotateX(0deg) rotateY(0deg);
}

.pc-card:hover,
.pc-card.active {
  transition: none;
  transform: translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
}

.pc-card-shell.entering .pc-card {
  transition: transform 180ms ease-out;
}

.pc-shine {
  mask-image: var(--icon);
  mask-mode: luminance;
  mask-repeat: repeat;
  mask-size: 150%;
  mask-position: top calc(200% - (var(--background-y) * 5)) left calc(100% - var(--background-x));
  transition: filter 0.8s ease;
  filter: brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5);
  animation: holo-bg 18s linear infinite;
  animation-play-state: running;
  mix-blend-mode: color-dodge;
}

.pc-shine,
.pc-shine::after {
  --space: 5%;
  --angle: -45deg;
  transform: translate3d(0, 0, 1px);
  overflow: hidden;
  z-index: 3;
  background: transparent;
  background-size: cover;
  background-position: center;
  background-image:
    repeating-linear-gradient(
      0deg,
      var(--sunpillar-clr-1) calc(var(--space) * 1),
      var(--sunpillar-clr-2) calc(var(--space) * 2),
      var(--sunpillar-clr-3) calc(var(--space) * 3),
      var(--sunpillar-clr-4) calc(var(--space) * 4),
      var(--sunpillar-clr-5) calc(var(--space) * 5),
      var(--sunpillar-clr-6) calc(var(--space) * 6),
      var(--sunpillar-clr-1) calc(var(--space) * 7)
    ),
    repeating-linear-gradient(
      var(--angle),
      #0e152e 0%,
      hsl(180, 10%, 60%) 3.8%,
      hsl(180, 29%, 66%) 4.5%,
      hsl(180, 10%, 60%) 5.2%,
      #0e152e 10%,
      #0e152e 12%
    ),
    radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(0, 0%, 0%, 0.1) 12%,
      hsla(0, 0%, 0%, 0.15) 20%,
      hsla(0, 0%, 0%, 0.25) 120%
    );
  background-position:
    0 var(--background-y),
    var(--background-x) var(--background-y),
    center;
  background-blend-mode: color, hard-light;
  background-size:
    500% 500%,
    300% 300%,
    200% 200%;
  background-repeat: repeat;
}

.pc-shine::before,
.pc-shine::after {
  content: "";
  background-position: center;
  background-size: cover;
  grid-area: 1/1;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.pc-card:hover .pc-shine,
.pc-card.active .pc-shine {
  filter: brightness(0.85) contrast(1.5) saturate(0.5);
  animation-play-state: paused;
}

.pc-card:hover .pc-shine::before,
.pc-card.active .pc-shine::before,
.pc-card:hover .pc-shine::after,
.pc-card.active .pc-shine::after {
  opacity: 1;
}

.pc-shine::before {
  background-image:
    linear-gradient(
      45deg,
      var(--sunpillar-4),
      var(--sunpillar-5),
      var(--sunpillar-6),
      var(--sunpillar-1),
      var(--sunpillar-2),
      var(--sunpillar-3)
    ),
    radial-gradient(
      circle at var(--pointer-x) var(--pointer-y),
      hsl(0, 0%, 70%) 0%,
      hsla(0, 0%, 30%, 0.2) 90%
    ),
    var(--grain);
  background-size:
    250% 250%,
    100% 100%,
    220px 220px;
  background-position:
    var(--pointer-x) var(--pointer-y),
    center,
    calc(var(--pointer-x) * 0.01) calc(var(--pointer-y) * 0.01);
  background-blend-mode: color-dodge;
  filter: brightness(calc(2 - var(--pointer-from-center)))
    contrast(calc(var(--pointer-from-center) + 2)) saturate(calc(0.5 + var(--pointer-from-center)));
  mix-blend-mode: luminosity;
}

.pc-shine::after {
  background-position:
    0 var(--background-y),
    calc(var(--background-x) * 0.4) calc(var(--background-y) * 0.5),
    center;
  background-size:
    200% 300%,
    700% 700%,
    100% 100%;
  mix-blend-mode: difference;
  filter: brightness(0.8) contrast(1.5);
}

.pc-glare {
  transform: translate3d(0, 0, 1.1px);
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x) var(--pointer-y),
    hsl(248, 25%, 80%) 12%,
    hsla(207, 40%, 30%, 0.8) 90%
  );
  filter: brightness(0.8) contrast(1.2);
}

.pc-avatar-content {
  transform: translateZ(2px);
}

.pc-avatar-content .avatar {
  transform: translateX(calc(-50% + (var(--pointer-from-left) - 0.5) * 6px)) translateZ(0)
    scaleY(calc(1 + (var(--pointer-from-top) - 0.5) * 0.02))
    scaleX(calc(1 + (var(--pointer-from-left) - 0.5) * 0.01));
  transition: transform 120ms ease-out;
}

.pc-content {
  transform: translate3d(
    calc(var(--pointer-from-left) * -6px + 3px),
    calc(var(--pointer-from-top) * -6px + 3px),
    0.1px
  );
}

@keyframes holo-bg {
  0% {
    background-position:
      0 var(--background-y),
      0 0,
      center;
  }
  100% {
    background-position:
      0 var(--background-y),
      90% 90%,
      center;
  }
}
</style>
