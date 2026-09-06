import type { RouteRecordRaw } from "vue-router";
import { site } from "@/data/profile";

interface RouteMeta {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
    meta: {
      title: "首页 - Setobox(姬顶盒)",
      description: "Setobox 的箱庭世界。",
      keywords:
        "setobox, 姬顶盒, frontend developer, vue, typescript, gsap, web developer, 前端开发",
    } satisfies RouteMeta,
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/pages/AboutPage.vue"),
    meta: {
      title: "关于 - Setobox(姬顶盒)",
      description: "了解 Setobox。",
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
