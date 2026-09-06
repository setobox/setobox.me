import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";
import { profile, site, socials } from "@/data/profile";
import type { RouteMeta } from "@/router";

const identityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}#person`,
      name: "Setobox",
      alternateName: "姬顶盒",
      url: site.url,
      image: new URL(profile.avatar, site.url).href,
      jobTitle: "Frontend Developer",
      sameAs: socials
        .filter(({ name }) => ["GitHub", "Bilibili", "Blog"].includes(name))
        .map(({ href }) => href),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}#website`,
      name: site.name,
      alternateName: ["Setobox", "姬顶盒の箱庭世界"],
      url: site.url,
      inLanguage: "zh-CN",
      publisher: { "@id": `${site.url}#person` },
    },
  ],
};

export function useSEO() {
  const route = useRoute();
  useHead(() => {
    const meta = route.meta as Partial<RouteMeta>;
    const title = meta.title || site.name;
    const description = meta.description || `${site.identity}的个人主页。`;
    const canonical = meta.canonicalPath ? new URL(meta.canonicalPath, site.url).href : undefined;
    const image = meta.ogImage || new URL(profile.avatar, site.url).href;
    return {
      htmlAttrs: { lang: "zh-CN" },
      title,
      meta: [
        { name: "description", content: description },
        { name: "keywords", content: meta.keywords },
        { name: "robots", content: meta.noindex ? "noindex, follow" : "index, follow" },
        { property: "og:site_name", content: site.name },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(canonical ? [{ property: "og:url", content: canonical }] : []),
        { property: "og:image", content: image },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      link: canonical ? [{ rel: "canonical", href: canonical }] : [],
      script: meta.noindex
        ? []
        : [
            {
              key: "site-identity",
              type: "application/ld+json",
              innerHTML: JSON.stringify(identityGraph).replace(/</g, "\\u003c"),
            },
          ],
    };
  });
}
