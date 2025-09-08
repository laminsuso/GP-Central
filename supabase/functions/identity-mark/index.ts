import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const SECRET = Deno.env.get("IDENTITY_WEBHOOK_SECRET")!; // set via supabase secrets

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: cors });

  // verify webhook secret
  const header = req.headers.get("x-webhook-secret") || "";
  if (!SECRET || header !== SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }

  const { user_id, verified, provider_ref, status } = await req.json();

  if (!user_id || typeof verified !== "boolean") {
    return new Response(JSON.stringify({ error: "user_id and verified are required" }), { status: 400, headers: cors });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role to bypass RLS
  );

  // 1) set verified flag on profile
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ identity_verified: verified })
    .eq("user_id", user_id);

  if (pErr) return new Response(JSON.stringify({ error: pErr.message }), { status: 400, headers: cors });

  // 2) update session tracker (optional)
  if (status || provider_ref) {
    await supabase
      .from("identity_sessions")
      .upsert({
        user_id,
        status: status ?? (verified ? "verified" : "rejected"),
        provider_ref: provider_ref ?? null,
        updated_at: new Date().toISOString(),
      });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: cors, status: 200 });
});
