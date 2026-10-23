import React from 'react';
import { Bookmark, HelpCircle, Lock, Package, Settings, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'catalog' | 'admin' | 'profile' | 'how-it-works';
  setActiveTab: (tab: 'catalog' | 'admin' | 'profile' | 'how-it-works') => void;
  savedCount: number;
  ordersCount: number;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  ordersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-[#e7e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="text-left cursor-pointer transition-opacity hover:opacity-85 flex items-center gap-2.5 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#c26d24] text-white flex items-center justify-center font-bold text-sm shadow-clean">
            🏠
          </div>
          <div>
            <span className="font-display font-bold text-lg text-[#1c1917] tracking-tight block leading-none">
              Venta de Garaje
            </span>
            <span className="text-[10px] text-[#78716c] font-medium tracking-wide uppercase">
              Juguetes de Nuestros Hijos
            </span>
          </div>
        </button>

        {/* Zone 2: Nav Links */}
        <nav className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-medium text-[#57534e]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors py-1 ${
              activeTab === 'catalog'
                ? 'text-[#1c1917] font-semibold border-b-2 border-[#c26d24]'
                : 'hover:text-[#1c1917]'
            }`}
          >
            Catálogo
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors py-1 hidden md:block ${
              activeTab === 'how-it-works'
                ? 'text-[#1c1917] font-semibold border-b-2 border-[#c26d24]'
                : 'hover:text-[#1c1917]'
            }`}
          >
            Lugar y Horarios
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'text-[#1c1917] font-semibold border-b-2 border-[#c26d24]'
                : 'hover:text-[#1c1917]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#78716c]" />
            <span>Mis Reservas</span>
            {ordersCount > 0 && (
              <span className="text-[11px] bg-[#f5f4f0] text-[#1c1917] font-bold px-1.5 rounded-full tabular-nums">
                {ordersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="whitespace-nowrap shrink-0 cursor-pointer transition-colors py-1 hidden sm:flex items-center gap-1.5 hover:text-[#1c1917]"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#78716c]" />
            <span>Guardados</span>
            {savedCount > 0 && (
              <span className="text-[11px] bg-[#fef7ee] text-[#c26d24] font-bold px-1.5 rounded-full tabular-nums">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Discreet Organizer Mode for the parent only) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('admin')}
            title="Panel para que mamá/papá agregue juguetes y gestione stock"
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeTab === 'admin'
                ? 'bg-[#1c1917] text-white border-[#1c1917]'
                : 'bg-white text-[#57534e] border-[#e7e5e0] hover:text-[#1c1917] hover:border-[#d6d3cb]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[#c26d24]" />
            <span className="hidden sm:inline">Gestionar Garaje</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
