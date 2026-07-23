import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Building } from 'lucide-react';
import api from '../services/api';

const SettingsPage = () => {
  const [setting, setSetting] = useState({
    companyName: '',
    tagline: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: '',
    },
    termsAndConditions: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.setting) setSetting(res.setting);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', setting);
      alert('Company settings saved successfully!');
    } catch (err) {
      alert(err.message || 'Saving settings failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Company Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure company branding, GST details, bank information & GST invoice terms</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass-card border border-slate-800 p-6 rounded-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Company Name *</label>
            <input
              required
              type="text"
              value={setting.companyName}
              onChange={(e) => setSetting({ ...setting, companyName: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tagline</label>
            <input
              type="text"
              value={setting.tagline}
              onChange={(e) => setSetting({ ...setting, tagline: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label>
            <input
              type="email"
              value={setting.email}
              onChange={(e) => setSetting({ ...setting, email: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={setting.phone}
              onChange={(e) => setSetting({ ...setting, phone: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">GSTIN Number</label>
            <input
              type="text"
              value={setting.gstNumber}
              onChange={(e) => setSetting({ ...setting, gstNumber: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white uppercase font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Address</label>
          <textarea
            rows={2}
            value={setting.address}
            onChange={(e) => setSetting({ ...setting, address: e.target.value })}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
          />
        </div>

        {/* Bank Details */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">Invoice Bank Account Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Name</label>
              <input
                type="text"
                value={setting.bankDetails?.accountName || ''}
                onChange={(e) =>
                  setSetting({ ...setting, bankDetails: { ...setting.bankDetails, accountName: e.target.value } })
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Number</label>
              <input
                type="text"
                value={setting.bankDetails?.accountNumber || ''}
                onChange={(e) =>
                  setSetting({ ...setting, bankDetails: { ...setting.bankDetails, accountNumber: e.target.value } })
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Bank Name</label>
              <input
                type="text"
                value={setting.bankDetails?.bankName || ''}
                onChange={(e) =>
                  setSetting({ ...setting, bankDetails: { ...setting.bankDetails, bankName: e.target.value } })
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">IFSC Code</label>
              <input
                type="text"
                value={setting.bankDetails?.ifscCode || ''}
                onChange={(e) =>
                  setSetting({ ...setting, bankDetails: { ...setting.bankDetails, ifscCode: e.target.value } })
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Branch Name</label>
              <input
                type="text"
                value={setting.bankDetails?.branch || ''}
                onChange={(e) =>
                  setSetting({ ...setting, bankDetails: { ...setting.bankDetails, branch: e.target.value } })
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
          >
            <Save className="h-4 w-4" /> Save Company Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
