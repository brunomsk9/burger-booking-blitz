import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('📥 Webhook recebido:', JSON.stringify(payload, null, 2));

    // Extract data from n8n webhook payload
    const {
      franchiseId,
      chatId,
      customerName,
      customerPhone,
      messageText,
      messageId,
      timestamp
    } = payload;

    if (!franchiseId || !chatId || !customerPhone || !messageText) {
      console.error('❌ Dados obrigatórios faltando');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: franchiseId, chatId, customerPhone, messageText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert message into database
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        franchise_id: franchiseId,
        chat_id: chatId,
        customer_name: customerName || customerPhone,
        customer_phone: customerPhone,
        message_text: messageText,
        direction: 'incoming',
        message_id: messageId,
        timestamp: timestamp || new Date().toISOString(),
        status: 'delivered'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir mensagem:', error);
      throw error;
    }

    console.log('✅ Mensagem salva:', data);

    return new Response(
      JSON.stringify({ success: true, message: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
