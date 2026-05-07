import React, { useState } from 'react';
import { motion } from 'motion/react';
import { dbService } from '../services/dbService';
import { BusinessType } from '../types';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: BusinessType.FREELANCER,
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);

  const businessTypes = Object.values(BusinessType);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await dbService.createUserProfile({
        ...formData,
        onboarded: true,
      });
      onComplete();
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-50">
          <motion.div 
            className="h-full bg-black" 
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">What's your business called?</h2>
              <p className="text-gray-500">This helps Cortex personalize your dashboard.</p>
            </div>
            <input 
              type="text" 
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Acme Design Studio"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-lg"
            />
            <button 
              disabled={!formData.businessName}
              onClick={() => setStep(2)}
              className="w-full h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Next <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Business Model</h2>
              <p className="text-gray-500">I'll adapt recommendations to your specific workflow.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {businessTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, businessType: type })}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all",
                    formData.businessType === type 
                      ? "border-black bg-black text-white" 
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <span className="font-semibold">{type}</span>
                  {formData.businessType === type && <Check size={20} />}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 h-14 bg-gray-100 text-black rounded-2xl font-bold">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold">Next</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Preferred Currency</h2>
              <p className="text-gray-500">Used for your profit/loss calculations.</p>
            </div>
            <select 
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-lg appearance-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="AUD">AUD ($)</option>
            </select>
            <button 
              disabled={loading}
              onClick={handleSubmit}
              className="w-full h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-black/10"
            >
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" /> : 'Launch Cortex OS'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
