import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
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
        return <strong key={j}>{part.slice(2, -2)}</strong>;
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
      <header className="border-b border-border">
        <div className="container flex items-center justify-center py-6 relative">
          <Link to="/blog" className="absolute left-4 top-6 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <Link to="/" className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground hover:text-primary transition-colors">
              <span className="text-primary">Autonomous</span> Capitalism
            </Link>
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
                · {post.tweet_count} tweets analyzed
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

      <footer className="border-t border-border py-8 mt-12">
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

export default BlogPost;
