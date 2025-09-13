import { useState } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { StarBorder } from "@/components/ui/star-border";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Send, Sparkles, FileText, Clock, Globe } from "lucide-react";

const languages = {
  english: {
    name: "English",
    prompts: [
      "Invoice TechCorp for website redesign project, $2,500, 20% tax, due in 2 weeks",
      "Create invoice for consulting services, $1,200, 10% tax, payment in 30 days",
      "Bill ClientCorp for software development, $3,500, 25% tax, due next month",
      "Invoice for mobile app development, $4,200, 18% tax, payment within 45 days",
      "Create bill for digital marketing campaign, $1,800, 15% tax, due in 21 days"
    ],
    companies: ["TechCorp", "ClientCorp", "DevStudio", "AppWorks Inc", "Digital Pro"],
    services: ["Website redesign project", "Consulting services", "Software development", "Mobile app development", "Digital marketing campaign"],
    amounts: ["$2,500.00", "$1,200.00", "$3,500.00", "$4,200.00", "$1,800.00"],
    taxes: ["20%", "10%", "25%", "18%", "15%"],
    taxAmounts: ["$500.00", "$120.00", "$875.00", "$756.00", "$270.00"],
    totals: ["$3,000.00", "$1,320.00", "$4,375.00", "$4,956.00", "$2,070.00"],
    totalLabel: "Total:"
  },
  danish: {
    name: "Dansk",
    prompts: [
      "Faktura for bilvask service, 500 DKK, 25% moms, forfalder om 1 uge",
      "Regning til rengøring af kontor, 750 DKK, 25% moms, betaling om 2 uger",
      "Faktura for IT support, 1200 DKK, 25% moms, forfalder om 30 dage",
      "Faktura for grafisk design, 2000 DKK, 25% moms, betaling om 14 dage",
      "Regning for bogføring, 900 DKK, 25% moms, forfalder om 3 uger"
    ],
    companies: ["BilvaskCenter", "KontorService", "IT-Support", "Design Bureau", "RegnskabsHus"],
    services: ["Bilvask service", "Rengøring af kontor", "IT support", "Grafisk design", "Bogføring"],
    amounts: ["500.00 DKK", "750.00 DKK", "1200.00 DKK", "2000.00 DKK", "900.00 DKK"],
    taxes: ["25% moms", "25% moms", "25% moms", "25% moms", "25% moms"],
    taxAmounts: ["125.00 DKK", "187.50 DKK", "300.00 DKK", "500.00 DKK", "225.00 DKK"],
    totals: ["625.00 DKK", "937.50 DKK", "1500.00 DKK", "2500.00 DKK", "1125.00 DKK"],
    totalLabel: "Total:"
  },
  german: {
    name: "Deutsch",
    prompts: [
      "Rechnung für Webdesign-Beratung, €1,200, 19% MwSt, Zahlung in 30 Tagen",
      "Faktura für Marketing Services, €2,000, 19% MwSt, fällig in 14 Tagen",
      "Rechnung für Software-Entwicklung, €3,500, 19% MwSt, Zahlung in 45 Tagen",
      "Faktura für Grafikdesign, €1,800, 19% MwSt, Zahlung in 21 Tagen",
      "Rechnung für IT-Beratung, €2,800, 19% MwSt, fällig in 30 Tagen"
    ],
    companies: ["WebDesign GmbH", "Marketing Pro", "Software AG", "Grafik Studio", "IT Beratung"],
    services: ["Webdesign-Beratung", "Marketing Services", "Software-Entwicklung", "Grafikdesign", "IT-Beratung"],
    amounts: ["€1,200.00", "€2,000.00", "€3,500.00", "€1,800.00", "€2,800.00"],
    taxes: ["19% MwSt", "19% MwSt", "19% MwSt", "19% MwSt", "19% MwSt"],
    taxAmounts: ["€228.00", "€380.00", "€665.00", "€342.00", "€532.00"],
    totals: ["€1,428.00", "€2,380.00", "€4,165.00", "€2,142.00", "€3,332.00"],
    totalLabel: "Gesamt:"
  },
  spanish: {
    name: "Español",
    prompts: [
      "Factura para diseño web, €1,500, 21% IVA, pago en 30 días",
      "Facturar servicios de consultoría, €2,200, 21% IVA, vencimiento en 15 días",
      "Factura por desarrollo de software, €4,000, 21% IVA, pago en 45 días",
      "Facturar diseño gráfico, €1,300, 21% IVA, pago en 21 días",
      "Factura para marketing digital, €2,600, 21% IVA, vencimiento en 30 días"
    ],
    companies: ["Diseño Web SL", "Consultoría Pro", "Software SA", "Gráfico Studio", "Marketing Digital"],
    services: ["Diseño web", "Servicios de consultoría", "Desarrollo de software", "Diseño gráfico", "Marketing digital"],
    amounts: ["€1,500.00", "€2,200.00", "€4,000.00", "€1,300.00", "€2,600.00"],
    taxes: ["21% IVA", "21% IVA", "21% IVA", "21% IVA", "21% IVA"],
    taxAmounts: ["€315.00", "€462.00", "€840.00", "€273.00", "€546.00"],
    totals: ["€1,815.00", "€2,662.00", "€4,840.00", "€1,573.00", "€3,146.00"],
    totalLabel: "Total:"
  },
  french: {
    name: "Français",
    prompts: [
      "Facture pour développement web, €1,800, 20% TVA, paiement sous 30 jours",
      "Facturer services de design, €1,400, 20% TVA, échéance dans 2 semaines",
      "Facture pour conseil IT, €2,500, 20% TVA, paiement sous 45 jours",
      "Facturer création graphique, €1,600, 20% TVA, paiement sous 21 jours",
      "Facture pour formation, €2,100, 20% TVA, échéance dans 30 jours"
    ],
    companies: ["WebDev SARL", "Design Studio", "IT Conseil", "Création Graph", "Formation Pro"],
    services: ["Développement web", "Services de design", "Conseil IT", "Création graphique", "Formation"],
    amounts: ["€1,800.00", "€1,400.00", "€2,500.00", "€1,600.00", "€2,100.00"],
    taxes: ["20% TVA", "20% TVA", "20% TVA", "20% TVA", "20% TVA"],
    taxAmounts: ["€360.00", "€280.00", "€500.00", "€320.00", "€420.00"],
    totals: ["€2,160.00", "€1,680.00", "€3,000.00", "€1,920.00", "€2,520.00"],
    totalLabel: "Total:"
  }
};

export function AIShowcaseSection() {
  const [activePrompt, setActivePrompt] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof languages>("english");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentLanguage = languages[selectedLanguage];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setActivePrompt((prev) => (prev + 1) % currentLanguage.prompts.length);
    }, 2000);
  };

  return (
    <section id="ai-showcase" className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-between mb-16">
            <div className="text-center flex-1">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-ai-accent bg-clip-text text-transparent">
                AI in Action
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Simply describe what you need in any language, and watch AI create professional invoices instantly
              </p>
            </div>
            
            <div className="ml-8">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Language</span>
              </div>
              <Select value={selectedLanguage} onValueChange={(value: keyof typeof languages) => {
                setSelectedLanguage(value);
                setActivePrompt(0);
              }}>
                <SelectTrigger className="w-32 bg-card/50 backdrop-blur-xl border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([key, lang]) => (
                    <SelectItem key={key} value={key}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Prompt Interface */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-glass">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-lg">AI Prompt Interface</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2">You say:</p>
                  <p className="font-medium text-foreground">
                    "{currentLanguage.prompts[activePrompt]}"
                  </p>
                </div>
                
                <StarBorder as="div" className="w-full">
                  <InteractiveHoverButton 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    text={isGenerating ? "Generating Invoice..." : "Generate Invoice"}
                    className="w-full h-11 px-8"
                  >
                    {isGenerating ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </InteractiveHoverButton>
                </StarBorder>
              </div>
            </div>
          </motion.div>

          {/* Invoice Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.div
              key={activePrompt}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-card rounded-2xl border border-border/50 p-8 shadow-glass"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Invoice #INV-2024-001</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Generated in 2.3s</span>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">From:</p>
                    <p className="font-medium">Your Company</p>
                    <p className="text-xs text-muted-foreground">123 Business St.</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">To:</p>
                    <p className="font-medium">
                      {currentLanguage.companies[activePrompt]}
                    </p>
                    <p className="text-xs text-muted-foreground">Client Address</p>
                  </div>
                </div>
                
                <div className="border-t border-border/30 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>
                        {currentLanguage.services[activePrompt]}
                      </span>
                      <span className="font-medium">
                        {currentLanguage.amounts[activePrompt]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({currentLanguage.taxes[activePrompt]})</span>
                      <span className="font-medium">
                        {currentLanguage.taxAmounts[activePrompt]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border/30 mt-4 pt-4 flex justify-between font-bold text-lg">
                    <span>{currentLanguage.totalLabel}</span>
                    <span className="text-primary">
                      {currentLanguage.totals[activePrompt]}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}