
import React from 'react';

interface SidebarProps {
  activeTab: 'create' | 'gallery';
  setActiveTab: (tab: 'create' | 'gallery') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-[#05060f] border-r border-gray-800/50 p-6 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black text-sm italic shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          X
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white italic">XRECEP STUDIO</h1>
      </div>

      <nav className="space-y-2 flex-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
            activeTab === 'create' 
            ? 'bg-white text-black shadow-lg' 
            : 'text-gray-500 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          STÜDYO
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
            activeTab === 'gallery' 
            ? 'bg-white text-black shadow-lg' 
            : 'text-gray-500 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          KADROM
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800/50">
        <div className="p-4 bg-gray-900/30 rounded-2xl border border-gray-800/50">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-3">SİSTEM DURUMU</p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-pink-500 tracking-tighter">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
            SİNİRSEL BAĞLANTI AKTİF
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
