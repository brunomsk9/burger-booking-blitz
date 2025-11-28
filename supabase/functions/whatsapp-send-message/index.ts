import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 whatsapp-send-message iniciado');
  console.log('📋 Método:', req.method);
  console.log('📋 Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo OPTIONS com CORS');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2));
    
    const { franchiseId, chatId, customerPhone, messageText } = body;
    console.log('📤 Enviando mensagem via webhook n8n:', { franchiseId, chatId, customerPhone, messageText: messageText?.substring(0, 50) + '...' });

    if (!franchiseId || !customerPhone || !messageText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: franchiseId, customerPhone, messageText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get franchise Z-API credentials
    const { data: franchise, error: franchiseError } = await supabase
      .from('franchises')
      .select('zapi_instance_id, zapi_token, zapi_client_token, company_name')
      .eq('id', franchiseId)
      .single();

    if (franchiseError || !franchise?.zapi_instance_id || !franchise?.zapi_token || !franchise?.zapi_client_token) {
      console.error('❌ Credenciais Z-API não configuradas para esta franquia');
      return new Response(
        JSON.stringify({ error: 'Z-API credentials not configured for this franchise' }),
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

    // Send message via Z-API
    try {
      // Construir URL da Z-API
      const zapiUrl = `https://api.z-api.io/instances/${franchise.zapi_instance_id}/token/${franchise.zapi_token}/send-text`;
      
      // Payload para Z-API
      const zapiPayload = {
        phone: phone,
        message: messageText
      };

      console.log('📡 Enviando para Z-API:', zapiUrl);
      console.log('📦 Payload Z-API:', JSON.stringify(zapiPayload, null, 2));

      const zapiResponse = await fetch(zapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': franchise.zapi_client_token,
        },
        body: JSON.stringify(zapiPayload),
      });

      console.log('📬 Status da resposta Z-API:', zapiResponse.status);
      console.log('📬 Headers da resposta:', Object.fromEntries(zapiResponse.headers.entries()));

      const responseData = await zapiResponse.json();
      console.log('📬 Resposta Z-API:', JSON.stringify(responseData, null, 2));

      if (!zapiResponse.ok) {
        console.error('❌ Erro ao enviar via Z-API:', {
          status: zapiResponse.status,
          statusText: zapiResponse.statusText,
          error: responseData,
          payload: zapiPayload
        });
        
        // Update message status to failed
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'failed' })
          .eq('id', savedMessage.id);

        throw new Error(`Failed to send message via Z-API: ${JSON.stringify(responseData)}`);
      }

      console.log('✅ Mensagem enviada com sucesso via Z-API');

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
