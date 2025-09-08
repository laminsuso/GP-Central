import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsOrigin = Deno.env.get("CORS_ORIGIN") || "*";
const cors = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: cors });

  // Multipart form parse (KYC providers typically expect a file upload)
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), { status: 400, headers: cors });
  }
  const form = await req.formData();
  const file = form.get("document");
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "document file is required" }), { status: 400, headers: cors });
  }

  // TODO: upload to your KYC provider / Supabase Storage as needed
  // For now, just acknowledge:
  return new Response(JSON.stringify({ status: "uploaded", filename: file.name }), { headers: cors, status: 200 });
});
