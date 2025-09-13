import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Download,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  title?: string;
  status: string;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  created_at: string;
}

export default function CustomerInvoices() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && customerId) {
      fetchCustomerAndInvoices();
    }
  }, [user, customerId]);

  const fetchCustomerAndInvoices = async () => {
    try {
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('invoice_customers')
        .select('*')
        .eq('id', customerId)
        .eq('user_id', user?.id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch customer invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('user_invoices')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('user_invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const downloadPDF = async (invoice: Invoice) => {
    try {
      console.log('💾 Starting PDF download for invoice:', invoice.id);
      
      // Get the current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Make direct fetch request to handle binary PDF data
      const response = await fetch(`https://sbczhprnlejjmdoqbkwz.supabase.co/functions/v1/generate-invoice-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PDF generation failed:', errorData);
        throw new Error(`Failed to generate PDF: ${response.status}`);
      }
      
      console.log('📝 PDF generation successful, downloading...');
      
      // Get PDF as blob
      const pdfBlob = await response.blob();
      
      // Verify it's actually a PDF
      if (pdfBlob.type !== 'application/pdf' && !pdfBlob.type.includes('pdf')) {
        console.error('Response is not a PDF:', pdfBlob.type);
        const text = await pdfBlob.text();
        console.error('Response content:', text);
        throw new Error('Server did not return a valid PDF');
      }
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ PDF downloaded successfully for invoice:', invoice.invoice_number);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully with template styling",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download invoice PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {customer.name}
            </h1>
            <p className="text-muted-foreground">
              {customer.company_name && `${customer.company_name} • `}
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <Button asChild>
          <Link to={`/invoices/new?customer=${customer.id}`}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Customer Info */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-foreground">{customer.name}</p>
          </div>
          {customer.company_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company</p>
              <p className="text-foreground">{customer.company_name}</p>
            </div>
          )}
          {customer.email && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{customer.email}</p>
            </div>
          )}
          {customer.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-foreground">{customer.phone}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Invoices */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoices
        </h2>
        
        {invoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invoice for {customer.name}
            </p>
            <Button asChild>
              <Link to={`/invoices/new?customer=${customer.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {invoice.invoice_number}
                        </h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      
                      {invoice.title && (
                        <p className="text-muted-foreground mb-2">{invoice.title}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>
                          Total: <span className="font-medium text-foreground">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: invoice.currency || 'USD'
                            }).format(invoice.total_amount)}
                          </span>
                        </span>
                        <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                        <span>Created: {new Date(invoice.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => downloadPDF(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/invoices/${invoice.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this invoice?')) {
                            deleteInvoice(invoice.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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