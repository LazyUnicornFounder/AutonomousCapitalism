import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const fetchSubscriberCount = async (): Promise<number> => {
  const { data, error } = await supabase.rpc("get_active_subscriber_count");
  if (error) throw error;
  return data || 0;
};

const EmailCapture = ({ variant = "default" }: { variant?: "default" | "compact" | "hero" }) => {
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: subscriberCount } = useQuery({
    queryKey: ["subscriber-count"],
    queryFn: fetchSubscriberCount,
  });

  const subscribe = useMutation({
    mutationFn: async (emailAddr: string) => {
      const { data, error } = await supabase.functions.invoke("subscribe", {
        body: { email: emailAddr },
      });
      if (error) throw error;
      if (data?.status === "already_subscribed") throw new Error("already_subscribed");
    },
    onSuccess: () => {
      toast.success("You're in! Check your spam folder and move us to Primary so you never miss a dispatch.", {
        duration: 8000,
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["subscriber-count"] });
    },
    onError: (err: Error) => {
      if (err.message === "already_subscribed") {
        toast.info("You're already subscribed.");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address.");
      return;
    }
    subscribe.mutate(trimmed);
  };

  if (variant === "hero") {
    return (
      <div className="text-left">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            disabled={subscribe.isPending}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-body font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {subscribe.isPending ? "..." : "Subscribe"}
          </button>
        </form>
        {typeof subscriberCount === "number" && (
          <p className="text-xs text-muted-foreground font-body mt-3">
            Join <span className="text-primary font-semibold">{subscriberCount.toLocaleString()}</span> readers
          </p>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="border-t border-border/50 pt-4 mt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-0 transition-all"
            disabled={subscribe.isPending}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-body font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
          >
            {subscribe.isPending ? "..." : "Join"}
          </button>
        </form>
        {typeof subscriberCount === "number" && (
          <p className="text-xs text-muted-foreground font-body mt-2">
            <span className="text-primary font-semibold">{subscriberCount.toLocaleString()}</span> subscribers
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-xl p-5 bg-card/50">
      <p className="font-body font-semibold text-sm mb-2 text-foreground">
        Get <span className="text-primary">autonomous</span> news daily
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-0 transition-all"
          disabled={subscribe.isPending}
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-body font-semibold text-xs hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
        >
          {subscribe.isPending ? "..." : "Subscribe"}
        </button>
      </form>
      {typeof subscriberCount === "number" && (
        <p className="text-xs text-muted-foreground font-body mt-2">
          <span className="text-primary font-semibold">{subscriberCount.toLocaleString()}</span> readers
        </p>
      )}
    </div>
  );
};

export default EmailCapture;
