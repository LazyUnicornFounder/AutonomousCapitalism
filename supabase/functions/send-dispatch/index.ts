import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get the blog post to send (either from body or latest)
    const body = await req.json().catch(() => ({}));
    let postId = body.postId;
    const singleEmail = body.singleEmail; // optional: send only to this email

    let post: any;
    if (postId) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) throw new Error(`Post not found: ${error.message}`);
      post = data;
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(1)
        .single();
      if (error) throw new Error(`No posts found: ${error.message}`);
      post = data;
    }

    // Get recipients: single email or all active subscribers
    let subscribers: { email: string }[];
    if (singleEmail) {
      subscribers = [{ email: singleEmail }];
    } else {
      const { data, error: subError } = await supabase
        .from("subscribers")
        .select("email")
        .eq("is_active", true);

      if (subError) throw new Error(`Failed to fetch subscribers: ${subError.message}`);
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ message: "No active subscribers" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      subscribers = data;
    }

    // Build the email HTML
    const siteUrl = "https://auto-capital-chronicle.lovable.app";
    const postUrl = `${siteUrl}/blog/${post.id}`;
    // Strip business ideas section from email content
    const rawContent = post.content as string;
    const contentHtml = rawContent
      .split(/\n\n+/)
      .map((p: string) => {
        // Bold
        let html = p.replace(/\*\*(.*?)\*\*/g, "$1");
        // Italic
        html = html.replace(/_(.*?)_/g, "<em>$1</em>");
        // @handles as links
        html = html.replace(/@(\w+)/g, '<a href="https://x.com/$1" style="color:#0099ff;text-decoration:none;">@$1</a>');
        return `<p style="margin:0 0 16px;line-height:1.6;color:#e0e0e0;font-size:16px;">${html}</p>`;
      })
      .join("");

    const buildEmailHtml = (subscriberEmail: string) => {
      const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;
      return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="text-align:center;padding-bottom:30px;">
          <h1 style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:28px;font-weight:900;color:#fff;">
            <span style="color:#0099ff;">Autonomous</span> Capitalism
          </h1>
          <p style="margin:8px 0 0;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">DAILY AUTONOMOUS BRIEFINGS</p>
        </td></tr>
        <tr><td style="border-top:2px solid #0099ff;padding-top:30px;">
          <h2 style="margin:0 0 20px;font-family:Montserrat,Arial,sans-serif;font-size:24px;font-weight:900;color:#fff;line-height:1.2;">
            ${post.title}
          </h2>
          <p style="margin:0 0 24px;font-size:12px;color:#888;letter-spacing:1px;">
            ${post.tweet_count} X POSTS ANALYZED
          </p>
          ${contentHtml}
        </td></tr>
        <tr><td style="padding-top:30px;text-align:center;">
          <a href="${postUrl}" style="display:inline-block;background:#0099ff;color:#000;font-weight:bold;font-size:14px;padding:12px 28px;text-decoration:none;letter-spacing:1px;">
            READ ON SITE
          </a>
        </td></tr>
        <tr><td style="padding-top:40px;border-top:1px solid #222;margin-top:40px;text-align:center;">
          <p style="margin:20px 0 0;font-size:12px;color:#666;">
            Autonomous Capitalism is part of <a href="https://lazyfounderventures.com" style="color:#0099ff;text-decoration:none;">Lazy Founder Ventures</a>
          </p>
          <p style="margin:12px 0 0;font-size:11px;color:#555;">
            <a href="${unsubscribeUrl}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    };

    // Send emails sequentially with delay to avoid rate limits, with retry
    let sent = 0;
    let failed = 0;
    const maxRetries = 3;

    for (const sub of subscribers) {
      let success = false;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch(`${GATEWAY_URL}/emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": RESEND_API_KEY,
            },
            body: JSON.stringify({
              from: "Autonomous Capitalism <dispatch@autonomouscapitalism.com>",
              to: [sub.email],
              subject: `🤖 ${post.title}`,
              html: buildEmailHtml(sub.email),
            }),
          });

          if (res.ok) {
            sent++;
            success = true;
            break;
          } else if (res.status === 429 && attempt < maxRetries) {
            const retryAfter = parseInt(res.headers.get("retry-after") || "2", 10);
            console.warn(`Rate limited sending to ${sub.email}, retrying in ${retryAfter}s (attempt ${attempt}/${maxRetries})`);
            await res.text(); // consume body
            await new Promise((r) => setTimeout(r, retryAfter * 1000));
          } else {
            const err = await res.text();
            console.error(`Failed to send to ${sub.email} (attempt ${attempt}):`, err);
            if (attempt === maxRetries) break;
            await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (e) {
          console.error(`Error sending to ${sub.email} (attempt ${attempt}):`, e);
          if (attempt === maxRetries) break;
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      if (!success) failed++;

      // 600ms delay between sends to stay under 2 req/s limit
      await new Promise((r) => setTimeout(r, 600));
    }

    console.log(`Dispatch sent: ${sent} succeeded, ${failed} failed out of ${subscribers.length}`);

    return new Response(
      JSON.stringify({
        message: "Dispatch sent",
        sent,
        failed,
        total: subscribers.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
