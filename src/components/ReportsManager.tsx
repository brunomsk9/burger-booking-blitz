
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Download, Filter, FileText, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Reservation, FRANCHISES, ReportFilters } from '@/types';

const ReportsManager: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    franchiseName: '',
    status: ''
  });

  // Mock data - mesmos dados do ReservationManager
  const mockReservations: Reservation[] = [
    {
      id: '1',
      franchiseName: 'Herois Burguer - Shopping',
      customerName: 'João Silva',
      phone: '11999888777',
      dateTime: new Date('2024-06-25T19:00:00'),
      people: 4,
      birthday: true,
      birthdayPersonName: 'Lucas Silva',
      characters: 'Super-Homem, Batman',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      franchiseName: 'Herois Burguer - Centro',
      customerName: 'Maria Santos',
      phone: '11888777666',
      dateTime: new Date('2024-06-25T20:30:00'),
      people: 2,
      birthday: false,
      characters: 'Mulher Maravilha',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      franchiseName: 'Herois Burguer - Zona Norte',
      customerName: 'Pedro Costa',
      phone: '11777666555',
      dateTime: new Date('2024-06-26T18:00:00'),
      people: 6,
      birthday: true,
      birthdayPersonName: 'Ana Costa',
      characters: 'Flash, Aquaman',
      status: 'cancelled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const filteredReservations = mockReservations.filter(reservation => {
    const matchesDateRange = (!filters.startDate || reservation.dateTime >= filters.startDate) &&
                            (!filters.endDate || reservation.dateTime <= filters.endDate);
    const matchesFranchise = !filters.franchiseName || reservation.franchiseName === filters.franchiseName;
    const matchesStatus = !filters.status || reservation.status === filters.status;

    return matchesDateRange && matchesFranchise && matchesStatus;
  });

  const handleExportPDF = () => {
    toast({ 
      title: 'Exportando PDF...', 
      description: 'O relatório em PDF será baixado em breve.' 
    });
    // Aqui seria implementada a lógica de exportação para PDF
  };

  const handleExportExcel = () => {
    toast({ 
      title: 'Exportando Excel...', 
      description: 'O relatório em Excel será baixado em breve.' 
    });
    // Aqui seria implementada a lógica de exportação para Excel
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const totalReservations = filteredReservations.length;
  const confirmedReservations = filteredReservations.filter(r => r.status === 'confirmed').length;
  const pendingReservations = filteredReservations.filter(r => r.status === 'pending').length;
  const cancelledReservations = filteredReservations.filter(r => r.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
            <FileText size={16} />
            Exportar PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
            <File size={16} />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters({
                  ...filters, 
                  startDate: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters({
                  ...filters, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
            <div>
              <Label htmlFor="franchise">Franquia</Label>
              <Select 
                value={filters.franchiseName} 
                onValueChange={(value) => setFilters({...filters, franchiseName: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as franquias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as franquias</SelectItem>
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
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value as ReportFilters['status']})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalReservations}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{confirmedReservations}</p>
              <p className="text-sm text-gray-600">Confirmadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingReservations}</p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{cancelledReservations}</p>
              <p className="text-sm text-gray-600">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({filteredReservations.length} resultados)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Franquia</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Pessoas</TableHead>
                <TableHead>Aniversário</TableHead>
                <TableHead>Personagens</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customerName}</TableCell>
                  <TableCell>{reservation.franchiseName}</TableCell>
                  <TableCell>
                    {reservation.dateTime.toLocaleDateString('pt-BR')} às {reservation.dateTime.toTimeString().slice(0, 5)}
                  </TableCell>
                  <TableCell>{reservation.people}</TableCell>
                  <TableCell>
                    {reservation.birthday ? (
                      <span className="text-pink-600">
                        🎂 {reservation.birthdayPersonName || 'Sim'}
                      </span>
                    ) : (
                      'Não'
                    )}
                  </TableCell>
                  <TableCell>{reservation.characters || 'Nenhum'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusText(reservation.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManager;
