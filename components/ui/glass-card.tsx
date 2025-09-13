import * as React from "react";
import { Bot, Zap, Globe, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const AILogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
  </svg>
);

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  features?: string[];
  variant?: "ai" | "customer" | "global" | "default";
}

const cardVariants = {
  ai: {
    title: "AI Invoice Generation",
    description: "Create professional invoices instantly with natural language prompts.",
    features: ["Natural language processing", "Smart formatting", "Auto calculations"],
    icon: Bot,
    gradient: "from-primary to-ai-accent",
  },
  customer: {
    title: "Smart Customer Management",
    description: "Organize clients with intelligent insights and automated workflows.",
    features: ["Customer profiles", "Payment tracking", "Smart insights"],
    icon: Zap,
    gradient: "from-ai-accent to-secondary",
  },
  global: {
    title: "Global Multi-Currency",
    description: "Support worldwide clients with automatic currency and tax handling.",
    features: ["Multi-currency support", "Tax compliance", "Localization"],
    icon: Globe,
    gradient: "from-secondary to-primary",
  },
  default: {
    title: "Professional Invoicing",
    description: "Create, share, and use beautiful custom invoices made with AI.",
    features: ["Custom templates", "Export options", "Brand management"],
    icon: AILogo,
    gradient: "from-primary to-primary/80",
  },
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, title, description, features, variant = "default", ...props }, ref) => {
    const config = cardVariants[variant];
    const CardIcon = config.icon;

    return (
      <div
        ref={ref}
        className={`group h-[420px] w-[320px] [perspective:1000px] ${className}`}
        {...props}
      >
        <div className="relative h-full rounded-[50px] bg-gradient-to-br from-background/90 to-muted/60 backdrop-blur-xl border border-border/20 shadow-glass transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[box-shadow:var(--shadow-glow),var(--shadow-glass)] group-hover:[transform:rotate3d(1,1,0,20deg)]">
          <div className="absolute inset-2 rounded-[45px] border-b border-l border-white/10 dark:border-white/5 bg-gradient-glass backdrop-blur-sm [transform-style:preserve-3d] [transform:translate3d(0,0,25px)]"></div>
          
          <div className="absolute [transform:translate3d(0,0,26px)] p-8 w-full">
            <div className="pt-16 pb-20">
              <span className="block text-2xl font-bold text-foreground mb-2">
                {title || config.title}
              </span>
              <span className="block text-base text-muted-foreground leading-relaxed mb-4">
                {description || config.description}
              </span>
              
              {(features || config.features) && (
                <ul className="mt-4 space-y-2">
                  {(features || config.features).map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between [transform-style:preserve-3d] [transform:translate3d(0,0,26px)]">
            <div className="flex gap-3 [transform-style:preserve-3d]">
              <button
                onClick={() => {
                  // Scroll to features section for "Learn More"
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group/btn px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-200 ease-in-out group-hover:[transform:translate3d(0,0,20px)] hover:bg-primary hover:text-primary-foreground hover:border-primary"
                style={{ transitionDelay: '0ms' }}
              >
                Learn More
              </button>
              <button
                onClick={() => {
                  // Scroll to AI showcase section for "Try Demo"
                  const aiSection = document.getElementById('ai-showcase');
                  if (aiSection) {
                    aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    // Fallback: search for "AI in Action" text
                    const sections = document.querySelectorAll('section, div');
                    for (const section of sections) {
                      const textContent = section.textContent || '';
                      if (textContent.includes('AI in Action') || section.querySelector('h2')?.textContent?.includes('AI in Action')) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        break;
                      }
                    }
                  }
                }}
                className="group/btn px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-200 ease-in-out group-hover:[transform:translate3d(0,0,20px)] hover:bg-primary hover:text-primary-foreground hover:border-primary"
                style={{ transitionDelay: '100ms' }}
              >
                Try Demo
              </button>
              <Link
                to="/auth"
                className="group/btn px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-200 ease-in-out group-hover:[transform:translate3d(0,0,20px)] hover:bg-primary hover:text-primary-foreground hover:border-primary inline-flex items-center"
                style={{ transitionDelay: '200ms' }}
              >
                Get Started
              </Link>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 [transform-style:preserve-3d]">
            {[
              { size: "140px", pos: "10px", z: "15px", delay: "0s" },
              { size: "110px", pos: "15px", z: "30px", delay: "0.2s" },
              { size: "80px", pos: "22px", z: "45px", delay: "0.4s" },
              { size: "50px", pos: "30px", z: "60px", delay: "0.6s" },
            ].map((circle, index) => (
              <div
                key={index}
                className={`absolute aspect-square rounded-full bg-gradient-to-br ${config.gradient} opacity-20 shadow-glass transition-all duration-500 ease-in-out`}
                style={{
                  width: circle.size,
                  top: circle.pos,
                  right: circle.pos,
                  transform: `translate3d(0, 0, ${circle.z})`,
                  transitionDelay: circle.delay,
                }}
              ></div>
            ))}
            
            <div
              className={`absolute grid aspect-square w-[60px] place-content-center rounded-full bg-gradient-to-br ${config.gradient} shadow-glass transition-all duration-500 ease-in-out [transform:translate3d(0,0,75px)] [transition-delay:0.8s] group-hover:[transform:translate3d(0,0,90px)]`}
              style={{ top: "20px", right: "20px" }}
            >
              <CardIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;