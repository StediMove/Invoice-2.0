import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarBorder } from '@/components/ui/star-border';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search,
  Grid3X3,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { InvoicePreview } from '@/components/InvoicePreview';

interface Template {
  id: string;
  name: string;
  template_data: any;
  is_default: boolean;
  created_at: string;
}

const defaultTemplateConfigs = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, minimal design perfect for tech companies',
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-100',
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
    name: 'Classic Business',
    description: 'Traditional layout ideal for established businesses',
    preview: 'bg-gradient-to-br from-gray-50 to-slate-100',
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
    name: 'Creative Studio',
    description: 'Bold design for creative agencies and freelancers',
    preview: 'bg-gradient-to-br from-purple-50 to-pink-100',
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
    name: 'Minimalist',
    description: 'Ultra-clean design focusing on content',
    preview: 'bg-gradient-to-br from-green-50 to-emerald-100',
    templateData: {
      colorScheme: 'green',
      fontFamily: 'mono',
      primaryColor: '#10b981',
      secondaryColor: '#065f46',
      accentColor: '#059669',
      textColor: '#111827'
    }
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [searchTerm, setSearchTerm] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<any>({
    companyName: 'Your Company',
    companyAddress: '123 Business Street',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'hello@yourcompany.com',
    companyWebsite: 'www.yourcompany.com',
    taxId: 'TAX-123456',
    businessLicense: 'LIC-123456',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    textColor: '#1f2937',
    fontFamily: 'inter'
  })
  const [customizing, setCustomizing] = useState(false)
  const [defaultTemplates, setDefaultTemplates] = useState<Template[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    template_name: '',
    company_name: '',
    color_scheme: 'blue',
    font_family: 'inter',
    header_text: '',
    footer_text: '',
    logo_url: '',
    company_address: '123 Business Street',
    company_phone: '+1 (555) 123-4567',
    company_email: 'hello@yourcompany.com',
    company_website: 'www.yourcompany.com',
    tax_id: 'TAX-123456',
    business_license: 'LIC-123456',
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    accent_color: '#06b6d4',
    text_color: '#1f2937'
  })
  const [creatingTemplate, setCreatingTemplate] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchTemplates()
      initializeDefaultTemplates()
      // Initialize preview with modern template by default
      const modernTemplate = defaultTemplateConfigs.find(t => t.id === 'modern')
      if (modernTemplate) {
        applyTemplate(modernTemplate)
      }
    }
  }, [user])

  const getDefaultTemplate = () => ({
    companyName: "Your Company",
    companyAddress: "123 Business St, City, State 12345",
    companyPhone: "(555) 123-4567",
    companyEmail: "info@yourcompany.com",
    customerName: "Sample Customer",
    customerAddress: "456 Customer Ave, City, State 67890",
    invoiceNumber: "INV-001",
    issueDate: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(),
    items: [
      { description: "Sample Service", quantity: 1, rate: 100.00 },
      { description: "Additional Service", quantity: 2, rate: 50.00 }
    ],
    notes: "Thank you for your business!"
  })

  const initializeDefaultTemplates = async () => {
    try {
      // Check if default templates already exist
      const { data: existingDefaults } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('user_id', user?.id)
        .in('name', defaultTemplateConfigs.map(t => t.name))

      const existingNames = existingDefaults?.map(t => t.name) || []
      
      // Create missing default templates
      const templatesToCreate = defaultTemplateConfigs
        .filter(config => !existingNames.includes(config.name))
        .map(config => ({
          user_id: user?.id,
          name: config.name,
          template_data: {
            ...getDefaultTemplate(),
            ...config.templateData,
            description: config.description
          },
          color_scheme: config.templateData.colorScheme,
          font_family: config.templateData.fontFamily,
          is_default: true
        }))

      if (templatesToCreate.length > 0) {
        const { data, error } = await supabase
          .from('invoice_templates')
          .insert(templatesToCreate)
          .select()

        if (error) throw error
        
        // Update state with created templates
        setDefaultTemplates([...existingDefaults || [], ...data])
      } else {
        setDefaultTemplates(existingDefaults || [])
      }
    } catch (error) {
      console.error('Error initializing default templates:', error)
    }
  }

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
    } else {
      setTemplates(data || [])
    }
    setLoading(false)
  }

  const handleCreateTemplate = async () => {
    if (!templateForm.template_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      })
      return
    }
    
    setCreatingTemplate(true)
    
    try {
    
    const templateData = {
      ...previewTemplate,
      companyName: templateForm.company_name,
      companyAddress: templateForm.company_address,
      companyPhone: templateForm.company_phone,
      companyEmail: templateForm.company_email,
      companyWebsite: templateForm.company_website,
      taxId: templateForm.tax_id,
      businessLicense: templateForm.business_license,
      colorScheme: templateForm.color_scheme,
      fontFamily: templateForm.font_family,
      logoUrl: templateForm.logo_url,
      headerText: templateForm.header_text,
      footerText: templateForm.footer_text,
      primaryColor: templateForm.primary_color,
      secondaryColor: templateForm.secondary_color,
      accentColor: templateForm.accent_color,
      textColor: templateForm.text_color
    }
    
    const { data, error } = await supabase
      .from('invoice_templates')
      .insert([{
        user_id: user?.id,
        name: templateForm.template_name,
        template_data: templateData,
        color_scheme: templateForm.color_scheme,
        font_family: templateForm.font_family,
        logo_url: templateForm.logo_url,
        header_text: templateForm.header_text,
        footer_text: templateForm.footer_text
      }])
      .select()

    if (error) {
      console.error('Error creating template:', error)
      console.error('Template form data:', templateForm)
      console.error('Template data being inserted:', templateData)
      toast({
        title: "Error",
        description: `Failed to create template: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    } else {
      setTemplates([...templates, ...data])
      // Check if we're in tutorial mode and save to localStorage
      const hasSeenTutorial = localStorage.getItem('invoiceAI-tutorial-completed');
      if (!hasSeenTutorial) {
        // This will help the tutorial know that a template was created
        localStorage.setItem('invoiceAI-template-created', 'true');
      }
      // Reset form but keep the company info for next template
      setTemplateForm(prev => ({
        ...prev,
        template_name: '',
        header_text: '',
        footer_text: ''
      }))
      setCustomizing(false)
      toast({
        title: "Success",
        description: "Template created successfully",
      })
    }
    } catch (error: any) {
      console.error('Unexpected error creating template:', error)
      toast({
        title: "Error",
        description: `Failed to create template: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setCreatingTemplate(false)
    }
  }

  const handleUseTemplate = async (templateId: string, isDefault = false) => {
    try {
      let templateData
      
      if (isDefault) {
        // Find the default template configuration
        const config = defaultTemplateConfigs.find(t => t.id === templateId)
        if (config) {
          templateData = {
            ...config.templateData,
            description: config.description
          }
          
          // Store template data in localStorage for immediate use
          localStorage.setItem('selectedTemplateData', JSON.stringify(templateData))
        }
      } else {
        // Find the custom template
        const template = templates.find(t => t.id === templateId)
        if (template) {
          localStorage.setItem('selectedTemplateData', JSON.stringify(template.template_data))
        }
      }
      
      // Navigate to create invoice with template
      navigate('/invoices/new?template=' + templateId)
    } catch (error) {
      console.error('Error using template:', error)
      toast({
        title: "Error",
        description: "Failed to use template",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error", 
        description: "Failed to delete template",
        variant: "destructive",
      })
    } else {
      setTemplates(templates.filter(t => t.id !== templateId))
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    }
  }

  const handleTemplateUpdate = (field: string, value: any) => {
    setPreviewTemplate((prev: any) => ({
      ...prev,
      [field]: value
    }));
    // Don't update templateForm here as it's handled by the input onChange
  }

  const applyTemplate = (templateConfig: any) => {
    const templateData = {
      ...templateConfig.templateData,
      companyName: templateForm.company_name || 'Your Company',
      companyAddress: templateForm.company_address,
      companyPhone: templateForm.company_phone,
      companyEmail: templateForm.company_email,
      companyWebsite: templateForm.company_website,
      taxId: templateForm.tax_id,
      businessLicense: templateForm.business_license,
      logoUrl: templateForm.logo_url,
      primaryColor: templateConfig.templateData.primaryColor,
      secondaryColor: templateConfig.templateData.secondaryColor,
      accentColor: templateConfig.templateData.accentColor,
      textColor: templateConfig.templateData.textColor,
      fontFamily: templateConfig.templateData.fontFamily
    }
    
    setPreviewTemplate(templateData)
    setTemplateForm(prev => ({
      ...prev,
      color_scheme: templateConfig.templateData.colorScheme,
      font_family: templateConfig.templateData.fontFamily,
      primary_color: templateConfig.templateData.primaryColor,
      secondary_color: templateConfig.templateData.secondaryColor,
      accent_color: templateConfig.templateData.accentColor,
      text_color: templateConfig.templateData.textColor
    }))
    
    setSelectedTemplate(templateConfig.id)
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter default templates based on search term
  const filteredDefaultTemplates = defaultTemplateConfigs.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-32 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Templates</h1>
          <p className="text-muted-foreground">Choose and customize your invoice templates</p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setCustomizing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      <div className={`grid gap-6 transition-all duration-500 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Template Selection */}
        <motion.div 
          className="space-y-4"
          animate={{
            x: isFullscreen ? '-100%' : '0%',
            opacity: isFullscreen ? 0 : 1
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ display: isFullscreen ? 'none' : 'block' }}
        >
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Choose Template</h3>
            <div className="space-y-3">
              {defaultTemplateConfigs.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Template Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={templateForm.template_name}
                  onChange={(e) => {
                    setTemplateForm(prev => ({ ...prev, template_name: e.target.value }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter company name"
                  value={templateForm.company_name}
                  onChange={(e) => {
                    setTemplateForm(prev => ({ ...prev, company_name: e.target.value }));
                    handleTemplateUpdate('companyName', e.target.value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="company-logo">Company Logo URL</Label>
                <Input
                  id="company-logo"
                  placeholder="https://..."
                  value={templateForm.logo_url}
                  onChange={(e) => {
                    setTemplateForm(prev => ({ ...prev, logo_url: e.target.value }));
                    handleTemplateUpdate('logoUrl', e.target.value);
                  }}
                />
              </div>
                <div>
                  <Label htmlFor="company-address">Company Address</Label>
                  <Input
                    id="company-address"
                    placeholder="123 Business Street"
                    value={templateForm.company_address}
                    onChange={(e) => {
                      setTemplateForm(prev => ({ ...prev, company_address: e.target.value }));
                      handleTemplateUpdate('companyAddress', e.target.value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      placeholder="+1 (555) 123-4567"
                      value={templateForm.company_phone}
                      onChange={(e) => {
                        setTemplateForm(prev => ({ ...prev, company_phone: e.target.value }));
                        handleTemplateUpdate('companyPhone', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      placeholder="hello@yourcompany.com"
                      value={templateForm.company_email}
                      onChange={(e) => {
                        setTemplateForm(prev => ({ ...prev, company_email: e.target.value }));
                        handleTemplateUpdate('companyEmail', e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-website">Website</Label>
                    <Input
                      id="company-website"
                      placeholder="www.yourcompany.com"
                      value={templateForm.company_website}
                      onChange={(e) => {
                        setTemplateForm(prev => ({ ...prev, company_website: e.target.value }));
                        handleTemplateUpdate('companyWebsite', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax-id">Tax ID</Label>
                    <Input
                      id="tax-id"
                      placeholder="TAX-123456"
                      value={templateForm.tax_id}
                      onChange={(e) => {
                        setTemplateForm(prev => ({ ...prev, tax_id: e.target.value }));
                        handleTemplateUpdate('taxId', e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="business-license">Business License Number</Label>
                  <Input
                    id="business-license"
                    placeholder="LIC-123456"
                    value={templateForm.business_license}
                    onChange={(e) => {
                      setTemplateForm(prev => ({ ...prev, business_license: e.target.value }));
                      handleTemplateUpdate('businessLicense', e.target.value);
                    }}
                  />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <input
                    id="primary-color"
                    type="color"
                    value={templateForm.primary_color}
                    onChange={(e) => {
                      setTemplateForm(prev => ({ ...prev, primary_color: e.target.value }));
                      handleTemplateUpdate('primaryColor', e.target.value);
                    }}
                    className="h-10 w-full rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <input
                    id="secondary-color"
                    type="color"
                    value={templateForm.secondary_color}
                    onChange={(e) => {
                      setTemplateForm(prev => ({ ...prev, secondary_color: e.target.value }));
                      handleTemplateUpdate('secondaryColor', e.target.value);
                    }}
                    className="h-10 w-full rounded border cursor-pointer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <input
                    id="accent-color"
                    type="color"
                    value={templateForm.accent_color}
                    onChange={(e) => {
                      setTemplateForm(prev => ({ ...prev, accent_color: e.target.value }));
                      handleTemplateUpdate('accentColor', e.target.value);
                    }}
                    className="h-10 w-full rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <input
                    id="text-color"
                    type="color"
                    value={templateForm.text_color}
                    onChange={(e) => {
                      setTemplateForm(prev => ({ ...prev, text_color: e.target.value }));
                      handleTemplateUpdate('textColor', e.target.value);
                    }}
                    className="h-10 w-full rounded border cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="font-style">Font Style</Label>
                <Select 
                  value={templateForm.font_family} 
                  onValueChange={(value) => {
                    setTemplateForm(prev => ({ ...prev, font_family: value }));
                    handleTemplateUpdate('fontFamily', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Modern Sans</SelectItem>
                    <SelectItem value="serif">Classic Serif</SelectItem>
                    <SelectItem value="mono">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateTemplate} disabled={creatingTemplate}>
                {creatingTemplate ? 'Creating...' : 'Save Template'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Live Preview */}
        <motion.div 
          className={`transition-all duration-500 ${isFullscreen ? 'col-span-1' : 'lg:col-span-2'}`}
          animate={{
            scale: isFullscreen ? 1.02 : 1,
            x: isFullscreen ? '0%' : '0%'
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className={`p-6 ${isFullscreen ? 'h-screen overflow-auto' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Live Preview</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleFullscreenToggle}>
                  <Eye className="h-4 w-4 mr-2" />
                  {isFullscreen ? 'Exit Fullscreen' : 'Full Preview'}
                </Button>
                {isFullscreen && (
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                    ✕
                  </Button>
                )}
              </div>
            </div>
            
            <div className={`border rounded-lg p-4 bg-muted/10 overflow-auto ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'max-h-[600px]'}`}>
              <InvoicePreview 
                title="Professional Services Invoice"
                description="Website development and design services"
                currency="USD"
                items={[
                  { description: 'Website Development', quantity: 1, rate: 2500, amount: 2500 },
                  { description: 'UI/UX Design', quantity: 1, rate: 1500, amount: 1500 }
                ]}
                subtotal={4000}
                taxRate={10}
                taxAmount={400}
                total={4400}
                issueDate={new Date().toISOString().split('T')[0]}
                dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                customerName="John Doe"
                customerCompany="Acme Corp"
                invoiceNumber="INV-202509-001"
                companyInfo={{
                  name: previewTemplate?.companyName || templateForm.company_name || 'Your Company',
                  address: previewTemplate?.companyAddress || '123 Business Street',
                  phone: previewTemplate?.companyPhone || '+1 (555) 123-4567',
                  email: previewTemplate?.companyEmail || 'hello@yourcompany.com',
                  website: previewTemplate?.companyWebsite || 'www.yourcompany.com',
                  taxId: previewTemplate?.taxId || 'TAX-123456',
                  businessLicense: previewTemplate?.businessLicense || templateForm.business_license || 'LIC-123456',
                  logo_url: previewTemplate?.logoUrl || templateForm.logo_url,
                  primary_color: previewTemplate?.primaryColor || '#3b82f6',
                  secondary_color: previewTemplate?.secondaryColor || '#8b5cf6', 
                  accent_color: previewTemplate?.accentColor || '#06b6d4',
                  text_color: previewTemplate?.textColor || '#1f2937'
                }}
                notes="Thank you for your business!"
                language="en"
                templateData={previewTemplate}
               />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </Card>

      {/* Default Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Default Templates</h2>
          {searchTerm && (
            <span className="text-sm text-muted-foreground">
              ({filteredDefaultTemplates.length} of {defaultTemplateConfigs.length} templates)
            </span>
          )}
        </div>
        
        {filteredDefaultTemplates.length === 0 && searchTerm ? (
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Grid3X3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No default templates found
            </h3>
            <p className="text-muted-foreground">
              No default templates match your search for "{searchTerm}"
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDefaultTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 group">
                {/* Template Preview */}
                <div className={`h-32 ${template.preview} relative flex items-center justify-center`}>
                  <div className="absolute inset-4 bg-white/80 rounded shadow-sm flex flex-col p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-800 rounded w-16"></div>
                        <div className="h-1 bg-gray-400 rounded w-12"></div>
                      </div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="h-1 bg-gray-300 rounded w-full"></div>
                      <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <div className="h-2 bg-gray-600 rounded w-8"></div>
                    </div>
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        applyTemplate(template)
                        setSelectedTemplate(template.id)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        // Copy default template data into form
                        setTemplateForm({
                          template_name: template.name + ' Copy',
                          company_name: templateForm.company_name || '',
                          company_address: templateForm.company_address || '123 Business Street',
                          company_phone: templateForm.company_phone || '+1 (555) 123-4567',
                          company_email: templateForm.company_email || 'hello@yourcompany.com',
                          company_website: templateForm.company_website || 'www.yourcompany.com',
                          tax_id: templateForm.tax_id || 'TAX-123456',
                          business_license: templateForm.business_license || 'LIC-123456',
                          logo_url: templateForm.logo_url || '',
                          primary_color: template.templateData.primaryColor || '#3b82f6',
                          secondary_color: template.templateData.secondaryColor || '#8b5cf6',
                          accent_color: template.templateData.accentColor || '#06b6d4',
                          text_color: template.templateData.textColor || '#1f2937',
                          font_family: template.templateData.fontFamily || 'inter',
                          color_scheme: template.templateData.colorScheme || 'blue',
                          header_text: '',
                          footer_text: ''
                        });
                        // Apply the template for preview
                        applyTemplate(template);
                        setCustomizing(true);
                        toast({
                          title: "Template Copied",
                          description: "Template copied for customization. Update the name to save as new template.",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUseTemplate(template.id, true)}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </div>

      {/* Custom Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">My Templates</h2>
          </div>
          {templates.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 
                `${filteredTemplates.length} of ${templates.length} custom templates` : 
                `${templates.length} custom templates`
              }
            </p>
          )}
        </div>
        
        {filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Grid3X3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? `No templates found for "${searchTerm}"` : 'No custom templates yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search term or create a new template.' : 'Create your first custom template to match your brand perfectly.'}
            </p>
            <StarBorder>
              <Button onClick={() => searchTerm ? setSearchTerm('') : setCustomizing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {searchTerm ? 'Clear Search' : 'Create Your First Template'}
              </Button>
            </StarBorder>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 group">
                  {/* Template Preview */}
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/20 relative flex items-center justify-center">
                    <div className="absolute inset-4 bg-white/80 rounded shadow-sm flex flex-col p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-800 rounded w-16"></div>
                          <div className="h-1 bg-gray-400 rounded w-12"></div>
                        </div>
                        <div className="h-6 w-6 bg-primary/30 rounded"></div>
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="h-1 bg-gray-300 rounded w-full"></div>
                        <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <div className="h-2 bg-primary/60 rounded w-8"></div>
                      </div>
                    </div>
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          // Apply custom template data for preview
                          if (template.template_data) {
                            setPreviewTemplate(template.template_data);
                            setTemplateForm(prev => ({
                              ...prev,
                              template_name: template.name,
                              company_name: template.template_data.companyName || prev.company_name,
                              company_address: template.template_data.companyAddress || prev.company_address,
                              company_phone: template.template_data.companyPhone || prev.company_phone,
                              company_email: template.template_data.companyEmail || prev.company_email,
                              company_website: template.template_data.companyWebsite || prev.company_website,
                              tax_id: template.template_data.taxId || prev.tax_id,
                              business_license: template.template_data.businessLicense || prev.business_license,
                              logo_url: template.template_data.logoUrl || prev.logo_url,
                              primary_color: template.template_data.primaryColor || prev.primary_color,
                              secondary_color: template.template_data.secondaryColor || prev.secondary_color,
                              accent_color: template.template_data.accentColor || prev.accent_color,
                              text_color: template.template_data.textColor || prev.text_color,
                              font_family: template.template_data.fontFamily || prev.font_family,
                              color_scheme: template.template_data.colorScheme || prev.color_scheme
                            }));
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          // Load template data into form for editing
                          if (template.template_data) {
                            setTemplateForm({
                              template_name: template.name,
                              company_name: template.template_data.companyName || '',
                              company_address: template.template_data.companyAddress || '123 Business Street',
                              company_phone: template.template_data.companyPhone || '+1 (555) 123-4567',
                              company_email: template.template_data.companyEmail || 'hello@yourcompany.com',
                              company_website: template.template_data.companyWebsite || 'www.yourcompany.com',
                              tax_id: template.template_data.taxId || 'TAX-123456',
                              business_license: template.template_data.businessLicense || 'LIC-123456',
                              logo_url: template.template_data.logoUrl || '',
                              primary_color: template.template_data.primaryColor || '#3b82f6',
                              secondary_color: template.template_data.secondaryColor || '#8b5cf6',
                              accent_color: template.template_data.accentColor || '#06b6d4',
                              text_color: template.template_data.textColor || '#1f2937',
                              font_family: template.template_data.fontFamily || 'inter',
                              color_scheme: template.template_data.colorScheme || 'blue',
                              header_text: template.template_data.headerText || '',
                              footer_text: template.template_data.footerText || ''
                            });
                            setPreviewTemplate(template.template_data);
                            setCustomizing(true);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          // Copy template data into form with new name
                          if (template.template_data) {
                            setTemplateForm({
                              template_name: template.name + ' Copy',
                              company_name: template.template_data.companyName || '',
                              company_address: template.template_data.companyAddress || '123 Business Street',
                              company_phone: template.template_data.companyPhone || '+1 (555) 123-4567',
                              company_email: template.template_data.companyEmail || 'hello@yourcompany.com',
                              company_website: template.template_data.companyWebsite || 'www.yourcompany.com',
                              tax_id: template.template_data.taxId || 'TAX-123456',
                              business_license: template.template_data.businessLicense || 'LIC-123456',
                              logo_url: template.template_data.logoUrl || '',
                              primary_color: template.template_data.primaryColor || '#3b82f6',
                              secondary_color: template.template_data.secondaryColor || '#8b5cf6',
                              accent_color: template.template_data.accentColor || '#06b6d4',
                              text_color: template.template_data.textColor || '#1f2937',
                              font_family: template.template_data.fontFamily || 'inter',
                              color_scheme: template.template_data.colorScheme || 'blue',
                              header_text: template.template_data.headerText || '',
                              footer_text: template.template_data.footerText || ''
                            });
                            setPreviewTemplate(template.template_data);
                            setCustomizing(true);
                            toast({
                              title: "Template Copied",
                              description: "Template copied for editing. Update the name to save as new template.",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                       <Button 
                         size="sm" 
                         variant="secondary" 
                         className="text-red-600 hover:text-red-700"
                         onClick={() => handleDeleteTemplate(template.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      {template.is_default && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant={template.is_default ? "default" : "secondary"} className="text-xs">
                        {template.is_default ? 'Default' : 'Custom'}
                      </Badge>
                       <Button
                         size="sm"
                         variant="secondary"
                         onClick={() => handleUseTemplate(template.id, false)}
                       >
                         Use Template
                       </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}