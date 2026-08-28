import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import App from "@/App.vue";
import { router } from "@/router";

// presetWind4 emits its own reset via `preflights.reset`, so no separate
// reset stylesheet is imported here.
import "virtual:uno.css";
import "@/styles/main.css";

const app = createApp(App);

app.use(router).use(createHead()).mount("#app");
