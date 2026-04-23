import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import EmailCapture from "@/components/EmailCapture";
import NavHeader from "@/components/NavHeader";
import IdeaLandingHero from "@/components/IdeaLandingHero";
import { supabase } from "@/integrations/supabase/client";

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
  const relevantMatch = text.match(/\*?\*?Relevant posts:\*?\*?\s*(.*)/i);
  if (relevantMatch) {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let m;
    while ((m = linkRegex.exec(relevantMatch[1])) !== null) {
      links.push({ label: m[1], url: m[2] });
    }
  }
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

const fetchIdeas = async (): Promise<BusinessIdea[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, content, published_date, tweet_count")
    .order("published_date", { ascending: false })
    .limit(30);

  if (error) throw error;
  return extractIdeas((data || []) as BlogPost[]);
};

const Ideas = () => {
  const { data: ideas = [], isLoading, isError } = useQuery({
    queryKey: ["business-ideas"],
    queryFn: fetchIdeas,
  });

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <section className="border-b border-border py-12">
        <div className="container px-4 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            <span className="text-primary">Autonomous</span> Business Ideas
          </h1>
          <p className="text-muted-foreground font-body text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            AI-generated venture concepts surfaced from each daily briefing.
          </p>
        </div>
      </section>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="text-center text-muted-foreground font-body py-24">Failed to load ideas.</p>
      )}

      {!isLoading && ideas.length === 0 && (
        <p className="text-center text-muted-foreground font-body py-24">
          No ideas generated yet. Check back after the next daily briefing.
        </p>
      )}

      <div className="container px-4 md:px-6 max-w-6xl mx-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea, i) => (
          <IdeaLandingHero key={`${idea.postId}-${i}`} idea={idea} index={i} />
        ))}
      </div>

      <section className="border-t border-border py-16">
        <div className="container px-4 max-w-xl mx-auto">
          <EmailCapture variant="default" />
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

export default Ideas;
