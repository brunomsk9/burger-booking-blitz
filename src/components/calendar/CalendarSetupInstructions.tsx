
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const CalendarSetupInstructions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle size={20} />
          Como configurar o Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="step-by-step">
            <AccordionTrigger>
              📋 Passo a passo completo para configuração
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-blue-900">🔧 O que você precisa configurar:</h4>
                <div className="space-y-4">
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium text-gray-900">1. Criar projeto no Google Cloud Console</h5>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• Acesse <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                      <li>• Crie um novo projeto ou selecione um existente</li>
                      <li>• Ative a API do Google Calendar</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-medium text-gray-900">2. Configurar OAuth 2.0</h5>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• Vá em "APIs e Serviços" → "Credenciais"</li>
                      <li>• Clique em "Criar credenciais" → "ID do cliente OAuth 2.0"</li>
                      <li>• Tipo: Aplicação web</li>
                      <li>• Adicione suas URLs autorizadas</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h5 className="font-medium text-gray-900">3. Configurar tela de consentimento</h5>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• Configure a tela que o usuário verá ao autorizar</li>
                      <li>• Adicione domínios autorizados</li>
                      <li>• Configure escopos necessários (Calendar API)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-medium text-gray-900">4. Obter credenciais</h5>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• <strong>Client ID:</strong> Necessário para autenticação</li>
                      <li>• <strong>Client Secret:</strong> Chave secreta da aplicação</li>
                      <li>• <strong>ID do Calendário:</strong> Opcional (usa 'primary' se não especificado)</li>
                    </ul>
                  </div>

                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-800">⚠️ Importante:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Apenas o ID do calendário NÃO É SUFICIENTE</li>
                  <li>• É necessário configurar OAuth 2.0 para autenticação</li>
                  <li>• Sem as credenciais corretas, a integração não funcionará</li>
                  <li>• Cada franquia pode ter seu próprio calendário</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-800">✅ Depois de configurado:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Reservas serão automaticamente adicionadas ao calendário</li>
                  <li>• Cancelamentos removerão os eventos</li>
                  <li>• Sincronização em tempo real</li>
                  <li>• Histórico de todas as operações</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="calendar-id-help">
            <AccordionTrigger>
              📅 Como encontrar o ID do Calendário?
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Para usar o calendário principal:</h5>
                  <p className="text-sm text-gray-600">Deixe o campo em branco ou use <code className="bg-gray-200 px-2 py-1 rounded">primary</code></p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Para um calendário específico:</h5>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Abra o Google Calendar na web</li>
                    <li>2. Na barra lateral esquerda, encontre o calendário desejado</li>
                    <li>3. Clique nos três pontos ao lado do nome</li>
                    <li>4. Selecione "Configurações e compartilhamento"</li>
                    <li>5. Role até "ID do calendário" e copie o valor</li>
                  </ol>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CalendarSetupInstructions;
