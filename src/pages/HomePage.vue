<script setup lang="ts">
import AboutSection from "@/components/sections/AboutSection.vue";
import ContactSection from "@/components/sections/ContactSection.vue";
import HeroSection from "@/components/sections/HeroSection.vue";
import MarqueeDivider from "@/components/sections/MarqueeDivider.vue";
import ProjectsSection from "@/components/sections/ProjectsSection.vue";
import StackSection from "@/components/sections/StackSection.vue";

defineProps<{ booted: boolean }>();
</script>

<template>
  <div>
    <!-- A routed component inside <Transition> must expose one element root. -->
    <HeroSection :ready="booted" />
    <MarqueeDivider :texts="['PROFILE //', 'TECH STACK //']" />
    <AboutSection :intro="false" />
    <StackSection />
    <MarqueeDivider :texts="['PROJECTS //', '\\\\ PROJECTS']" />
    <ProjectsSection />
    <MarqueeDivider :texts="['CONTACT //', '\\\\ CONTACT']" />
    <ContactSection />
  </div>
</template>
