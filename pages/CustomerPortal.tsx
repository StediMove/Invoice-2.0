import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ExternalLink, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CustomerPortal() {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, subscriptionEnd, subscriptionStatus, cancelAtPeriodEnd, loading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);

  // Determine display status and styling
  const getStatusDisplay = () => {
    if (!subscribed) {
      return {
        text: 'Free',
        description: 'You are currently on the free plan',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      };
    }
    
    if (subscriptionStatus === 'cancelled' || cancelAtPeriodEnd) {
      return {
        text: 'Cancelled',
        description: `Your subscription is cancelled and will end on ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : 'the billing date'}`,
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      };
    }
    
    return {
      text: 'Active',
      description: 'Your subscription is active',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
  };

  const statusDisplay = getStatusDisplay();

  const handleOpenCustomerPortal = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to access the customer portal.',
        variant: 'destructive',
      });
      return;
    }

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to open customer portal',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Portal</h1>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Current Plan: <span className="text-primary">{subscriptionTier || 'Free'}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {statusDisplay.description}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.className}`}>
                {statusDisplay.text}
              </div>
            </div>

            {subscribed && subscriptionEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {cancelAtPeriodEnd || subscriptionStatus === 'cancelled' 
                    ? `Access ends: ${new Date(subscriptionEnd).toLocaleDateString()}`
                    : `Next billing: ${new Date(subscriptionEnd).toLocaleDateString()}`
                  }
                </span>
              </div>
            )}

            {/* Warning for cancelled subscriptions */}
            {(cancelAtPeriodEnd || subscriptionStatus === 'cancelled') && subscribed && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200">Subscription Cancelled</p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      Your subscription has been cancelled but you still have access until {new Date(subscriptionEnd || '').toLocaleDateString()}. 
                      You can reactivate your subscription anytime before this date.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stripe Customer Portal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Stripe Customer Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Access your complete billing history, update payment methods, download invoices, 
              and manage your subscription through Stripe's secure customer portal.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Update payment methods</li>
                <li>• Download invoices and receipts</li>
                <li>• View billing history</li>
                <li>• Cancel or modify your subscription</li>
                <li>• Update billing address</li>
              </ul>
            </div>

            <Button 
              onClick={handleOpenCustomerPortal}
              disabled={portalLoading}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {portalLoading ? 'Opening Portal...' : 'Open Customer Portal'}
            </Button>
          </CardContent>
        </Card>

        {/* Cancellation Warning for Subscribed Users */}
        {subscribed && !cancelAtPeriodEnd && subscriptionStatus !== 'cancelled' && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you cancel your subscription, you'll lose access to unlimited AI invoice generation 
                and will be limited to 5 free generations per month. Your account will remain active 
                until the end of your current billing period ({subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : 'billing date'}).
              </p>
              <p className="text-sm font-medium">
                To cancel your subscription, please use the Stripe Customer Portal above.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Free User Upgrade Prompt */}
        {!subscribed && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Upgrade to Professional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get unlimited AI invoice generation and advanced features with our Professional plan.
              </p>
              <Button 
                onClick={() => navigate('/manage-subscription')}
                className="w-full sm:w-auto"
              >
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}