import { useQuery } from "@tanstack/react-query";
import TweetCard from "@/components/TweetCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tweet } from "@/data/tweets";
import { Loader2 } from "lucide-react";

const fetchTweets = async (): Promise<Tweet[]> => {
  const { data, error } = await supabase.functions.invoke("twitter-search", {
    body: null,
    method: "GET",
  });

  if (error) throw error;
  return data?.tweets || [];
};

const formatTimestamp = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

const Index = () => {
  const { data: liveTweets, isLoading, isError } = useQuery({
    queryKey: ["tweets", "autonomous"],
    queryFn: fetchTweets,
    refetchInterval: 60000, // refresh every minute
  });

  const tweets = (liveTweets || []).map((t) => ({
    ...t,
    timestamp: formatTimestamp(t.timestamp),
  }));

  const displayTweets = tweets;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-center py-6">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground italic">
            Autonomous Capitalism
          </h1>
        </div>
      </header>
      <main className="container py-8 px-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground font-body text-sm">Loading live tweets…</span>
          </div>
        )}
        {isError && (
          <p className="text-center text-muted-foreground font-body text-sm mb-4">
            Couldn't load live tweets — showing cached posts.
          </p>
        )}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {displayTweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
