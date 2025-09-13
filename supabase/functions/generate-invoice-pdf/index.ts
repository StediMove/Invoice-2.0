// @ts-ignore - Deno imports
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Try a simple, working PDF approach
// @ts-ignore - Deno imports
import { jsPDF } from 'https://cdn.skypack.dev/jspdf@2.5.1';

// Translation utility
const translations = {
  en: {
    invoice: 'INVOICE',
    from: 'From',
    to: 'To',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    currency: 'Currency',
    description: 'Description',
    quantity: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    paymentMethod: 'Payment Method',
    notes: 'Notes',
    paymentTerms: 'Payment Terms'
  },
  da: {
    invoice: 'FAKTURA',
    from: 'Fra',
    to: 'Til',
    issueDate: 'Udstedelsesdato',
    dueDate: 'Forfaldsdato',
    currency: 'Valuta',
    description: 'Beskrivelse',
    quantity: 'Antal',
    rate: 'Pris',
    amount: 'Beløb',
    subtotal: 'Subtotal',
    tax: 'Moms',
    total: 'Total',
    paymentMethod: 'Betalingsmetode',
    notes: 'Noter',
    paymentTerms: 'Betalingsbetingelser'
  },
  de: {
    invoice: 'RECHNUNG',
    from: 'Von',
    to: 'An',
    issueDate: 'Rechnungsdatum',
    dueDate: 'Fälligkeitsdatum',
    currency: 'Währung',
    description: 'Beschreibung',
    quantity: 'Menge',
    rate: 'Preis',
    amount: 'Betrag',
    subtotal: 'Zwischensumme',
    tax: 'Steuer',
    total: 'Gesamt',
    paymentMethod: 'Zahlungsmethode',
    notes: 'Notizen',
    paymentTerms: 'Zahlungsbedingungen'
  },
  fr: {
    invoice: 'FACTURE',
    from: 'De',
    to: 'À',
    issueDate: 'Date d\'émission',
    dueDate: 'Date d\'échéance',
    currency: 'Devise',
    description: 'Description',
    quantity: 'Qté',
    rate: 'Taux',
    amount: 'Montant',
    subtotal: 'Sous-total',
    tax: 'Taxe',
    total: 'Total',
    paymentMethod: 'Mode de paiement',
    notes: 'Notes',
    paymentTerms: 'Conditions de paiement'
  },
  es: {
    invoice: 'FACTURA',
    from: 'De',
    to: 'Para',
    issueDate: 'Fecha de emisión',
    dueDate: 'Fecha de vencimiento',
    currency: 'Moneda',
    description: 'Descripción',
    quantity: 'Cant.',
    rate: 'Precio',
    amount: 'Importe',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    total: 'Total',
    paymentMethod: 'Método de pago',
    notes: 'Notas',
    paymentTerms: 'Términos de pago'
  }
};

const getTranslation = (language: string, key: string) => {
  return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || 
         translations.en[key as keyof typeof translations.en] || key;
};

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
  
  console.log('Content-based language detection in PDF generation:', { text, languageScores, detectedLanguage });
  
  return detectedLanguage;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore - Deno.env access
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore - Deno.env access
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get invoice data with related information including template
    const { data: invoice, error: invoiceError } = await supabase
      .from('user_invoices')
      .select(`
        *,
        invoice_customers (*),
        invoice_templates (*)
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice error:', invoiceError);
      throw new Error('Invoice not found');
    }

    console.log('Raw invoice data from DB:', {
      id: invoice.id,
      template_id: invoice.template_id, 
      invoice_templates: invoice.invoice_templates,
      user_id: invoice.user_id,
      customer_id: invoice.customer_id
    });

    console.log('Invoice data:', { 
      id: invoice.id, 
      template_id: invoice.template_id,
      hasTemplateJoined: !!invoice.invoice_templates,
      templateData: invoice.invoice_templates?.template_data,
      invoiceCustomer: invoice.invoice_customers?.name || 'No customer',
      invoiceTitle: invoice.title
    });

    // Get company info from profiles - but we will NOT use colors from here
    const { data: companyInfo } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    console.log('🏢 Company info from profiles (colors should be ignored):', {
      hasCompanyInfo: !!companyInfo,
      hasOldColors: !!(companyInfo?.primary_color || companyInfo?.secondary_color),
      profileColors: {
        primary: companyInfo?.primary_color,
        secondary: companyInfo?.secondary_color,
        accent: companyInfo?.accent_color,
        text: companyInfo?.text_color
      }
    });

    // Get payment methods
    const { data: paymentMethods } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    const defaultPaymentMethod = paymentMethods?.find(pm => pm.is_default) || paymentMethods?.[0];
    
    const formatPaymentMethod = (method: any) => {
      if (!method) return 'Payment method not specified';
      
      switch (method.type) {
        case 'card':
          return `${method.name} (**** ${method.details.lastFour || '****'})`;
        case 'bank':
          const bankDetails: string[] = [];
          if (method.details.bankName) bankDetails.push(`Bank: ${method.details.bankName}`);
          if (method.details.registrationNumber && method.details.accountNumber) {
            bankDetails.push(`Registration Number: ${method.details.registrationNumber}`);
            bankDetails.push(`Account Number: ${method.details.accountNumber}`);
          }
          if (method.details.iban) bankDetails.push(`IBAN: ${method.details.iban}`);
          return `${method.name}${bankDetails.length > 0 ? ` - ${bankDetails.join(', ')}` : ''}`;
        case 'mobile':
          return `${method.name} (${method.details.provider || 'Mobile Payment'})`;
        default:
          return method.name;
      }
    };

    // Parse items
    const items = JSON.parse(invoice.items || '[]');
    
    // Detect language from the AI-generated content instead of using company preferred language
    const detectedLanguage = detectLanguageFromContent(
      invoice.title || 
      invoice.description || 
      (items.length > 0 ? items[0].description : '') || 
      'Invoice'
    );
    const language = detectedLanguage;
    
    // CRITICAL: Only use template colors - no fallback to profile colors per specifications
    // Template branding must take absolute priority
    let templateData: any = null;
    if (invoice.template_id && invoice.invoice_templates) {
      templateData = invoice.invoice_templates.template_data;
      console.log('✓ Using linked template data:', {
        templateId: invoice.template_id,
        hasData: !!templateData,
        primaryColor: templateData?.primaryColor,
        companyName: templateData?.companyName
      });
    } else if (invoice.template_id) {
      // Template ID exists but join failed, try direct query
      console.log('⚠ Template ID exists but join failed, trying direct query for template:', invoice.template_id);
      const { data: templateResult, error: templateError } = await supabase
        .from('invoice_templates')
        .select('template_data')
        .eq('id', invoice.template_id)
        .single();
      
      if (templateResult && !templateError) {
        templateData = templateResult.template_data;
        console.log('✓ Retrieved template data via direct query:', {
          templateId: invoice.template_id,
          hasData: !!templateData,
          primaryColor: templateData?.primaryColor
        });
      } else {
        console.error('✗ Failed to retrieve template:', templateError);
      }
    } else {
      console.log('ℹ No template linked to invoice');
    }
    
    // Use template colors and data exclusively - no fallback to profile colors since branding moved to templates
    const primaryColor = templateData?.primaryColor || '#3b82f6';
    const secondaryColor = templateData?.secondaryColor || '#8b5cf6';
    const accentColor = templateData?.accentColor || '#06b6d4';
    const textColor = templateData?.textColor || '#1f2937';
    const fontFamily = templateData?.fontFamily || 'Arial';
    
    // Get template company info - prioritize template data over profile data
    const companyName = templateData?.companyName || companyInfo?.company_name || companyInfo?.full_name || 'Your Company';
    const companyAddress = templateData?.companyAddress || companyInfo?.business_address || '123 Business Street';
    const companyPhone = templateData?.companyPhone || companyInfo?.phone;
    const companyEmail = templateData?.companyEmail || companyInfo?.email || 'your@company.com';
    const companyWebsite = templateData?.companyWebsite || companyInfo?.website;
    const companyTaxId = templateData?.taxId || companyInfo?.tax_id;
    const companyBusinessLicense = templateData?.businessLicense || companyInfo?.business_license;
    const logoUrl = templateData?.logoUrl || companyInfo?.logo_url;
    
    // 🔍 DEBUG: Business License Data Flow
    console.log('🏢 Business License Debug in PDF Generation:', {
      templateBusinessLicense: templateData?.businessLicense,
      companyBusinessLicense: companyInfo?.business_license,
      finalBusinessLicense: companyBusinessLicense,
      templateDataKeys: templateData ? Object.keys(templateData) : 'no templateData',
      companyInfoKeys: companyInfo ? Object.keys(companyInfo) : 'no companyInfo',
      hasTemplateData: !!templateData,
      hasCompanyInfo: !!companyInfo
    });
    
    console.log('Applied template styling:', { 
      primaryColor, 
      secondaryColor, 
      accentColor, 
      textColor, 
      fontFamily,
      templateDataExists: !!templateData,
      templateId: invoice.template_id,
      companyName,
      logoUrl,
      businessLicense: companyBusinessLicense
    });

    // Create PDF directly using jsPDF with enhanced error handling
    console.log('Creating jsPDF instance...');
    let doc;
    try {
      doc = new jsPDF();
      console.log('✓ jsPDF instance created successfully');
      
    } catch (pdfError) {
      console.error('✗ Failed to create jsPDF instance:', pdfError);
      throw new Error(`PDF library initialization failed: ${pdfError.message}`);
    }
    
    // Set font based on template
    const fontName = fontFamily === 'serif' ? 'times' : fontFamily === 'mono' ? 'courier' : 'helvetica';
    doc.setFont(fontName);
    
    // Helper function to convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);
    const accentRgb = hexToRgb(accentColor);
    const textRgb = hexToRgb(textColor);
    
    let yPosition = 20;
    
    // Header section with logo and title
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(24);
    doc.text(getTranslation(language, 'invoice'), 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.text(`# ${invoice.invoice_number}`, 105, yPosition, { align: 'center' });
    yPosition += 25;
    
    // Company and customer information
    doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    doc.setFontSize(14);
    doc.text(getTranslation(language, 'from') + ':', 20, yPosition);
    doc.text(getTranslation(language, 'to') + ':', 120, yPosition);
    yPosition += 8;
    
    // Company info (left column)
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    doc.setFontSize(10);
    doc.text(companyName, 20, yPosition);
    doc.text(invoice.invoice_customers?.company_name || invoice.invoice_customers?.name || '', 120, yPosition);
    yPosition += 5;
    
    // Company address
    doc.text(companyAddress, 20, yPosition);
    // Customer address
    if (invoice.invoice_customers?.address) {
      doc.text(invoice.invoice_customers.address, 120, yPosition);
    }
    yPosition += 5;
    
    // Company phone
    if (companyPhone) {
      doc.text(`Phone: ${companyPhone}`, 20, yPosition);
    }
    // Customer city and postal code
    if (invoice.invoice_customers?.city || invoice.invoice_customers?.postal_code) {
      const cityPostal = [];
      if (invoice.invoice_customers?.postal_code) cityPostal.push(invoice.invoice_customers.postal_code);
      if (invoice.invoice_customers?.city) cityPostal.push(invoice.invoice_customers.city);
      if (cityPostal.length > 0) {
        doc.text(cityPostal.join(' '), 120, yPosition);
      }
    }
    yPosition += 5;
    
    // Company email
    doc.text(companyEmail, 20, yPosition);
    // Customer country
    if (invoice.invoice_customers?.country) {
      doc.text(invoice.invoice_customers.country, 120, yPosition);
    }
    yPosition += 5;
    
    // Company website and customer email
    if (companyWebsite) {
      doc.text(companyWebsite, 20, yPosition);
    }
    if (invoice.invoice_customers?.email) {
      doc.text(invoice.invoice_customers.email, 120, yPosition);
    }
    yPosition += 5;
    
    // Company tax ID
    if (companyTaxId) {
      doc.text(`Tax ID: ${companyTaxId}`, 20, yPosition);
      yPosition += 5;
    }
    
    // Company business license
    console.log('📝 About to render business license:', {
      companyBusinessLicense,
      willRender: !!companyBusinessLicense,
      currentYPosition: yPosition
    });
    if (companyBusinessLicense) {
      doc.text(`License: ${companyBusinessLicense}`, 20, yPosition);
      console.log('✅ Business license rendered in PDF:', companyBusinessLicense);
      yPosition += 5;
    } else {
      console.log('❌ Business license NOT rendered - no data available');
    }
    yPosition += 15;
    
    // Invoice details
    doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
    doc.setFontSize(10);
    doc.text(`${getTranslation(language, 'issueDate')}: ${new Date(invoice.issue_date).toLocaleDateString()}`, 20, yPosition);
    doc.text(`${getTranslation(language, 'currency')}: ${invoice.currency}`, 120, yPosition);
    yPosition += 5;
    
    doc.text(`${getTranslation(language, 'dueDate')}: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, yPosition);
    doc.text(`${getTranslation(language, 'paymentTerms')}: Net ${invoice.payment_terms} days`, 120, yPosition);
    yPosition += 15;
    
    // Invoice title and description
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    doc.setFontSize(14);
    doc.text(invoice.title, 20, yPosition);
    yPosition += 8;
    
    if (invoice.description) {
      doc.setFontSize(10);
      doc.text(invoice.description, 20, yPosition);
      yPosition += 8;
    }
    yPosition += 5;
    
    // Items table header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(10);
    doc.text(getTranslation(language, 'description'), 22, yPosition);
    doc.text(getTranslation(language, 'quantity'), 120, yPosition);
    doc.text(getTranslation(language, 'rate'), 140, yPosition);
    doc.text(getTranslation(language, 'amount'), 170, yPosition);
    yPosition += 8;
    
    // Items
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    items.forEach((item: any) => {
      doc.text(item.description, 22, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`${invoice.currency} ${item.rate.toFixed(2)}`, 140, yPosition);
      doc.text(`${invoice.currency} ${item.amount.toFixed(2)}`, 170, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Totals section
    const totalsX = 140;
    doc.text(`${getTranslation(language, 'subtotal')}:`, totalsX, yPosition);
    doc.text(`${invoice.currency} ${Number(invoice.subtotal).toFixed(2)}`, 170, yPosition);
    yPosition += 6;
    
    doc.text(`${getTranslation(language, 'tax')} (${Number(invoice.tax_rate).toFixed(1)}%):`, totalsX, yPosition);
    doc.text(`${invoice.currency} ${Number(invoice.tax_amount).toFixed(2)}`, 170, yPosition);
    yPosition += 8;
    
    // Total with emphasis
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setFontSize(12);
    doc.text(`${getTranslation(language, 'total')}:`, totalsX, yPosition);
    doc.text(`${invoice.currency} ${Number(invoice.total_amount).toFixed(2)}`, 170, yPosition);
    
    // Draw line above total
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.line(totalsX, yPosition - 3, 185, yPosition - 3);
    yPosition += 15;
    
    // Payment method
    if (defaultPaymentMethod) {
      doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      doc.setFontSize(12);
      doc.text(`${getTranslation(language, 'paymentMethod')}:`, 20, yPosition);
      yPosition += 6;
      
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.setFontSize(10);
      doc.text(formatPaymentMethod(defaultPaymentMethod), 20, yPosition);
      yPosition += 10;
    }
    
    // Notes
    if (invoice.notes) {
      doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      doc.setFontSize(12);
      doc.text(`${getTranslation(language, 'notes')}:`, 20, yPosition);
      yPosition += 6;
      
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.setFontSize(10);
      doc.text(invoice.notes, 20, yPosition);
    }
    
    // Generate PDF buffer with enhanced error handling
    console.log('Generating PDF buffer...');
    let pdfBuffer;
    try {
      pdfBuffer = doc.output('arraybuffer');
      console.log('✓ PDF buffer generated successfully:', {
        type: typeof pdfBuffer,
        size: pdfBuffer.byteLength,
        isArrayBuffer: pdfBuffer instanceof ArrayBuffer
      });
    } catch (outputError) {
      console.error('✗ Failed to generate PDF buffer:', outputError);
      throw new Error(`PDF output generation failed: ${outputError.message}`);
    }
    
    console.log('✓ PDF generated successfully with template styling:', {
      template_applied: !!templateData,
      template_id: invoice.template_id,
      colors: { primaryColor, secondaryColor, accentColor, textColor },
      font: fontFamily,
      invoice_number: invoice.invoice_number,
      buffer_size: pdfBuffer.byteLength
    });
    
    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      throw new Error('Generated PDF buffer is empty');
    }
    
    // Return PDF as binary response
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in generate-invoice-pdf function:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    // Return detailed error information for debugging
    const errorResponse = {
      error: 'PDF generation failed',
      message: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});