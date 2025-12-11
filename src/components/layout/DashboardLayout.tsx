import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Snow } from '../extraction/Snow';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  isLive?: boolean;
  isAdmin?: boolean;
}

// Avatar data matching Figma
const AVATARS = [
  { id: 1, name: "Santa", emoji: "🎅", bg: "bg-red-100" },
  { id: 2, name: "Mrs Claus", emoji: "👵", bg: "bg-red-200" },
  { id: 3, name: "Elfo", emoji: "🧝", bg: "bg-emerald-100" },
  { id: 4, name: "Elfa", emoji: "🧝‍♀️", bg: "bg-emerald-200" },
  { id: 5, name: "Renna", emoji: "🦌", bg: "bg-amber-100" },
  { id: 6, name: "Pupazzo", emoji: "⛄", bg: "bg-sky-100" },
  { id: 7, name: "Biscotto", emoji: "🍪", bg: "bg-orange-100" },
  { id: 8, name: "Orso", emoji: "🐻‍❄️", bg: "bg-blue-50" },
  { id: 9, name: "Pinguino", emoji: "🐧", bg: "bg-slate-200" },
  { id: 10, name: "Grinch", emoji: "🤢", bg: "bg-lime-200" },
  { id: 11, name: "Grinch Sly", emoji: "😏", bg: "bg-green-300" },
  { id: 12, name: "Grinch Santa", emoji: "👺", bg: "bg-green-200" },
  { id: 13, name: "Yeti", emoji: "🦍", bg: "bg-gray-100" },
  { id: 14, name: "Merlo", emoji: "🐦‍⬛", bg: "bg-orange-200" },
  { id: 15, name: "Gufo", emoji: "🦉", bg: "bg-amber-50" },
  { id: 16, name: "Gatto Natalizio", emoji: "🐱", bg: "bg-rose-100" },
  { id: 17, name: "Cane Natalizio", emoji: "🐶", bg: "bg-yellow-100" },
  { id: 18, name: "Albero", emoji: "🎄", bg: "bg-green-100" },
  { id: 19, name: "Regalo", emoji: "🎁", bg: "bg-purple-100" },
  { id: 20, name: "Stella", emoji: "⭐", bg: "bg-yellow-200" },
];

export const DashboardLayout = ({ children, userName, isLive = false, isAdmin = false }: DashboardLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-[Spectral] pb-20 overflow-x-hidden relative">
      <Snow />
      {/* Ambient Background matching Figma */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* Header - Exact Figma Match */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0">
        <h1 className="text-2xl md:text-3xl font-semibold font-[Spectral] text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-200 to-red-400">
          Santi Thesigners
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <button
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-full transition-colors pr-3 border border-transparent hover:border-white/10"
            >
              <div className={`w-10 h-10 rounded-full ${selectedAvatar.bg} flex items-center justify-center text-2xl shadow-inner border-2 border-slate-700`}>
                {selectedAvatar.emoji}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Ciao, {selectedAvatar.name}!
              </span>
            </button>

            {/* Avatar Selector Dropdown */}
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 grid grid-cols-4 gap-2 z-50 max-h-80 overflow-y-auto"
                >
                  <div className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scegli il tuo alter ego</div>
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setIsAvatarMenuOpen(false);
                      }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform ${avatar.bg} ${selectedAvatar.id === avatar.id ? 'ring-2 ring-yellow-400' : ''}`}
                      title={avatar.name}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 hidden sm:block"
            >
              Admin
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};
