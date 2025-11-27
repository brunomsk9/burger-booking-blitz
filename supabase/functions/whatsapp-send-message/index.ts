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

    const { franchiseId, chatId, customerPhone, messageText } = await req.json();
    console.log('📤 Enviando mensagem via webhook n8n:', { franchiseId, chatId, customerPhone });

    if (!franchiseId || !customerPhone || !messageText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: franchiseId, customerPhone, messageText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get franchise webhook URL
    const { data: franchise, error: franchiseError } = await supabase
      .from('franchises')
      .select('webhook_url, company_name')
      .eq('id', franchiseId)
      .single();

    if (franchiseError || !franchise?.webhook_url) {
      console.error('❌ Webhook URL não configurado para esta franquia');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured for this franchise' }),
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
        status: 'sent'
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erro ao salvar mensagem:', saveError);
      throw saveError;
    }

    console.log('✅ Mensagem salva no banco:', savedMessage);

    // Send message via n8n webhook
    try {
      // Formato compatível com o n8n/Z-API
      const webhookPayload = {
        franchiseId: franchiseId,
        phone: phone,
        text: {
          message: messageText
        },
        chatId: formattedChatId,
        messageId: savedMessage.id
      };

      console.log('📡 Enviando para n8n:', franchise.webhook_url);
      console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));

      const webhookResponse = await fetch(franchise.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('❌ Erro ao enviar para webhook:', {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          error: errorText,
          payload: webhookPayload
        });
        
        // Update message status to failed
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'failed' })
          .eq('id', savedMessage.id);

        throw new Error(`Failed to send message via webhook: ${errorText}`);
      }

      const responseData = await webhookResponse.text();
      console.log('✅ Resposta do n8n:', responseData);

      // Update message status to sent
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'sent' })
        .eq('id', savedMessage.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: savedMessage
        }),
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
