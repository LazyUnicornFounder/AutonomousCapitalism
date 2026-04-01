import { supabase } from "@/integrations/supabase/client";
import type { Tweet } from "@/data/tweets";

export async function fetchTweets(query = "autonomous"): Promise<Tweet[]> {
  const { data, error } = await supabase.functions.invoke("twitter-search", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: undefined,
  });

  // supabase.functions.invoke doesn't support query params natively for GET,
  // so we use POST with body instead
  if (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }

  return data.tweets || [];
}

export async function fetchTweetsViaPost(query = "autonomous", maxResults = 20): Promise<Tweet[]> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || `https://${projectId}.supabase.co`;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  
  const url = new URL(`${supabaseUrl}/functions/v1/twitter-search`);
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", String(maxResults));

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${anonKey}`,
      "apikey": anonKey,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch tweets");
  }

  const data = await res.json();
  return data.tweets || [];
}
