import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Plus, Trash2, Edit2, Zap } from 'lucide-react';
import { QuickReply, useQuickReplies } from '@/hooks/useQuickReplies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickReplyManagerProps {
  franchiseId: string;
}

export const QuickReplyManager: React.FC<QuickReplyManagerProps> = ({ franchiseId }) => {
  const { quickReplies, loading, createQuickReply, updateQuickReply, deleteQuickReply } = useQuickReplies(franchiseId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    shortcut: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateQuickReply(editingId, formData);
      } else {
        await createQuickReply({
          franchise_id: franchiseId,
          title: formData.title,
          message: formData.message,
          shortcut: formData.shortcut || null,
        });
      }
      
      setFormData({ title: '', message: '', shortcut: '' });
      setEditingId(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (reply: QuickReply) => {
    setEditingId(reply.id);
    setFormData({
      title: reply.title,
      message: reply.message,
      shortcut: reply.shortcut || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', message: '', shortcut: '' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta resposta rápida?')) {
      await deleteQuickReply(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Gerenciar respostas rápidas">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Gerenciar Respostas Rápidas
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 h-[60vh]">
          {/* Form */}
          <div className="border-r pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Saudação inicial"
                  required
                  maxLength={100}
                />
              </div>
              
              <div>
                <Label htmlFor="shortcut">Atalho (opcional)</Label>
                <Input
                  id="shortcut"
                  value={formData.shortcut}
                  onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  placeholder="Ex: /oi"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o atalho no chat para usar a resposta
                </p>
              </div>
              
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Digite a mensagem..."
                  required
                  rows={6}
                  maxLength={1000}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          {/* List */}
          <div>
            <h3 className="font-semibold mb-3">Respostas Cadastradas ({quickReplies.length})</h3>
            <ScrollArea className="h-[calc(60vh-2rem)]">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
              ) : quickReplies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma resposta rápida cadastrada
                </p>
              ) : (
                <div className="space-y-2 pr-2">
                  {quickReplies.map((reply) => (
                    <Card key={reply.id} className={editingId === reply.id ? 'border-primary' : ''}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{reply.title}</h4>
                            {reply.shortcut && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {reply.shortcut}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(reply)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(reply.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {reply.message}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
