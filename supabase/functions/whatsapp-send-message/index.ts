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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { franchiseId, chatId, customerPhone, messageText } = await req.json();
    console.log('📤 Enviando mensagem:', { franchiseId, chatId, customerPhone });

    if (!franchiseId || !chatId || !customerPhone || !messageText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get franchise webhook URL
    const { data: franchise, error: franchiseError } = await supabase
      .from('franchises')
      .select('webhook_url, name')
      .eq('id', franchiseId)
      .single();

    if (franchiseError || !franchise?.webhook_url) {
      console.error('❌ Webhook URL não configurado para esta franquia');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured for this franchise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save message to database first
    const { data: savedMessage, error: saveError } = await supabase
      .from('whatsapp_messages')
      .insert({
        franchise_id: franchiseId,
        chat_id: chatId,
        customer_phone: customerPhone,
        message_text: messageText,
        direction: 'outgoing',
        timestamp: new Date().toISOString(),
        status: 'sent'
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erro ao salvar mensagem:', saveError);
      throw saveError;
    }

    console.log('✅ Mensagem salva no banco:', savedMessage);

    // Send message to n8n webhook
    try {
      const webhookResponse = await fetch(franchise.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          chatId,
          customerPhone,
          messageText,
          franchiseName: franchise.name,
          messageId: savedMessage.id
        }),
      });

      if (!webhookResponse.ok) {
        console.error('❌ Erro ao enviar para webhook:', await webhookResponse.text());
        
        // Update message status to failed
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'failed' })
          .eq('id', savedMessage.id);

        throw new Error('Failed to send message via webhook');
      }

      console.log('✅ Mensagem enviada para n8n');

      // Update message status to delivered
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'delivered' })
        .eq('id', savedMessage.id);

      return new Response(
        JSON.stringify({ success: true, message: savedMessage }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (webhookError) {
      console.error('❌ Erro ao chamar webhook:', webhookError);
      
      // Update message status to failed
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'failed' })
        .eq('id', savedMessage.id);

      throw webhookError;
    }

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
