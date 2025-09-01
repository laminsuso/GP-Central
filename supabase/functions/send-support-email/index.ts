// supabase/functions/send-support-email/index.ts
//import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Allow only your site in production; you can start with '*' during dev
const corsOrigin = Deno.env.get("CORS_ORIGIN") || "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPPORT_TO_EMAIL = Deno.env.get("SUPPORT_TO_EMAIL")!;
const SUPPORT_FROM_EMAIL = Deno.env.get("SUPPORT_FROM_EMAIL")!;

type Payload = {
  name?: string;
  email: string;
  subject?: string;
  message: string;
  user_id?: string | null;
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function sendWithResend(data: Payload) {
  const html = `
    <h2>New Support Message</h2>
    <p><strong>From:</strong> ${data.name || "(no name)"} &lt;${data.email}&gt;</p>
    ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ""}
    <pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre-wrap;">${escapeHtml(data.message)}</pre>
    ${data.user_id ? `<p><strong>User ID:</strong> ${data.user_id}</p>` : ""}
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SUPPORT_FROM_EMAIL,
      to: [SUPPORT_TO_EMAIL],
      subject: data.subject || "New support message",
      html,
      reply_to: data.email,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend failed: ${res.status} ${txt}`);
  }
  return await res.json();
}

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { email, message, name, subject, user_id } = (await req.json()) as Payload;

    if (!email || !message) {
      return new Response(JSON.stringify({ error: "email and message are required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const sent = await sendWithResend({ email, message, name, subject, user_id });

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
