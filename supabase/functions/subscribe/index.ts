import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const AUDIENCE_NAME = "Autonomous Capitalism Subscribers";

async function getOrCreateAudienceId(lovableKey: string, resendKey: string): Promise<string> {
  // List existing audiences
  const listRes = await fetch(`${GATEWAY_URL}/audiences`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
  });

  if (listRes.ok) {
    const listData = await listRes.json();
    const audiences = listData?.data || [];
    const existing = audiences.find((a: any) => a.name === AUDIENCE_NAME);
    if (existing) return existing.id;
  }

  // Create new audience
  const createRes = await fetch(`${GATEWAY_URL}/audiences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({ name: AUDIENCE_NAME }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Resend audience: ${err}`);
  }

  const created = await createRes.json();
  return created.id;
}

async function syncContactToResend(
  email: string,
  lovableKey: string,
  resendKey: string,
  unsubscribed: boolean = false
) {
  try {
    const audienceId = await getOrCreateAudienceId(lovableKey, resendKey);

    const res = await fetch(`${GATEWAY_URL}/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        email,
        unsubscribed,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Failed to sync contact to Resend: ${err}`);
    } else {
      console.log(`Synced ${email} to Resend audience (unsubscribed=${unsubscribed})`);
    }
  } catch (e) {
    console.error("Error syncing to Resend:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const trimmedEmail = email.trim().toLowerCase();

    // Check if subscriber exists
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, is_active")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return new Response(JSON.stringify({ status: "already_subscribed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Reactivate
      const { error } = await supabase
        .from("subscribers")
        .update({ is_active: true })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      // New subscriber
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: trimmedEmail });
      if (error) throw error;
    }

    // Sync to Resend Audience (fire and forget)
    if (LOVABLE_API_KEY && RESEND_API_KEY) {
      syncContactToResend(trimmedEmail, LOVABLE_API_KEY, RESEND_API_KEY).catch(() => {});
    }

    // Send welcome dispatch (fire and forget)
    supabase.functions.invoke("send-dispatch", {
      body: { singleEmail: trimmedEmail },
    }).catch(() => {});

    return new Response(JSON.stringify({ status: "subscribed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
