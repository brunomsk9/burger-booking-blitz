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

    // Verificar se há corpo na requisição
    const contentType = req.headers.get('content-type');
    console.log('📨 Content-Type:', contentType);
    
    let payload;
    try {
      const text = await req.text();
      console.log('📄 Raw body:', text);
      
      if (!text || text.trim() === '') {
        console.error('❌ Corpo da requisição vazio');
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      payload = JSON.parse(text);
      console.log('📥 Webhook n8n recebido:', JSON.stringify(payload, null, 2));
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON',
          details: parseError.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract data from n8n payload (que recebeu da Z-API)
    const franchiseId = payload.franchiseId;
    const phone = payload.phone;
    
    // Extrair messageText de várias formas possíveis
    // 1. payload.messageText - quando vem direto da nossa API/n8n ao enviar mensagem
    // 2. payload.text?.message - quando vem da Z-API (mensagens recebidas)
    // 3. payload.message - alternativa
    // 4. payload.text - se for string direto
    const messageText = payload.messageText || payload.text?.message || payload.message || 
                       (typeof payload.text === 'string' ? payload.text : null);
    
    // n8n pode enviar como chatId ou chatLid, dependendo da configuração
    // chatLid vem direto da Z-API, então tem prioridade
    const chatId = payload.chatLid || payload.chatId || payload.chat_id;
    const messageId = payload.messageId;
    
    // Mapear status da Z-API para valores aceitos pelo banco (sent, delivered, read, failed)
    const statusMapping: Record<string, string> = {
      'SENT': 'sent',
      'RECEIVED': 'sent', // Mensagens recebidas também são consideradas "sent"
      'DELIVERED': 'delivered',
      'READ': 'read',
      'FAILED': 'failed'
    };
    const rawStatus = payload.status?.toUpperCase() || 'SENT';
    const status = statusMapping[rawStatus] || 'sent';
    
    console.log('🔍 Valores extraídos:', {
      franchiseId,
      phone,
      messageText,
      chatId,
      messageId,
      rawStatus,
      status
    });
    
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
    
    const senderName = payload.senderName || payload.chatName;
    
    // Detectar se a mensagem é do agente (fromMe=true na Z-API OU fromApi=true quando vem da nossa API)
    // Valores podem vir como boolean ou string, então normalizamos
    const isAgentMessage = payload.fromMe === true || payload.fromMe === "true" || 
                          payload.fromApi === true || payload.fromApi === "true";

    console.log('📞 Dados extraídos:', { 
      franchiseId, 
      phone, 
      messageText, 
      chatId, 
      messageId, 
      senderName,
      isAgentMessage,
      fromMe: payload.fromMe,
      fromApi: payload.fromApi
    });

    if (!franchiseId || !phone || !messageText || !chatId) {
      console.error('❌ Dados obrigatórios faltando:', {
        temFranchiseId: !!franchiseId,
        temPhone: !!phone,
        temMessageText: !!messageText,
        temChatId: !!chatId,
        payload: payload
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: {
            franchiseId: franchiseId ? 'OK' : 'MISSING',
            phone: phone ? 'OK' : 'MISSING',
            messageText: messageText ? 'OK' : 'MISSING',
            chatId: chatId ? 'OK' : 'MISSING'
          },
          hint: 'Verifique se o n8n está enviando os campos: franchiseId, phone, messageText (text.message) e chatId (ou chatLid)'
        }),
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
        customer_name: isAgentMessage ? (franchise.company_name || 'Agente') : senderName,
        customer_phone: phone,
        message_text: messageText,
        direction: isAgentMessage ? 'outgoing' : 'incoming',
        message_id: messageId,
        timestamp: timestamp,
        status: status
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir mensagem:', error);
      throw error;
    }

    console.log('✅ Mensagem salva com sucesso:', data);

    const responsePayload = { success: true, message: data };
    console.log('📤 Enviando resposta para n8n:', JSON.stringify(responsePayload, null, 2));
    
    return new Response(
      JSON.stringify(responsePayload),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    const errorResponse = { error: error.message };
    console.log('📤 Enviando resposta de erro para n8n:', JSON.stringify(errorResponse));
    
    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
