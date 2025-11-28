import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhatsAppMetrics } from '@/hooks/useWhatsAppMetrics';
import { MessageCircle, Clock, TrendingUp, Star, Activity, CheckCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricsDashboardProps {
  franchiseId: string;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ franchiseId }) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { metrics, loading } = useWhatsAppMetrics(franchiseId, dateRange);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header com filtro de data */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas</h2>
          <p className="text-muted-foreground">Análise de atendimento via WhatsApp</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
              {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex gap-2 p-3">
              <div>
                <p className="text-sm font-medium mb-2">De:</p>
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                  locale={ptBR}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Até:</p>
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                  locale={ptBR}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conversas Ativas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <MessageCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeChats}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
          </CardContent>
        </Card>

        {/* Total de Mensagens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        {/* Mensagens Recebidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.receivedMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Dos clientes</p>
          </CardContent>
        </Card>

        {/* Mensagens Enviadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sentMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Pelo portal: {metrics.sentFromPortal}</p>
          </CardContent>
        </Card>

        {/* Tempo Médio de Resposta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResponseTime < 60
                ? `${metrics.avgResponseTime} min`
                : `${Math.round(metrics.avgResponseTime / 60)}h ${metrics.avgResponseTime % 60}min`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Média do período</p>
          </CardContent>
        </Card>

        {/* Taxa de Resposta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Chats respondidos</p>
          </CardContent>
        </Card>

        {/* Total de Mensagens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        {/* Satisfação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {metrics.satisfactionScore > 0 ? metrics.satisfactionScore : '-'}
              {metrics.satisfactionScore > 0 && <span className="text-yellow-500">⭐</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.satisfactionCount} avaliações
            </p>
          </CardContent>
        </Card>

        {/* Crescimento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.messagesPerDay.length > 0
                ? Math.round(
                    metrics.totalMessages / metrics.messagesPerDay.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mensagens/dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mensagens por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.messagesPerDay.length > 0 ? (
              <div className="space-y-3">
                {metrics.messagesPerDay.slice(-7).map((item) => {
                  const maxCount = Math.max(
                    ...metrics.messagesPerDay.map((m) => Math.max(m.received, m.sent))
                  );
                  return (
                    <div key={item.date} className="space-y-1">
                      <span className="text-sm font-medium">
                        {format(new Date(item.date), 'dd/MM', { locale: ptBR })}
                      </span>
                      {/* Recebidas */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Recebidas</span>
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="h-5 bg-blue-500 rounded"
                            style={{
                              width: `${(item.received / maxCount) * 100}%`,
                            }}
                          />
                          <span className="text-xs font-medium w-8 text-right">{item.received}</span>
                        </div>
                      </div>
                      {/* Enviadas */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Enviadas</span>
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="h-5 bg-green-500 rounded"
                            style={{
                              width: `${(item.sent / maxCount) * 100}%`,
                            }}
                          />
                          <span className="text-xs font-medium w-8 text-right">{item.sent}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível
              </p>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Satisfação */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.satisfactionDistribution.length > 0 ? (
              <div className="space-y-2">
                {metrics.satisfactionDistribution.map((item) => (
                  <div key={item.rating} className="flex items-center justify-between">
                    <span className="text-sm">{item.rating}</span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div
                        className="h-6 bg-yellow-500 rounded"
                        style={{
                          width: `${(item.count / Math.max(...metrics.satisfactionDistribution.map((s) => s.count))) * 100}%`,
                        }}
                      />
                      <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma avaliação disponível
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
