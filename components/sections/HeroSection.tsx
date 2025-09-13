import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { StarBorder } from "@/components/ui/star-border";

export function HeroSection() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = "AI-Powered Invoicing";

  useEffect(() => {
    let index = 0;
    const typeTimer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typeTimer);
      }
    }, 25); // Optimized speed: 25ms per character

    return () => clearInterval(typeTimer);
  }, []);

  const handleStartInvoicing = () => {
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0">
        <BackgroundPaths title="" ctaText="" ctaAction={() => {}} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/80">
              {displayedText}
              {!isTypingComplete && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block ml-1 text-foreground"
                >
                  |
                </motion.span>
              )}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isTypingComplete ? 1 : 0, y: isTypingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Transform your business invoicing with AI. Create professional invoices instantly using natural language prompts, manage customers intelligently, and get paid faster worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isTypingComplete ? 1 : 0, y: isTypingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <StarBorder>
              <InteractiveHoverButton 
                text="Start Invoicing with AI"
                className="h-14 px-10 text-base font-semibold"
                onClick={handleStartInvoicing}
              />
            </StarBorder>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}