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
      <span key={i} className="text-primary">{part}</span>
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
      className="block pl-3 py-2 hover:border-primary/50 transition-all duration-300 cursor-pointer no-underline group"
    >
      <div className="flex items-center gap-1.5 mb-1">
        {tweet.avatarUrl ? (
          <img src={tweet.avatarUrl} alt={tweet.username} className="w-6 h-6 rounded-full object-cover opacity-60" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground font-body">
            {tweet.avatar}
          </div>
        )}
        <span className="text-base text-foreground/40 font-body truncate group-hover:text-foreground transition-colors">
          {tweet.handle}
        </span>
        {tweet.verified && <BadgeCheck className="w-5 h-5 text-primary/40 shrink-0" />}
        <span className="text-muted-foreground text-sm font-body shrink-0 ml-auto group-hover:text-foreground transition-colors">{tweet.timestamp}</span>
      </div>
      <p className="text-foreground/50 text-lg leading-relaxed font-body break-words group-hover:text-foreground transition-colors">
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
      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10 bg-gradient-to-b from-background to-transparent" />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-background to-transparent" />
      <div
        className="flex flex-col gap-8 animate-ticker-up"
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
