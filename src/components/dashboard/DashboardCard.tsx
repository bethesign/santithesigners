import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { Gift, ScrollText, Timer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Reusable Card Component for Dashboard
export const DashboardCard = ({
  title,
  icon: Icon,
  status,
  children,
  onClick,
  actionLabel = "Vai",
  disabled = false
}: {
  title: string;
  icon: any;
  status: 'pending' | 'completed' | 'locked' | 'active';
  children?: React.ReactNode;
  onClick?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}) => {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-xl bg-white border-border/50 shadow-xl border-l-4",
      status === 'completed' ? "border-l-green-500" :
      status === 'active' ? "border-l-[#da2c38]" :
      "border-l-gray-300"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-extrabold font-display flex items-center gap-2 text-[#da2c38]" style={{ fontWeight: 800 }}>
          <div className={cn("p-2 rounded-lg",
            status === 'completed' ? "bg-green-100 text-green-600" :
            status === 'active' ? "bg-red-100 text-red-600" :
            "bg-gray-100 text-gray-500"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          {title}
        </CardTitle>
        {status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      </CardHeader>
      <CardContent>
        <div className="min-h-[80px] flex flex-col justify-between">
          <div className="text-sm text-gray-800 mb-4">
            {children}
          </div>
          {onClick && (
            <Button
              className={cn(
                "w-full justify-between group bg-[#226f54] text-white hover:bg-[#1a5640]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={disabled ? undefined : onClick}
              disabled={disabled}
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
