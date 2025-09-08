import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: cors });

  // require user JWT (set verify_jwt=true in config.toml below)
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization" }), { status: 401, headers: cors });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });

  // read my profile
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("identity_verified")
    .single();

  // read session tracker (optional)
  const { data: sess } = await supabase
    .from("identity_sessions")
    .select("status,provider_ref,updated_at")
    .single();

  if (pErr) {
    return new Response(JSON.stringify({ error: pErr.message }), { status: 400, headers: cors });
  }

  return new Response(JSON.stringify({
    identity_verified: !!profile?.identity_verified,
    status: sess?.status ?? (profile?.identity_verified ? "verified" : "pending_review"),
    provider_ref: sess?.provider_ref ?? null,
    updated_at: sess?.updated_at ?? null,
  }), { headers: cors, status: 200 });
});
