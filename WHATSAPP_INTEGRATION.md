# Integração WhatsApp com n8n

## Visão Geral

Este sistema permite que cada franquia receba e responda mensagens do WhatsApp através de webhooks do n8n, tudo integrado diretamente na plataforma Reservaja.

## Arquitetura

- **whatsapp_messages**: Tabela que armazena todas as mensagens
- **whatsapp-webhook**: Edge function que recebe mensagens do n8n
- **whatsapp-send-message**: Edge function que envia mensagens via n8n
- **WhatsAppChat**: Página de interface estilo WhatsApp Web

## Configuração no n8n

### 1. Webhook para RECEBER mensagens (n8n → Reservaja)

Crie um workflow no n8n com:

1. **Trigger**: WhatsApp Trigger (ou webhook que recebe mensagens do WhatsApp)
2. **HTTP Request Node**: Para enviar a mensagem para o Reservaja

Configuração do HTTP Request:
```
Method: POST
URL: https://bdrfnvdhygasmxxvxvtt.supabase.co/functions/v1/whatsapp-webhook
Headers:
  Content-Type: application/json
Body (JSON):
{
  "franchiseId": "UUID_DA_FRANQUIA",
  "chatId": "{{ $json.chatId }}",
  "customerName": "{{ $json.customerName }}",
  "customerPhone": "{{ $json.customerPhone }}",
  "messageText": "{{ $json.messageText }}",
  "messageId": "{{ $json.messageId }}",
  "timestamp": "{{ $json.timestamp }}"
}
```

**Importante**: Substitua `UUID_DA_FRANQUIA` pelo ID real da franquia no banco de dados.

### 2. Webhook para ENVIAR mensagens (Reservaja → n8n)

Crie outro workflow no n8n com:

1. **Trigger**: Webhook
2. **WhatsApp Node**: Para enviar a mensagem via WhatsApp

Configuração do Webhook Trigger:
```
HTTP Method: POST
Path: /send-whatsapp-message
```

Copie a URL do webhook gerada pelo n8n (ex: `https://seu-n8n.app.n8n.cloud/webhook/send-whatsapp-message`)

3. Configure a franquia no Reservaja:
   - Acesse "Franquias" no menu
   - Edite a franquia desejada
   - Cole a URL do webhook do n8n no campo "Webhook URL"
   - Salve

## Como Usar

### Para os Usuários da Franquia

1. Acesse o menu "WhatsApp" no sistema
2. Selecione a franquia (se tiver mais de uma)
3. Visualize todas as conversas na barra lateral
4. Clique em uma conversa para ver o histórico
5. Digite e envie mensagens normalmente

### Formato dos Dados

#### Mensagem RECEBIDA (n8n → Reservaja)
```json
{
  "franchiseId": "uuid-da-franquia",
  "chatId": "5511999999999@c.us",
  "customerName": "Nome do Cliente",
  "customerPhone": "5511999999999",
  "messageText": "Olá, gostaria de fazer uma reserva",
  "messageId": "optional-whatsapp-message-id",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Mensagem ENVIADA (Reservaja → n8n)
```json
{
  "action": "send_message",
  "chatId": "5511999999999@c.us",
  "customerPhone": "5511999999999",
  "messageText": "Olá! Como posso ajudar?",
  "franchiseName": "Nome da Franquia",
  "messageId": "uuid-da-mensagem-no-sistema"
}
```

## Recursos

- ✅ Chat em tempo real com Supabase Realtime
- ✅ Interface estilo WhatsApp Web
- ✅ Histórico de conversas por cliente
- ✅ Notificações de novas mensagens
- ✅ Status de envio/entrega
- ✅ Multi-franquia
- ✅ Segurança com RLS

## URLs das Edge Functions

- **Receber mensagens**: `https://bdrfnvdhygasmxxvxvtt.supabase.co/functions/v1/whatsapp-webhook`
- **Enviar mensagens**: `https://bdrfnvdhygasmxxvxvtt.supabase.co/functions/v1/whatsapp-send-message`

## Logs e Debugging

Para visualizar logs das edge functions:
- Acesse: https://supabase.com/dashboard/project/bdrfnvdhygasmxxvxvtt/functions

## Troubleshooting

### Mensagens não aparecem no sistema
1. Verifique se o `franchiseId` está correto
2. Verifique os logs da edge function `whatsapp-webhook`
3. Confirme que o RLS está permitindo acesso

### Não consegue enviar mensagens
1. Verifique se a franquia tem o `webhook_url` configurado
2. Teste o webhook do n8n diretamente
3. Verifique os logs da edge function `whatsapp-send-message`

### Mensagens aparecem para todas as franquias
1. Verifique as políticas RLS na tabela `whatsapp_messages`
2. Confirme que o `franchiseId` está sendo enviado corretamente
