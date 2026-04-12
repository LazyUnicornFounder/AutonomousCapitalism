import { Link } from "react-router-dom";
import EmailCapture from "@/components/EmailCapture";
import NavHeader from "@/components/NavHeader";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <section className="border-b border-border py-12">
        <div className="container px-4 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            About <span className="text-primary">Autonomous</span> Capitalism
          </h1>
        </div>
      </section>

      <main className="container py-12 px-4 max-w-2xl mx-auto">
        <div className="space-y-8">
          <p className="text-foreground/90 font-body text-lg leading-relaxed">
            Every day, AI reads hundreds of{" "}
            <svg className="w-5 h-5 fill-primary inline -mt-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>{" "}
            posts about the <span className="text-primary font-bold">autonomous</span> revolution and sends you one sharp, story-driven{" "}
            <span className="text-primary font-bold">briefing</span> on what agents and machines are doing in business, finance, and society.
          </p>

          <p className="text-foreground/90 font-body text-lg leading-relaxed">
            Autonomous Capitalism tracks the rise of autonomous systems — from AI agents running businesses to robots settling invoices via smart contracts. We distill the noise into signal: one daily briefing, plus AI-generated business ideas you can launch.
          </p>

          <p className="text-foreground/90 font-body text-lg leading-relaxed">
            This isn't a newsletter about chatbots. It's a front-row seat to the economy that runs itself.
          </p>

          <div className="border-t border-border pt-8">
            <h2 className="font-display font-black text-xl text-foreground mb-4">How it works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="text-primary font-display font-black text-lg shrink-0">01</span>
                <p className="text-foreground/80 font-body">AI scans hundreds of X posts daily about autonomous systems, agents, and machine economics.</p>
              </div>
              <div className="flex gap-4">
                <span className="text-primary font-display font-black text-lg shrink-0">02</span>
                <p className="text-foreground/80 font-body">The most engaging posts are synthesized into a narrative-driven briefing — no lists, no fluff.</p>
              </div>
              <div className="flex gap-4">
                <span className="text-primary font-display font-black text-lg shrink-0">03</span>
                <p className="text-foreground/80 font-body">Business ideas are extracted from the trends, ready for you to copy a prompt and build.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <EmailCapture variant="default" />
          </div>
        </div>
      </main>

      <section className="border-t border-border py-16 md:py-24">
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-5 mb-4">
            <a href="https://x.com/SoloUnicorn" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7448781743005782016" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
            </a>
          </div>
          <p className="text-muted-foreground font-body text-lg leading-relaxed">
            Autonomous Capitalism is part of{" "}
            <a href="https://lazyfounderventures.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
              Lazy Founder Ventures
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
