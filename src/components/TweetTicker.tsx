import { BadgeCheck } from "lucide-react";
import type { Tweet } from "@/data/tweets";

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
      className="inline-flex flex-col gap-1.5 border-l-2 border-primary/30 pl-3 py-1 w-[400px] shrink-0 hover:border-primary transition-colors cursor-pointer no-underline group"
    >
      <div className="flex items-center gap-1.5">
        {tweet.avatarUrl ? (
          <img src={tweet.avatarUrl} alt={tweet.username} className="w-4 h-4 rounded-full object-cover opacity-70" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground font-body">
            {tweet.avatar}
          </div>
        )}
        <span className="text-xs text-muted-foreground font-body truncate">
          {tweet.handle}
        </span>
        {tweet.verified && <BadgeCheck className="w-3 h-3 text-primary/60 shrink-0" />}
        <span className="text-muted-foreground/50 text-xs font-body shrink-0">· {tweet.timestamp}</span>
      </div>
      <p className="text-foreground/70 text-[13px] leading-snug font-body break-words group-hover:text-foreground/90 transition-colors">
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
  const items = [...tweets, ...tweets];
  const animationClass = direction === "left" ? "animate-ticker-left" : "animate-ticker-right";

  return (
    <div className="overflow-hidden relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />
      <div
        className={`flex gap-6 ${animationClass}`}
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
  const third = Math.ceil(tweets.length / 3);
  const row1 = tweets.slice(0, third);
  const row2 = tweets.slice(third, third * 2);
  const row3 = tweets.slice(third * 2);

  return (
    <div className="flex flex-col gap-4 opacity-60 hover:opacity-90 transition-opacity duration-500">
      <TweetTickerRow tweets={row1} direction="left" speed={50} />
      <TweetTickerRow tweets={row2} direction="right" speed={45} />
      <TweetTickerRow tweets={row3} direction="left" speed={55} />
    </div>
  );
};

export default TweetTicker;
