import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const fetchSubscriberCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw error;
  return count || 0;
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
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: emailAddr } as any);
      if (error) {
        if (error.code === "23505") throw new Error("already_subscribed");
        throw error;
      }
      // Send the most recent dispatch to the new subscriber
      supabase.functions.invoke("send-dispatch", {
        body: { singleEmail: emailAddr },
      }).catch((e) => console.error("Welcome dispatch failed:", e));
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
      <div className="border border-border p-6 md:p-8 text-center">
        <h3 className="font-display font-black text-xl md:text-2xl mb-2 text-foreground">
          Get the <span className="text-primary">Autonomous Dispatch</span>
        </h3>
        <p className="text-muted-foreground font-body text-sm mb-4">
          AI-curated stories from the autonomous revolution. Delivered daily.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-secondary border border-border px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            disabled={subscribe.isPending}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="bg-primary text-primary-foreground px-6 py-2.5 font-body font-bold text-sm tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {subscribe.isPending ? "..." : "SUBSCRIBE"}
          </button>
        </form>
        {typeof subscriberCount === "number" && (
          <p className="text-xs text-muted-foreground font-body mt-3">
            <span className="text-primary font-bold">{subscriberCount.toLocaleString()}</span> readers subscribed
          </p>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="border-t border-border pt-4 mt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-secondary border border-border px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary min-w-0"
            disabled={subscribe.isPending}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="bg-primary text-primary-foreground px-4 py-2 font-body font-bold text-xs tracking-wider hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
          >
            {subscribe.isPending ? "..." : "JOIN"}
          </button>
        </form>
        {typeof subscriberCount === "number" && (
          <p className="text-xs text-muted-foreground font-body mt-2">
            <span className="text-primary font-bold">{subscriberCount.toLocaleString()}</span> subscribers
          </p>
        )}
      </div>
    );
  }

  // default
  return (
    <div className="border border-border p-5">
      <p className="font-display font-bold text-sm mb-2 text-foreground">
        Get <span className="text-primary">autonomous</span> news daily
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-secondary border border-border px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary min-w-0"
          disabled={subscribe.isPending}
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 font-body font-bold text-xs tracking-wider hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
        >
          {subscribe.isPending ? "..." : "SUBSCRIBE"}
        </button>
      </form>
      {typeof subscriberCount === "number" && (
        <p className="text-xs text-muted-foreground font-body mt-2">
          <span className="text-primary font-bold">{subscriberCount.toLocaleString()}</span> readers
        </p>
      )}
    </div>
  );
};

export default EmailCapture;
