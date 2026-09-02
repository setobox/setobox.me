import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";

interface RouteMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

/**
 * Dynamic SEO meta tag management.
 *
 * Watches route changes and updates document title, meta descriptions,
 * Open Graph tags, Twitter Cards, and canonical URLs based on route meta.
 */
export function useSEO() {
  const route = useRoute();
  const baseUrl = "https://setobox.me";

  // Register the head entry while setup's injection context is active. Unhead
  // tracks the route values read by this getter and updates the entry whenever
  // navigation changes.
  useHead(() => {
    const meta = route.meta as RouteMeta;
    const url = `${baseUrl}${route.path}`;
    const title = meta.title || "Setobox Home";
    const description =
      meta.description || "Setobox Home — 姬顶盒的个人主页。Frontend developer, Yak Shaver.";
    const keywords = meta.keywords || "setobox, frontend developer, vue, typescript, gsap";
    const ogImage = meta.ogImage || `${baseUrl}/img/og-image.jpg`;

    return {
      title,
      meta: [
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      link: [{ rel: "canonical", href: url }],
    };
  });
}
