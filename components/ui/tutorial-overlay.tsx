import React,{ useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Globe, Users, Grid3X3, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElementId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  page?: string;
  sections?: { 
    title: string; 
    description: string;
    selector?: string;
  }[];
  type?: 'tutorial' | 'language' | 'customer' | 'template';
  nextStep?: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onLanguageChange?: (language: string) => void;
  onTutorialComplete?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ 
  steps, 
  isOpen, 
  onClose,
  onComplete,
  onLanguageChange,
  onTutorialComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [highlightedSection, setHighlightedSection] = useState<number | null>(null);
  const [tutorialPhase, setTutorialPhase] = useState<'initial' | 'language' | 'customer' | 'template' | 'complete'>('initial');
  const targetRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  // Check for localStorage flags to automatically progress through tutorial phases
  useEffect(() => {
    if (!isOpen) return;
    
    const checkTutorialProgress = () => {
      // Check if language was saved during language phase
      if (tutorialPhase === 'language') {
        const languageSaved = localStorage.getItem('invoiceAI-language-saved');
        if (languageSaved) {
          handleLanguageSave();
          localStorage.removeItem('invoiceAI-language-saved'); // Clean up
        }
      }
      
      // Check if customer was created during customer phase
      if (tutorialPhase === 'customer') {
        const customerCreated = localStorage.getItem('invoiceAI-customer-created');
        if (customerCreated) {
          handleCustomerCreated();
          localStorage.removeItem('invoiceAI-customer-created'); // Clean up
        }
      }
      
      // Check if template was created during template phase
      if (tutorialPhase === 'template') {
        const templateCreated = localStorage.getItem('invoiceAI-template-created');
        if (templateCreated) {
          handleTemplateCreated();
          localStorage.removeItem('invoiceAI-template-created'); // Clean up
        }
      }
    };
    
    // Check immediately and then every 500ms
    checkTutorialProgress();
    const interval = setInterval(checkTutorialProgress, 500);
    
    return () => clearInterval(interval);
  }, [tutorialPhase, isOpen]);

  // Disable scrolling when tutorial is open - but only for initial tutorial steps
  useEffect(() => {
    if (isOpen && showLanguageSelection) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, showLanguageSelection]);

  useEffect(() => {
    if (isOpen && !showLanguageSelection && steps[currentStep]?.targetElementId && tutorialPhase === 'initial') {
      // Navigate to the page if specified
      if (steps[currentStep].page) {
        navigate(steps[currentStep].page);
      }
      
      // Wait for page navigation and then highlight target
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(steps[currentStep].targetElementId!);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          setTargetPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        }
      }, 500); // Increased wait time for navigation animation
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen, showLanguageSelection, steps, navigate, tutorialPhase]);

  const startTutorial = () => {
    setShowLanguageSelection(false);
    setCurrentStep(0);
    setTutorialPhase('initial');
    
    // Clean up any existing tutorial flags
    localStorage.removeItem('invoiceAI-language-saved');
    localStorage.removeItem('invoiceAI-customer-created');
    localStorage.removeItem('invoiceAI-template-created');
    
    // Apply selected language immediately
    if (onLanguageChange) {
      onLanguageChange(selectedLanguage);
      // Ensure the document's language is updated
      document.documentElement.lang = selectedLanguage;
    }
    
    // Navigate to first page
    if (steps[0]?.page) {
      navigate(steps[0].page);
    }
  };

  const nextStep = () => {
    // Check if we're at the end of the initial tutorial steps
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setHighlightedSection(null);
    } else {
      // Initial tutorial is complete, move to language selection phase
      setTutorialPhase('language');
      navigate('/settings');
      
      // Scroll to language and country settings after a delay
      setTimeout(() => {
        const languageSection = document.querySelector('.language-country-settings');
        if (languageSection) {
          languageSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setHighlightedSection(null);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  const highlightSection = (index: number) => {
    setHighlightedSection(index);
    const section = steps[currentStep]?.sections?.[index];
    if (section?.selector) {
      const element = document.querySelector(section.selector);
      if (element) {
        // Prevent scrolling by calculating position without scrolling
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (onLanguageChange) {
      onLanguageChange(languageCode);
      // Ensure the document's language is updated
      document.documentElement.lang = languageCode;
    }
  };

  // Handle language save and move to customer creation
  const handleLanguageSave = () => {
    setTutorialPhase('customer');
    navigate('/customers/new');
  };

  // Handle customer creation and move to template creation
  const handleCustomerCreated = () => {
    setTutorialPhase('template');
    navigate('/templates');
  };

  // Handle template creation and complete tutorial
  const handleTemplateCreated = () => {
    setTutorialPhase('complete');
    if (onTutorialComplete) {
      onTutorialComplete();
    }
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate tooltip position to avoid going off screen
  const getTooltipPosition = () => {
    if (!targetPosition) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    let left, top;
    
    // For steps at the end of the sidebar (settings, subscription), position tooltip higher
    const isEndStep = ['subscription', 'settings'].includes(currentStepData.id);
    
    if (currentStepData.position === 'right') {
      left = targetPosition.left + targetPosition.width + 50;
      top = isEndStep ? targetPosition.top - 150 : targetPosition.top + targetPosition.height / 2 - 75;
    } else if (currentStepData.position === 'left') {
      left = targetPosition.left - 300;
      top = isEndStep ? targetPosition.top - 150 : targetPosition.top + targetPosition.height / 2 - 75;
    } else if (currentStepData.position === 'top') {
      left = targetPosition.left + targetPosition.width / 2 - 150;
      top = targetPosition.top - 150;
    } else if (currentStepData.position === 'bottom') {
      left = targetPosition.left + targetPosition.width / 2 - 150;
      top = targetPosition.top + targetPosition.height + 50;
    } else {
      // Default center positioning
      left = targetPosition.left + targetPosition.width / 2 - 150;
      top = targetPosition.top + targetPosition.height / 2 - 75;
    }
    
    // Ensure tooltip doesn't go off screen
    const tooltipWidth = 300;
    const tooltipHeight = 200;
    
    if (left < 20) left = 20;
    if (left > window.innerWidth - tooltipWidth - 20) left = window.innerWidth - tooltipWidth - 20;
    if (top < 20) top = 20;
    if (top > window.innerHeight - tooltipHeight - 20) top = window.innerHeight - tooltipHeight - 20;
    
    return { left: `${left}px`, top: `${top}px`, transform: 'none' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Semi-transparent backdrop - only for language selection */}
          {showLanguageSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={skipTutorial}
            />
          )}
          
          {/* Language Selection Screen */}
          <AnimatePresence>
            {showLanguageSelection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                  <div className="text-center mb-6">
                    <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to InvoiceAI</h2>
                    <p className="text-muted-foreground">Choose your preferred language for the tutorial</p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedLanguage === lang.code
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-foreground">{lang.name}</span>
                        {selectedLanguage === lang.code && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={startTutorial} 
                    className="w-full"
                    size="lg"
                  >
                    Start Tutorial
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Highlight target element */}
          {targetPosition && !showLanguageSelection && tutorialPhase === 'initial' && (
            <motion.div
              className="fixed border-2 border-primary rounded-lg z-40 pointer-events-none"
              initial={{ 
                x: targetPosition.left, 
                y: targetPosition.top,
                width: targetPosition.width,
                height: targetPosition.height,
                opacity: 0
              }}
              animate={{ 
                x: targetPosition.left, 
                y: targetPosition.top,
                width: targetPosition.width,
                height: targetPosition.height,
                opacity: 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Animated arrow */}
          {targetPosition && !showLanguageSelection && tutorialPhase === 'initial' && (
            <motion.div
              className="fixed z-40 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentStepData.position === 'right' && (
                <ArrowRight className="text-primary w-8 h-8" 
                  style={{ 
                    left: targetPosition.left + targetPosition.width + 20, 
                    top: targetPosition.top + targetPosition.height / 2 - 16,
                    position: 'absolute'
                  }} />
              )}
              {currentStepData.position === 'left' && (
                <ArrowLeft className="text-primary w-8 h-8" 
                  style={{ 
                    left: targetPosition.left - 40, 
                    top: targetPosition.top + targetPosition.height / 2 - 16,
                    position: 'absolute'
                  }} />
              )}
              {currentStepData.position === 'top' && (
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowLeft className="text-primary w-8 h-8 rotate-90" 
                    style={{ 
                      left: targetPosition.left + targetPosition.width / 2 - 16, 
                      top: targetPosition.top - 40,
                      position: 'absolute'
                    }} />
                </motion.div>
              )}
              {currentStepData.position === 'bottom' && (
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowLeft className="text-primary w-8 h-8 -rotate-90" 
                    style={{ 
                      left: targetPosition.left + targetPosition.width / 2 - 16, 
                      top: targetPosition.top + targetPosition.height + 20,
                      position: 'absolute'
                    }} />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Tooltip for initial tutorial steps */}
          {!showLanguageSelection && tutorialPhase === 'initial' && (
            <motion.div
              className="fixed z-50 bg-card border border-border rounded-lg p-6 max-w-sm shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={getTooltipPosition()}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-foreground">{currentStepData.title}</h3>
                <Button variant="ghost" size="icon" onClick={skipTutorial} className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {currentStepData.sections ? (
                <div className="mb-4">
                  <p className="text-muted-foreground mb-3">{currentStepData.description}</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentStepData.sections.map((section, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          highlightedSection === index 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          highlightSection(index);
                        }}
                      >
                        <h4 className="font-medium text-foreground">{section.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">{currentStepData.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} of {steps.length}
                </span>
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  <Button size="sm" onClick={nextStep}>
                    {isLastStep ? 'Continue' : 'Next'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Language Selection Phase - Non-blocking overlay */}
          {tutorialPhase === 'language' && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 z-40 w-80"
            >
              <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Language Settings</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLanguageSave} className="h-6 w-6">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Please select your preferred language and country in the settings below, then save your changes.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleLanguageSave}>
                    Skip Step
                  </Button>
                  <Button onClick={handleLanguageSave} size="sm">
                    Continue After Saving
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Creation Phase - Non-blocking overlay */}
          {tutorialPhase === 'customer' && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 z-40 w-80"
            >
              <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Create Customer</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCustomerCreated} className="h-6 w-6">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Create your first customer using the form below. After creating a customer, you'll proceed to the next step.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCustomerCreated}>
                    Skip Step
                  </Button>
                  <Button onClick={handleCustomerCreated} size="sm">
                    Continue After Creating
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Template Creation Phase - Non-blocking overlay */}
          {tutorialPhase === 'template' && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 z-40 w-80"
            >
              <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Create Template</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleTemplateCreated} className="h-6 w-6">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Create your first invoice template. After creating a template, your tutorial will be complete!
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleTemplateCreated}>
                    Skip Step
                  </Button>
                  <Button onClick={handleTemplateCreated} size="sm">
                    Finish Tutorial
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tutorial Complete Phase */}
          {tutorialPhase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center mb-6">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Tutorial Complete!</h2>
                  <p className="text-muted-foreground">
                    Congratulations! You've completed the InvoiceAI tutorial. You're now ready to start creating invoices.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={onClose} className="w-full max-w-xs">
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};