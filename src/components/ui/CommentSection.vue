<script setup lang="ts">
/**
 * CommentSection - giscus 留言板，由 GitHub Discussions 驱动。
 *
 * giscus 在 iframe 内渲染，父页样式无法覆盖，主题只能通过 `theme` 指向一个
 * 托管的 CSS 文件（见 public/giscus-theme.css）。本地开发回退到内置
 * `purple_dark`，避免 giscus 请求一个尚未部署的主题 URL。
 *
 * 配置读自 `profile.ts` 的 `giscus` 对象；任一字段为空则整个区块不渲染。
 */
import { computed } from "vue";
import Giscus from "@giscus/vue";
import { giscus } from "@/data/profile";

const theme = computed(() =>
  import.meta.env.PROD ? "https://setobox.me/giscus-theme.css" : "purple_dark",
);

const repo = computed(() => giscus.repo as `${string}/${string}`);

const ready = computed(() =>
  Boolean(giscus.repo && giscus.repoId && giscus.category && giscus.categoryId),
);
</script>

<template>
  <section v-if="ready" id="comments" aria-label="留言板">
    <Giscus
      :repo="repo"
      :repo-id="giscus.repoId"
      :category="giscus.category"
      :category-id="giscus.categoryId"
      mapping="pathname"
      strict="1"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      lang="zh-CN"
      loading="lazy"
      :theme="theme"
    />
  </section>
</template>
