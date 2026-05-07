import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Home, 
  PlusCircle, 
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  businessName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, businessName }) => {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'financials', label: 'Financials', icon: BarChart3 },
    { id: 'scheduler', label: 'Tasks', icon: Calendar },
    { id: 'chat', label: 'Assistant', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cortex OS</h1>
            <p className="text-xs text-gray-500">{businessName || 'Business Manager'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  activeTab === tab.id 
                    ? "bg-black text-white shadow-lg shadow-black/10" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                )}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-black" size={24} />
            <span className="font-bold tracking-tight">Cortex</span>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "p-2 transition-colors",
              activeTab === 'settings' ? "text-black" : "text-gray-500"
            )}
          >
            <Settings size={20} />
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center justify-around p-4 bg-white border-t border-gray-100 pb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "p-2 rounded-full",
                  activeTab === tab.id ? "text-black" : "text-gray-400"
                )}
              >
                <Icon size={24} />
              </button>
            );
          })}
          <button onClick={() => setActiveTab('add')} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            <PlusCircle size={24} />
          </button>
        </nav>
      </main>
    </div>
  );
};
