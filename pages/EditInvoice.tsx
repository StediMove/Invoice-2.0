import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { StarBorder } from '@/components/ui/star-border';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InvoicePreview } from '@/components/InvoicePreview';
import { 
  ArrowLeft, 
  Plus, 
  Trash2,
  Calendar,
  DollarSign,
  Users
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

export default function EditInvoice() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

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
    if (user && id) {
      fetchInvoiceData();
      fetchCustomers();
      fetchCompanyInfo();
      fetchPaymentMethods();
      fetchTemplates();
    }
  }, [user, id]);

  const fetchInvoiceData = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('user_invoices')
        .select(`
          *,
          invoice_templates (*),
          invoice_customers (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      const invoiceItems = JSON.parse((data.items as string) || '[]');
      
      // Set the invoice number
      setInvoiceNumber(data.invoice_number || '');
      
      setFormData({
        customer_id: data.customer_id,
        title: data.title || '',
        description: data.description || '',
        currency: data.currency || 'USD',
        tax_rate: Number(data.tax_rate) || 0,
        payment_terms: Number(data.payment_terms) || 30,
        issue_date: data.issue_date,
        due_date: data.due_date,
        notes: data.notes || '',
      });
      
      setItems(invoiceItems.length > 0 ? invoiceItems : [
        { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
      ]);
      
      // Set the customer if exists
      if (data.invoice_customers) {
        setSelectedCustomer({
          id: data.invoice_customers.id,
          name: data.invoice_customers.name,
          company_name: data.invoice_customers.company_name,
          email: data.invoice_customers.email,
          address: data.invoice_customers.address,
          city: data.invoice_customers.city,
          country: data.invoice_customers.country,
          postal_code: data.invoice_customers.postal_code,
          preferred_currency: data.invoice_customers.preferred_currency || 'USD',
          default_tax_rate: data.invoice_customers.default_tax_rate || 0,
          payment_terms: data.invoice_customers.payment_terms || 30
        });
      }
      
      // Set the associated template if exists
      if (data.template_id && data.invoice_templates) {
        setSelectedTemplate(data.invoice_templates);
      }
      
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice data',
        variant: 'destructive',
      });
      navigate('/invoices');
    } finally {
      setInitialLoading(false);
    }
  };

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

  useEffect(() => {
    if (formData.customer_id && customers.length > 0) {
      const customer = customers.find(c => c.id === formData.customer_id);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [formData.customer_id, customers]);

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
    }
  };

  const applyTemplateData = (templateData: any) => {
    // Update company info with template data
    if (templateData && companyInfo) {
      setCompanyInfo(prev => ({
        ...prev,
        name: templateData.companyName || prev?.name || 'Your Company',
        address: templateData.companyAddress || prev?.address || '123 Business Street',
        phone: templateData.companyPhone || prev?.phone,
        email: templateData.companyEmail || prev?.email,
        website: templateData.companyWebsite || prev?.website,
        taxId: templateData.taxId || prev?.taxId,
        businessLicense: templateData.businessLicense || prev?.businessLicense,
        logo_url: templateData.logoUrl || prev?.logo_url,
        primary_color: templateData.primaryColor || prev?.primary_color,
        secondary_color: templateData.secondaryColor || prev?.secondary_color,
        accent_color: templateData.accentColor || prev?.accent_color,
        text_color: templateData.textColor || prev?.text_color
      }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCustomer || !id) return;

    const { subtotal, taxAmount, total } = calculateTotals();
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_invoices')
        .update({
          customer_id: formData.customer_id,
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
          template_id: selectedTemplate?.id || null,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice updated successfully!',
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

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">Edit Invoice</h1>
          <p className="text-muted-foreground">Update your invoice details</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
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
                {loading ? 'Updating...' : 'Update Invoice'}
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
              invoiceNumber={invoiceNumber}
              companyInfo={companyInfo ? {
                name: companyInfo.company_name || companyInfo.full_name || 'Your Company',
                address: companyInfo.business_address || '123 Business Street',
                phone: companyInfo.phone,
                email: companyInfo.email,
                website: companyInfo.website,
                taxId: companyInfo.tax_id,
                logo_url: companyInfo.logo_url,
                primary_color: companyInfo.primary_color,
                secondary_color: companyInfo.secondary_color,
                accent_color: companyInfo.accent_color,
                text_color: companyInfo.text_color,
                business_email: companyInfo.business_email,
                business_phone: companyInfo.business_phone
              } : undefined}
              paymentMethods={paymentMethods}
              language={companyInfo?.preferred_language as any || 'en'}
              templateData={selectedTemplate?.template_data}
            />
          </Card>
        )}
      </motion.div>
    </div>
  );
}