
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

export interface AttendanceRecord {
  id: string;
  sn: string;
  empCode: string;
  punchTime: string;
  verifyType: number;
  status: number;
}

export interface SystemStats {
  totalDevices: number;
  connectedDevices: number;
  totalRecords: number;
  lastSync: string;
}
