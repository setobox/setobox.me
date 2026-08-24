import { createApp } from "vue";
import App from "@/App.vue";
import { router } from "@/router";

// presetWind4 emits its own reset via `preflights.reset`, so no separate
// reset stylesheet is imported here.
import "virtual:uno.css";
import "@/styles/main.css";

createApp(App).use(router).mount("#app");
