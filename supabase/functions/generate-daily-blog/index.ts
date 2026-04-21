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
    const tweets = await fetchAllTweets(bearerToken, "autonomous", 200);

    if (tweets.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tweets found to summarize" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Collected ${tweets.length} tweets, generating blog...`);

    // Sort by engagement
    tweets.sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets));

    // Fetch recent headlines to avoid similarity
    const { data: recentPosts } = await supabase
      .from("blog_posts")
      .select("title, published_date")
      .order("published_date", { ascending: false })
      .limit(30);
    const recentTitles = (recentPosts || [])
      .map((p: any) => `- "${p.title}" (${p.published_date})`)
      .join("\n");
    console.log(`Loaded ${recentPosts?.length || 0} recent headlines for de-duplication`);

    // Extract forbidden subject keywords (proper nouns + meaningful nouns) from recent headlines
    const STOPWORDS_SUBJ = new Set(["the","a","an","is","are","of","to","in","on","and","or","for","with","by","at","as","its","it","this","that","be","from","into","over","new","how","why","but","not","now","up","out","off","you","your","our","we","they","them","their","has","have","had","was","were","will","can","could","should","would","may","might","than","then","so","if","about","after","before","while","when","where","who","what","which","there","here","just","also","more","most","some","any","all","one","two","three","first","last","next","each","other","another","such","only","own","same","very","still","ever","never","once","again","like","make","made","get","got","take","took","go","went","come","came","see","saw","say","said","told","tell","know","knew","think","thought","starts","starting","began","begin","begins","starts","start","starting","ends","end","ending","continues","continue","continuing","says","saying","gets","getting","makes","making","goes","going","comes","coming","sees","seeing","tells","telling","thinks","thinking","becomes","became","becoming","keeps","keeping","kept","puts","putting","put","let","lets","letting","yet","much","many","few","fewer","less","lot","lots","big","small","high","low","old"]);
    const extractSubjects = (s: string) =>
      s.replace(/[^\w\s'-]/g, " ").split(/\s+/).filter((w) => w && w.length > 2 && !STOPWORDS_SUBJ.has(w.toLowerCase()));
    const recentSubjectSet = new Set<string>();
    for (const p of recentPosts || []) {
      for (const w of extractSubjects(p.title)) recentSubjectSet.add(w.toLowerCase());
    }
    const forbiddenSubjects = Array.from(recentSubjectSet).sort();
    console.log(`Forbidden subject keywords (${forbiddenSubjects.length}): ${forbiddenSubjects.slice(0, 40).join(", ")}...`);

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
- HEADLINE RULES (MANDATORY): The VERY FIRST LINE of your response must be ONLY the headline. Nothing else on that line. The headline MUST be 10 words or fewer. No periods. No markdown. No formatting. Just the headline text. Example: "Uber bets $10 billion on driverless future". Count every word — if over 10, shorten it. This is non-negotiable.
- After the headline, leave a blank line, then write 6-10 paragraphs of narrative prose
- Do NOT mention any Twitter/X handles or usernames — refer to people by name or role only
- Group themes: technology breakthroughs, market impacts, labor disruption, policy debates, cultural reactions
- End with a thought-provoking closing line
- Use markdown for bold and italic emphasis
- IMPORTANT: Do NOT start the article by talking about chatbots. Vary your opening — lead with the most compelling or surprising theme of the day, not a generic chatbot reference.

RECENT HEADLINES TO AVOID DUPLICATING (your headline must cover a DIFFERENT STORY — different company, different person, different event, different topic; do not share 3+ meaningful words with any of these; avoid recurring openers like "Machines are…", "AI is…", "The robots…"):
${recentTitles || "(none yet)"}

FORBIDDEN SUBJECT KEYWORDS (these proper nouns / topic words appeared in recent headlines — your headline MUST NOT contain ANY of these words; pick a completely different story from today's tweets):
${forbiddenSubjects.join(", ") || "(none yet)"}

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

    // Extract title from first line, enforce 10-word max
    const lines = content.trim().split("\n");
    let title = lines[0].replace(/^#+\s*/, "").replace(/^\*+/, "").replace(/\*+$/, "").trim();
    // Hard enforce: if title is more than 10 words, truncate
    const titleWords = title.split(/\s+/);
    if (titleWords.length > 10) {
      console.warn(`Title too long (${titleWords.length} words), truncating: "${title}"`);
      title = titleWords.slice(0, 10).join(" ");
    }
    const body = lines.slice(1).join("\n").trim();

    // Similarity check vs recent headlines (Jaccard on meaningful words); rewrite if too similar
    const STOP = new Set(["the","a","an","is","are","of","to","in","on","and","or","for","with","by","at","as","its","it","this","that","be","from","into","over","new","how","why","but","not","now","up","out","off"]);
    const tokens = (s: string) => new Set(
      s.toLowerCase().replace(/[^\w\s'-]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w) && w.length > 2)
    );
    const similarity = (a: string, b: string) => {
      const A = tokens(a), B = tokens(b);
      if (!A.size || !B.size) return 0;
      let inter = 0;
      for (const w of A) if (B.has(w)) inter++;
      return inter / Math.min(A.size, B.size);
    };
    const titleSubjectsLower = extractSubjects(title).map((w) => w.toLowerCase());
    let overlapSubject = titleSubjectsLower.find((w) => recentSubjectSet.has(w));
    let tooSimilar = (recentPosts || []).find((p: any) => similarity(title, p.title) >= 0.5);
    let rewriteAttempts = 0;
    while ((tooSimilar || overlapSubject) && rewriteAttempts < 3) {
      rewriteAttempts++;
      const reason = overlapSubject
        ? `contains forbidden subject "${overlapSubject}" already used in recent headlines`
        : `too similar to recent "${tooSimilar.title}"`;
      console.warn(`Headline "${title}" ${reason} — requesting rewrite (attempt ${rewriteAttempts})`);
      try {
        const rewriteRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: `Rewrite the given headline so it covers a COMPLETELY DIFFERENT STORY than these recent headlines. Different company, person, event, and topic. Max 10 words. No periods. No markdown. Reply with ONLY the new headline text.\n\nRecent headlines:\n${recentTitles}\n\nFORBIDDEN WORDS (do NOT use ANY of these): ${forbiddenSubjects.join(", ")}\n\nPick a different angle from the article body — focus on a subject NOT in the forbidden list.` },
              { role: "user", content: `Original headline: ${title}\n\nArticle opening: ${body.substring(0, 800)}` },
            ],
          }),
        });
        if (!rewriteRes.ok) {
          console.error("Rewrite failed (non-fatal):", rewriteRes.status);
          break;
        }
        const rd = await rewriteRes.json();
        const raw = (rd.choices?.[0]?.message?.content || "").trim().split("\n")[0];
        const newTitle = raw.replace(/^#+\s*/, "").replace(/^["*]+|["*.]+$/g, "").trim();
        if (!newTitle) break;
        const nw = newTitle.split(/\s+/);
        title = nw.length > 10 ? nw.slice(0, 10).join(" ") : newTitle;
        console.log(`Rewritten headline (attempt ${rewriteAttempts}): "${title}"`);
        const newSubjects = extractSubjects(title).map((w) => w.toLowerCase());
        overlapSubject = newSubjects.find((w) => recentSubjectSet.has(w));
        tooSimilar = (recentPosts || []).find((p: any) => similarity(title, p.title) >= 0.5);
      } catch (e) {
        console.error("Rewrite error (non-fatal):", e);
        break;
      }
    }

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

    console.log(`Daily blog post generated from ${tweets.length} tweets`);
    return new Response(
      JSON.stringify({ message: "Blog post generated and dispatched", title, tweet_count: tweets.length, image_url: imageUrl }),
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
