import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getTranslation, type Language } from '@/utils/translations';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoicePreviewProps {
  title: string;
  description?: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
  customerName?: string;
  customerCompany?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  customerPostalCode?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    businessLicense?: string;
    business_license?: string; // Add snake_case version for database compatibility
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    text_color?: string;
    business_email?: string;
    business_phone?: string;
  };
  paymentMethods?: Array<{
    id: string;
    name: string;
    type: string;
    details: any;
    is_default: boolean;
  }>;
  language?: Language;
  templateData?: any;
}

export function InvoicePreview({
  title,
  description,
  currency,
  items,
  subtotal,
  taxRate,
  taxAmount,
  total,
  issueDate,
  dueDate,
  notes,
  customerName,
  customerCompany,
  customerEmail,
  customerAddress,
  customerCity,
  customerCountry,
  customerPostalCode,
  paymentMethod,
  invoiceNumber,
  companyInfo,
  paymentMethods,
  language = 'en',
  templateData
}: InvoicePreviewProps) {
  // Use customer's preferred currency if available, otherwise use the provided currency
  const displayCurrency = currency;
  const defaultPaymentMethod = paymentMethods?.find(pm => pm.is_default) || paymentMethods?.[0];
  
  const formatPaymentMethod = (method: any) => {
    if (!method) return paymentMethod || 'Payment method not specified';
    
    switch (method.type) {
      case 'card':
        return `${method.name} (**** ${method.details.lastFour || '****'})`;
      case 'bank':
        return `${method.name} (Account: ${method.details.accountNumber || 'N/A'}, Bank: ${method.details.bankName || 'N/A'}${method.details.registrationNumber ? `, Reg: ${method.details.registrationNumber}` : ''}${method.details.iban ? `, IBAN: ${method.details.iban}` : ''})`;
      case 'mobile':
        return `${method.name} (${method.details.phoneNumber || method.details.provider || 'Mobile Payment'})`;
      default:
        return method.name;
    }
  };

  // Debug business license data
  console.log('🔍 Business License Debug:', {
    templateBusinessLicense: templateData?.businessLicense,
    companyBusinessLicense: companyInfo?.businessLicense,
    companyBusiness_license: companyInfo?.business_license,
    companyInfoKeys: companyInfo ? Object.keys(companyInfo) : 'no companyInfo',
    templateDataKeys: templateData ? Object.keys(templateData) : 'no templateData'
  });

  // Apply company branding colors and template customizations
  // PRIORITY: Template data overrides company info colors
  const primaryColor = templateData?.primaryColor || companyInfo?.primary_color || '#3b82f6';
  const secondaryColor = templateData?.secondaryColor || companyInfo?.secondary_color || '#8b5cf6';
  const accentColor = templateData?.accentColor || companyInfo?.accent_color || '#06b6d4';
  const textColor = templateData?.textColor || companyInfo?.text_color || '#1f2937';
  
  // Apply font family from template
  const fontFamily = templateData?.fontFamily || 'inter';
  const fontClass = {
    'inter': 'font-sans',
    'serif': 'font-serif', 
    'mono': 'font-mono'
  }[fontFamily] || 'font-sans';
  return (
    <Card className={`p-8 bg-white dark:bg-card max-w-4xl mx-auto ${fontClass}`} style={{ color: textColor }}>
      {/* Header */}
      <div className="text-center mb-8">
        {(templateData?.logoUrl || companyInfo?.logo_url) && (
          <img 
            src={templateData?.logoUrl || companyInfo?.logo_url} 
            alt="Company Logo" 
            className="h-16 mx-auto mb-4 object-contain"
          />
        )}
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          {getTranslation(language, 'invoice')}
        </h1>
        <p className="text-muted-foreground"># {invoiceNumber || `INV-${new Date().getFullYear()}-001`}</p>
      </div>

      {/* Company and Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2" style={{ color: secondaryColor }}>
            {getTranslation(language, 'from')}
          </h3>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">{templateData?.companyName || companyInfo?.name || 'Your Company'}</p>
            <p>{templateData?.companyAddress || companyInfo?.address || '123 Business Street'}</p>
            {(templateData?.companyPhone || companyInfo?.business_phone || companyInfo?.phone) && <p>{templateData?.companyPhone || companyInfo?.business_phone || companyInfo?.phone}</p>}
            <p>{templateData?.companyEmail || companyInfo?.business_email || companyInfo?.email || 'your@company.com'}</p>
            {(templateData?.companyWebsite || companyInfo?.website) && <p>{templateData?.companyWebsite || companyInfo?.website}</p>}
            {(templateData?.taxId || companyInfo?.taxId) && <p>Tax ID: {templateData?.taxId || companyInfo?.taxId}</p>}
            {(templateData?.businessLicense || companyInfo?.businessLicense || companyInfo?.business_license) && <p>License: {templateData?.businessLicense || companyInfo?.businessLicense || companyInfo?.business_license}</p>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2" style={{ color: secondaryColor }}>
            {getTranslation(language, 'to')}
          </h3>
          <div className="text-sm text-muted-foreground">
            {customerCompany && <p className="font-medium">{customerCompany}</p>}
            {customerName && <p>{customerName}</p>}
            {customerAddress && <p>{customerAddress}</p>}
            {(customerPostalCode || customerCity) && (
              <p>{[customerPostalCode, customerCity].filter(Boolean).join(' ')}</p>
            )}
            {customerCountry && <p>{customerCountry}</p>}
            {customerEmail && <p>{customerEmail}</p>}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-sm">
            <span className="font-medium" style={{ color: accentColor }}>
              {getTranslation(language, 'issueDate')}
            </span> {new Date(issueDate).toLocaleDateString()}
          </p>
          <p className="text-sm">
            <span className="font-medium" style={{ color: accentColor }}>
              {getTranslation(language, 'dueDate')}
            </span> {new Date(dueDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium" style={{ color: accentColor }}>
              {getTranslation(language, 'currency')}
            </span> {displayCurrency}
          </p>
        </div>
      </div>

      {/* Invoice Title and Description */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {/* Line Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-medium" style={{ color: primaryColor }}>
                {getTranslation(language, 'description')}
              </th>
              <th className="text-right py-2 font-medium w-20" style={{ color: primaryColor }}>
                {getTranslation(language, 'quantity')}
              </th>
              <th className="text-right py-2 font-medium w-24" style={{ color: primaryColor }}>
                {getTranslation(language, 'rate')}
              </th>
              <th className="text-right py-2 font-medium w-24" style={{ color: primaryColor }}>
                {getTranslation(language, 'amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="py-3 text-sm text-foreground">{item.description}</td>
                <td className="py-3 text-sm text-right text-muted-foreground">{item.quantity}</td>
                <td className="py-3 text-sm text-right text-muted-foreground">{displayCurrency} {item.rate.toFixed(2)}</td>
                <td className="py-3 text-sm text-right text-foreground font-medium">{displayCurrency} {item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">
              {getTranslation(language, 'subtotal')}
            </span>
            <span className="text-sm font-medium text-foreground">{displayCurrency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">
              {getTranslation(language, 'tax')} ({taxRate.toFixed(1)}%):
            </span>
            <span className="text-sm font-medium text-foreground">{displayCurrency} {taxAmount.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between py-2">
            <span className="font-semibold text-foreground">
              {getTranslation(language, 'total')}
            </span>
            <span className="font-bold text-lg" style={{ color: primaryColor }}>
              {displayCurrency} {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      {(defaultPaymentMethod || paymentMethod) && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2" style={{ color: secondaryColor }}>
            {getTranslation(language, 'paymentMethod')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatPaymentMethod(defaultPaymentMethod)}
          </p>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div>
          <h3 className="font-semibold mb-2" style={{ color: secondaryColor }}>
            {getTranslation(language, 'notes')}
          </h3>
          <p className="text-sm text-muted-foreground">{notes}</p>
        </div>
      )}
    </Card>
  );
}