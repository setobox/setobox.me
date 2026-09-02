import { createLocalFontProcessor } from "@unocss/preset-web-fonts/local";
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

/**
 * Setobox Home — design tokens.
 *
 * Palette derives from the 银狼 / Silver Wolf key art in `plan/`: a deep indigo
 * void, silver-white type, and three neon accents (violet → magenta → cyan)
 * with gold reserved for rare highlights.
 */
export default defineConfig({
  presets: [
    presetWind4({ preflights: { reset: true } }),
    presetWebFonts({
      provider: "google",
      // Keep the existing font token stacks below, including their system
      // fallbacks. This preset only emits the local @font-face declarations.
      extendTheme: false,
      fonts: {
        display: {
          name: "Orbitron",
          weights: ["400..900"],
          subsets: ["latin"],
        },
        display2: {
          name: "Electrolize",
          weights: ["400"],
          subsets: ["latin"],
        },
        sans: {
          name: "Chakra Petch",
          weights: ["400"],
          subsets: ["latin"],
        },
        mono: {
          name: "JetBrains Mono",
          weights: ["400"],
          subsets: ["latin"],
        },
      },
      processors: createLocalFontProcessor({
        cacheDir: "node_modules/.cache/unocss/fonts",
        fontAssetsDir: "public/assets/fonts",
        fontServeBaseUrl: "/assets/fonts",
      }),
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],

  content: {
    pipeline: {
      // Icon classes live in `src/data/*.ts`, which the default extractor
      // pipeline skips (it only walks template-ish extensions).
      include: [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/, "src/**/*.ts"],
    },
  },

  theme: {
    colors: {
      // Backgrounds — the indigo void the character floats in.
      void: {
        950: "#03020A",
        900: "#060413",
        800: "#0A0722",
        700: "#0F0B30",
        600: "#161141",
        500: "#1E1755",
        400: "#2A2170",
      },
      // Neutrals — Silver Wolf's hair, cool-shifted so it never reads beige.
      silver: {
        50: "#F6F5FD",
        100: "#E8E5F7",
        200: "#D2CDEB",
        300: "#B0A9D4",
        400: "#8A82B4",
        500: "#665E90",
        600: "#4B446C",
        700: "#352F4E",
        800: "#221E34",
      },
      // Primary — the dominant violet of the key art.
      violet: {
        200: "#DDCCFF",
        300: "#C1A5FF",
        400: "#A47CFF",
        500: "#8B5CF6",
        600: "#7338E8",
        700: "#5A25C4",
      },
      // Secondary accent — the hot magenta of the logotype and hex outlines.
      magenta: {
        200: "#FFC4E6",
        300: "#FF93D0",
        400: "#FF5FB8",
        500: "#FF2E9E",
        600: "#DE1180",
      },
      // Tertiary accent — the electric cyan of her visor and data cubes.
      cyan: {
        200: "#C3F3FF",
        300: "#8DE7FF",
        400: "#4CD9F5",
        500: "#21C4E8",
        600: "#0C9CBE",
      },
      // Reserved for scarce highlights (the pixel stars / sparkles).
      gold: {
        300: "#FFEDB0",
        400: "#FFD75E",
        500: "#F5BE1E",
      },
    },

    font: {
      display: '"Orbitron", "Chakra Petch", ui-sans-serif, system-ui, sans-serif',
      display2: '"Electrolize", "Orbitron", ui-sans-serif, system-ui, sans-serif',
      sans: '"Chakra Petch", ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, "Cascadia Code", Consolas, monospace',
    },

    breakpoint: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      hg: "1680px",
    },

    ease: {
      hex: "cubic-bezier(0.215, 0.61, 0.355, 1)",
      snap: "cubic-bezier(0.16, 1, 0.3, 1)",
    },

    animation: {
      keyframes: {
        "hex-pulse":
          "{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}",
        "hex-spin": "{from{transform:rotate(0)}to{transform:rotate(360deg)}}",
        drift: "{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}",
        "scan-y": "{from{transform:translateY(-100%)}to{transform:translateY(100%)}}",
        flicker:
          "{0%,100%{opacity:1}41%{opacity:1}42%{opacity:.35}43%{opacity:1}92%{opacity:1}93%{opacity:.5}94%{opacity:1}}",
        "marquee-x": "{from{transform:translateX(0)}to{transform:translateX(-50%)}}",
      },
      durations: {
        "hex-pulse": "4s",
        "hex-spin": "18s",
        drift: "6s",
        "scan-y": "5s",
        flicker: "7s",
        "marquee-x": "24s",
      },
      timingFns: {
        "hex-pulse": "ease-in-out",
        "hex-spin": "linear",
        drift: "ease-in-out",
        "scan-y": "linear",
        flicker: "steps(1, end)",
        "marquee-x": "linear",
      },
      counts: {
        "hex-pulse": "infinite",
        "hex-spin": "infinite",
        drift: "infinite",
        "scan-y": "infinite",
        flicker: "infinite",
        "marquee-x": "infinite",
      },
    },
  },

  rules: [
    // Hexagon masks. `hex-flat` has vertices left/right, `hex-point` top/bottom.
    [
      "hex-flat",
      {
        "clip-path": "polygon(25% 1.34%, 75% 1.34%, 100% 50%, 75% 98.66%, 25% 98.66%, 0% 50%)",
      },
    ],
    [
      "hex-point",
      {
        "clip-path": "polygon(50% 0%, 98.66% 25%, 98.66% 75%, 50% 100%, 1.34% 75%, 1.34% 25%)",
      },
    ],
    // "Box" panels: chamfered corners, the flat-pack cousin of the hexagon.
    [
      /^cut-(\d+)$/,
      ([, d]) => ({
        "clip-path": `polygon(0 ${d}px, ${d}px 0, calc(100% - ${d}px) 0, 100% ${d}px, 100% calc(100% - ${d}px), calc(100% - ${d}px) 100%, ${d}px 100%, 0 calc(100% - ${d}px))`,
      }),
    ],
    [
      /^cut-tr-(\d+)$/,
      ([, d]) => ({
        "clip-path": `polygon(0 0, calc(100% - ${d}px) 0, 100% ${d}px, 100% 100%, 0 100%)`,
      }),
    ],
    [
      /^cut-br-(\d+)$/,
      ([, d]) => ({
        "clip-path": `polygon(0 0, 100% 0, 100% calc(100% - ${d}px), calc(100% - ${d}px) 100%, 0 100%)`,
      }),
    ],
    [
      /^cut-diag-(\d+)$/,
      ([, d]) => ({
        "clip-path": `polygon(${d}px 0, 100% 0, 100% calc(100% - ${d}px), calc(100% - ${d}px) 100%, 0 100%, 0 ${d}px)`,
      }),
    ],
    // Perspective + preserve-3d for the tilt cards.
    ["preserve-3d", { "transform-style": "preserve-3d" }],
    [/^persp-(\d+)$/, ([, d]) => ({ perspective: `${d}px` })],
    // Text glow, used on hover across the site.
    [/^glow-(\d+)$/, ([, d]) => ({ "text-shadow": `0 0 ${d}px currentColor` })],
  ],

  shortcuts: [
    // — Layout ————————————————————————————————————————————————
    ["container-page", "w-full max-w-1400px mx-auto px-5 sm:px-8 lg:px-12"],
    ["section-y", "py-20 md:py-40 lg:py-48"],

    // — Type ——————————————————————————————————————————————————
    [
      "h-section",
      "font-display font-light uppercase tracking-[0.12em] text-silver-50 text-[clamp(2.2rem,9vw,5.5rem)] leading-none",
    ],
    ["label-mono", "font-mono text-[0.7rem] uppercase tracking-[0.32em] text-violet-300"],
    ["body-text", "text-silver-300 leading-relaxed"],

    // — Surfaces ——————————————————————————————————————————————
    ["panel", "relative bg-void-800/70 backdrop-blur-md border border-silver-700/70"],
    ["panel-hover", "transition-all duration-500 ease-hex hover:border-violet-500/70"],

    // — Interaction ————————————————————————————————————————————
    ["cursor-target", "cursor-none select-none"],
    ["text-glow", "transition-text-shadow duration-300 ease-hex hover:glow-15"],
    ["link-glow", "transition-all duration-300 ease-hex hover:text-violet-300 hover:glow-15"],
    [
      "btn-hex",
      "inline-flex items-center gap-2 px-6 py-3 font-display text-sm uppercase tracking-[0.18em] cut-10 bg-violet-600/20 text-silver-100 border border-violet-500/60 transition-all duration-300 ease-hex hover:bg-violet-500/35 hover:text-white hover:border-violet-300",
    ],
  ],
});
