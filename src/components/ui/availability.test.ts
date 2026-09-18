// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createApp, createSSRApp, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import emailjs from "@emailjs/browser";
import AboutPage from "@/pages/AboutPage.vue";
import EmailForm from "./EmailForm.vue";
import ProfileCard from "./ProfileCard.vue";
import ProjectCard from "./ProjectCard.vue";
import { giscus, profile } from "@/data/profile";
import type { Project } from "@/data/projects";

vi.hoisted(() => {
  Object.defineProperty(window, "matchMedia", {
    value: (media: string) => ({
      matches: false,
      media,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

vi.mock("@emailjs/browser", () => ({ default: { send: vi.fn() } }));
vi.mock("@giscus/vue", () => ({ default: { template: '<div data-testid="comments" />' } }));

const initialGiscus = { ...giscus };
const unmounts: Array<() => void> = [];

afterEach(() => {
  unmounts.splice(0).forEach((unmount) => unmount());
  document.body.replaceChildren();
  Object.assign(giscus, initialGiscus);
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

function configureEmail() {
  vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "test-service");
  vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "test-template");
  vi.stubEnv("VITE_EMAILJS_USER_ID", "test-key");
}

function mountForm() {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(EmailForm);
  app.mount(host);
  unmounts.push(() => app.unmount());
  return host;
}

function fillForm(host: HTMLElement) {
  const values = { user_name: "测试用户", user_email: "test@example.com", message: "项目咨询" };
  for (const [name, value] of Object.entries(values)) {
    const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function submit(host: HTMLElement) {
  host
    .querySelector("form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("feature availability", () => {
  it("keeps a usable email link and hides unconfigured form and message headings on About", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "");
    Object.assign(giscus, { repo: "", repoId: "", category: "", categoryId: "" });
    const html = await renderToString(createSSRApp(AboutPage));
    expect(html).toContain(`href="mailto:${profile.email}"`);
    expect(html).not.toContain("<form");
    expect(html).not.toContain("MESSAGES");
    expect(html).not.toContain('id="comments"');
  });

  it("shows the message heading and widget together when configured", async () => {
    Object.assign(giscus, {
      repo: "test/site",
      repoId: "repo-id",
      category: "Comments",
      categoryId: "category-id",
    });
    const html = await renderToString(createSSRApp(AboutPage));
    expect(html).toContain("MESSAGES");
    expect(html).toContain('data-testid="comments"');
  });

  it("does not invent a default identity, online status, image URL, or contact action", async () => {
    const html = await renderToString(createSSRApp(ProfileCard));
    expect(html).not.toContain("Online");
    expect(html).not.toContain("Javi");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<button");
  });

  it.each(["", "https://example.com/project"])(
    "only renders a project link with a destination: %s",
    async (href) => {
      const project: Project = {
        title: "Example",
        href,
        desc: ["Project description"],
        date: "2026.09",
        tags: [],
      };
      const host = document.createElement("div");
      host.innerHTML = await renderToString(createSSRApp(ProjectCard, { project }));
      expect(host.querySelector("h3")?.textContent).toContain("Example");
      const link = host.querySelector("h3 a");
      if (href) expect(link?.getAttribute("href")).toBe(href);
      else expect(link).toBeNull();
    },
  );
});

describe("email feedback", () => {
  it("provides retry and direct email options after failure while preserving the message", async () => {
    configureEmail();
    vi.mocked(emailjs.send).mockRejectedValueOnce({ status: 503, text: "Provider details" });
    const host = mountForm();
    fillForm(host);
    submit(host);
    await vi.waitFor(() => expect(host.querySelector('[role="alert"]')).not.toBeNull());
    const alert = host.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain("邮件发送失败");
    expect(alert.textContent).toContain("重试");
    expect(alert.querySelector("a")?.getAttribute("href")).toBe(`mailto:${profile.email}`);
    expect(alert.textContent).not.toContain("Provider details");
    expect(host.querySelector("textarea")?.value).toBe("项目咨询");
    expect(host.querySelector("button")?.disabled).toBe(false);
  });

  it("blocks duplicate submissions, then reports success and clears the sent message", async () => {
    configureEmail();
    let finish!: () => void;
    vi.mocked(emailjs.send).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ status: 200, text: "OK" });
        }),
    );
    const host = mountForm();
    fillForm(host);
    submit(host);
    submit(host);
    await nextTick();
    expect(emailjs.send).toHaveBeenCalledTimes(1);
    expect(host.querySelector("button")?.disabled).toBe(true);
    expect(host.querySelector("button")?.textContent).toContain("发送中");
    finish();
    await vi.waitFor(() =>
      expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe("邮件已发送。"),
    );
    expect(host.querySelector("textarea")?.value).toBe("");
    expect(host.querySelector("button")?.disabled).toBe(false);
    expect(host.querySelector("button")?.textContent).toContain("发送邮件");
  });
});
