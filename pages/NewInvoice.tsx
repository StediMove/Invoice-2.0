import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGenerationLimits } from '@/hooks/useGenerationLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { StarBorder } from '@/components/ui/star-border';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InvoicePreview } from '@/components/InvoicePreview';
import { AI_Prompt } from '@/components/ui/animated-ai-input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  preferred_currency: string;
  default_tax_rate: number;
  payment_terms: number;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Add language detection function based on content
const detectLanguageFromContent = (text: string): 'en' | 'da' | 'de' | 'fr' | 'es' => {
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Define language-specific keywords
  const languageKeywords = {
    da: [
      'faktura', 'dansk', 'danmark', 'dkk', 'krone', 'kroner', 
      'bilvask', 'service', 'tjeneste', 'betaling', 'moms', 'fra', 'til'
    ],
    de: [
      'rechnung', 'deutsch', 'deutschland', 'eur', 'euro', 
      'webdesign', 'dienstleistung', 'service', 'zahlung', 'mwst', 'von', 'an'
    ],
    fr: [
      'facture', 'français', 'france', 'eur', 'euro', 
      'service', 'paiement', 'tva', 'de', 'à'
    ],
    es: [
      'factura', 'español', 'españa', 'eur', 'euro', 
      'servicio', 'consultoría', 'pago', 'iva', 'de', 'para'
    ],
    en: [
      'invoice', 'english', 'usa', 'usd', 'dollar', 
      'service', 'payment', 'tax', 'from', 'to'
    ]
  };
  
  // Count matches for each language
  const languageScores = {
    da: 0,
    de: 0,
    fr: 0,
    es: 0,
    en: 0
  };
  
  // Count keyword matches for each language
  Object.entries(languageKeywords).forEach(([lang, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        languageScores[lang as keyof typeof languageScores] += 1;
      }
    });
  });
  
  // Find the language with the highest score
  let detectedLanguage: 'en' | 'da' | 'de' | 'fr' | 'es' = 'en'; // Default to English
  let highestScore = 0;
  
  Object.entries(languageScores).forEach(([lang, score]) => {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = lang as 'en' | 'da' | 'de' | 'fr' | 'es';
    }
  });
  
  // If no keywords matched, try to detect based on common language patterns
  if (highestScore === 0) {
    // Simple heuristic based on character patterns
    if (/[æøå]/.test(text)) {
      detectedLanguage = 'da';
    } else if (/[äöü]/.test(text)) {
      detectedLanguage = 'de';
    } else if (/[ñ]/.test(text)) {
      detectedLanguage = 'es';
    } else if (/[ç]/.test(text)) {
      detectedLanguage = 'fr';
    }
  }
  
  console.log('Content-based language detection:', { text, languageScores, detectedLanguage });
  
  return detectedLanguage;
};

export default function NewInvoice() {
  const { user } = useAuth();
  const { subscribed, subscriptionTier } = useSubscription();
  const { canGenerate, remainingGenerations, recordGeneration } = useGenerationLimits();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [invoiceLanguage, setInvoiceLanguage] = useState<'en' | 'da' | 'de' | 'fr' | 'es'>('en');
  const [showTextShimmer, setShowTextShimmer] = useState(false);

  const isProfessional = subscribed && subscriptionTier === 'Professional';

  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    currency: 'USD',
    tax_rate: 0,
    payment_terms: 30,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchCompanyInfo();
      fetchPaymentMethods();
      fetchTemplates();
    }
  }, [user]);

  useEffect(() => {
    const customerId = searchParams.get('customer');
    const templateId = searchParams.get('template');
    
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setFormData(prev => ({
          ...prev,
          customer_id: customer.id,
          currency: customer.preferred_currency,
          tax_rate: customer.default_tax_rate,
          payment_terms: customer.payment_terms,
        }));
        calculateDueDate(customer.payment_terms);
      }
    }
    
    if (templateId) {
      handleTemplateFromURL(templateId);
    }
  }, [searchParams, customers, templates]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoice_customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchCompanyInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setCompanyInfo(data);
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateFromURL = async (templateId: string) => {
    try {
      // First check if it's a stored template data from localStorage
      const storedTemplateData = localStorage.getItem('selectedTemplateData');
      if (storedTemplateData) {
        const templateData = JSON.parse(storedTemplateData);
        applyTemplateData(templateData);
        localStorage.removeItem('selectedTemplateData'); // Clean up
        return;
      }
      
      // Look for template in database
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        if (template.template_data) {
          applyTemplateData(template.template_data);
        }
      } else {
        // Check if it's a default template ID
        const defaultTemplateConfigs = [
          {
            id: 'modern',
            templateData: {
              colorScheme: 'blue',
              fontFamily: 'inter',
              primaryColor: '#3b82f6',
              secondaryColor: '#8b5cf6',
              accentColor: '#06b6d4',
              textColor: '#1f2937'
            }
          },
          {
            id: 'classic',
            templateData: {
              colorScheme: 'gray',
              fontFamily: 'serif',
              primaryColor: '#374151',
              secondaryColor: '#6b7280',
              accentColor: '#9ca3af',
              textColor: '#111827'
            }
          },
          {
            id: 'creative',
            templateData: {
              colorScheme: 'purple',
              fontFamily: 'inter',
              primaryColor: '#8b5cf6',
              secondaryColor: '#ec4899',
              accentColor: '#f59e0b',
              textColor: '#1f2937'
            }
          },
          {
            id: 'minimalist',
            templateData: {
              colorScheme: 'green',
              fontFamily: 'mono',
              primaryColor: '#10b981',
              secondaryColor: '#065f46',
              accentColor: '#059669',
              textColor: '#111827'
            }
          }
        ];
        
        const defaultConfig = defaultTemplateConfigs.find(c => c.id === templateId);
        if (defaultConfig) {
          const mockTemplate = {
            id: templateId,
            name: defaultConfig.id.charAt(0).toUpperCase() + defaultConfig.id.slice(1) + ' Template',
            template_data: defaultConfig.templateData
          };
          setSelectedTemplate(mockTemplate);
          applyTemplateData(defaultConfig.templateData);
        }
      }
    } catch (error) {
      console.error('Error applying template from URL:', error);
    }
  };
  
  const applyTemplateData = (templateData: any) => {
    // Update company info with template data
    if (templateData) {
      setCompanyInfo(prev => ({
        ...prev,
        name: templateData.companyName || prev?.name || 'Your Company',
        address: templateData.companyAddress || prev?.address || '123 Business Street',
        phone: templateData.companyPhone || prev?.phone,
        email: templateData.companyEmail || prev?.email,
        website: templateData.companyWebsite || prev?.website,
        taxId: templateData.taxId || prev?.taxId,
        logo_url: templateData.logoUrl || prev?.logo_url,
        primary_color: templateData.primaryColor || prev?.primary_color,
        secondary_color: templateData.secondaryColor || prev?.secondary_color,
        accent_color: templateData.accentColor || prev?.accent_color,
        text_color: templateData.textColor || prev?.text_color
      }));
    }
  };

  const calculateDueDate = (paymentTerms: number) => {
    const issueDate = new Date(formData.issue_date);
    const dueDate = new Date(issueDate.getTime() + (paymentTerms * 24 * 60 * 60 * 1000));
    setFormData(prev => ({
      ...prev,
      due_date: dueDate.toISOString().split('T')[0]
    }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData(prev => ({
        ...prev,
        customer_id: customer.id,
        currency: customer.preferred_currency,
        tax_rate: customer.default_tax_rate,
        payment_terms: customer.payment_terms,
      }));
      calculateDueDate(customer.payment_terms);
    }
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (formData.tax_rate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description for your invoice.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to use AI generation.',
        variant: 'destructive',
      });
      return;
    }

    // Check generation limits
    if (!canGenerate) {
      toast({
        title: 'Generation Limit Reached',
        description: isProfessional 
          ? 'Unable to generate at this time. Please try again later.'
          : `You've reached your free limit of 5 invoices per month. Upgrade to Professional for unlimited AI-generated invoices.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setShowTextShimmer(true); // Show the TextShimmer component

    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-ai', {
        body: {
          prompt: aiPrompt,
          customerId: selectedCustomer?.id || null,
        }
      });

      if (error) throw error;

      // Record the successful generation
      const recordSuccess = await recordGeneration();
      if (!recordSuccess) {
        console.warn('Failed to record generation usage');
      }

      // Detect language from the generated title (first few words should be enough)
      const detectedLanguage = detectLanguageFromContent(data.title || data.description || '');
      setInvoiceLanguage(detectedLanguage);

      // Set the generated data
      const generatedItems: InvoiceItem[] = data.items.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }));

      setItems(generatedItems);
      setFormData(prev => ({
        ...prev,
        title: data.title,
        description: data.description,
        notes: data.notes || prev.notes
      }));

      setIsAiMode(false);
      setShowTextShimmer(false); // Hide the TextShimmer component

      toast({
        title: 'Success',
        description: 'Invoice generated using AI!',
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      setShowTextShimmer(false); // Hide the TextShimmer component on error
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate invoice with AI',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCustomer) return;

    const { subtotal, taxAmount, total } = calculateTotals();
    
    // Debug logging for template saving
    console.log('💾 Saving invoice with template:', {
      selectedTemplate: selectedTemplate,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      hasTemplateData: !!selectedTemplate?.template_data
    });
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_invoices')
        .insert({
          user_id: user.id,
          customer_id: formData.customer_id,
          invoice_number: generateInvoiceNumber(),
          title: formData.title,
          description: formData.description,
          currency: formData.currency,
          subtotal: subtotal,
          tax_rate: formData.tax_rate,
          tax_amount: taxAmount,
          total_amount: total,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          payment_terms: formData.payment_terms,
          notes: formData.notes,
          items: JSON.stringify(items),
          status: 'draft',
          template_id: selectedTemplate?.id || null,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice created successfully!',
      });

      navigate('/invoices');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/invoices')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Invoice</h1>
          <p className="text-muted-foreground">Generate professional invoices with AI</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* AI Generation */}
        {isAiMode && (
          <Card className="p-6 ai-invoice-generator">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">AI Invoice Generator</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {!isProfessional && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {remainingGenerations} of 5 free generations remaining
                    </span>
                    {remainingGenerations <= 2 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => navigate('/manage-subscription')}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Upgrade
                      </Button>
                    )}
                  </>
                )}
                {isProfessional && (
                  <span className="flex items-center gap-1 text-primary">
                    <Crown className="h-3 w-3" />
                    Unlimited generations
                  </span>
                )}
              </div>
            </div>
            
            {showTextShimmer ? (
              <div className="flex flex-col items-center justify-center py-12">
                <TextShimmer 
                  className="text-2xl font-bold mb-4" 
                  duration={1.5}
                >
                  Generating your invoice...
                </TextShimmer>
                <p className="text-muted-foreground text-center mt-4">
                  Our AI is working hard to create your professional invoice
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Describe your invoice</Label>
                    <p className="text-sm text-muted-foreground">
                      Write in any language - the AI will automatically detect and respond in the same language!
                    </p>
                  </div>
                  
                  <AI_Prompt
                    value={aiPrompt}
                    onChange={setAiPrompt}
                    onSubmit={handleAiGeneration}
                    customers={customers}
                    templates={templates}
                    selectedCustomer={selectedCustomer}
                    selectedTemplate={selectedTemplate}
                    onCustomerChange={(customer) => {
                      setSelectedCustomer(customer);
                      if (customer) {
                        setFormData(prev => ({
                          ...prev,
                          customer_id: customer.id,
                          currency: customer.preferred_currency,
                          tax_rate: customer.default_tax_rate,
                          payment_terms: customer.payment_terms,
                        }));
                        calculateDueDate(customer.payment_terms);
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          customer_id: '',
                        }));
                      }
                    }}
                    onTemplateChange={(template) => {
                      setSelectedTemplate(template);
                      if (template?.template_data) {
                        applyTemplateData(template.template_data);
                      }
                    }}
                    disabled={!canGenerate}
                    loading={loading}
                    placeholder="Example: Invoice TechCorp for website redesign project, $2,500, 20% tax, due in 2 weeks

Or in Danish: Faktura for bilvask service, 500 DKK, 25% moms
Or in German: Rechnung für Webdesign, €1,200, 19% MwSt
Or in Spanish: Factura para servicio de consultoría, $800, 16% IVA"
                  />
                  
                  <div className="flex gap-4">
                    <InteractiveHoverButton
                      text="Create Manually"
                      onClick={() => setIsAiMode(false)}
                      className="px-6 border bg-background hover:bg-muted"
                    />
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Customer Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={handleCustomerChange}
                  required
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name ? `${customer.company_name} (${customer.name})` : customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {customers.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No customers found</p>
                  <Button variant="outline" asChild>
                    <a href="/customers/new">Add Your First Customer</a>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Template Selection */}
          {templates.length > 0 && (
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Invoice Template</h2>
              </div>
              
              <div className="space-y-2">
                <Label>Select Template</Label>
                <Select
                  value={selectedTemplate?.id || ''}
                  onValueChange={(value) => {
                    const template = templates.find(t => t.id === value);
                    console.log('🎨 Template selected:', {
                      value,
                      template,
                      templateData: template?.template_data
                    });
                    setSelectedTemplate(template);
                    if (template?.template_data) {
                      applyTemplateData(template.template_data);
                    }
                  }}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )}

          {/* Invoice Details */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Invoice Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Invoice Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                    <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                    <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                    <SelectItem value="PLN">PLN - Polish Złoty</SelectItem>
                    <SelectItem value="CZK">CZK - Czech Koruna</SelectItem>
                    <SelectItem value="HUF">HUF - Hungarian Forint</SelectItem>
                    <SelectItem value="RON">RON - Romanian Leu</SelectItem>
                    <SelectItem value="BGN">BGN - Bulgarian Lev</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="bg-background/50 border-border/50"
              />
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Line Items</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-background/30 rounded-lg border border-border/30">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Service or product description"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label>Amount</Label>
                      <div className="h-10 px-3 py-2 bg-muted/50 rounded-md border border-border/50 flex items-center">
                        {formData.currency} {item.amount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-700 h-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formData.currency} {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tax:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                      className="w-20 h-8 text-sm bg-background/50 border-border/50"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                  <span className="font-medium">{formData.currency} {taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                  <span>Total:</span>
                  <span>{formData.currency} {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="bg-background/50 border-border/50"
                placeholder="Payment instructions, terms, or other notes..."
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </Button>
            <StarBorder>
              <Button
                type="submit"
                disabled={loading || !formData.customer_id || !formData.title}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </StarBorder>
          </div>
        </form>
        
        {/* Live Preview */}
        {formData.title && formData.customer_id && (
          <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/30">
            <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Preview</h2>
            <InvoicePreview
              title={formData.title}
              description={formData.description}
              currency={formData.currency}
              items={items}
              subtotal={subtotal}
              taxRate={formData.tax_rate}
              taxAmount={taxAmount}
              total={total}
              issueDate={formData.issue_date}
              dueDate={formData.due_date}
              notes={formData.notes}
              customerName={selectedCustomer?.name}
              customerCompany={selectedCustomer?.company_name}
              customerEmail={selectedCustomer?.email}
              customerAddress={selectedCustomer?.address}
              customerCity={selectedCustomer?.city}
              customerCountry={selectedCustomer?.country}
              customerPostalCode={selectedCustomer?.postal_code}
              invoiceNumber={`INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`}
              companyInfo={{
                name: selectedTemplate?.template_data?.companyName || companyInfo?.company_name || companyInfo?.full_name || 'Your Company',
                address: selectedTemplate?.template_data?.companyAddress || companyInfo?.business_address || '123 Business Street',
                phone: selectedTemplate?.template_data?.companyPhone || companyInfo?.phone,
                email: selectedTemplate?.template_data?.companyEmail || companyInfo?.email,
                website: selectedTemplate?.template_data?.companyWebsite || companyInfo?.website,
                taxId: selectedTemplate?.template_data?.taxId || companyInfo?.tax_id,
                businessLicense: selectedTemplate?.template_data?.businessLicense || companyInfo?.business_license,
                logo_url: selectedTemplate?.template_data?.logoUrl || companyInfo?.logo_url,
                primary_color: selectedTemplate?.template_data?.primaryColor || companyInfo?.primary_color || '#3b82f6',
                secondary_color: selectedTemplate?.template_data?.secondaryColor || companyInfo?.secondary_color || '#8b5cf6',
                accent_color: selectedTemplate?.template_data?.accentColor || companyInfo?.accent_color || '#06b6d4',
                text_color: selectedTemplate?.template_data?.textColor || companyInfo?.text_color || '#1f2937',
                business_email: companyInfo?.business_email,
                business_phone: companyInfo?.business_phone
              }}
              paymentMethods={paymentMethods}
              language={invoiceLanguage} // Use the detected language instead of company preferred language
              templateData={selectedTemplate?.template_data}
            />
          </Card>
        )}
      </motion.div>
    </div>
  );
}