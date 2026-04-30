import { Link, useLocation } from "react-router-dom";

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  </svg>
);

const navLinks = [
  { to: "/briefings", label: "Briefings" },
  { to: "/ideas", label: "Ideas" },
  { to: "/manifesto", label: "Manifesto" },
  { to: "/about", label: "About" },
];

const NavHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // On subscribe page, don't show the SUBSCRIBE button
  const isSubscribePage = currentPath === "/subscribe";

  return (
    <header>
      <div className="flex items-center justify-between py-4 px-4 md:py-6 md:px-24">
        <Link
          to="/"
          className="font-display text-sm md:text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors shrink-0"
        >
          <span className="text-primary">Autonomous</span> Capitalism
        </Link>
        <div className="flex items-center gap-3 md:gap-5">
          {navLinks.map((link) => {
            const isActive = currentPath === link.to || currentPath.startsWith(link.to + "/");
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs md:text-sm font-body font-bold tracking-wide transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-primary hover:text-primary/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {!isSubscribePage && (
            <Link
              to="/subscribe"
              className="bg-primary text-primary-foreground px-3 md:px-4 py-1 md:py-1.5 font-body font-bold text-[10px] md:text-xs tracking-wider hover:bg-primary/90 transition-colors"
            >
              SUBSCRIBE
            </Link>
          )}
          <a
            href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors hidden sm:block"
          >
            <LinkedInIcon className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
