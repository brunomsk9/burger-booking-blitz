
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface FormData {
  name: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  manager_name: string;
  active: boolean;
  logo_url: string;
  webhook_url: string;
}

interface FranchiseFormFieldsProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const FranchiseFormFields: React.FC<FranchiseFormFieldsProps> = ({
  formData,
  onFormDataChange
}) => {
  const updateField = (field: keyof FormData, value: string | boolean) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <>
      <div>
        <Label htmlFor="edit-name">Nome da Franquia (ID)</Label>
        <Input
          id="edit-name"
          value={formData.name}
          disabled
          className="bg-gray-100 cursor-not-allowed"
          placeholder="nome-unico-franquia"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Identificador único (não pode ser alterado)
        </p>
      </div>

      <div>
        <Label htmlFor="edit-company-name">Nome da Empresa</Label>
        <Input
          id="edit-company-name"
          value={formData.company_name}
          onChange={(e) => updateField('company_name', e.target.value)}
          required
          placeholder="Herois Burguer - Unidade Centro"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nome exibido para os clientes
        </p>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="edit-address">Endereço</Label>
        <Textarea
          id="edit-address"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Endereço completo da franquia"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="edit-phone">Telefone</Label>
        <Input
          id="edit-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>
      
      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="email@franquia.com"
        />
      </div>
      
      <div className="md:col-span-2">
        <Label htmlFor="edit-manager">Nome do Gerente</Label>
        <Input
          id="edit-manager"
          value={formData.manager_name}
          onChange={(e) => updateField('manager_name', e.target.value)}
          placeholder="Nome do gerente responsável"
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="edit-webhook">URL do Webhook</Label>
        <Input
          id="edit-webhook"
          type="url"
          value={formData.webhook_url}
          onChange={(e) => updateField('webhook_url', e.target.value)}
          placeholder="https://n8n-n8n.hjiq5w.easypanel.host/webhook/producao"
        />
        <p className="text-xs text-muted-foreground mt-1">
          URL para receber notificações de novas reservas desta franquia
        </p>
      </div>
      
      <div className="md:col-span-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-active"
            checked={formData.active}
            onCheckedChange={(checked) => updateField('active', checked)}
          />
          <Label htmlFor="edit-active">Franquia Ativa</Label>
        </div>
      </div>
    </>
  );
};

export default FranchiseFormFields;
