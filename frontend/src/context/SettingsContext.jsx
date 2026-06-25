import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    restaurantName: 'HAJIAN FOODS',
    slogan: 'GOOD MOOD GOOD FOOD',
    address: 'Kohat Road Near Hajian Hotel, Sra Khawra',
    phone: '',
    whatsapp: '',
    email: '',
    socialLinks: { facebook: '', instagram: '', tiktok: '', whatsapp: '' },
    heroSection: { heading: 'HAJIAN FOODS', slogan: 'GOOD MOOD GOOD FOOD', description: 'Serving delicious fast food made with fresh ingredients, premium quality, and unforgettable taste.' }
  });
  
  const [paymentDetails, setPaymentDetails] = useState({
    easyPaisa: { accountTitle: '', mobileNumber: '', qrCode: '' },
    jazzCash: { accountTitle: '', mobileNumber: '', qrCode: '' },
    bank: { bankName: '', accountTitle: '', accountNumber: '', iban: '' }
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching website settings:', error);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get('/api/payments');
      if (response.data.success) {
        setPaymentDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchPaymentDetails()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, paymentDetails, loading, refreshAll }}>
      {children}
    </SettingsContext.Provider>
  );
};
