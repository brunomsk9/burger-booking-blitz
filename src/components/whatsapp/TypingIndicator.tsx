import React from 'react';

interface TypingIndicatorProps {
  customerName: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ customerName }) => {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-white dark:bg-card rounded-lg rounded-bl-none p-3 shadow-sm max-w-[70%]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{customerName} está digitando</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-[bounce_1s_ease-in-out_0s_infinite]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};
