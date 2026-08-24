<script setup lang="ts">
import AboutSection from "@/components/sections/AboutSection.vue";
import ContactSection from "@/components/sections/ContactSection.vue";
import HeroSection from "@/components/sections/HeroSection.vue";
import MarqueeDivider from "@/components/sections/MarqueeDivider.vue";
import ProjectsSection from "@/components/sections/ProjectsSection.vue";
import StackSection from "@/components/sections/StackSection.vue";
</script>

<template>
  <div>
    <HeroSection />
    <MarqueeDivider :texts="['CREATING // DESIGNING', 'EXPLORING \\\\ DISCOVERING']" />
    <AboutSection />
    <StackSection />
    <MarqueeDivider :texts="['PROJECTS //', '\\\\ PROJECTS']" />
    <ProjectsSection />
    <MarqueeDivider :texts="['CONNECTION //', '\\\\ CONNECTION']" />
    <ContactSection />
  </div>
</template>
