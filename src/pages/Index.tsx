import { useQuery } from "@tanstack/react-query";
import TweetTicker from "@/components/TweetTicker";
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
  if (isNaN(diff) || diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

const Index = () => {
  const { data: liveTweets, isLoading } = useQuery({
    queryKey: ["tweets", "autonomous"],
    queryFn: fetchTweets,
    refetchInterval: 60000,
  });

  const tweets = (liveTweets || [])
    .filter((t) => /autonomous/i.test(t.content))
    .map((t) => ({
      ...t,
      timestamp: formatTimestamp(t.timestamp),
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="flex items-center justify-between py-4 px-6 md:px-16 max-w-7xl mx-auto">
          <h1 className="font-body text-base md:text-lg font-bold tracking-tight text-foreground">
            <span className="text-primary">Autonomous</span> Capitalism
          </h1>
          <div className="flex items-center gap-4 md:gap-6">
            <a href="/briefings" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Briefings
            </a>
            <a href="/subscribe" className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-medium text-sm hover:bg-primary/20 transition-colors">
              Subscribe
            </a>
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-[calc(100vh-64px)] flex items-center py-16 md:py-24 overflow-hidden">
        <div className="flex w-full px-6 md:px-16 max-w-7xl mx-auto gap-12">
          {/* Left */}
          <div className="w-full md:w-1/2 flex-shrink-0 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full w-fit mb-8">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              AI-powered newsletter
            </div>
            <h2 className="font-body font-bold text-3xl md:text-5xl leading-[1.15] tracking-tight text-foreground mb-6">
              The daily briefing on the <span className="text-primary">autonomous</span> revolution
            </h2>
            <p className="text-muted-foreground font-body text-base md:text-lg leading-relaxed mb-10 max-w-lg">
              Every day, AI reads hundreds of posts about the autonomous revolution on{" "}
              <svg className="w-4 h-4 fill-muted-foreground inline -mt-0.5" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>{" "}
              and sends you one sharp, story-driven briefing on what agents and machines are doing in business, finance, and society.
            </p>
            <EmailCapture variant="hero" />
          </div>

          {/* Right: tweet ticker */}
          <div className="hidden md:block w-[45%] flex-shrink-0">
            {isLoading && (
              <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <span className="text-3xl animate-spin inline-block">🤖</span>
              </div>
            )}
            {!isLoading && tweets.length > 0 && (
              <TweetTicker tweets={tweets} />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-border/50 py-16">
        <div className="max-w-2xl mx-auto text-center px-6">
          <div className="flex items-center justify-center gap-5 mb-4">
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
            </a>
          </div>
          <p className="text-muted-foreground font-body text-sm">
            Autonomous Capitalism is part of{" "}
            <a href="https://lazyfounderventures.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Lazy Founder Ventures
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
