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
    console.log('📥 Webhook Z-API recebido:', JSON.stringify(payload, null, 2));

    // Extract data from Z-API webhook payload
    // Z-API format: { phone: "5513997162888", text: { message: "texto" }, chatId: "5513997162888@c.us", ... }
    const phone = payload.phone || payload.chatId?.replace('@c.us', '');
    const messageText = payload.text?.message || payload.message || payload.body;
    const chatId = payload.chatId || `${phone}@c.us`;
    const messageId = payload.messageId || payload.id?.id;
    const timestamp = payload.momment ? new Date(payload.momment * 1000).toISOString() : new Date().toISOString();
    const senderName = payload.senderName || payload.notifyName;

    console.log('📞 Dados extraídos:', { phone, messageText, chatId, messageId, senderName });

    if (!phone || !messageText) {
      console.error('❌ Dados obrigatórios faltando - phone ou messageText');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone, messageText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar a franquia pelo número (heroissantos instance)
    // Para simplificar, vamos usar a franquia Heróis Burger Santos por padrão
    const { data: franchises, error: franchiseError } = await supabase
      .from('franchises')
      .select('id')
      .eq('company_name', 'Heróis Burger Santos')
      .limit(1)
      .single();

    if (franchiseError || !franchises) {
      console.error('❌ Franquia não encontrada:', franchiseError);
      return new Response(
        JSON.stringify({ error: 'Franchise not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🏢 Franquia encontrada:', franchises.id);

    // Insert message into database
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        franchise_id: franchises.id,
        chat_id: chatId,
        customer_name: senderName || phone,
        customer_phone: phone,
        message_text: messageText,
        direction: 'incoming',
        message_id: messageId,
        timestamp: timestamp,
        status: 'delivered'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir mensagem:', error);
      throw error;
    }

    console.log('✅ Mensagem salva com sucesso:', data);

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
