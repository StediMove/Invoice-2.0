// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports
import { jsPDF } from 'https://cdn.skypack.dev/jspdf@2.5.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating test PDF...');
    
    // Create a simple test PDF
    const doc = new jsPDF();
    doc.text('Test PDF Generation', 20, 20);
    doc.text('This is a simple test to verify jsPDF works in Deno', 20, 30);
    doc.text('Date: ' + new Date().toISOString(), 20, 40);
    
    const pdfBuffer = doc.output('arraybuffer');
    
    console.log('Test PDF created successfully, size:', pdfBuffer.byteLength);
    
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Test PDF error:', error);
    return new Response(JSON.stringify({ 
      error: 'Test PDF generation failed',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});