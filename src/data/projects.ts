export interface Project {
  title: string;
  href: string;
  desc: string[];
  /** Display date; also used verbatim, so keep the format consistent. */
  date: string;
  /**
   * Optional cover. Rendered with a procedural hexagon pattern fallback, so a
   * missing or hotlink-blocked image degrades to something intentional rather
   * than a broken-image icon.
   */
  cover?: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    title: "Setobox Home",
    href: "https://setobox.me",
    desc: [
      "This is the page — a simple introduction to me.",
      "Animations powered by GSAP and Vue-Bits.",
    ],
    date: "2026.08",
    cover: "",
    tags: ["Vue", "GSAP", "Motion", "UnoCSS"],
  },
  {
    title: "Daijob CLI",
    href: "https://github.com/setobox/daijob",
    desc: [
      "A CLI tool for Daijob, an AI-powered agent for job hunting.",
      "Your career, your experience, your AI. Job hunting? 大丈夫.",
    ],
    date: "2026.08",
    cover: "",
    tags: ["React", "CLI", "Ink", "VitePlus", "Agent"],
  },
  {
    title: "Milanote API",
    href: "https://github.com/setobox/milanote-api",
    desc: [
      "Un official API for Milanote, a note-taking and organization tool.",
      "You can use it to display your Milanote boards on your own website.",
    ],
    date: "2026.06",
    cover: "",
    tags: ["React", "Tailwind", "VitePlus", "Vitest"],
  },
  {
    title: "Duolingo Streaks",
    href: "https://github.com/setobox/duolingo",
    desc: [
      "Un official API for Duolingo, a popular language learning app.",
      "You can search your streaks keeping data.",
    ],
    date: "2026.04",
    cover: "",
    tags: ["API", "Cloudflare Workers"],
  },
  {
    title: "Setobox Blog",
    href: "https://blog.setobox.me",
    desc: [
      "A blog for me, with AI-powered features",
      "Built with Nuxt 4 and UnoCSS and the posts powered by Nuxt Content.",
    ],
    date: "2026.04",
    cover: "",
    tags: ["Nuxt 4", "Vue", "Agent", "UnoCSS"],
  },
  {
    title: "Calabiyau Emotes",
    href: "https://github.com/setobox/calabiyau-emotes",
    desc: [
      // @oxlint-disable-next-line max-line-length
      "A simple web app for copying emotes in game's chat.",
      "For the game Calabiyau.",
    ],
    date: "2025.04",
    cover: "",
    tags: ["Vue", "UnoCSS", "SPA"],
  },
  {
    title: "Mushin.js",
    href: "",
    desc: [
      "A TypeScript app for building QQ bot with a workflow engine.",
      "Now supports the integration of agents and RAG.",
    ],
    date: "2020",
    cover: "",
    tags: ["TypeScript", "Node", "Bot", "Agent", "WorkFlow"],
  },
];
