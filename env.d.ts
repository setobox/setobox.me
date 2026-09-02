/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** EmailJS 凭据；未配置时邮箱表单不渲染。 */
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_USER_ID?: string;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<{}, {}, any>;
  export default component;
}
