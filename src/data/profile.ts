/**
 * Site content.
 *
 * here and nothing else needs to change. Every consumer reads from this file.
 */

export interface InfoRow {
  label: string;
  value: string;
  icon: string;
}

export interface Social {
  name: string;
  href: string;
  icon: string;
  /** Shown in the contact list; omit to hide from it. */
  featured?: boolean;
}

export const site = {
  name: "Setobox Home",
  short: "SETOBOX",
  tagline: "while(!dead) { time--; exp++; }",
} as const;

export const profile = {
  handle: "setobox",
  aka: ["姬顶盒"],
  avatar: "/img/avatar.jpg",
  email: "hi@setobox.me",

  /** Two-line hero headline; each entry is one line. */
  headline:
    // ["TIME DECREASES,", "EXPERIENCE INCREASES"],
    ["TURNING CODE,", "INTO EXPERIENCES"],

  /** Cycled by the typewriter under the hero. */
  typed: ["while(!dead) { time--; exp++; }"],

  intro: [
    "Frontend developer, Yak Shaver.",
    "ACG(Anime、Code、Game) 爱好者。",
    "喜欢新鲜事物、尝试新技术，什么都想学一点。",
    "喜欢创造(/gamemode 1)、音乐、运动（标准引体18+）。",
  ],
} as const;

export const infoRows: InfoRow[] = [
  { label: "NAME", value: "Setobox", icon: "i-lucide-user" },
  { label: "BIRTH", value: "2000-06-12", icon: "i-lucide-cake" },
  { label: "LOCATION", value: "Shanghai, CN", icon: "i-lucide-map-pin" },
  { label: "FIELD", value: "Frontend / Yak Shaver", icon: "i-lucide-terminal" },
  { label: "INTEREST", value: "Tech / Art", icon: "i-lucide-sparkles" },
];

/** The honeycomb of roles. Order drives the staggered reveal. */
export const roles = [
  { name: "Developer", icon: "i-lucide-code" },
  { name: "Otaku", icon: "i-lucide-tv" },
  { name: "Gamer", icon: "i-lucide-gamepad-2" },
  { name: "UX Designer", icon: "i-lucide-palette" },
  { name: "Producer", icon: "i-lucide-wand-sparkles" },
] as const;

export interface Tech {
  name: string;
  /** Highlighted tiles get the violet treatment. */
  key?: boolean;
}

export const stack: Tech[] = [
  { name: "HTML", key: true },
  { name: "CSS", key: true },
  { name: "TypeScript", key: true },
  { name: "Vue", key: true },
  { name: "Nuxt", key: true },
  { name: "React" },
  { name: "Next.js" },
  { name: "Vite", key: true },
  { name: "Tailwind", key: true },
  { name: "UnoCSS", key: true },
  { name: "Electron" },
  { name: "GSAP", key: true },
  { name: "Blender", key: true },
  { name: "Python" },
  { name: "Three.js" },
  { name: "Node" },
  { name: "Git" },
  { name: "Docker" },
  { name: "Linux" },
  { name: "Figma" },
];

export const socials: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/setobox",
    icon: "i-simple-icons-github",
    featured: true,
  },
  {
    name: "Bilibili",
    href: "https://space.bilibili.com/8638330",
    icon: "i-simple-icons-bilibili",
    featured: true,
  },
  {
    name: "QQ",
    href: "https://qm.qq.com/q/n17nxf0SXg",
    icon: "i-simple-icons-qq",
    featured: true,
  },
  {
    name: "Blog",
    href: "https://blog.setobox.me",
    icon: "i-lucide-rss",
    featured: true,
  },
];

export const navItems = [
  { text: "Home", href: "/" },
  { text: "About", href: "/about" },
  { text: "Use", href: "https://blog.setobox.me/use" },
  { text: "Posts", href: "https://blog.setobox.me" },
] as const;
