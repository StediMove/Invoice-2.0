// Send reset code via email
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

interface WebhookPayload {
  email: string;
  code: string;
}

serve(async (req) => {
  try {
    const { email, code }: WebhookPayload = await req.json();
    
    console.log('Sending reset code email to:', email);
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Send email with the reset code
    const { error } = await supabase.auth.admin.sendSMS({
      phone: '', // We're not using SMS
      email: email,
      message: `Your password reset code is: ${code}. This code will expire in 30 minutes.`
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Reset code email sent successfully to:', email);
    
    return new Response(JSON.stringify({ message: 'Reset code email sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in send-reset-code function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});