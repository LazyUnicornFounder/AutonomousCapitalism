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
      className="inline-flex flex-col gap-2 bg-card/50 backdrop-blur-sm border-2 border-border/40 rounded-lg px-4 py-3 w-[320px] shrink-0 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer no-underline group"
    >
      <div className="flex items-center gap-2 min-w-0">
        {tweet.avatarUrl ? (
          <img src={tweet.avatarUrl} alt={tweet.username} className="w-5 h-5 rounded-full object-cover ring-1 ring-border/50" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground font-body">
            {tweet.avatar}
          </div>
        )}
        <span className="text-[11px] text-foreground/60 font-body font-medium truncate">
          {tweet.handle}
        </span>
        {tweet.verified && <BadgeCheck className="w-3 h-3 text-primary/50 shrink-0" />}
        <span className="text-foreground/30 text-[11px] font-body shrink-0 ml-auto">{tweet.timestamp}</span>
      </div>
      <p className="text-foreground/60 text-[13px] leading-relaxed font-body break-words group-hover:text-foreground/80 transition-colors line-clamp-3">
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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-background to-transparent" />
      <div
        className={`flex gap-3 ${animationClass}`}
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
    <div className="flex flex-col gap-3">
      <TweetTickerRow tweets={row1} direction="left" speed={50} />
      <TweetTickerRow tweets={row2} direction="right" speed={45} />
      <TweetTickerRow tweets={row3} direction="left" speed={55} />
    </div>
  );
};

export default TweetTicker;
