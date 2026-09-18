import type { RouteRecordRaw } from "vue-router";
import { site } from "@/data/profile";

export interface RouteMeta {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalPath?: string;
  noindex?: boolean;
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
    meta: {
      title: site.name,
      description: "Setobox / 姬顶盒的个人主页，包含个人介绍、前端项目、技术栈和联系方式。",
      canonicalPath: "/",
      keywords:
        "setobox, 姬顶盒, frontend developer, vue, typescript, gsap, web developer, 前端开发",
    } satisfies RouteMeta,
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/pages/AboutPage.vue"),
    meta: {
      title: "关于 Setobox / 姬顶盒",
      description:
        "了解 Setobox / 姬顶盒：前端开发者与 ACG 爱好者的个人介绍、技术栈、兴趣和联系方式。",
      canonicalPath: "/about",
      keywords: "about setobox, developer profile, tech stack, frontend developer shanghai",
    } satisfies RouteMeta,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: {
      title: "404 - Setobox / 姬顶盒",
      description: "页面未找到 - Setobox / 姬顶盒",
      noindex: true,
    } satisfies RouteMeta,
  },
];
