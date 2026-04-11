import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import EmailCapture from "@/components/EmailCapture";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type BlogPostData = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tweet_count: number;
  published_date: string;
  created_at: string;
  image_url: string | null;
};

const fetchBlogPost = async (id: string): Promise<BlogPostData> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as any;
};

// Simple markdown-to-JSX renderer for bold, italic, handles, and paragraphs
const renderMarkdown = (text: string) => {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, i) => {
    if (p.startsWith("# ") || p.startsWith("## ") || p.startsWith("### ")) {
      const stripped = p.replace(/^#+\s*/, "");
      return (
        <h3 key={i} className="font-display font-black text-xl mt-6 mb-3 text-foreground">
          {stripped}
        </h3>
      );
    }

    // Process inline formatting
    const parts = p.split(/(\*\*.*?\*\*|_.*?_|@\w+)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <span key={j}>{part.slice(2, -2)}</span>;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return <em key={j}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("@")) {
        return (
          <a
            key={j}
            href={`https://x.com/${part.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });

    return (
      <p key={i} className="text-foreground/90 font-body text-base leading-relaxed mb-4">
        {rendered}
      </p>
    );
  });
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => fetchBlogPost(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="flex items-center justify-between py-6 px-6 md:px-24">
          <Link to="/" className="font-display text-base md:text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors">
            <span className="text-primary">Autonomous</span> Capitalism
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/briefings" className="text-primary hover:text-primary/80 transition-colors text-sm font-body font-bold tracking-wide">Briefings</Link>
            <Link to="/subscribe" className="bg-primary text-primary-foreground px-4 py-1.5 font-body font-bold text-xs tracking-wider hover:bg-primary/90 transition-colors">SUBSCRIBE</Link>
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 max-w-2xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="text-center text-muted-foreground font-body py-12">
            Post not found.
          </p>
        )}

        {post && (
          <article>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-primary text-primary-foreground text-xs font-body font-bold tracking-widest px-2 py-0.5">
                DISPATCH
              </span>
              <span className="text-xs text-muted-foreground font-body">
                {format(new Date(post.published_date), "MMMM d, yyyy")}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                · {post.tweet_count} X posts analyzed
              </span>
            </div>

            <h1 className="font-display font-black text-3xl md:text-4xl leading-tight mb-8 text-foreground">
              {post.title}
            </h1>

            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full aspect-[16/9] object-cover mb-8"
                loading="eager"
              />
            )}

            <div className="border-t border-border pt-6">
              {renderMarkdown(post.content)}
            </div>
          </article>
        )}
        <div className="mt-8">
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

export default BlogPost;
