<script setup lang="ts">
/**
 * EmailForm - EmailJS-powered contact form.
 *
 * Reads EmailJS credentials from `VITE_EMAILJS_*` env vars; the whole block
 * renders nothing when any of them is missing, so the page never shows a form
 * that would only error on submit.
 */
import { computed, reactive, ref } from "vue";
import emailjs from "@emailjs/browser";
import { profile } from "@/data/profile";

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const publicKey = import.meta.env.VITE_EMAILJS_USER_ID ?? "";

const configured = computed(() => Boolean(serviceId && templateId && publicKey));

const form = reactive({ name: "", email: "", subject: "", message: "" });
const status = ref<"idle" | "sending" | "success" | "error">("idle");

async function send() {
  if (!configured.value || status.value === "sending") return;
  status.value = "sending";

  const params = {
    name: `${form.name} (${form.email})`,
    email: form.email,
    title: form.subject || "No Subject",
    time: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
    message: form.message,
  };

  try {
    await emailjs.send(serviceId, templateId, params, { publicKey });
    status.value = "success";
    Object.assign(form, { name: "", email: "", subject: "", message: "" });
  } catch {
    status.value = "error";
  }
}
</script>

<template>
  <form
    v-if="configured"
    class="relative cut-16 border border-silver-800 bg-void-800/50 p-6 backdrop-blur-sm sm:p-8"
    :aria-busy="status === 'sending'"
    @submit.prevent="send"
  >
    <p class="label-mono mb-6 flex items-center gap-1.5">
      <span class="i-lucide-mail text-xs" aria-hidden="true" />
      发送邮件
    </p>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 sm:flex-row">
        <label class="flex min-w-0 flex-1 flex-col gap-2 text-sm text-silver-200">
          称呼（必填）
          <input
            v-model="form.name"
            name="user_name"
            autocomplete="name"
            required
            class="input-field"
          />
        </label>
        <label class="flex min-w-0 flex-1 flex-col gap-2 text-sm text-silver-200">
          邮箱（必填）
          <input
            v-model="form.email"
            name="user_email"
            type="email"
            autocomplete="email"
            required
            class="input-field"
          />
        </label>
      </div>
      <label class="flex flex-col gap-2 text-sm text-silver-200">
        邮件主题
        <input v-model="form.subject" name="subject" class="input-field" />
      </label>
      <label class="flex flex-col gap-2 text-sm text-silver-200">
        邮件内容（必填）
        <textarea
          v-model="form.message"
          name="message"
          required
          rows="6"
          class="input-field resize-y"
        />
      </label>

      <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p v-if="status === 'error'" class="text-sm leading-relaxed text-magenta-300" role="alert">
          邮件发送失败。请重试，或通过
          <a :href="`mailto:${profile.email}`" class="break-all underline underline-offset-4">{{
            profile.email
          }}</a>
          联系。
        </p>
        <p v-else-if="status === 'success'" class="text-sm text-cyan-300" role="status">
          邮件已发送。
        </p>
        <button
          type="submit"
          class="btn-hex shrink-0 sm:ml-auto disabled:cursor-wait disabled:opacity-60"
          :disabled="status === 'sending'"
        >
          <span
            :class="status === 'sending' ? 'i-lucide-loader-circle animate-spin' : 'i-lucide-send'"
            class="text-sm"
            aria-hidden="true"
          />
          {{ status === "sending" ? "发送中…" : "发送邮件" }}
        </button>
      </div>
    </div>
  </form>
</template>
