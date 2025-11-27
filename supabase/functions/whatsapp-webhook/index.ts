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
    console.log('📥 Webhook n8n recebido:', JSON.stringify(payload, null, 2));

    // Extract data from n8n payload (que recebeu da Z-API)
    const franchiseId = payload.franchiseId;
    const phone = payload.phone || payload.customerPhone || payload.chatId?.replace('@c.us', '');
    const messageText = payload.messageText || payload.text?.message || payload.message || payload.body;
    const chatId = payload.chatId || `${phone}@c.us`;
    const messageId = payload.messageId || payload.id?.id;
    
    // Convert timestamp properly
    let timestamp: string;
    if (payload.timestamp) {
      timestamp = payload.timestamp;
    } else if (payload.momment) {
      // momment vem como string em milissegundos da Z-API
      const mommentMs = parseInt(String(payload.momment), 10);
      if (!isNaN(mommentMs) && mommentMs > 0) {
        timestamp = new Date(mommentMs).toISOString();
      } else {
        timestamp = new Date().toISOString();
      }
    } else {
      timestamp = new Date().toISOString();
    }
    
    const senderName = payload.customerName || payload.senderName || payload.notifyName;
    
    // Detectar se a mensagem é do agente automático
    // Mensagens do agente podem ter: fromMe=true, isAgent=true, ou vir com direction='outgoing'
    const isAgentMessage = payload.fromMe === true || 
                          payload.isAgent === true || 
                          payload.direction === 'outgoing' ||
                          payload.source === 'agent' ||
                          payload.type === 'agent_message';

    console.log('📞 Dados extraídos:', { 
      franchiseId, 
      phone, 
      messageText, 
      chatId, 
      messageId, 
      senderName,
      isAgentMessage 
    });

    if (!franchiseId || !phone || !messageText) {
      console.error('❌ Dados obrigatórios faltando - franchiseId, phone ou messageText');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: franchiseId, phone, messageText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se a franquia existe
    const { data: franchise, error: franchiseError } = await supabase
      .from('franchises')
      .select('id, company_name')
      .eq('id', franchiseId)
      .single();

    if (franchiseError || !franchise) {
      console.error('❌ Franquia não encontrada:', franchiseError);
      return new Response(
        JSON.stringify({ error: 'Franchise not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🏢 Franquia encontrada:', franchise.company_name);

    // Insert message into database
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        franchise_id: franchiseId,
        chat_id: chatId,
        customer_name: senderName || phone,
        customer_phone: phone,
        message_text: messageText,
        direction: isAgentMessage ? 'outgoing' : 'incoming',
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
