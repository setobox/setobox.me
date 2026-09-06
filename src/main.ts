import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { routes } from "./router";
import "virtual:uno.css";
import "@/styles/main.css";

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  },
  undefined,
  { hydration: import.meta.env.PROD },
);
