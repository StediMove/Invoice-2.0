import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarBorder } from '@/components/ui/star-border';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/ui/job-card';
import { 
  Plus, 
  Search,
  Filter,
  Building,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  address?: string;
  city?: string;
  country?: string;
  preferred_currency: string;
  default_tax_rate: number;
  payment_terms: number;
  created_at: string;
}

export default function Customers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoice_customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    // Implementation for delete functionality
    console.log('Delete customer:', id);
  };

  const handleViewInvoices = (id: string) => {
    navigate(`/customers/${id}/invoices`);
  };

  const handleCreateInvoice = (id: string) => {
    navigate(`/invoices/new?customer=${id}`);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        
        <StarBorder>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/customers/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </Button>
        </StarBorder>
      </div>

      {/* Search and filters */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Customers grid */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No customers yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first customer to start creating invoices.
            </p>
            <StarBorder>
              <Button asChild>
                <Link to="/customers/new">
                  Add Your First Customer
                </Link>
              </Button>
            </StarBorder>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <JobCard
                  title={customer.name}
                  company={customer.company_name || customer.name}
                  rate={customer.preferred_currency}
                  location={`${customer.city || ''}${customer.city && customer.country ? ', ' : ''}${customer.country || ''}`}
                  type={customer.phone || ''}
                  experience={`${customer.payment_terms}d terms`}
                  customerId={customer.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewInvoices={handleViewInvoices}
                  onCreateInvoice={handleCreateInvoice}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}