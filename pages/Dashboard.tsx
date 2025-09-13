import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Card } from '@/components/ui/card';
import GlassCard from '@/components/ui/glass-card';
import { StarBorder } from '@/components/ui/star-border';
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalInvoices: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    paidInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch invoices
      const { data: invoices } = await supabase
        .from('user_invoices')
        .select('*')
        .eq('user_id', user.id);

      // Fetch customers
      const { data: customers } = await supabase
        .from('invoice_customers')
        .select('*')
        .eq('user_id', user.id);

      const totalInvoices = invoices?.length || 0;
      const totalCustomers = customers?.length || 0;
      const totalRevenue = invoices?.reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount.toString()) || 0), 0) || 0;
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
      const pendingInvoices = invoices?.filter(inv => ['draft', 'sent'].includes(inv.status)).length || 0;
      const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue').length || 0;

      setStats({
        totalInvoices,
        totalCustomers,
        totalRevenue,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices.toString(),
      icon: FileText,
      change: '+8',
      changeType: 'positive' as const,
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      title: 'Overdue',
      value: stats.overdueInvoices.toString(),
      icon: AlertCircle,
      change: stats.overdueInvoices > 0 ? 'Needs attention' : 'All clear',
      changeType: stats.overdueInvoices > 0 ? 'negative' as const : 'positive' as const,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="revenue-summary"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your invoices today.
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap gap-4 items-center quick-actions"
      >
        <StarBorder>
          <Link to="/invoices/new">
            <InteractiveHoverButton text="Create Invoice" className="w-auto px-6 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
            </InteractiveHoverButton>
          </Link>
        </StarBorder>
        
        <StarBorder>
          <Link to="/customers/new">
            <InteractiveHoverButton text="Add Customer" className="w-auto px-6">
              <Users className="h-4 w-4 mr-2" />
            </InteractiveHoverButton>
          </Link>
        </StarBorder>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 revenue-summary"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 recent-activity"
      >
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Invoices
          </h3>
          <div className="space-y-3">
            {stats.totalInvoices === 0 ? (
              <p className="text-muted-foreground text-sm">
                No invoices yet. Create your first invoice to get started!
              </p>
            ) : (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {stats.totalInvoices} invoices created
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.paidInvoices} paid, {stats.pendingInvoices} pending
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/invoices">View all</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            AI Invoice Assistant
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ready to create your next invoice? Just describe what you need and I'll help you build it.
            </p>
            <StarBorder>
              <Button className="w-full" asChild>
                <Link to="/invoices/new">
                  Try AI Invoice Generation
                </Link>
              </Button>
            </StarBorder>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}