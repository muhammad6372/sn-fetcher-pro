
import { SNDevice, DataRecord } from '@/types';

class DataStore {
  private devices: SNDevice[] = [];
  private records: DataRecord[] = [];
  private listeners: (() => void)[] = [];

  // Initialize with localStorage data
  init() {
    try {
      const storedDevices = localStorage.getItem('sn-devices');
      const storedRecords = localStorage.getItem('data-records');
      
      if (storedDevices) {
        this.devices = JSON.parse(storedDevices);
      }
      
      if (storedRecords) {
        this.records = JSON.parse(storedRecords);
      }
    } catch (error) {
      console.error('Error initializing data store:', error);
    }
  }

  // Save to localStorage
  private save() {
    try {
      localStorage.setItem('sn-devices', JSON.stringify(this.devices));
      localStorage.setItem('data-records', JSON.stringify(this.records));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Subscribe to changes
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Device management
  getDevices(): SNDevice[] {
    return [...this.devices];
  }

  addDevice(device: Omit<SNDevice, 'id' | 'status' | 'lastRecords'>): void {
    const newDevice: SNDevice = {
      ...device,
      id: Date.now().toString(),
      status: 'Idle',
      lastRecords: 0
    };
    this.devices.push(newDevice);
    this.save();
  }

  updateDevice(id: string, updates: Partial<SNDevice>): void {
    const index = this.devices.findIndex(d => d.id === id);
    if (index !== -1) {
      this.devices[index] = { ...this.devices[index], ...updates };
      this.save();
    }
  }

  deleteDevice(id: string): void {
    this.devices = this.devices.filter(d => d.id !== id);
    this.records = this.records.filter(r => r.sn !== this.devices.find(d => d.id === id)?.sn);
    this.save();
  }

  // Data management
  getRecords(): DataRecord[] {
    return [...this.records];
  }

  addRecords(newRecords: DataRecord[]): void {
    this.records.push(...newRecords);
    this.save();
  }

  clearRecords(): void {
    this.records = [];
    this.save();
  }

  // Simulate operations
  async simulateTestConnection(deviceId: string): Promise<boolean> {
    this.updateDevice(deviceId, { status: 'Processing' });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure
    const success = Math.random() > 0.2;
    this.updateDevice(deviceId, { 
      status: success ? 'Connected' : 'Failed',
      lastSync: success ? new Date().toISOString() : undefined
    });
    
    return success;
  }

  async simulateFetchData(deviceId: string): Promise<number> {
    this.updateDevice(deviceId, { status: 'Processing' });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return 0;

    // Generate mock data
    const recordCount = Math.floor(Math.random() * 200) + 50;
    const mockRecords: DataRecord[] = [];
    
    for (let i = 0; i < recordCount; i++) {
      mockRecords.push({
        id: `${Date.now()}-${i}`,
        sn: device.sn,
        deviceId: `DEV${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        col3: Math.round((Math.random() * 10 + 20) * 10) / 10,
        col4: Math.round((Math.random() * 15 + 70) * 10) / 10,
        col5: Math.round((Math.random() * 20 + 110) * 10) / 10
      });
    }

    this.addRecords(mockRecords);
    this.updateDevice(deviceId, { 
      status: 'Connected',
      lastRecords: recordCount,
      lastSync: new Date().toISOString()
    });
    
    return recordCount;
  }
}

export const dataStore = new DataStore();
