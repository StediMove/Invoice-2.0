import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  Star, 
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  type: string;
  details: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const paymentTypeIcons = {
  card: CreditCard,
  bank: Building,
  mobile: Smartphone,
};

const paymentTypeColors = {
  card: "bg-blue-50 text-blue-600 border-blue-200",
  bank: "bg-green-50 text-green-600 border-green-200", 
  mobile: "bg-purple-50 text-purple-600 border-purple-200",
};

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: '',
    type: 'card',
    details: {} as any
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } else {
      setPaymentMethods(data || []);
    }
    setLoading(false);
  };

  const setAsDefault = async (methodId: string) => {
    // First remove default from all methods
    const { error: updateError } = await supabase
      .from('user_payment_methods')
      .update({ is_default: false })
      .eq('user_id', user?.id);

    if (updateError) {
      console.error('Error updating payment methods:', updateError);
      return;
    }

    // Set the selected method as default
    const { error } = await supabase
      .from('user_payment_methods')
      .update({ is_default: true })
      .eq('id', methodId);

    if (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to set default payment method",
        variant: "destructive",
      });
    } else {
      fetchPaymentMethods();
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    const { error } = await supabase
      .from('user_payment_methods')
      .delete()
      .eq('id', methodId);

    if (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    } else {
      fetchPaymentMethods();
      toast({
        title: "Success",
        description: "Payment method deleted",
      });
    }
  };

  const addPaymentMethod = async () => {
    if (!newMethod.name || !newMethod.type) return;

    const isFirstMethod = paymentMethods.length === 0;

    const { data, error } = await supabase
      .from('user_payment_methods')
      .insert([{
        user_id: user?.id,
        name: newMethod.name,
        type: newMethod.type,
        details: newMethod.details,
        is_default: isFirstMethod
      }])
      .select();

    if (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    } else {
      fetchPaymentMethods();
      setNewMethod({ name: '', type: 'card', details: {} });
      setIsAddingMethod(false);
      toast({
        title: "Success",
        description: "Payment method added",
      });
    }
  };

  const renderPaymentDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return (
          <div className="text-sm text-muted-foreground">
            <p>**** **** **** {method.details.lastFour || '****'}</p>
            <p>Expires: {method.details.expiryMonth || 'MM'}/{method.details.expiryYear || 'YY'}</p>
          </div>
        );
      case 'bank':
        return (
          <div className="text-sm text-muted-foreground">
            <p>Bank: {method.details.bankName || 'Not specified'}</p>
            {method.details.registrationNumber && method.details.accountNumber && (
              <p>Reg: {method.details.registrationNumber} | Konto: {method.details.accountNumber}</p>
            )}
            {method.details.iban && (
              <p>IBAN: {method.details.iban}</p>
            )}
          </div>
        );
      case 'mobile':
        return (
          <div className="text-sm text-muted-foreground">
            <p>Number: {method.details.phoneNumber || 'Not specified'}</p>
            <p>Provider: {method.details.provider || 'Not specified'}</p>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">No details available</p>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment methods for invoices</p>
        </div>
        
        <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="method-name">Method Name</Label>
                <Input
                  id="method-name"
                  placeholder="e.g., Business Visa Card"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="method-type">Type</Label>
                <Select value={newMethod.type} onValueChange={(value) => setNewMethod(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMethod.type === 'card' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="card-number">Last 4 Digits</Label>
                    <Input
                      id="card-number"
                      placeholder="1234"
                      maxLength={4}
                      value={newMethod.details.lastFour || ''}
                      onChange={(e) => setNewMethod(prev => ({
                        ...prev,
                        details: { ...prev.details, lastFour: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry-month">Expiry Month</Label>
                      <Input
                        id="expiry-month"
                        placeholder="MM"
                        maxLength={2}
                        value={newMethod.details.expiryMonth || ''}
                        onChange={(e) => setNewMethod(prev => ({
                          ...prev,
                          details: { ...prev.details, expiryMonth: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry-year">Expiry Year</Label>
                      <Input
                        id="expiry-year"
                        placeholder="YY"
                        maxLength={2}
                        value={newMethod.details.expiryYear || ''}
                        onChange={(e) => setNewMethod(prev => ({
                          ...prev,
                          details: { ...prev.details, expiryYear: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {newMethod.type === 'bank' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input
                        id="bank-name"
                        placeholder="e.g., Danske Bank, Nordea"
                        value={newMethod.details.bankName || ''}
                        onChange={(e) => setNewMethod(prev => ({
                          ...prev,
                          details: { ...prev.details, bankName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number">Account Number (Konto Nr.)</Label>
                      <Input
                        id="account-number"
                        placeholder="e.g., 1234567890"
                        value={newMethod.details.accountNumber || ''}
                        onChange={(e) => setNewMethod(prev => ({
                          ...prev,
                          details: { ...prev.details, accountNumber: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registration-number">Registration Number (Reg Nr.)</Label>
                      <Input
                        id="registration-number"
                        placeholder="e.g., 4180"
                        value={newMethod.details.registrationNumber || ''}
                        onChange={(e) => setNewMethod(prev => ({
                          ...prev,
                          details: { ...prev.details, registrationNumber: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iban">IBAN (Optional)</Label>
                      <Input
                        id="iban"
                        placeholder="e.g., DK5000400440116243"
                        value={newMethod.details.iban || ''}
                        onChange={(e) => setNewMethod(prev => ({
                          ...prev,
                          details: { ...prev.details, iban: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {newMethod.type === 'mobile' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      placeholder="+1234567890"
                      value={newMethod.details.phoneNumber || ''}
                      onChange={(e) => setNewMethod(prev => ({
                        ...prev,
                        details: { ...prev.details, phoneNumber: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      placeholder="e.g., PayPal, Apple Pay"
                      value={newMethod.details.provider || ''}
                      onChange={(e) => setNewMethod(prev => ({
                        ...prev,
                        details: { ...prev.details, provider: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <InteractiveHoverButton 
                  text="Cancel" 
                  className="w-auto px-6" 
                  onClick={() => setIsAddingMethod(false)}
                />
                <InteractiveHoverButton 
                  text="Add Method" 
                  className="w-auto px-6" 
                  onClick={addPaymentMethod}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Payment Methods</h3>
          <p className="text-muted-foreground mb-6">
            Add your payment methods to include them on invoices
          </p>
          <InteractiveHoverButton 
            className="w-auto px-6 gap-2" 
            onClick={() => setIsAddingMethod(true)}
          >
            <Plus className="w-4 h-4" />
            Add Your First Payment Method
          </InteractiveHoverButton>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method, index) => {
            const Icon = paymentTypeIcons[method.type as keyof typeof paymentTypeIcons] || CreditCard;
            const colorClass = paymentTypeColors[method.type as keyof typeof paymentTypeColors] || paymentTypeColors.card;
            
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 transition-all hover:shadow-md ${method.is_default ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg border ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{method.name}</h3>
                          {method.is_default && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              <Star className="w-3 h-3 fill-current" />
                              Default
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{method.type} Payment</p>
                        {renderPaymentDetails(method)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(method.id)}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePaymentMethod(method.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {paymentMethods.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center cursor-pointer hover:shadow-md transition-all"
                onClick={() => setIsAddingMethod(true)}>
            <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold">Add Card</h3>
            <p className="text-sm text-muted-foreground">Credit or Debit Card</p>
          </Card>
          
          <Card className="p-6 text-center cursor-pointer hover:shadow-md transition-all"
                onClick={() => {
                  setNewMethod(prev => ({ ...prev, type: 'bank' }));
                  setIsAddingMethod(true);
                }}>
            <Building className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold">Bank Transfer</h3>
            <p className="text-sm text-muted-foreground">Direct bank payment</p>
          </Card>
          
          <Card className="p-6 text-center cursor-pointer hover:shadow-md transition-all"
                onClick={() => {
                  setNewMethod(prev => ({ ...prev, type: 'mobile' }));
                  setIsAddingMethod(true);
                }}>
            <Smartphone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold">Mobile Payment</h3>
            <p className="text-sm text-muted-foreground">PayPal, Apple Pay, etc.</p>
          </Card>
        </div>
      )}
    </div>
  );
}