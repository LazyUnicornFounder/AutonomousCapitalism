import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Return a simple HTML page confirming unsubscribe
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed</title></head>
<body style="margin:0;padding:40px 20px;background:#000;color:#fff;font-family:Inter,Arial,sans-serif;text-align:center;">
  <h1 style="font-family:Montserrat,Arial,sans-serif;font-size:28px;font-weight:900;">
    <span style="color:#0099ff;">Autonomous</span> Capitalism
  </h1>
  <p style="color:#888;margin-top:40px;font-size:18px;">You've been unsubscribed.</p>
  <p style="color:#666;font-size:14px;">We're sorry to see you go. You can always resubscribe at
    <a href="https://auto-capital-chronicle.lovable.app" style="color:#0099ff;">our site</a>.
  </p>
</body></html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
