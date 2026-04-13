import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function fetchAllTweets(bearerToken: string, query: string, maxTotal = 200) {
  const allTweets: any[] = [];
  const users: Record<string, any> = {};
  let nextToken: string | undefined;

  while (allTweets.length < maxTotal) {
    const twitterUrl = new URL("https://api.x.com/2/tweets/search/recent");
    twitterUrl.searchParams.set("query", `${query} -is:retweet lang:en`);
    twitterUrl.searchParams.set("max_results", "100");
    twitterUrl.searchParams.set("tweet.fields", "created_at,public_metrics,author_id");
    twitterUrl.searchParams.set("expansions", "author_id");
    twitterUrl.searchParams.set("user.fields", "name,username");
    if (nextToken) twitterUrl.searchParams.set("next_token", nextToken);

    const res = await fetch(twitterUrl.toString(), {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Twitter API error:", JSON.stringify(data));
      throw new Error(`Twitter API error: ${data.detail || data.title}`);
    }

    if (data.includes?.users) {
      for (const u of data.includes.users) users[u.id] = u;
    }

    if (data.data) {
      for (const t of data.data) {
        const user = users[t.author_id] || {};
        allTweets.push({
          id: t.id,
          text: t.text,
          author: user.name || "Unknown",
          handle: `@${user.username || "unknown"}`,
          username: user.username || "unknown",
          likes: t.public_metrics?.like_count || 0,
          retweets: t.public_metrics?.retweet_count || 0,
        });
      }
    }

    nextToken = data.meta?.next_token;
    if (!nextToken || !data.data?.length) break;
  }

  return allTweets;
}

async function generateCoverImage(
  lovableKey: string,
  title: string,
  summary: string,
  supabase: any,
): Promise<string | null> {
  try {
    console.log("Generating cover image...");
    const imagePrompt = `Create a dramatic, editorial-style illustration for a news article titled "${title}". The image should be abstract, moody, and futuristic — think autonomous machines, AI systems, digital networks, or algorithmic capitalism. Use dark tones with striking accent colors. No text in the image. Cinematic composition, high contrast, magazine-quality editorial art.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: imagePrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      console.error("Image generation error:", aiRes.status);
      return null;
    }

    const aiData = await aiRes.json();
    const imageDataUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageDataUrl) {
      console.error("No image returned from AI");
      return null;
    }

    // Extract base64 data and upload to storage
    const base64Data = imageDataUrl.split(",")[1];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `blog-covers/${crypto.randomUUID()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(fileName, binaryData, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: publicUrl } = supabase.storage.from("public-assets").getPublicUrl(fileName);
    console.log("Cover image uploaded:", publicUrl.publicUrl);
    return publicUrl.publicUrl;
  } catch (e) {
    console.error("Image generation failed (non-fatal):", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const bearerToken = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!bearerToken) throw new Error("TWITTER_BEARER_TOKEN not configured");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check for force flag
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";
    const today = new Date().toISOString().split("T")[0];

    if (!force) {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("published_date", today)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ message: "Blog post already exists for today" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch tweets with pagination
    console.log("Fetching all tweets for blog generation...");
    const tweets = await fetchAllTweets(bearerToken, "autonomous", 500);

    if (tweets.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tweets found to summarize" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Collected ${tweets.length} tweets, generating blog...`);

    // Sort by engagement
    tweets.sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets));

    // Build tweet digest for AI
    const tweetDigest = tweets
      .map(
        (t: any, i: number) =>
          `${i + 1}. ${t.author} (${t.handle}): "${t.text}" [${t.likes} likes, ${t.retweets} RTs] URL: https://x.com/${t.username}/status/${t.id}`
      )
      .join("\n");

    // Use Lovable AI to generate the blog post
    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a sharp, witty journalist writing for "Autonomous Capitalism" — a publication tracking the rise of autonomous systems in business, finance, and society. Write in a narrative, story-driven style. Think New Yorker meets Wired. Use vivid language, connect themes across tweets, and weave them into a cohesive daily narrative. The tone is smart, slightly irreverent, and forward-looking.

Format:
- Start with a SHORT, punchy headline (STRICTLY max 10 words) in sentence case (capitalize only the first word and proper nouns, on its own line, no markdown heading syntax). Keep it concise — think newspaper headline, not essay title. Count the words and revise if over 10.
- Write 6-10 paragraphs of narrative prose
- Do NOT mention any Twitter/X handles or usernames — refer to people by name or role only
- Group themes: technology breakthroughs, market impacts, labor disruption, policy debates, cultural reactions
- End with a thought-provoking closing line
- Use markdown for bold and italic emphasis
- IMPORTANT: Do NOT start the article by talking about chatbots. Vary your opening — lead with the most compelling or surprising theme of the day, not a generic chatbot reference.

Do NOT list tweets. Do NOT use @handles. Tell a STORY. Make it feel like a daily column readers look forward to.`,
            },
            {
              role: "user",
              content: `Here are today's ${tweets.length} tweets about autonomous systems, sorted by engagement. Write today's daily blog post:\n\n${tweetDigest}`,
            },
          ],
        }),
      }
    );

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      throw new Error(`AI gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content generated by AI");

    // Extract title from first line
    const lines = content.trim().split("\n");
    let title = lines[0].replace(/^#+\s*/, "").replace(/^\*+/, "").replace(/\*+$/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    const summary = body.substring(0, 300).replace(/\n/g, " ").trim() + "…";

    // Generate business ideas (stored in content but only shown on Ideas page)
    console.log("Generating autonomous business ideas...");
    const ideasRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a venture strategist for "Autonomous Capitalism." Based on today's X posts about autonomous systems, generate 3-5 concrete, actionable business ideas that leverage the trends discussed.

Format each idea EXACTLY as:
### [Idea Name]
One paragraph (3-5 sentences) describing the opportunity, target market, why now, and how autonomous technology makes it viable.

**Relevant posts:** [list 2-3 X post URLs from the provided tweets that inspired this idea, formatted as markdown links like [Author Name](url)]

Be specific — include concrete product concepts, not vague "AI platform" ideas. Think like a founder who reads these trends and spots gaps. No preamble, jump straight into the ideas. ALWAYS include the "Relevant posts:" line with actual URLs from the tweet list.`,
            },
            {
              role: "user",
              content: `Here are today's ${tweets.length} tweets about autonomous systems with their URLs. Generate business ideas inspired by these trends:\n\n${tweetDigest.substring(0, 12000)}`,
            },
          ],
        }),
      }
    );

    let ideasSection = "";
    if (ideasRes.ok) {
      const ideasData = await ideasRes.json();
      const ideasContent = ideasData.choices?.[0]?.message?.content;
      if (ideasContent) {
        ideasSection = `\n\n---\n\n## Business Ideas From Today's Trends\n\n${ideasContent}`;
      }
    } else {
      console.error("Ideas generation failed (non-fatal):", ideasRes.status);
    }

    // Generate cover image
    const imageUrl = await generateCoverImage(lovableKey, title, summary, supabase);

    if (force) {
      // Delete existing post for today before inserting
      await supabase.from("blog_posts").delete().eq("published_date", today);
    }

    const { data: insertedPost, error: insertError } = await supabase.from("blog_posts").insert({
      title,
      content: body + ideasSection,
      summary,
      tweet_count: tweets.length,
      published_date: today,
      image_url: imageUrl,
    }).select("id").single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to save blog post: ${insertError.message}`);
    }

    // Trigger email dispatch to subscribers
    console.log("Triggering email dispatch...");
    try {
      const dispatchRes = await fetch(
        `${supabaseUrl}/functions/v1/send-dispatch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ postId: insertedPost.id }),
        }
      );
      const dispatchData = await dispatchRes.json();
      console.log("Dispatch result:", JSON.stringify(dispatchData));
    } catch (e) {
      console.error("Failed to trigger dispatch (non-fatal):", e);
    }

    // Publish to Substack via email
    const substackEmail = Deno.env.get("SUBSTACK_IMPORT_EMAIL");
    if (substackEmail) {
      console.log("Sending post to Substack...");
      try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (RESEND_API_KEY && LOVABLE_API_KEY) {
          const substackText = body
            .replace(/\r\n/g, "\n")
            .trim();

          const substackRes = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": RESEND_API_KEY,
            },
            body: JSON.stringify({
              from: "Autonomous Capitalism <dispatch@autonomouscapitalism.com>",
              to: [substackEmail],
              subject: title,
              text: substackText,
            }),
          });
          const substackData = await substackRes.json();
          console.log("Substack email result:", JSON.stringify(substackData));
        }
      } catch (e) {
        console.error("Failed to send to Substack (non-fatal):", e);
      }
    }

    console.log(`Daily blog post generated from ${tweets.length} tweets`);
    return new Response(
      JSON.stringify({ message: "Blog post generated, dispatched, and sent to Substack", title, tweet_count: tweets.length, image_url: imageUrl }),
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
