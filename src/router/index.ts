import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { site } from "@/data/profile";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
    meta: { title: site.name },
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/pages/AboutPage.vue"),
    meta: { title: `About - ${site.name}` },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: { title: `404 - ${site.name}` },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Jump instantly rather than smooth-scrolling: the route transition already
  // fades the old page out, and animating both at once reads as a stutter.
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

router.afterEach((to) => {
  const title = to.meta.title;
  if (typeof title === "string") document.title = title;
});
