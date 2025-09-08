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

  // TODO: create session with your KYC provider and store a reference
  return new Response(JSON.stringify({ status: "started" }), { headers: cors, status: 200 });
});
