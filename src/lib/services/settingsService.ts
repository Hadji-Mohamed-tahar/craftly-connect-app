import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FinancialSettings, RevenueRules } from '../types/earnings';

const SETTINGS_DOC_ID = 'financial_settings';

// ========== Settings Management ==========

// Get financial settings
export const getFinancialSettings = async (): Promise<FinancialSettings | null> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID));
    
    if (!settingsDoc.exists()) {
      // Create default settings
      const defaultSettings: FinancialSettings = {
        revenueRules: {
          defaultCurrency: 'SAR',
          taxPercent: 0,
          platformCommissionPercent: 5, // 5% commission on orders
          lastUpdated: new Date().toISOString()
        }
      };
      
      await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), defaultSettings);
      return defaultSettings;
    }
    
    return settingsDoc.data() as FinancialSettings;
  } catch (error) {
    console.error('Error getting financial settings:', error);
    return null;
  }
};

// Update revenue rules
export const updateRevenueRules = async (
  updates: Partial<RevenueRules>
): Promise<boolean> => {
  try {
    const settings = await getFinancialSettings();
    
    if (!settings) {
      return false;
    }
    
    const updatedRules: RevenueRules = {
      ...settings.revenueRules,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'settings', SETTINGS_DOC_ID), {
      revenueRules: updatedRules
    });
    
    return true;
  } catch (error) {
    console.error('Error updating revenue rules:', error);
    return false;
  }
};

// Get platform commission percentage
export const getPlatformCommission = async (): Promise<number> => {
  const settings = await getFinancialSettings();
  return settings?.revenueRules.platformCommissionPercent || 5;
};

// Get default currency
export const getDefaultCurrency = async (): Promise<string> => {
  const settings = await getFinancialSettings();
  return settings?.revenueRules.defaultCurrency || 'SAR';
};
