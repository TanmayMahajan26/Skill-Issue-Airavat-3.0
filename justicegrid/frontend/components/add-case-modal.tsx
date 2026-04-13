import { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';

export function AddCaseModal({ isOpen, onClose, onSuccess, lawyerId, paralegalId }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lawyerId?: string;
  paralegalId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accused_name: '',
    father_name: '',
    age: '',
    gender: 'Male',
    occupation: '',
    education: '',
    address: '',
    fir_number: '',
    police_station: '',
    arrest_date: '',
    is_first_offender: true,
  });

  const [charges, setCharges] = useState<{ section: string; act: string; max_years: number; life_or_death: boolean }[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      charges,
      assigned_lawyer_id: lawyerId || null,
      assigned_paralegal_id: paralegalId || null,
    };

    try {
      const res = await fetchAPI('/api/v1/cases/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCharge = () => {
    setCharges([...charges, { section: '', act: 'IPC', max_years: 0, life_or_death: false }]);
  };

  const updateCharge = (index: number, field: string, value: any) => {
    const newCharges = [...charges];
    newCharges[index] = { ...newCharges[index], [field]: value };
    setCharges(newCharges);
  };

  const removeCharge = (index: number) => {
    setCharges(charges.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-jg-bg/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-slide-up">
        
        {/* Header */}
        <div className="sticky top-0 bg-jg-bg/95 backdrop-blur z-10 p-6 border-b border-jg-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-jg-text">Create New Case Profile</h2>
            <p className="text-xs text-jg-text-secondary">Fill in the details to automatically run ML eligibility</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-jg-border/50 rounded-lg text-jg-text-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Section 1: Profile */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-jg-blue mb-4">1. Accused Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Full Name *</label>
                <input required value={formData.accused_name} onChange={e => setFormData({...formData, accused_name: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none" placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Father&apos;s Name</label>
                <input value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none" placeholder="e.g. Ramesh Sharma" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Age</label>
                <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-jg-text-secondary mb-1">Address</label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none" placeholder="Village/City, District, State" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Occupation</label>
                <input value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Education</label>
                <input value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-blue outline-none" placeholder="e.g. 10th Standard" />
              </div>
            </div>
          </div>

          {/* Section 2: Legal Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-jg-amber mb-4">2. Legal Intelligence Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">FIR Number *</label>
                <input required value={formData.fir_number} onChange={e => setFormData({...formData, fir_number: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-amber outline-none" placeholder="e.g. 120/2024" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Police Station</label>
                <input value={formData.police_station} onChange={e => setFormData({...formData, police_station: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-amber outline-none" />
              </div>
              <div>
                <label className="block text-xs text-jg-text-secondary mb-1">Arrest Date (YYYY-MM-DD) *</label>
                <input required type="date" value={formData.arrest_date} onChange={e => setFormData({...formData, arrest_date: e.target.value})} className="w-full bg-jg-bg border border-jg-border rounded-lg p-2 text-sm text-jg-text focus:border-jg-amber outline-none [color-scheme:dark]" />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_first_offender} onChange={e => setFormData({...formData, is_first_offender: e.target.checked})} className="accent-jg-amber w-4 h-4" />
                  <span className="text-sm text-jg-text">Is First Offender? (S.479 1/3 threshold)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Charges Array */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-jg-purple">3. Charges & Extracted Sentences</h3>
              <button type="button" onClick={addCharge} className="flex items-center gap-1 text-xs bg-jg-purple/20 text-jg-purple px-2 py-1 rounded hover:bg-jg-purple/30 transition">
                <Plus className="w-3 h-3" /> Add Charge
              </button>
            </div>
            
            {charges.length === 0 && (
              <div className="text-center p-4 border border-dashed border-jg-border rounded-lg text-jg-text-secondary text-sm">
                No charges added. S.479 evaluation requires at least one charge.
              </div>
            )}

            <div className="space-y-3">
              {charges.map((charge, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-jg-bg p-3 rounded-lg border border-jg-border">
                  <input placeholder="Section (e.g. 379)" value={charge.section} onChange={e => updateCharge(idx, 'section', e.target.value)} className="flex-1 bg-transparent border-b border-jg-border p-1 text-sm text-jg-text focus:border-jg-purple outline-none" required />
                  <input placeholder="Act" value={charge.act} onChange={e => updateCharge(idx, 'act', e.target.value)} className="w-20 bg-transparent border-b border-jg-border p-1 text-sm text-jg-text focus:border-jg-purple outline-none" required />
                  <input type="number" placeholder="Max Years" value={charge.max_years === 0 ? '' : charge.max_years} onChange={e => updateCharge(idx, 'max_years', parseInt(e.target.value) || 0)} className="w-24 bg-transparent border-b border-jg-border p-1 text-sm text-jg-text focus:border-jg-purple outline-none" required min="1" />
                  <label className="flex items-center gap-1 text-xs text-jg-text-secondary ml-2">
                    <input type="checkbox" checked={charge.life_or_death} onChange={e => updateCharge(idx, 'life_or_death', e.target.checked)} className="accent-jg-red" />
                    Life
                  </label>
                  <button type="button" onClick={() => removeCharge(idx)} className="ml-2 text-jg-red/70 hover:text-jg-red"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-jg-blue hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Run ML Inference & Save Case</>}
          </button>
        </form>
      </div>
    </div>
  );
}
