import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { StarBorder } from "@/components/ui/star-border";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/auth');
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-ai-accent/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ai-accent/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            Join thousands of businesses already using AI invoicing
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-ai-accent bg-clip-text text-transparent">
            Ready to Transform Your Invoicing?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start creating professional invoices with AI today. No credit card required, 
            no setup fees, just intelligent invoicing that grows with your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <StarBorder>
              <InteractiveHoverButton 
                text="Start Invoicing Today"
                className="px-8 h-14 text-base font-semibold"
                onClick={handleStartTrial}
              >
                <ArrowRight className="w-5 h-5" />
              </InteractiveHoverButton>
            </StarBorder>
            

          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            {[
              { number: "<3s", label: "AI generation time" },
              { number: "15", label: "Supported currencies" },
              { number: "10+", label: "Languages supported" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}