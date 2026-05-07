import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, Task, TransactionType } from '../types';
import { dbService } from '../services/dbService';
import { aiService } from '../services/aiService';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Dashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [data, setData] = useState<{
    transactions: Transaction[];
    tasks: Task[];
    advice: string;
    loading: boolean;
  }>({
    transactions: [],
    tasks: [],
    advice: "Analyzing your business data...",
    loading: true
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const [txs, tasks] = await Promise.all([
        dbService.getTransactions(profile.id),
        dbService.getTasks(profile.id)
      ]);

      setData(prev => ({ ...prev, transactions: txs, tasks: tasks }));
      
      // Get AI Advice
      const advice = await aiService.getDailyAdvice(profile, txs, tasks);
      setData(prev => ({ ...prev, advice, loading: false }));
    };

    loadDashboard();
  }, [profile.id]);

  const income = data.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = income - expenses;

  // Chart data
  const chartData = data.transactions
    .slice(0, 10)
    .reverse()
    .map(t => ({
      name: format(t.date, 'MMM dd'),
      amount: t.type === TransactionType.INCOME ? t.amount : -t.amount
    }));

  return (
    <div className="space-y-10">
      {/* Header with AI Advice */}
      <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Sparkles size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">AI Morning Briefing</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 pr-20">
            {data.loading ? "Waking up Cortex..." : data.advice}
          </h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Execute Plan
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <BrainCircuit size={200} />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Income" 
          value={`${profile.currency} ${income.toLocaleString()}`} 
          trend="+12%" 
          icon={<TrendingUp className="text-emerald-500" />} 
          delay={0}
        />
        <StatCard 
          label="Expenses" 
          value={`${profile.currency} ${expenses.toLocaleString()}`} 
          trend="+5%" 
          icon={<TrendingDown className="text-rose-500" />} 
          delay={0.1}
        />
        <StatCard 
          label="Profit" 
          value={`${profile.currency} ${profit.toLocaleString()}`} 
          trend="+18%" 
          accent
          icon={<ArrowUpRight className="text-white" />} 
          delay={0.2}
        />
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="premium-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Cash Flow Trend</h3>
            <select className="bg-gray-50 border-none rounded-lg text-xs font-semibold p-2">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-gray-900 mb-6">Critical Actions</h3>
          <div className="space-y-4">
            {data.tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-black/10 transition-colors">
                <div className={cn(
                  "p-2 rounded-lg",
                  task.priority === 'high' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                )}>
                  <Clock size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm line-clamp-1">{task.title}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{task.impact || 'Medium Impact'}</p>
                </div>
                <button className="text-gray-300 hover:text-emerald-500">
                  <CheckCircle2 size={24} />
                </button>
              </div>
            ))}
            {data.tasks.filter(t => t.status !== 'completed').length === 0 && (
              <div className="text-center py-10 opacity-30">
                <CheckCircle2 size={40} className="mx-auto mb-2" />
                <p className="text-sm font-medium">All systems clear. No pending actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, icon, accent, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={cn(
      "premium-card p-6 flex flex-col justify-between h-40",
      accent && "bg-black text-white border-transparent"
    )}
  >
    <div className="flex justify-between">
      <div className={cn("p-2 rounded-xl", accent ? "bg-white/10" : "bg-gray-50")}>
        {icon}
      </div>
      <div className={cn("text-[10px] font-bold px-2 py-1 rounded-full", accent ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-600")}>
        {trend}
      </div>
    </div>
    <div>
      <p className={cn("text-xs font-medium mb-1", accent ? "text-white/60" : "text-gray-500")}>{label}</p>
      <p className="text-2xl font-bold tracking-tight data-value">{value}</p>
    </div>
  </motion.div>
);

const BrainCircuit = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .94 4.82 2.5 2.5 0 0 0 0 4.28 2.5 2.5 0 0 0-1 4.83 2.5 2.5 0 0 0 2 3 2.5 2.5 0 0 0 4.96-.47 2.5 2.5 0 0 0 4.96.47 2.5 2.5 0 0 0 2-3 2.5 2.5 0 0 0-1-4.83 2.5 2.5 0 0 0 0-4.28 2.5 2.5 0 0 0 .94-4.82 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5z"/>
    <path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M12 12h.01"/><path d="M16 16h.01"/><path d="M8 16h.01"/>
  </svg>
)
