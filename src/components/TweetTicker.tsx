import { BadgeCheck } from "lucide-react";
import type { Tweet } from "@/data/tweets";

const highlightAutonomous = (text: string) => {
  const parts = text.split(/(autonomous)/gi);
  return parts.map((part, i) =>
    part.toLowerCase() === "autonomous" ? (
      <span key={i} className="text-primary font-bold">{part}</span>
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
      className="inline-flex flex-col gap-2 bg-card border border-border p-4 w-[340px] shrink-0 hover:bg-accent/30 transition-colors cursor-pointer no-underline rounded-sm"
    >
      <div className="flex items-center gap-2">
        {tweet.avatarUrl ? (
          <img src={tweet.avatarUrl} alt={tweet.username} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground font-body">
            {tweet.avatar}
          </div>
        )}
        <span className="font-bold text-xs text-foreground font-body truncate">{tweet.username}</span>
        {tweet.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
        <span className="text-muted-foreground text-xs font-body">{tweet.handle}</span>
      </div>
      <p className="text-foreground/90 text-sm leading-snug font-body line-clamp-3 break-words">
        {highlightAutonomous(tweet.content)}
      </p>
    </a>
  );
};

type TweetTickerRowProps = {
  tweets: Tweet[];
  direction: "left" | "right";
  speed?: number;
};

const TweetTickerRow = ({ tweets, direction, speed = 40 }: TweetTickerRowProps) => {
  // Double the tweets for seamless looping
  const items = [...tweets, ...tweets];
  const animationClass = direction === "left" ? "animate-ticker-left" : "animate-ticker-right";

  return (
    <div className="overflow-hidden relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-background to-transparent" />
      <div
        className={`flex gap-4 ${animationClass}`}
        style={{ ["--ticker-speed" as string]: `${speed}s` }}
      >
        {items.map((tweet, i) => (
          <TickerCard key={`${tweet.id}-${i}`} tweet={tweet} />
        ))}
      </div>
    </div>
  );
};

type TweetTickerProps = {
  tweets: Tweet[];
};

const TweetTicker = ({ tweets }: TweetTickerProps) => {
  // Split tweets into 3 rows
  const third = Math.ceil(tweets.length / 3);
  const row1 = tweets.slice(0, third);
  const row2 = tweets.slice(third, third * 2);
  const row3 = tweets.slice(third * 2);

  return (
    <div className="flex flex-col gap-3">
      <TweetTickerRow tweets={row1} direction="left" speed={50} />
      <TweetTickerRow tweets={row2} direction="right" speed={45} />
      <TweetTickerRow tweets={row3} direction="left" speed={55} />
    </div>
  );
};

export default TweetTicker;
