import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { site } from "@/data/profile";

interface RouteMeta {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
    meta: {
      title: site.name,
      description: "专注于前端开发、交互设计和动效实现。",
      keywords:
        "setobox, 姬顶盒, frontend developer, vue, typescript, gsap, web developer, 前端开发",
    } satisfies RouteMeta,
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/pages/AboutPage.vue"),
    meta: {
      title: `About - ${site.name}`,
      description: "了解 Setobox：前端开发者、ACG 爱好者、技术探索者。喜欢创造、音乐和运动。",
      keywords: "about setobox, developer profile, tech stack, frontend developer shanghai",
    } satisfies RouteMeta,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: {
      title: `404 - ${site.name}`,
      description: "页面未找到 - Setobox Home",
    } satisfies RouteMeta,
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
