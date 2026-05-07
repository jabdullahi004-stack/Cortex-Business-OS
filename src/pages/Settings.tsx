import React, { useState } from 'react';
import { UserProfile, BusinessType } from '../types';
import { dbService } from '../services/dbService';
import { Save, User, Building, Landmark, ChevronRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Settings: React.FC<{ profile: UserProfile, onUpdate: () => void }> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    businessName: profile.businessName,
    businessType: profile.businessType,
    currency: profile.currency,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const businessTypes = Object.values(BusinessType);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dbService.createUserProfile({
        ...formData,
        onboarded: true,
      });
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Configure your business core and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Section */}
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              <Building size={18} />
            </div>
            <h3 className="font-bold">Business Identity</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Business Name</label>
              <input 
                type="text" 
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Business Model</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: type })}
                    className={cn(
                      "p-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all",
                      formData.businessType === type 
                        ? "border-black bg-black text-white" 
                        : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <span>{type}</span>
                    {formData.businessType === type && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div className="premium-card p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              <Landmark size={18} />
            </div>
            <h3 className="font-bold">Financial Defaults</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Base Currency</label>
            <select 
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black transition-all appearance-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-bold transition-all shadow-xl",
            saved 
              ? "bg-emerald-500 text-white shadow-emerald-200" 
              : "bg-black text-white shadow-black/10 hover:bg-gray-800"
          )}
        >
          {loading ? (
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : saved ? (
            <>Saved Successfully <Check size={20} /></>
          ) : (
            <>Save Changes <Save size={20} /></>
          )}
        </button>
      </form>
    </div>
  );
};
