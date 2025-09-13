// @ts-ignore - Deno imports
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { prompt, customerId } = await req.json();
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get customer information if provided
    let customerInfo = null;
    if (customerId) {
      const { data: customer } = await supabase
        .from('invoice_customers')
        .select('*')
        .eq('id', customerId)
        .eq('user_id', user.id)
        .maybeSingle();
      customerInfo = customer;
    }

    // Use the provided DeepSeek API key
    const deepSeekApiKey = "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";

    // Construct the AI prompt with customer context and language detection instruction
    const systemPrompt = `You are an expert invoice generator AI. Your task is to create professional invoices based on user descriptions.

LANGUAGE DETECTION AND CONSISTENCY RULES:
1. First, detect the language of the user's input text
2. ALL generated content MUST be in the SAME language as the user's input
3. Do not switch languages mid-response
4. If the user writes in Danish, respond entirely in Danish
5. If the user writes in English, respond entirely in English
6. If the user writes in German, respond entirely in German
7. If the user writes in Spanish, respond entirely in Spanish
8. Maintain language consistency across title, description, items, and notes

${customerInfo ? `Customer Information:
- Name: ${customerInfo.name}
- Company: ${customerInfo.company_name || 'N/A'}
- Email: ${customerInfo.email || 'N/A'}
- Currency: ${customerInfo.preferred_currency}
- Default Tax Rate: ${customerInfo.default_tax_rate}%
- Payment Terms: ${customerInfo.payment_terms} days
- Address: ${customerInfo.address || 'N/A'}, ${customerInfo.city || 'N/A'}, ${customerInfo.country || 'N/A'}
` : ''}

Generate invoice items based on the user's description. Return ONLY a valid JSON object with this exact structure:
{
  "title": "Invoice title in the SAME language as user input",
  "description": "Brief description of services/products in the SAME language as user input",
  "items": [
    {
      "description": "Item description in the SAME language as user input",
      "quantity": 1,
      "rate": 100.00
    }
  ],
  "notes": "Additional notes or payment instructions in the SAME language as user input"
}

Parse amounts from the description and create appropriate line items. If multiple services are mentioned, create separate items. Use the customer's preferred currency and tax rate when provided.

CRITICAL INSTRUCTIONS:
1. ALL text content MUST be in the SAME language as the user's input
2. Return ONLY valid JSON with the exact structure shown above
3. Do not include any markdown formatting, code blocks, or extra text
4. Ensure all JSON fields are properly quoted and formatted
5. Maintain absolute language consistency throughout the response
6. Double-check that all fields use the same language

User request: ${prompt}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepSeekApiKey}`,
        "HTTP-Referer": "http://localhost:8080", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "InvoiceAI", // Optional. Site title for rankings on openrouter.ai.
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
          {
            "role": "user",
            "content": systemPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if we have a valid response
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('No valid response from DeepSeek API');
    }

    const generatedText = data.choices[0].message.content;

    console.log('Generated text:', generatedText);

    // Extract JSON from the response more robustly
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON that might be wrapped in markdown code blocks
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonMatch = [null, codeBlockMatch[1]];
      } else {
        throw new Error('Could not extract JSON from AI response');
      }
    }

    const invoiceData = JSON.parse(jsonMatch[0]);

    // Validate the structure of the response
    if (!invoiceData.title || !invoiceData.description || !Array.isArray(invoiceData.items)) {
      throw new Error('Invalid invoice data structure from AI response');
    }

    // Add calculated amounts to items
    const processedItems = invoiceData.items.map((item: any) => ({
      ...item,
      amount: item.quantity * item.rate
    }));

    return new Response(JSON.stringify({
      ...invoiceData,
      items: processedItems,
      customerInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-invoice-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate invoice'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});