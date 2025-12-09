import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { TreePine, Bell } from 'lucide-react';
import { cn } from '../ui/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  isLive?: boolean;
  onNavigate: (page: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userName = "Utente", 
  isLive = false,
  onNavigate 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => onNavigate('dashboard')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white">
              <TreePine className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-brand-primary-dark hidden sm:inline-block">Secret Santa</span>
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-4">
            {isLive && (
              <div 
                className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 animate-pulse cursor-pointer"
                onClick={() => onNavigate('extraction')}
              >
                <span className="h-2 w-2 rounded-full bg-red-600" />
                LIVE
              </div>
            )}

            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
              <Avatar className="cursor-pointer border-2 border-white shadow-sm" onClick={() => onNavigate('login')}>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
                <AvatarFallback className="bg-brand-gold text-brand-primary-dark font-bold">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1280px] px-4 py-8 lg:px-20 lg:py-12">
        {children}
      </main>
    </div>
  );
};
