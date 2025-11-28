import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Search } from 'lucide-react';
import { QuickReply } from '@/hooks/useQuickReplies';
import { Badge } from '@/components/ui/badge';

interface QuickReplySelectorProps {
  quickReplies: QuickReply[];
  onSelect: (message: string) => void;
}

export const QuickReplySelector: React.FC<QuickReplySelectorProps> = ({ 
  quickReplies, 
  onSelect 
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredReplies = quickReplies.filter((reply) =>
    reply.title.toLowerCase().includes(search.toLowerCase()) ||
    reply.message.toLowerCase().includes(search.toLowerCase()) ||
    (reply.shortcut && reply.shortcut.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (message: string) => {
    onSelect(message);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          title="Respostas rápidas"
          className="rounded-full"
        >
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Respostas Rápidas</h3>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar resposta..."
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            {filteredReplies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {search ? 'Nenhuma resposta encontrada' : 'Nenhuma resposta cadastrada'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleSelect(reply.message)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{reply.title}</h4>
                      {reply.shortcut && (
                        <Badge variant="secondary" className="text-xs">
                          {reply.shortcut}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {reply.message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
