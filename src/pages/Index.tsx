import TweetCard from "@/components/TweetCard";
import { tweets } from "@/data/tweets";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-center py-6">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground italic">
            Autonomous Capitalism
          </h1>
        </div>
      </header>
      <main className="container py-8 px-4">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
