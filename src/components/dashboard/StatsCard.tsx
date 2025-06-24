
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'gray';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, color }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-l-blue-600',
          text: 'text-blue-600',
          bg: 'bg-blue-500',
          icon: 'text-blue-500'
        };
      case 'red':
        return {
          border: 'border-l-red-600',
          text: 'text-red-600',
          bg: 'bg-red-500',
          icon: 'text-red-500'
        };
      case 'gray':
        return {
          border: 'border-l-gray-600',
          text: 'text-gray-600',
          bg: 'bg-gray-500',
          icon: 'text-gray-500'
        };
      default:
        return {
          border: 'border-l-blue-600',
          text: 'text-blue-600',
          bg: 'bg-blue-500',
          icon: 'text-blue-500'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${colors.border}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className={`${colors.icon} mr-1`} />
              <span className={`text-sm ${colors.text}`}>{subtitle}</span>
            </div>
          </div>
          <div className={`${colors.bg} p-3 rounded-full`}>
            {React.cloneElement(icon as React.ReactElement, { 
              size: 24, 
              className: "text-white" 
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
