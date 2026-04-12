import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const AUDIENCE_NAME = "Autonomous Capitalism Subscribers";

async function getAudienceId(lovableKey: string, resendKey: string): Promise<string | null> {
  const res = await fetch(`${GATEWAY_URL}/audiences`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const audience = (data?.data || []).find((a: any) => a.name === AUDIENCE_NAME);
  return audience?.id || null;
}

async function markUnsubscribedInResend(email: string) {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) return;

    const audienceId = await getAudienceId(LOVABLE_API_KEY, RESEND_API_KEY);
    if (!audienceId) return;

    // Create/update contact as unsubscribed
    await fetch(`${GATEWAY_URL}/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({ email, unsubscribed: true }),
    });

    console.log(`Marked ${email} as unsubscribed in Resend`);
  } catch (e) {
    console.error("Error syncing unsubscribe to Resend:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase
      .from("subscribers")
      .update({ is_active: false })
      .eq("email", email);

    if (error) {
      console.error("Unsubscribe error:", error);
      throw new Error("Failed to unsubscribe");
    }

    // Sync unsubscribe to Resend (fire and forget)
    markUnsubscribedInResend(email).catch(() => {});

    // Redirect to confirmation page on the site
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: "https://auto-capital-chronicle.lovable.app/unsubscribed",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
