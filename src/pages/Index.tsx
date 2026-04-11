import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
      <header>
        <div className="flex items-center justify-between py-4 px-4 md:px-8">
          <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground">
            <span className="text-primary">Autonomous</span> Capitalism
          </h1>
          <div className="flex items-center gap-5">
            <a href="/briefings" className="text-primary hover:text-primary/80 transition-colors text-sm font-body font-bold tracking-wide">Briefings</a>
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero — Email capture CTA + Tweet Tickers */}
      <section className="border-b border-border min-h-[calc(100vh-64px)] flex flex-col justify-center py-16 md:py-24">
        <div className="px-4 max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-display font-black text-4xl md:text-6xl leading-none tracking-tight text-foreground mb-6">
            <span className="block w-fit mx-auto whitespace-nowrap">The <span className="text-primary">autonomous</span> revolution.</span><br />Delivered daily.
          </h2>
          <p className="text-muted-foreground font-body text-lg md:text-xl leading-relaxed mb-8 max-w-lg mx-auto">
            Every morning, AI reads hundreds of posts about the <span className="text-primary font-bold">autonomous</span> revolution from <svg className="w-5 h-5 md:w-6 md:h-6 fill-primary inline -mt-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> and writes you one sharp, story-driven <span className="text-primary font-bold">briefing</span> on what machines are doing in business, finance, and society.
          </p>
          <EmailCapture variant="hero" />
        </div>

        {/* Tweet tickers */}
        <div className="mt-8">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && tweets.length > 0 && (
            <TweetTicker tweets={tweets} />
          )}
        </div>
      </section>

      <section id="about" className="border-t border-border py-16 md:py-24">
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Autonomous Capitalism is part of{" "}
            <a href="https://lazyfounderventures.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
              Lazy Founder Ventures
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
