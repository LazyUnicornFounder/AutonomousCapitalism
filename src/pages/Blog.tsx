import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
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
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-center py-6 relative">
          <Link to="/" className="absolute left-4 top-6 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground">
              <span className="text-primary">Autonomous</span> Dispatch
            </h1>
            <p className="text-muted-foreground font-body text-sm mt-2 tracking-wide">
              AI-generated story summaries of the autonomous revolution
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 max-w-3xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {posts && posts.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-12">
            No dispatches yet. The first one will be generated soon.
          </p>
        )}

        <div className="space-y-8">
          {posts?.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="block border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
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

      <footer className="border-t border-border py-8">
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

export default Blog;
