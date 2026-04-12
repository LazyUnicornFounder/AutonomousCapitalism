import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import EmailCapture from "@/components/EmailCapture";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type BlogPost = {
  id: string;
  title: string;
  summary: string | null;
  tweet_count: number;
  published_date: string;
  created_at: string;
  image_url: string | null;
};

const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, summary, tweet_count, published_date, created_at, image_url")
    .order("published_date", { ascending: false });

  if (error) throw error;
  return (data as any) || [];
};

const Blog = () => {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="flex items-center justify-between py-4 px-4 md:py-6 md:px-24">
          <Link to="/" className="font-display text-sm md:text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors shrink-0">
            <span className="text-primary">Autonomous</span> Capitalism
          </Link>
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/briefings" className="text-primary hover:text-primary/80 transition-colors text-xs md:text-sm font-body font-bold tracking-wide">Daily Briefings</Link>
            <Link to="/subscribe" className="bg-primary text-primary-foreground px-3 md:px-4 py-1 md:py-1.5 font-body font-bold text-[10px] md:text-xs tracking-wider hover:bg-primary/90 transition-colors">SUBSCRIBE</Link>
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors hidden sm:block">
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors hidden sm:block">
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-border py-12">
        <div className="container px-4 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            <span className="text-primary">Daily Autonomous</span> Briefings
          </h1>
          <p className="text-muted-foreground font-body text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            Every day, AI reads hundreds of <svg className="w-4 h-4 md:w-5 md:h-5 fill-primary inline -mt-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> posts about the <span className="text-primary font-bold">autonomous</span> revolution and sends you one sharp, story-driven <span className="text-primary font-bold">briefing</span> on what agents and machines are doing in business, finance, and society.
          </p>
        </div>
      </section>

      <main className="container py-8 px-4 max-w-3xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {posts && posts.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-12">
            No briefings yet. The first one will be generated soon.
          </p>
        )}

        <div className="space-y-8">
          {posts?.map((post) => (
            <Link
              key={post.id}
              to={`/briefings/${post.id}`}
              className="block border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary text-primary-foreground text-xs font-body font-bold tracking-widest px-2 py-0.5">
                  BRIEFING
                </span>
                <span className="text-xs text-muted-foreground font-body">
                  {format(new Date(post.published_date), "MMMM d, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground font-body">
                  · {post.tweet_count} X posts analyzed
                </span>
              </div>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full aspect-[16/9] object-cover mb-4 rounded"
                  loading="lazy"
                />
              )}
              <h2 className="font-display font-black text-xl md:text-2xl leading-tight mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.summary && (
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {post.summary}
                </p>
              )}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <EmailCapture variant="default" />
        </div>
      </main>

      <section id="about" className="border-t border-border py-16 md:py-24">
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-5 mb-4">
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
            </a>
          </div>
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

export default Blog;
