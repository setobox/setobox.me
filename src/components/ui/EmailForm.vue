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

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const publicKey = import.meta.env.VITE_EMAILJS_USER_ID ?? "";

const configured = computed(() => Boolean(serviceId && templateId && publicKey));

const form = reactive({ name: "", email: "", subject: "", message: "" });
const status = ref<"idle" | "sending" | "success" | "error">("idle");
const errorText = ref("");

async function send() {
  if (status.value === "sending") return;
  status.value = "sending";
  errorText.value = "";

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
  } catch (error) {
    status.value = "error";
    errorText.value = error instanceof Error ? error.message : String(error);
  }
}
</script>

<template>
  <form
    v-if="configured"
    class="relative cut-16 border border-silver-800 bg-void-800/50 p-6 backdrop-blur-sm sm:p-8"
    @submit.prevent="send"
  >
    <p class="label-mono mb-2 flex items-center gap-1.5">
      <span class="i-lucide-message-dots text-xs" aria-hidden="true" />
      get in touch
    </p>
    <p class="body-text mb-6 text-sm">Say hello, ask questions, or share your thoughts!</p>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 sm:flex-row">
        <input
          v-model="form.name"
          name="user_name"
          required
          placeholder="你的称呼 | Name*"
          class="input-field flex-1"
        />
        <input
          v-model="form.email"
          name="user_email"
          type="email"
          required
          placeholder="你的邮箱 | Email*"
          class="input-field flex-1"
        />
      </div>
      <input
        v-model="form.subject"
        name="subject"
        placeholder="邮件主题 | Subject"
        class="input-field"
      />
      <textarea
        v-model="form.message"
        name="message"
        required
        rows="6"
        placeholder="邮件内容 - Content*"
        class="input-field resize-none"
      />

      <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          v-if="status === 'error'"
          class="font-mono text-xs leading-relaxed text-magenta-300"
          role="alert"
        >
          Submit failed: {{ errorText }}
        </p>
        <p v-else-if="status === 'success'" class="font-mono text-xs text-cyan-300" role="status">
          Message sent — thanks!
        </p>
        <span v-else class="font-mono text-xs text-silver-500">Sending via EmailJS.</span>

        <button type="submit" class="btn-hex shrink-0" :disabled="status === 'sending'">
          <span
            :class="
              status === 'sending' ? 'i-lucide-loader-circle animate-hex-spin' : 'i-lucide-send'
            "
            class="text-sm"
            aria-hidden="true"
          />
          {{ status === "sending" ? "SENDING" : status === "success" ? "SENT" : "SUBMIT" }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.input-field {
  width: 100%;
  border: 1px solid var(--sb-panel);
  background: rgb(3 2 10 / 60%);
  padding: 0.75rem 1rem;
  font-family: "JetBrains Mono", ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: 0.875rem;
  color: var(--sb-silver);
  caret-color: var(--sb-violet);
  outline: none;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.input-field::placeholder {
  color: #665e90;
}

.input-field:focus {
  border-color: rgb(139 92 246 / 70%);
  box-shadow: 0 0 0 1px rgb(139 92 246 / 35%);
}
</style>
