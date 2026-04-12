import { BadgeCheck } from "lucide-react";
import type { Tweet } from "@/data/tweets";

const trimAfterAutonomous = (text: string, minWordsAfter = 10): string => {
  const idx = text.search(/autonomous/i);
  if (idx === -1) return text;
  const after = text.slice(idx);
  const words = after.split(/\s+/);
  if (words.length <= minWordsAfter + 1) return text;
  const kept = text.slice(0, idx) + words.slice(0, minWordsAfter + 1).join(" ");
  return kept + "…";
};

const highlightAutonomous = (text: string) => {
  const parts = text.split(/(autonomous)/gi);
  return parts.map((part, i) =>
    part.toLowerCase() === "autonomous" ? (
      <span key={i} className="text-primary font-semibold">{part}</span>
    ) : (
      part
    )
  );
};

const TickerCard = ({ tweet }: { tweet: Tweet }) => {
  const handleUsername = tweet.handle.replace("@", "");
  const tweetUrl = `https://x.com/${handleUsername}/status/${tweet.id}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-card/60 border border-border/40 hover:border-primary/30 hover:bg-card transition-all duration-300 cursor-pointer no-underline group"
    >
      <div className="flex items-center gap-2 mb-2">
        {tweet.avatarUrl ? (
          <img src={tweet.avatarUrl} alt={tweet.username} className="w-6 h-6 rounded-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold text-muted-foreground font-body">
            {tweet.avatar}
          </div>
        )}
        <span className="text-sm text-muted-foreground font-body truncate group-hover:text-foreground transition-colors">
          {tweet.handle}
        </span>
        {tweet.verified && <BadgeCheck className="w-4 h-4 text-primary/50 shrink-0" />}
        <span className="text-muted-foreground/60 text-xs font-body shrink-0 ml-auto">{tweet.timestamp}</span>
      </div>
      <p className="text-foreground/60 text-sm leading-relaxed font-body break-words group-hover:text-foreground/90 transition-colors">
        {highlightAutonomous(trimAfterAutonomous(tweet.content))}
      </p>
    </a>
  );
};

type TweetTickerProps = {
  tweets: Tweet[];
};

const TweetTicker = ({ tweets }: TweetTickerProps) => {
  const items = [...tweets, ...tweets];

  return (
    <div className="relative h-[calc(100vh-200px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 z-10 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 z-10 bg-gradient-to-t from-background to-transparent" />
      <div
        className="flex flex-col gap-3 animate-ticker-up"
        style={{ ["--ticker-speed" as string]: "600s" }}
      >
        {items.map((tweet, i) => (
          <TickerCard key={`${tweet.id}-${i}`} tweet={tweet} />
        ))}
      </div>
    </div>
  );
};

export default TweetTicker;
