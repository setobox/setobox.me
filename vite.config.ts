import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite-plus";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vue(), UnoCSS(), cloudflare()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    // GSAP is the heaviest single dependency and the motion layer is not
    // needed to paint the shell, so it gets its own chunk. Rolldown's
    // `manualChunks` is function-only, unlike Rollup's object form.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/gsap")) return "gsap";
          if (/node_modules[/\\](vue|vue-router|@vue|lenis)[/\\]/.test(id)) {
            return "vendor";
          }
          return undefined;
        },
      },
    },
  },

  staged: {
    "*": "vp check --fix",
  },
  // The smoke harness is a local dev tool, not shipped source; keep it out of
  // the formatter and the type-aware lint pass.
  fmt: { ignore: ["scripts/**", ".smoke/**", "dist/**"] },
  lint: {
    ignorePatterns: ["scripts/**", ".smoke/**", "dist/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
