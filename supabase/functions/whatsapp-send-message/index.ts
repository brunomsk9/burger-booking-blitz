import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const Z_API_URL = Deno.env.get('Z_API_URL');
const Z_API_INSTANCE_ID = Deno.env.get('Z_API_INSTANCE_ID');
const Z_API_TOKEN = Deno.env.get('Z_API_TOKEN');

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { franchiseId, chatId, customerPhone, messageText } = await req.json();
    console.log('📤 Enviando mensagem via Z-API:', { franchiseId, chatId, customerPhone });

    if (!franchiseId || !customerPhone || !messageText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: franchiseId, customerPhone, messageText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove @ if present)
    const phone = customerPhone.replace('@c.us', '');
    const formattedChatId = chatId || `${phone}@c.us`;

    // Save message to database first
    const { data: savedMessage, error: saveError } = await supabase
      .from('whatsapp_messages')
      .insert({
        franchise_id: franchiseId,
        chat_id: formattedChatId,
        customer_phone: phone,
        message_text: messageText,
        direction: 'outgoing',
        timestamp: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erro ao salvar mensagem:', saveError);
      throw saveError;
    }

    console.log('✅ Mensagem salva no banco:', savedMessage);

    // Send message via Z-API
    try {
      const zapiUrl = `${Z_API_URL}/instances/${Z_API_INSTANCE_ID}/token/${Z_API_TOKEN}/send-text`;
      
      console.log('📡 Enviando para Z-API:', zapiUrl);

      const zapiResponse = await fetch(zapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          message: messageText
        }),
      });

      const zapiData = await zapiResponse.json();
      console.log('📨 Resposta Z-API:', zapiData);

      if (!zapiResponse.ok || !zapiData.messageId) {
        console.error('❌ Erro ao enviar pela Z-API:', zapiData);
        
        // Update message status to failed
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'failed' })
          .eq('id', savedMessage.id);

        throw new Error(zapiData.message || 'Failed to send message via Z-API');
      }

      console.log('✅ Mensagem enviada pela Z-API');

      // Update message with Z-API message ID and status
      await supabase
        .from('whatsapp_messages')
        .update({ 
          status: 'sent',
          message_id: zapiData.messageId 
        })
        .eq('id', savedMessage.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: savedMessage,
          zapiMessageId: zapiData.messageId 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (zapiError) {
      console.error('❌ Erro ao chamar Z-API:', zapiError);
      
      // Update message status to failed
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'failed' })
        .eq('id', savedMessage.id);

      throw zapiError;
    }

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
