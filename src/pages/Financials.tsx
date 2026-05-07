import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, TransactionType } from '../types';
import { dbService } from '../services/dbService';
import { aiService } from '../services/aiService';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Filter,
  Loader2,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Financials: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTx, setNewTx] = useState({
    amount: '',
    type: TransactionType.INCOME,
    description: '',
    category: '',
  });
  const [categorizing, setCategorizing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const txs = await dbService.getTransactions(profile.id);
    setTransactions(txs);
    setLoading(false);
  };

  const handleSmartCategorize = async () => {
    if (!newTx.description) return;
    setCategorizing(true);
    const result = await aiService.categorizeTransaction(newTx.description);
    setNewTx(prev => ({ ...prev, category: result.category }));
    setCategorizing(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;

    await dbService.addTransaction({
      amount: parseFloat(newTx.amount),
      type: newTx.type,
      description: newTx.description,
      category: newTx.category || 'General',
      date: new Date(),
      userId: profile.id,
    });

    setNewTx({ amount: '', type: TransactionType.INCOME, description: '', category: '' });
    setIsModalOpen(false);
    loadTransactions();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
          <p className="text-gray-500">Every cent tracked, every decision optimized.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
        >
          <Plus size={20} /> Add Record
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 p-2 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl outline-none text-sm font-medium border border-transparent focus:border-black/5"
          />
        </div>
        <button className="px-4 py-3 bg-white rounded-xl border border-transparent hover:border-black/5 text-gray-500">
          <Filter size={18} />
        </button>
      </div>

      {/* Transactions List */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-200" size={40} />
                  </td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {format(tx.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {tx.category}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold data-value",
                    tx.type === TransactionType.INCOME ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'} {profile.currency} {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-30">
                    <p className="text-sm font-medium">Clear history. Start by adding your first transaction.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6">New Transaction</h2>
              
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: TransactionType.INCOME })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                      newTx.type === TransactionType.INCOME ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500"
                    )}
                  >
                    <ArrowUpCircle size={18} /> Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: TransactionType.EXPENSE })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
                      newTx.type === TransactionType.EXPENSE ? "bg-white text-rose-600 shadow-sm" : "text-gray-500"
                    )}
                  >
                    <ArrowDownCircle size={18} /> Expense
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Description</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={newTx.description}
                      onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                      onBlur={handleSmartCategorize}
                      placeholder="e.g. Monthly cloud hosting"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all"
                    />
                    {categorizing && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={20} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Amount</label>
                    <input 
                      type="number" 
                      required
                      value={newTx.amount}
                      onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Category</label>
                    <input 
                      type="text" 
                      value={newTx.category}
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                      placeholder="AI detected..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all"
                >
                  Confirm & Sync
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
