import { Link } from "react-router-dom";

const Unsubscribed = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container flex items-center justify-center py-6">
          <Link to="/" className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground hover:text-primary transition-colors">
            <span className="text-primary">Autonomous</span> Capitalism
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground text-lg font-body mt-4">
            You've been unsubscribed.
          </p>
          <p className="text-muted-foreground/60 text-sm font-body mt-4">
            We're sorry to see you go. You can always resubscribe at{" "}
            <Link to="/" className="text-primary hover:underline">our site</Link>.
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-muted-foreground font-body text-sm">
            Autonomous Capitalism is part of{" "}
            <a href="https://lazyfounderventures.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Lazy Founder Ventures
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Unsubscribed;
