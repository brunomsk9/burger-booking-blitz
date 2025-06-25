
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    
    // Configurações da EvolutionAPI
    const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");
    const instanceName = Deno.env.get("EVOLUTION_INSTANCE_NAME");
    const notificationNumber = Deno.env.get("WHATSAPP_NOTIFICATION_NUMBER") || "5511999888777";
    
    if (!evolutionApiUrl || !evolutionApiKey || !instanceName) {
      console.error("Configurações da EvolutionAPI não encontradas");
      return new Response("EvolutionAPI not configured", { status: 500 });
    }

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

    // Enviar via EvolutionAPI
    const evolutionResponse = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: notificationNumber,
        text: message
      })
    });

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text();
      console.error('Erro ao enviar WhatsApp via EvolutionAPI:', errorText);
      return new Response(`EvolutionAPI error: ${errorText}`, { status: 500 });
    }

    const result = await evolutionResponse.json();
    console.log('Mensagem enviada com sucesso via EvolutionAPI:', result);

    return new Response(JSON.stringify({ success: true, result }), {
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
