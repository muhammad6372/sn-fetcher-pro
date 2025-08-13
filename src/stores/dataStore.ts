
import { SNDevice, AttendanceRecord } from '@/types';
import { supabase } from '@/integrations/supabase/client';

class DataStore {
  private devices: SNDevice[] = [];
  private records: AttendanceRecord[] = [];
  private listeners: (() => void)[] = [];

  // Initialize with localStorage data
  init() {
    try {
      const storedDevices = localStorage.getItem('sn-devices');
      const storedRecords = localStorage.getItem('attendance-records');
      
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
      localStorage.setItem('attendance-records', JSON.stringify(this.records));
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
    const deviceToDelete = this.devices.find(d => d.id === id);
    this.devices = this.devices.filter(d => d.id !== id);
    if (deviceToDelete) {
      this.records = this.records.filter(r => r.sn !== deviceToDelete.sn);
    }
    this.save();
  }

  // Data management
  getRecords(): AttendanceRecord[] {
    return [...this.records];
  }

  addRecords(newRecords: AttendanceRecord[]): void {
    this.records.push(...newRecords);
    this.save();
  }

  clearRecords(): void {
    this.records = [];
    this.save();
  }

  // Real connection test
  async simulateTestConnection(deviceId: string): Promise<boolean> {
    this.updateDevice(deviceId, { status: 'Processing' });
    
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) {
      this.updateDevice(deviceId, { status: 'Failed' });
      return false;
    }

    try {
      // Test connection with a simple request to the server
      const response = await supabase.functions.invoke('fetch-attendance', {
        body: {
          sn: device.sn,
          password: device.password,
          startDate: device.startDate,
          endDate: device.startDate // Just test with start date for connection test
        }
      });

      if (response.error) {
        console.error('Connection test failed:', response.error);
        this.updateDevice(deviceId, { status: 'Failed' });
        return false;
      }

      this.updateDevice(deviceId, { 
        status: 'Connected',
        lastSync: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      this.updateDevice(deviceId, { status: 'Failed' });
      return false;
    }
  }

  // Real data fetching
  async simulateFetchData(deviceId: string): Promise<number> {
    this.updateDevice(deviceId, { status: 'Processing' });
    
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) {
      this.updateDevice(deviceId, { status: 'Failed' });
      return 0;
    }

    try {
      console.log(`Fetching real data for device ${device.sn}`);
      
      const response = await supabase.functions.invoke('fetch-attendance', {
        body: {
          sn: device.sn,
          password: device.password,
          startDate: device.startDate,
          endDate: device.endDate
        }
      });

      if (response.error) {
        console.error('Data fetch failed:', response.error);
        this.updateDevice(deviceId, { status: 'Failed' });
        return 0;
      }

      const data = response.data;
      if (data && data.success && data.records) {
        this.addRecords(data.records);
        
        this.updateDevice(deviceId, { 
          status: 'Connected',
          lastRecords: data.count,
          lastSync: new Date().toISOString()
        });
        
        console.log(`Successfully fetched ${data.count} records for ${device.sn}`);
        return data.count;
      } else {
        console.error('Invalid response data:', data);
        this.updateDevice(deviceId, { status: 'Failed' });
        return 0;
      }
    } catch (error) {
      console.error('Data fetch error:', error);
      this.updateDevice(deviceId, { status: 'Failed' });
      return 0;
    }
  }
}

export const dataStore = new DataStore();
