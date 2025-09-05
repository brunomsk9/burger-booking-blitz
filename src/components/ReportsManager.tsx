
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Gift,
  FileText,
  Loader2,
  Building
} from 'lucide-react';
import { FRANCHISES } from '@/types';
import { useReports, ReportFilters } from '@/hooks/useReports';

const ReportsManager: React.FC = () => {
  const { reportData, loading, generateReport } = useReports();
  const [filters, setFilters] = useState<ReportFilters>({});

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    // Convert special "all" values back to undefined
    const actualValue = value === 'all-franchises' || value === 'all-status' ? undefined : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
  };

  const handleGenerateReport = () => {
    generateReport(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    generateReport({});
  };

  // Dados para gráficos
  const franchiseData = Object.entries(reportData.reservationsByFranchise).map(([name, value]) => ({
    name: name.replace('reservaja - ', ''),
    value,
  }));

  const statusData = [
    { name: 'Confirmadas', value: reportData.confirmedReservations, color: '#2563EB' },
    { name: 'Pendentes', value: reportData.pendingReservations, color: '#DC2626' },
    { name: 'Canceladas', value: reportData.cancelledReservations, color: '#6B7280' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Gerando relatório...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
      </div>

      {/* Filtros */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText size={20} />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="franchise">Franquia</Label>
              <Select 
                value={filters.franchiseName || 'all-franchises'} 
                onValueChange={(value) => handleFilterChange('franchiseName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as franquias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-franchises">Todas as franquias</SelectItem>
                  {FRANCHISES.map(franchise => (
                    <SelectItem key={franchise} value={franchise}>
                      {franchise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status || 'all-status'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700">
              Gerar Relatório
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalReservations}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.confirmedReservations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-red-600">{reportData.pendingReservations}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aniversários</p>
                <p className="text-2xl font-bold text-red-600">{reportData.birthdayReservations}</p>
              </div>
              <Gift className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Building size={20} />
              Reservas por Franquia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={franchiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users size={20} />
              Status das Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Reservas */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar size={20} />
            Reservas Detalhadas ({reportData.reservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reportData.reservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{reservation.customer_name}</h4>
                    <Badge 
                      className={
                        reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        reservation.status === 'pending' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }
                    >
                      {reservation.status === 'confirmed' ? 'Confirmada' :
                       reservation.status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </Badge>
                    {reservation.birthday && (
                      <Badge className="bg-red-100 text-red-700">🎂 Aniversário</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {reservation.franchise_name} • {new Date(reservation.date_time).toLocaleDateString('pt-BR')} às {new Date(reservation.date_time).toTimeString().slice(0, 5)} • {reservation.people} pessoas
                  </p>
                </div>
              </div>
            ))}
            
            {reportData.reservations.length === 0 && (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Nenhuma reserva encontrada com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManager;
