import { Heart, MessageCircle, Repeat2, Share, BadgeCheck } from "lucide-react";
import type { Tweet } from "@/data/tweets";

const formatNumber = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const highlightAutonomous = (text: string) => {
  const parts = text.split(/(autonomous)/gi);
  return parts.map((part, i) =>
    part.toLowerCase() === "autonomous" ? (
      <span key={i} className="text-primary font-bold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const TweetCard = ({ tweet }: { tweet: Tweet }) => {
  const handleUsername = tweet.handle.replace('@', '');
  const tweetUrl = `https://x.com/${handleUsername}/status/${tweet.id}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border p-4 break-inside-avoid mb-4 hover:bg-accent/30 transition-colors cursor-pointer no-underline"
    >
      <div className="flex items-start gap-3">
        {tweet.avatarUrl ? (
          <img src={tweet.avatarUrl} alt={tweet.username} className="w-10 h-10 rounded-full shrink-0 object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 font-body">
            {tweet.avatar}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-sm text-foreground font-body">{tweet.username}</span>
            {tweet.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
            <span className="text-muted-foreground text-sm font-body">{tweet.handle}</span>
            <span className="text-muted-foreground text-sm font-body">· {tweet.timestamp}</span>
          </div>
          <p className="text-foreground text-[15px] leading-relaxed mt-1 font-body break-words overflow-hidden">
            {highlightAutonomous(tweet.content)}
          </p>
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-xs font-body">
              <MessageCircle className="w-4 h-4" />
              {formatNumber(tweet.replies)}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-body">
              <Repeat2 className="w-4 h-4" />
              {formatNumber(tweet.retweets)}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-body">
              <Heart className="w-4 h-4" />
              {formatNumber(tweet.likes)}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-body">
              <Share className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default TweetCard;
