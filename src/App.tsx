import { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Financials } from './pages/Financials';
import { Scheduler } from './pages/Scheduler';
import { AIChat } from './pages/AIChat';
import { Settings as SettingsPage } from './pages/Settings';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BrainCircuit size={48} className="text-black" />
        </motion.div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Initializing OS...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl shadow-black/5 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6">
              <BrainCircuit size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Cortex Business OS</h1>
            <p className="text-gray-500 mb-8">The AI business manager for modern entrepreneurs.</p>
            
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all transform active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert" alt="Google" />
              Continue with Google
            </button>
            
            <div className="mt-8 grid grid-cols-2 gap-4 w-full text-left">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-black mb-1 uppercase tracking-wider">AI Memory</p>
                <p className="text-[10px] text-gray-500 leading-tight">Learns from your daily routines.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-black mb-1 uppercase tracking-wider">Predictive</p>
                <p className="text-[10px] text-gray-500 leading-tight">Cash flow forecasting & risk alerts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={refreshProfile} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard profile={profile} />;
      case 'financials': return <Financials profile={profile} />;
      case 'scheduler': return <Scheduler profile={profile} />;
      case 'chat': return <AIChat profile={profile} />;
      case 'settings': return <SettingsPage profile={profile} onUpdate={refreshProfile} />;
      default: return <Dashboard profile={profile} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
      businessName={profile.businessName}
    >
      {renderContent()}
    </Layout>
  );
}
