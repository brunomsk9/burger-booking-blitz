
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    franchise_name: string;
    customer_name: string;
    phone: string;
    date_time: string;
    people: number;
    birthday: boolean;
    birthday_person_name?: string;
    characters?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ReservationPayload = await req.json();
    
    // Verificar se é uma nova reserva
    if (payload.type !== 'INSERT' || payload.table !== 'reservations') {
      return new Response('Not a reservation insert', { status: 200 });
    }

    const reservation = payload.record;
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Buscar o webhook_url da franquia
    const { data: franchise, error: franchiseError } = await supabase
      .from('franchises')
      .select('webhook_url')
      .or(`name.eq.${reservation.franchise_name},company_name.eq.${reservation.franchise_name}`)
      .single();
    
    if (franchiseError) {
      console.error('Erro ao buscar franquia:', franchiseError);
      return new Response('Franchise not found', { status: 404 });
    }
    
    if (!franchise?.webhook_url) {
      console.log('Franquia não possui webhook configurado:', reservation.franchise_name);
      return new Response('No webhook configured for franchise', { status: 200 });
    }
    
    const webhookUrl = franchise.webhook_url;
    
    // Formatar data e hora
    const dateTime = new Date(reservation.date_time);
    const formattedDate = dateTime.toLocaleDateString('pt-BR');
    const formattedTime = dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Montar mensagem
    let message = `🍔 *NOVA RESERVA - Herois Burguer*\n\n`;
    message += `👤 *Cliente:* ${reservation.customer_name}\n`;
    message += `📍 *Franquia:* ${reservation.franchise_name}\n`;
    message += `📞 *Telefone:* ${reservation.phone}\n`;
    message += `📅 *Data:* ${formattedDate}\n`;
    message += `⏰ *Horário:* ${formattedTime}\n`;
    message += `👥 *Pessoas:* ${reservation.people}\n`;
    
    if (reservation.birthday) {
      message += `🎂 *Aniversário:* Sim`;
      if (reservation.birthday_person_name) {
        message += ` - ${reservation.birthday_person_name}`;
      }
      message += `\n`;
    }
    
    if (reservation.characters) {
      message += `🦸 *Personagens:* ${reservation.characters}\n`;
    }
    
    message += `\n📋 *ID da Reserva:* ${reservation.id}`;

    // Preparar payload para o webhook
    const webhookPayload = {
      type: 'whatsapp_notification',
      reservation: reservation,
      message: message,
      formatted_date: formattedDate,
      formatted_time: formattedTime,
      timestamp: new Date().toISOString()
    };

    // Enviar para o webhook da franquia
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Erro ao enviar webhook:', errorText);
      return new Response(`Webhook error: ${errorText}`, { status: 500 });
    }

    const result = await webhookResponse.text();
    console.log('Webhook enviado com sucesso para:', webhookUrl, result);

    return new Response(JSON.stringify({ success: true, result, webhook_url: webhookUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Erro na função:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
