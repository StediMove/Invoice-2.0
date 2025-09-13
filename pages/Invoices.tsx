import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarBorder } from '@/components/ui/star-border';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search,
  Filter,
  Download,
  Send,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

// Typewriter component for overdue messages
const TypewriterText = ({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed + delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay, speed]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="text-red-600 text-sm font-medium">
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  status: string;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  customer_id: string;
  invoice_customers?: {
    name: string;
    company_name?: string;
  };
}

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showOverdueWarning, setShowOverdueWarning] = useState<{[key: string]: boolean}>({});
  const [hoveredInvoice, setHoveredInvoice] = useState<string | null>(null);

  // Helper function to calculate days overdue
  const getDaysOverdue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to check if invoice is overdue
  const isOverdue = (invoice: Invoice): boolean => {
    return invoice.status !== 'paid' && invoice.status !== 'cancelled' && getDaysOverdue(invoice.due_date) > 0;
  };

  // Helper function to get overdue message
  const getOverdueMessage = (dueDate: string): string => {
    const daysOverdue = getDaysOverdue(dueDate);
    if (daysOverdue === 1) {
      return "Due date is over 1 day";
    }
    return `Due date is over ${daysOverdue} days`;
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  // Auto-detect overdue invoices and trigger initial warnings
  useEffect(() => {
    const overdueInvoices = invoices.filter(isOverdue);
    const newWarnings: {[key: string]: boolean} = {};
    
    overdueInvoices.forEach(invoice => {
      newWarnings[invoice.id] = true;
      // Auto-hide initial warning after 3 seconds, then rely on hover
      setTimeout(() => {
        setShowOverdueWarning(prev => ({
          ...prev,
          [invoice.id]: false
        }));
      }, 3000);
    });
    
    setShowOverdueWarning(newWarnings);
  }, [invoices]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_invoices')
        .select(`
          *,
          invoice_customers (
            name,
            company_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const { toast } = useToast();

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_invoices')
        .update({ 
          status: newStatus,
          ...(newStatus === 'paid' ? { paid_date: new Date().toISOString().split('T')[0] } : {})
        })
        .eq('id', invoiceId);

      if (error) throw error;

      // Refresh invoices
      fetchInvoices();
      
      toast({
        title: "Success",
        description: `Invoice status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
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
        const errorText = await response.text();
        console.error('PDF generation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        // Try to parse the error response for better error messages
        let errorMessage = `Failed to generate PDF: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If parsing fails, use the raw text or status
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
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
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_customers?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'overdue' ? isOverdue(invoice) : invoice.status === statusFilter);
    
    // Date filter
    const matchesDate = dateFilter === 'all' || (() => {
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'due_today':
          return diffDays === 0;
        case 'due_this_week':
          return diffDays >= 0 && diffDays <= 7;
        case 'due_this_month':
          return diffDays >= 0 && diffDays <= 30;
        case 'overdue_filter':
          return isOverdue(invoice);
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
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
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage and track all your invoices</p>
        </div>
        
        <StarBorder>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Link>
          </Button>
        </StarBorder>
      </div>

      {/* Search and filters */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 invoice-actions">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="due_today">Due Today</SelectItem>
                  <SelectItem value="due_this_week">Due This Week</SelectItem>
                  <SelectItem value="due_this_month">Due This Month</SelectItem>
                  <SelectItem value="overdue_filter">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter summary */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {statusFilter === 'overdue' ? 'Overdue' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Badge>
            )}
            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Date: {dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            )}
            {(statusFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchTerm('');
                }}
                className="h-6 text-xs px-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Invoices list */}
      <div className="space-y-4 invoice-list">
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No invoices yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first invoice to get started with AI-powered invoicing.
            </p>
            <StarBorder>
              <Button asChild>
                <Link to="/invoices/new">
                  Create Your First Invoice
                </Link>
              </Button>
            </StarBorder>
          </Card>
        ) : (
          filteredInvoices.map((invoice, index) => {
            const overdueStatus = isOverdue(invoice);
            const daysOverdue = overdueStatus ? getDaysOverdue(invoice.due_date) : 0;
            
            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
                onMouseEnter={() => overdueStatus && setHoveredInvoice(invoice.id)}
                onMouseLeave={() => setHoveredInvoice(null)}
              >
                {/* Overdue Warning Popup - now triggered by hover */}
                <AnimatePresence>
                  {overdueStatus && (showOverdueWarning[invoice.id] || hoveredInvoice === invoice.id) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
                    >
                      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <TypewriterText 
                          text={getOverdueMessage(invoice.due_date)}
                          delay={100}
                          speed={25}
                        />
                      </div>
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-500"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card className={`p-6 backdrop-blur-sm border-border/50 transition-all duration-300 cursor-pointer ${
                  overdueStatus 
                    ? 'bg-red-50/80 border-red-200 shadow-red-100/50 hover:bg-red-100/80 hover:shadow-red-200/60 hover:border-red-300' 
                    : 'bg-card/50 hover:bg-card/80'
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          overdueStatus ? 'text-red-700' : 'text-foreground'
                        }`}>
                          {invoice.invoice_number}
                        </h3>
                        <Badge className={`${
                          overdueStatus && invoice.status !== 'paid' && invoice.status !== 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : getStatusColor(invoice.status)
                        }`}>
                          {overdueStatus && invoice.status !== 'paid' && invoice.status !== 'cancelled' 
                            ? 'Overdue' 
                            : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
                          }
                        </Badge>
                        {overdueStatus && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            className="flex items-center gap-1 text-red-600"
                          >
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">+{daysOverdue}d</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <p className={`font-medium mb-1 ${
                        overdueStatus ? 'text-red-700' : 'text-foreground'
                      }`}>
                        {invoice.title || 'Untitled Invoice'}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                        <span>
                          Customer: {invoice.invoice_customers?.company_name || invoice.invoice_customers?.name}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          Amount: {invoice.currency} {invoice.total_amount.toLocaleString()}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className={overdueStatus ? 'text-red-600 font-medium' : ''}>
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 invoice-actions">
                      <Select
                        value={invoice.status}
                        onValueChange={(value) => updateInvoiceStatus(invoice.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => downloadPDF(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
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
            );
          })
        )}
      </div>
    </div>
  );
}