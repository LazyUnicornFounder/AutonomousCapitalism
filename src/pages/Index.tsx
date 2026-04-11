import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import TweetCard from "@/components/TweetCard";
import EmailCapture from "@/components/EmailCapture";
import { supabase } from "@/integrations/supabase/client";
import type { Tweet } from "@/data/tweets";

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
        <div className="container relative flex items-center justify-center py-4">
          <div className="absolute left-4 top-4 flex items-center gap-4">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">About</a>
            <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Daily Dispatch</a>
          </div>
          <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground">
            <span className="text-primary">Autonomous</span> Capitalism
          </h1>
        </div>
      </header>

      {/* Hero — Email capture CTA */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <h2 className="font-display font-black text-4xl md:text-6xl leading-none tracking-tight text-foreground mb-6">
            The <span className="text-primary">autonomous</span> revolution,<br />delivered daily.
          </h2>
          <p className="text-muted-foreground font-body text-lg md:text-xl leading-relaxed mb-8 max-w-lg mx-auto">
            Every morning, AI reads hundreds of posts from <svg className="w-5 h-5 md:w-6 md:h-6 fill-muted-foreground inline -mt-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> and writes you one sharp, story-driven briefing on what machines are doing in business, finance, and society.
          </p>
          <EmailCapture variant="hero" />
        </div>
      </section>

      {/* Live feed */}
      <section className="container py-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-foreground flex items-center gap-3">
            Live from
            <svg className="w-8 h-8 md:w-10 md:h-10 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </h2>
        </div>
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
        <div className="mt-8">
          <EmailCapture variant="default" />
        </div>
      </section>

      <footer id="about" className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-muted-foreground font-body text-sm">
            Autonomous Capitalism is part of{" "}
            <a href="https://lazyfactoryventures.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Lazy Factory Ventures
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
