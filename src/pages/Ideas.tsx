import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Lightbulb } from "lucide-react";
import EmailCapture from "@/components/EmailCapture";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type BlogPost = {
  id: string;
  title: string;
  content: string;
  published_date: string;
  tweet_count: number;
};

type BusinessIdea = {
  name: string;
  description: string;
  links: { label: string; url: string }[];
  date: string;
  postId: string;
};

const parseLinks = (text: string): { clean: string; links: { label: string; url: string }[] } => {
  const links: { label: string; url: string }[] = [];
  // Match **Relevant posts:** line and extract markdown links
  const relevantMatch = text.match(/\*?\*?Relevant posts:\*?\*?\s*(.*)/i);
  if (relevantMatch) {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let m;
    while ((m = linkRegex.exec(relevantMatch[1])) !== null) {
      links.push({ label: m[1], url: m[2] });
    }
  }
  // Also find bare x.com URLs
  if (links.length === 0) {
    const bareUrlRegex = /(https:\/\/x\.com\/\w+\/status\/\d+)/g;
    let m;
    while ((m = bareUrlRegex.exec(text)) !== null) {
      links.push({ label: "View post", url: m[1] });
    }
  }
  const clean = text.replace(/\*?\*?Relevant posts:\*?\*?\s*.*/gi, "").trim();
  return { clean, links };
};

const extractIdeas = (posts: BlogPost[]): BusinessIdea[] => {
  const ideas: BusinessIdea[] = [];
  for (const post of posts) {
    const ideasMatch = post.content.split(/## Business Ideas From Today's Trends/i);
    if (ideasMatch.length < 2) continue;
    const ideasSection = ideasMatch[1];

    const ideaBlocks = ideasSection.split(/### /).filter(Boolean);
    for (const block of ideaBlocks) {
      const lines = block.trim().split("\n");
      const name = lines[0].trim().replace(/^\[|\]$/g, "");
      const rawDesc = lines.slice(1).join("\n").trim();
      const { clean, links } = parseLinks(rawDesc);
      if (name && clean) {
        ideas.push({ name, description: clean, links, date: post.published_date, postId: post.id });
      }
    }
  }
  return ideas;
};

const fetchIdeas = async (): Promise<{ ideas: BusinessIdea[]; posts: BlogPost[] }> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, content, published_date, tweet_count")
    .order("published_date", { ascending: false })
    .limit(30);

  if (error) throw error;
  const posts = (data || []) as BlogPost[];
  return { ideas: extractIdeas(posts), posts };
};

const Ideas = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["business-ideas"],
    queryFn: fetchIdeas,
  });

  const ideas = data?.ideas || [];

  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="flex items-center justify-between py-4 px-4 md:py-6 md:px-24">
          <Link to="/" className="font-display text-sm md:text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors shrink-0">
            <span className="text-primary">Autonomous</span> Capitalism
          </Link>
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/briefings" className="text-primary hover:text-primary/80 transition-colors text-xs md:text-sm font-body font-bold tracking-wide">Daily Briefings</Link>
            <Link to="/ideas" className="text-foreground text-xs md:text-sm font-body font-bold tracking-wide">Ideas</Link>
            <Link to="/subscribe" className="bg-primary text-primary-foreground px-3 md:px-4 py-1 md:py-1.5 font-body font-bold text-[10px] md:text-xs tracking-wider hover:bg-primary/90 transition-colors">SUBSCRIBE</Link>
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors hidden sm:block">
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            <span className="bg-primary text-primary-foreground text-xs font-body font-bold tracking-widest px-2 py-0.5">IDEAS LAB</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mb-3">
            Autonomous Business Ideas
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl">
            AI-generated venture concepts extracted from daily X post analysis. Each idea is inspired by real trends in autonomous systems.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="text-center text-muted-foreground font-body py-12">Failed to load ideas.</p>
        )}

        {!isLoading && ideas.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-12">No ideas generated yet. Check back after the next daily briefing.</p>
        )}

        <div className="space-y-6">
          {ideas.map((idea, i) => (
            <div key={i} className="border border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <span className="text-primary font-display font-black text-2xl mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <h3 className="font-display font-black text-lg text-foreground mb-2">{idea.name}</h3>
                  <p className="text-foreground/80 font-body text-sm leading-relaxed mb-3">{idea.description}</p>
                  {idea.links.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <svg className="w-4 h-4 fill-primary shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      {idea.links.map((link, j) => (
                        <a
                          key={j}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-body text-primary hover:underline border border-primary/30 px-2 py-0.5 hover:bg-primary/10 transition-colors"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {idea.links.length === 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 fill-muted-foreground shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <a
                        href={`https://x.com/search?q=${encodeURIComponent(idea.name.split(/\s+/).slice(0, 3).join(" ") + " autonomous")}&f=live`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-body text-muted-foreground hover:text-primary hover:underline"
                      >
                        Search related posts →
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                    <span>{format(new Date(idea.date), "MMM d, yyyy")}</span>
                    <span>·</span>
                    <Link to={`/briefings/${idea.postId}`} className="text-primary hover:underline">From briefing →</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <EmailCapture variant="default" />
        </div>
      </main>

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

export default Ideas;
