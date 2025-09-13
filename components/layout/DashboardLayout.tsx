import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  CreditCard,
  Grid3X3,
  LogOut,
  Crown,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { TutorialOverlay } from '@/components/ui/tutorial-overlay';

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
}

const navigation = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: <LayoutDashboard className="text-foreground h-5 w-5 flex-shrink-0" />
  },
  { 
    label: 'Invoices', 
    href: '/invoices', 
    icon: <FileText className="text-foreground h-5 w-5 flex-shrink-0" />
  },
  { 
    label: 'Customers', 
    href: '/customers', 
    icon: <Users className="text-foreground h-5 w-5 flex-shrink-0" />
  },
  { 
    label: 'Templates', 
    href: '/templates', 
    icon: <Grid3X3 className="text-foreground h-5 w-5 flex-shrink-0" />
  },
  { 
    label: 'Payment Methods', 
    href: '/payment-methods', 
    icon: <CreditCard className="text-foreground h-5 w-5 flex-shrink-0" />
  },
  { 
    label: 'Manage Subscription', 
    href: '/manage-subscription', 
    icon: <Crown className="text-foreground h-5 w-5 flex-shrink-0" />
  },
  { 
    label: 'Settings', 
    href: '/settings', 
    icon: <Settings className="text-foreground h-5 w-5 flex-shrink-0" />
  },
];

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'This is your main dashboard where you can see an overview of your invoices, revenue, and recent activity.',
    targetElementId: 'nav-dashboard',
    position: 'right',
    page: '/dashboard',
    sections: [
      {
        title: 'Revenue Summary',
        description: 'View your total revenue, pending payments, and overdue invoices at a glance.',
        selector: '.revenue-summary'
      },
      {
        title: 'Recent Activity',
        description: 'See the latest actions and updates to your invoices and customer interactions.',
        selector: '.recent-activity'
      },
      {
        title: 'Quick Actions',
        description: 'Create new invoices, add customers, or generate reports with one click.',
        selector: '.quick-actions'
      }
    ]
  },
  {
    id: 'invoices',
    title: 'Manage Invoices',
    description: 'Create, view, and manage all your invoices. You can also generate AI-powered invoices here.',
    targetElementId: 'nav-invoices',
    position: 'right',
    page: '/invoices',
    sections: [
      {
        title: 'Invoice List',
        description: 'Browse all your invoices with filtering options by status, date, and customer.',
        selector: '.invoice-list'
      },
      {
        title: 'AI Invoice Generation',
        description: 'Create professional invoices instantly using natural language prompts.',
        selector: '.ai-invoice-generator'
      },
      {
        title: 'Invoice Actions',
        description: 'Send, edit, duplicate, or delete invoices with bulk action options.',
        selector: '.invoice-actions'
      }
    ]
  },
  {
    id: 'customers',
    title: 'Customer Management',
    description: 'Keep track of all your customers and their information in one place.',
    targetElementId: 'nav-customers',
    position: 'right',
    page: '/customers',
    sections: [
      {
        title: 'Customer Directory',
        description: 'View and search all your customers with contact information and transaction history.',
        selector: '.customer-directory'
      },
      {
        title: 'Customer Details',
        description: 'See detailed information about each customer including invoices and payment history.',
        selector: '.customer-details'
      },
      {
        title: 'Add New Customer',
        description: 'Quickly add new customers with their contact details and billing information.',
        selector: '.add-customer'
      }
    ]
  },
  {
    id: 'templates',
    title: 'Invoice Templates',
    description: 'Create and customize professional invoice templates that you can reuse for different clients.',
    targetElementId: 'nav-templates',
    position: 'right',
    page: '/templates',
    sections: [
      {
        title: 'Template Gallery',
        description: 'Browse pre-designed templates or create your own custom designs.',
        selector: '.template-gallery'
      },
      {
        title: 'Template Editor',
        description: 'Customize every aspect of your invoices with our drag-and-drop editor.',
        selector: '.template-editor'
      },
      {
        title: 'Template Management',
        description: 'Save, duplicate, or delete templates for different business needs.',
        selector: '.template-management'
      }
    ]
  },
  {
    id: 'payment-methods',
    title: 'Payment Methods',
    description: 'Set up and manage payment methods for receiving payments from your customers.',
    targetElementId: 'nav-payment-methods',
    position: 'right',
    page: '/payment-methods',
    sections: [
      {
        title: 'Payment Gateway Integration',
        description: 'Connect popular payment processors like Stripe, PayPal, and more.',
        selector: '.payment-gateways'
      },
      {
        title: 'Payment Settings',
        description: 'Configure payment preferences, currencies, and automatic payment reminders.',
        selector: '.payment-settings'
      },
      {
        title: 'Transaction History',
        description: 'Track all payments received through your integrated payment methods.',
        selector: '.transaction-history'
      }
    ]
  },
  {
    id: 'subscription',
    title: 'Subscription Management',
    description: 'Manage your subscription plan and billing information.',
    targetElementId: 'nav-subscription',
    position: 'right',
    page: '/manage-subscription',
    sections: [
      {
        title: 'Plan Overview',
        description: 'View your current plan features, usage limits, and renewal date.',
        selector: '.plan-overview'
      },
      {
        title: 'Billing Information',
        description: 'Update your payment method and billing address.',
        selector: '.billing-info'
      },
      {
        title: 'Upgrade/Downgrade',
        description: 'Switch between plans based on your business needs.',
        selector: '.plan-change'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Account Settings',
    description: 'Customize your account preferences, profile information, and other settings.',
    targetElementId: 'nav-settings',
    position: 'right',
    page: '/settings',
    sections: [
      {
        title: 'Profile Management',
        description: 'Update your personal information, company details, and contact preferences.',
        selector: '.profile-settings'
      },
      {
        title: 'Language & Country Settings',
        description: 'Set your preferred language and country which will be used for invoice generation.',
        selector: '.language-country-settings'
      },
      {
        title: 'Notification Preferences',
        description: 'Choose how and when you receive notifications about invoices and payments.',
        selector: '.notification-settings'
      }
    ]
  }
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialLanguage, setTutorialLanguage] = useState('en');
  const { user, signOut } = useAuth();
  const { subscribed, subscriptionTier } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

  const isProfessional = subscribed && subscriptionTier === 'Professional';

  // Show tutorial on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('invoiceAI-tutorial-completed');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      setTutorialOpen(true);
    }
  }, []);

  const handleStartTutorial = () => {
    setTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
  };

  const handleCompleteTutorial = () => {
    localStorage.setItem('invoiceAI-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  const handleTutorialComplete = () => {
    // This is called when the extended tutorial is fully completed
    localStorage.setItem('invoiceAI-tutorial-completed', 'true');
    setShowTutorial(false);
    setTutorialOpen(false);
  };

  const handleLanguageChange = (language: string) => {
    setTutorialLanguage(language);
    // Apply the language change immediately
    document.documentElement.lang = language;
    console.log('Tutorial language changed to:', language);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCustomerPortal = async () => {
    navigate('/customer-portal');
  };

  const Logo = () => {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
        <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium text-foreground whitespace-pre"
        >
          InvoiceAI
        </motion.span>
      </div>
    );
  };

  const LogoIcon = () => {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
        <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      </div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row bg-background w-full flex-1 mx-auto min-h-screen"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navigation.map((link, idx) => {
                // Hide Manage Subscription for Professional users
                if (link.href === '/manage-subscription' && isProfessional) {
                  return null;
                }
                
                // Add IDs for tutorial targeting
                const linkWithId = {
                  ...link,
                  id: `nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`
                };
                
                return (
                  <SidebarLink
                    key={idx}
                    link={linkWithId}
                    className={cn(
                      "hover:bg-accent rounded-md px-2 py-2",
                      location.pathname === link.href && "bg-primary/10 text-primary border border-primary/20"
                    )}
                  />
                );
              })}
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center space-x-3 px-2 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.email}
                    </p>
                    {isProfessional && (
                      <div className="flex items-center gap-1 mt-1">
                        <Crown className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          Pro
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCustomerPortal}
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground px-2 py-2 mb-2",
                !open && "justify-center px-0"
              )}
            >
              <CreditCard className="h-4 w-4" />
              {open && <span className="ml-2">Customer Portal</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartTutorial}
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground px-2 py-2 mb-2",
                !open && "justify-center px-0"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              {open && <span className="ml-2">Tutorial</span>}
            </Button>
            <ThemeToggle variant="sidebar" showLabel={open} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground px-2 py-2",
                !open && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4" />
              {open && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </SidebarBody>
      </Sidebar>
      
      {/* Tutorial Overlay */}
      <TutorialOverlay
        steps={tutorialSteps}
        isOpen={tutorialOpen}
        onClose={handleCloseTutorial}
        onComplete={handleCompleteTutorial}
        onLanguageChange={handleLanguageChange}
        onTutorialComplete={handleTutorialComplete}
      />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-screen">
        <div className="flex-1 bg-background">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center">
                <h2 className="text-xl font-semibold text-foreground">
                  {navigation.find(item => item.href === location.pathname)?.label || 'Dashboard'}
                </h2>
              </div>
              {showTutorial && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStartTutorial}
                  className="hidden md:flex"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Start Tutorial
                </Button>
              )}
            </div>
          </div>

          {/* Page content with animation */}
          <motion.main 
            className="py-8 min-h-0 flex-1 overflow-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}