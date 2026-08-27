<script setup lang="ts">
import AboutSection from "@/components/sections/AboutSection.vue";
import ContactSection from "@/components/sections/ContactSection.vue";
import HeroSection from "@/components/sections/HeroSection.vue";
import MarqueeDivider from "@/components/sections/MarqueeDivider.vue";
import ProjectsSection from "@/components/sections/ProjectsSection.vue";
import StackSection from "@/components/sections/StackSection.vue";
import Particles from "@/components/bits/Particles.vue";

defineProps<{ booted: boolean }>();
</script>

<template>
  <div>
    <!-- A routed component inside <Transition> must expose one element root. -->
    <div fixed top-0 left-0 right-0 bottom-0 z-[-1] pointer-events-none>
      <Particles
        class="w-full h-full"
        :particle-count="200"
        :particle-spread="13"
        :speed="0.2"
        :particle-colors="['#C1A5FF', '#fff']"
        :move-particles-on-hover="false"
        :particle-hover-factor="0.5"
        :alpha-particles="true"
        :particle-base-size="100"
        :size-randomness="1"
        :camera-distance="20"
        :disable-rotation="true"
      />
    </div>

    <HeroSection :ready="booted" />
    <MarqueeDivider :texts="['CREATING // DESIGNING', 'EXPLORING \\\\ DISCOVERING']" />
    <AboutSection :intro="false" />
    <StackSection />
    <MarqueeDivider :texts="['PROJECTS //', '\\\\ PROJECTS']" />
    <ProjectsSection />
    <MarqueeDivider :texts="['CONNECTION //', '\\\\ CONNECTION']" />
    <ContactSection />
  </div>
</template>
