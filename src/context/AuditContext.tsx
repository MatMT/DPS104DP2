import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/Product';
import { AuditEntry } from '../types/AuditEntry';
import { INITIAL_PRODUCTS } from '../data/products';
import { SEED_AUDIT_LOGS } from '../data/seedAudits';

interface AuditContextType {
  products: Product[];
  auditLogs: AuditEntry[];
  loading: boolean;
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'> & { timestamp?: string }) => Promise<AuditEntry>;
  getProductByBarcode: (barcode: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  deleteAuditEntry: (id: string) => Promise<void>;
  clearAuditLogs: () => Promise<void>;
  reloadAuditLogs: () => Promise<void>;
}

const STORAGE_KEY = '@dps_audit_logs_v1';

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar registros persistidos al iniciar
  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuditEntry[] = JSON.parse(stored);
        setAuditLogs(parsed);
      } else {
        // Inicializar con semillas de prueba para facilitar la demostración
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
        setAuditLogs(SEED_AUDIT_LOGS);
      }
    } catch (error) {
      console.error('Error al cargar la bitácora de auditorías:', error);
      setAuditLogs(SEED_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const addAuditEntry = async (
    entryData: Omit<AuditEntry, 'id' | 'timestamp'> & { timestamp?: string }
  ): Promise<AuditEntry> => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entryData.timestamp || new Date().toISOString(),
      productId: entryData.productId,
      productTitle: entryData.productTitle,
      actionType: entryData.actionType,
      audioNoteUrl: entryData.audioNoteUrl,
      location: entryData.location,
    };

    const updated = [newEntry, ...auditLogs];
    setAuditLogs(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error al persistir la nueva auditoría:', error);
    }

    return newEntry;
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    const cleanBarcode = barcode.trim();
    return products.find((p) => p.barcode === cleanBarcode);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const deleteAuditEntry = async (id: string) => {
    const updated = auditLogs.filter((log) => log.id !== id);
    setAuditLogs(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error al eliminar auditoría:', error);
    }
  };

  const clearAuditLogs = async () => {
    setAuditLogs([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar auditorías:', error);
    }
  };

  const reloadAuditLogs = async () => {
    await loadAuditLogs();
  };

  return (
    <AuditContext.Provider
      value={{
        products,
        auditLogs,
        loading,
        addAuditEntry,
        getProductByBarcode,
        getProductById,
        deleteAuditEntry,
        clearAuditLogs,
        reloadAuditLogs,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit debe ser utilizado dentro de un AuditProvider');
  }
  return context;
};
