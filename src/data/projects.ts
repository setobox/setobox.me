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
    date: "2026.08.24",
    cover: "",
    tags: ["Vue", "GSAP", "Motion", "UnoCSS"],
  },
  {
    title: "Mushin.js",
    href: "",
    desc: [
      "A TypeScript app for building QQ bot with a workflow engine.",
      "Supports the integration of agents and RAG.",
    ],
    date: "2020",
    cover: "",
    tags: ["TypeScript", "Node", "Bot", "Agent", "WorkFlow"],
  },
];
