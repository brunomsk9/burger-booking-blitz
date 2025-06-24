
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, UserPlus, Building, Trash2, Loader2, ShieldAlert, Info } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useFranchises } from '@/hooks/useFranchises';
import { usePermissions } from '@/hooks/usePermissions';
import { UserProfile } from '@/types/user';

const UserManager: React.FC = () => {
  const { users, userFranchises, loading, updateUserRole, assignUserToFranchise, removeUserFromFranchise } = useUsers();
  const { franchises, loading: franchisesLoading } = useFranchises();
  const { canManageUsers, getRoleText, isSuperAdmin, isAdmin } = usePermissions();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!canManageUsers()) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ShieldAlert size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
        <p className="text-gray-600">Você não tem permissão para gerenciar usuários.</p>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-700 border-red-200';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'editor': return 'bg-green-100 text-green-700 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUserFranchises = (userId: string) => {
    return userFranchises.filter(uf => uf.user_id === userId);
  };

  const handleAssignFranchise = async () => {
    if (!selectedUser || !selectedFranchise) return;
    
    await assignUserToFranchise(selectedUser.id, selectedFranchise);
    setSelectedFranchise('');
    setIsDialogOpen(false);
  };

  // Filtrar opções de papel baseado no usuário atual
  const getRoleOptions = () => {
    if (isSuperAdmin()) {
      return [
        { value: 'superadmin', label: 'Super Admin' },
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Visualizador' }
      ];
    } else if (isAdmin()) {
      return [
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Visualizador' }
      ];
    }
    return [];
  };

  if (loading || franchisesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
      </div>

      {isAdmin() && !isSuperAdmin() && (
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Info size={16} />
              <span className="text-sm font-medium">
                Como administrador, você pode ver e gerenciar apenas os usuários das suas franquias.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => {
          const userFranchisesList = getUserFranchises(user.id);
          const roleOptions = getRoleOptions();
          
          return (
            <Card key={user.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div>
                        <strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <strong className="text-sm text-gray-700">Franquias:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userFranchisesList.length > 0 ? (
                          userFranchisesList.map((uf) => (
                            <div key={uf.id} className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs">
                              <Building size={12} className="mr-1" />
                              {uf.franchise_name}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                                onClick={() => removeUserFromFranchise(uf.id)}
                              >
                                <Trash2 size={10} />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Nenhuma franquia atrelada</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value as UserProfile['role'])}
                    >
                      <SelectTrigger className="w-full lg:w-40">
                        <SelectValue placeholder="Papel" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => setSelectedUser(user)}
                        >
                          <UserPlus size={16} className="mr-1" />
                          Atrelar Franquia
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Atrelar {user.name} à Franquia</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma franquia" />
                            </SelectTrigger>
                            <SelectContent>
                              {franchises
                                .filter(franchise => 
                                  !userFranchisesList.some(uf => uf.franchise_id === franchise.id)
                                )
                                .map(franchise => (
                                <SelectItem key={franchise.id} value={franchise.id}>
                                  {franchise.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleAssignFranchise}
                              disabled={!selectedFranchise}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Atrelar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDialogOpen(false);
                                setSelectedFranchise('');
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {users.length === 0 && (
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600">
                {isAdmin() && !isSuperAdmin() 
                  ? "Nenhum usuário encontrado nas suas franquias." 
                  : "Os usuários aparecerão aqui conforme se cadastrarem no sistema."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManager;
