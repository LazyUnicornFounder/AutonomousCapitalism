import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const stripIdeas = (content: string) => content.split(/---\s*\n\s*## Business Ideas/i)[0].trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const substackEmail = Deno.env.get("SUBSTACK_IMPORT_EMAIL");
    if (!substackEmail) throw new Error("SUBSTACK_IMPORT_EMAIL not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, title, content, published_date")
      .order("published_date", { ascending: true });

    if (error) throw new Error(`Failed to fetch posts: ${error.message}`);
    if (!posts?.length) {
      return new Response(JSON.stringify({ message: "No posts found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;

    for (const post of posts) {
      try {
        const text = stripIdeas(post.content).replace(/\r\n/g, "\n").trim();
        const res = await fetch(`${GATEWAY_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "Autonomous Capitalism <dispatch@autonomouscapitalism.com>",
            to: [substackEmail],
            subject: post.title,
            text,
          }),
        });

        if (!res.ok) {
          throw new Error(`Send failed [${res.status}]: ${await res.text()}`);
        }

        sent++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send ${post.published_date}:`, error);
        failed++;
      }
    }

    return new Response(JSON.stringify({ message: "Batch complete", sent, failed, total: posts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});