import { Search, Menu } from "lucide-react";
import { categories } from "@/data/articles";

const SiteHeader = () => {
  return (
    <header className="border-b border-border">
      <div className="container flex items-center justify-between py-4">
        <span className="text-muted-foreground text-sm font-body cursor-pointer">Got A Tip?</span>
        <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground italic">
          Autonomous Capitalism
        </h1>
        <span className="text-muted-foreground text-sm font-body cursor-pointer">Log In</span>
      </div>
      <nav className="border-t border-border">
        <div className="container flex items-center justify-between py-3">
          <Menu className="w-5 h-5 text-foreground cursor-pointer md:hidden" />
          <ul className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <li key={cat}>
                <a href="#" className="text-sm font-body font-bold tracking-widest text-foreground hover:text-primary transition-colors">
                  {cat}
                </a>
              </li>
            ))}
          </ul>
          <Search className="w-5 h-5 text-foreground cursor-pointer" />
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
