// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createApp, nextTick } from "vue";
import { gsap } from "@/composables/useGSAP";
import HexLoader from "./HexLoader.vue";

vi.hoisted(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((media: string) => ({
      media,
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
});

const unmounts: Array<() => void> = [];

beforeEach(() => {
  gsap.globalTimeline.clear();
  gsap.globalTimeline.time(0);
  gsap.ticker.sleep();
});

afterEach(() => {
  unmounts.splice(0).forEach((unmount) => unmount());
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function mountLoader() {
  const events: string[] = [];
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(HexLoader, {
    onReveal: () => events.push("reveal"),
    onDone: () => events.push("done"),
  });
  app.mount(host);
  gsap.ticker.sleep();
  const startedAt = gsap.globalTimeline.time();
  const advance = (seconds: number) => gsap.globalTimeline.time(startedAt + seconds, false);
  const unmount = () => app.unmount();
  unmounts.push(unmount);
  return { host, events, advance, unmount };
}

describe("opening loader transition", () => {
  it("keeps outlines opaque while brightening a modern CSS color token", () => {
    // UnoCSS resolves stroke-violet-500 to oklab in the browser. Include that
    // computed start color here; jsdom does not load the generated stylesheet.
    const style = document.createElement("style");
    style.textContent = ".loader-hex { stroke: oklab(0.605616 0.0845671 -0.201916); }";
    document.body.append(style);
    const { host, advance } = mountLoader();
    const cell = host.querySelector<SVGElement>(".loader-hex")!;

    for (const time of [0.41, 0.6, 0.85, 1.1]) {
      advance(time);
      const stroke = getComputedStyle(cell).stroke;
      expect(stroke, `outline color at ${time}s`).toMatch(/^rgb\(/);
      const channels = stroke.match(/[\d.]+/g)!.map(Number);
      for (const [index, minimum, maximum] of [
        [0, 139, 193],
        [1, 92, 165],
        [2, 246, 255],
      ] as const) {
        expect(channels[index]).toBeGreaterThanOrEqual(minimum);
        expect(channels[index]).toBeLessThanOrEqual(maximum);
      }
    }
  });

  it.each([
    [1440, 900],
    [3440, 1440],
    [390, 844],
  ])("reveals the page tile by tile after assembly at %i x %i", async (width, height) => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(height);
    const { host, events, advance } = mountLoader();
    const overlay = host.querySelector<HTMLElement>('[role="status"]')!;
    const ground = host.querySelector<HTMLElement>(".loader-ground")!;
    const cells = [...host.querySelectorAll<SVGElement>(".loader-hex")];

    advance(1.2);
    expect(events).toEqual([]);
    expect(gsap.getProperty(overlay, "opacity")).toBe(1);
    expect(gsap.getProperty(ground, "opacity")).toBe(1);
    for (const cell of cells) {
      expect(gsap.getProperty(cell, "scaleX")).toBe(1);
      expect(gsap.getProperty(cell, "opacity")).toBe(1);
      expect(gsap.getProperty(cell, "fillOpacity")).toBe(1);
    }
    const assembled = cells.map((cell) => cell.getAttribute("transform"));
    const strokes = cells.map((cell) => cell.style.stroke);

    advance(1.48);
    const hollowTiles = cells.filter((cell) => gsap.getProperty(cell, "fillOpacity") === 0);
    expect(hollowTiles.length).toBeGreaterThan(0);
    expect(hollowTiles.length).toBeLessThan(cells.length / 5);
    expect(hollowTiles.every((cell) => Number(gsap.getProperty(cell, "opacity")) > 0)).toBe(true);
    expect(cells.map((cell) => cell.style.stroke)).toEqual(strokes);

    advance(1.8);
    expect(events).toEqual(["reveal"]);
    // The full-screen ground must no longer obscure holes left by the tiles.
    expect(gsap.getProperty(ground, "opacity")).toBe(0);
    expect(gsap.getProperty(overlay, "opacity")).toBe(1);
    expect(cells.map((cell) => cell.getAttribute("transform"))).toEqual(assembled);
    const opacities = cells.map((cell) => Number(gsap.getProperty(cell, "opacity")));
    expect(opacities.some((opacity) => opacity === 0)).toBe(true);
    expect(opacities.some((opacity) => opacity > 0 && opacity < 1)).toBe(true);
    expect(opacities.some((opacity) => opacity === 1)).toBe(true);

    advance(2.2);
    expect(events).toEqual(["reveal"]);
    expect(cells.some((cell) => Number(gsap.getProperty(cell, "opacity")) > 0)).toBe(true);

    // The independent fill effect must not prolong the original 0.97s exit.
    advance(2.28);
    await nextTick();
    expect(events).toEqual(["reveal", "done"]);
    expect(host.querySelector('[role="status"]')).toBeNull();
  });

  it.each([0.5, 1.8])("cancels pending callbacks when unmounted at %is", (time) => {
    const { events, advance, unmount } = mountLoader();
    advance(time);
    const emitted = [...events];
    unmount();
    unmounts.pop();
    advance(3);
    expect(events).toEqual(emitted);
    expect(gsap.globalTimeline.getChildren()).toHaveLength(0);
  });

  it("uses a short fade with no cell transforms for reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((media: string) => ({
      media,
      matches: media === "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    }));
    const { host, events, advance } = mountLoader();
    advance(0.3);
    expect(events).toEqual(["reveal"]);
    expect(host.querySelector(".loader-hex[transform]")).toBeNull();
    advance(0.6);
    await nextTick();
    expect(events).toEqual(["reveal", "done"]);
    expect(host.querySelector('[role="status"]')).toBeNull();
  });
});
