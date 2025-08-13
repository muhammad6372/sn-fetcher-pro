
import { useState, useEffect } from 'react';
import { dataStore } from '@/stores/dataStore';
import { SNDevice, DataRecord } from '@/types';

export function useDataStore() {
  const [devices, setDevices] = useState<SNDevice[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);

  useEffect(() => {
    // Initialize store
    dataStore.init();
    
    // Set initial data
    setDevices(dataStore.getDevices());
    setRecords(dataStore.getRecords());

    // Subscribe to changes
    const unsubscribe = dataStore.subscribe(() => {
      setDevices(dataStore.getDevices());
      setRecords(dataStore.getRecords());
    });

    return unsubscribe;
  }, []);

  return {
    devices,
    records,
    addDevice: (device: Omit<SNDevice, 'id' | 'status' | 'lastRecords'>) => 
      dataStore.addDevice(device),
    updateDevice: (id: string, updates: Partial<SNDevice>) => 
      dataStore.updateDevice(id, updates),
    deleteDevice: (id: string) => dataStore.deleteDevice(id),
    clearRecords: () => dataStore.clearRecords(),
    testConnection: (id: string) => dataStore.simulateTestConnection(id),
    fetchData: (id: string) => dataStore.simulateFetchData(id)
  };
}
