import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { FiCheckCircle, FiUpload, FiCreditCard } from 'react-icons/fi';

const ManagePayments = () => {
  const { refreshAll } = useSettings();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Payment Form States
  const [easyPaisa, setEasyPaisa] = useState({ accountTitle: '', mobileNumber: '', qrCode: '' });
  const [jazzCash, setJazzCash] = useState({ accountTitle: '', mobileNumber: '', qrCode: '' });
  const [bank, setBank] = useState({ bankName: '', accountTitle: '', accountNumber: '', iban: '' });

  // Upload status flags
  const [uploadingEP, setUploadingEP] = useState(false);
  const [uploadingJC, setUploadingJC] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('/api/payments');
        if (response.data.success) {
          const { easyPaisa: ep, jazzCash: jc, bank: bk } = response.data.data;
          setEasyPaisa(ep || { accountTitle: '', mobileNumber: '', qrCode: '' });
          setJazzCash(jc || { accountTitle: '', mobileNumber: '', qrCode: '' });
          setBank(bk || { bankName: '', accountTitle: '', accountNumber: '', iban: '' });
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleQrUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'ep') setUploadingEP(true);
    if (type === 'jc') setUploadingJC(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        if (type === 'ep') {
          setEasyPaisa((prev) => ({ ...prev, qrCode: response.data.url }));
        } else {
          setJazzCash((prev) => ({ ...prev, qrCode: response.data.url }));
        }
      }
    } catch (err) {
      console.error('Error uploading QR code:', err);
      alert('QR code upload failed.');
    } finally {
      setUploadingEP(false);
      setUploadingJC(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      const response = await axios.put('/api/payments', {
        easyPaisa,
        jazzCash,
        bank,
      });

      if (response.data.success) {
        setSuccess(true);
        refreshAll(); // Refresh settings context
      }
    } catch (err) {
      console.error('Error updating payments:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Payment Configuration</h1>
          <p className="text-gray-500 text-xs">Set receiving EasyPaisa numbers, JazzCash titles, Bank accounts, and QR codes.</p>
        </div>
      </section>

      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-2xl border border-green-200 text-xs font-bold flex items-center space-x-2">
          <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>Payment details updated successfully! Changes are live on the checkout page.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs font-medium text-gray-600">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* EasyPaisa Card */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6">
            <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
              <FiCreditCard className="text-primary w-5 h-5" />
              <span>1. EasyPaisa Details</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Account Title</label>
                <input
                  type="text"
                  placeholder="e.g. Hajian Foods EP"
                  value={easyPaisa.accountTitle}
                  onChange={(e) => setEasyPaisa({ ...easyPaisa, accountTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 03001234567"
                  value={easyPaisa.mobileNumber}
                  onChange={(e) => setEasyPaisa({ ...easyPaisa, mobileNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              {/* QR Upload */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">QR Code Image</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 py-2.5 px-4 bg-white border border-light-gray rounded-xl cursor-pointer hover:bg-gray-50 text-xs font-bold text-dark/85 shadow-sm">
                    <FiUpload className="text-primary w-4 h-4" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQrUpload(e, 'ep')}
                      className="hidden"
                    />
                  </label>
                  {uploadingEP && <span className="text-[10px] text-gray-400 animate-pulse">Uploading...</span>}
                </div>
                
                <input
                  type="text"
                  placeholder="Or paste QR image URL..."
                  value={easyPaisa.qrCode}
                  onChange={(e) => setEasyPaisa({ ...easyPaisa, qrCode: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                />

                {easyPaisa.qrCode && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-light-gray mt-2 bg-white p-1">
                    <img src={easyPaisa.qrCode} alt="EP QR Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* JazzCash Card */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6">
            <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
              <FiCreditCard className="text-primary w-5 h-5" />
              <span>2. JazzCash Details</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Account Title</label>
                <input
                  type="text"
                  placeholder="e.g. Hajian Foods JC"
                  value={jazzCash.accountTitle}
                  onChange={(e) => setJazzCash({ ...jazzCash, accountTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 03151234567"
                  value={jazzCash.mobileNumber}
                  onChange={(e) => setJazzCash({ ...jazzCash, mobileNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              {/* QR Upload */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">QR Code Image</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 py-2.5 px-4 bg-white border border-light-gray rounded-xl cursor-pointer hover:bg-gray-50 text-xs font-bold text-dark/85 shadow-sm">
                    <FiUpload className="text-primary w-4 h-4" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQrUpload(e, 'jc')}
                      className="hidden"
                    />
                  </label>
                  {uploadingJC && <span className="text-[10px] text-gray-400 animate-pulse">Uploading...</span>}
                </div>
                
                <input
                  type="text"
                  placeholder="Or paste QR image URL..."
                  value={jazzCash.qrCode}
                  onChange={(e) => setJazzCash({ ...jazzCash, qrCode: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                />

                {jazzCash.qrCode && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-light-gray mt-2 bg-white p-1">
                    <img src={jazzCash.qrCode} alt="JC QR Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Account details */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
              <FiCreditCard className="text-primary w-5 h-5" />
              <span>3. Bank Account Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meezan Bank Limited"
                  value={bank.bankName}
                  onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Account Title</label>
                <input
                  type="text"
                  placeholder="e.g. Hajian Foods"
                  value={bank.accountTitle}
                  onChange={(e) => setBank({ ...bank, accountTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 123401020304"
                  value={bank.accountNumber}
                  onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">IBAN Number</label>
                <input
                  type="text"
                  placeholder="e.g. PK49MEZN123401020304"
                  value={bank.iban}
                  onChange={(e) => setBank({ ...bank, iban: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                />
              </div>
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
        >
          {submitting ? 'Saving Settings...' : 'Save Payment Configuration'}
        </button>

      </form>
    </div>
  );
};

export default ManagePayments;
