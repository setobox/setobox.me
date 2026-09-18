<script setup lang="ts">
import ProjectCard from "@/components/ui/ProjectCard.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import { projects } from "@/data/projects";
</script>

<template>
  <section id="projects" class="section-y">
    <div class="container-page">
      <SectionHeading title="PROJECTS" kicker="项目列表" icon="i-lucide-layers" />

      <!-- Cards alternate sides down the list, so the eye zig-zags instead of
           tracking one straight column. -->
      <div v-if="projects.length" class="mt-16 flex flex-col gap-14 lg:mt-24 lg:gap-20">
        <ProjectCard
          v-for="(project, i) in projects"
          :key="project.title"
          :project="project"
          :flip="i % 2 === 1"
        />
      </div>
      <p v-else class="body-text mt-12 text-center">暂无项目。</p>
    </div>
  </section>
</template>
