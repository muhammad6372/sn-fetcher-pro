
export interface SNDevice {
  id: string;
  sn: string;
  password: string;
  startDate: string;
  endDate: string;
  status: 'Connected' | 'Failed' | 'Processing' | 'Idle';
  lastRecords: number;
  lastSync?: string;
}

export interface DataRecord {
  id: string;
  sn: string;
  deviceId: string;
  timestamp: string;
  col3: number;
  col4: number;
  col5: number;
}

export interface SystemStats {
  totalDevices: number;
  connectedDevices: number;
  totalRecords: number;
  lastSync: string;
}
