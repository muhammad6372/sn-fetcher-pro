
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Play, Square, Download, Settings } from 'lucide-react';

interface SNDevice {
  id: string;
  sn: string;
  password: string;
  startDate: string;
  endDate: string;
  status: 'Connected' | 'Failed' | 'Processing' | 'Idle';
  lastRecords: number;
}

export const SNList = () => {
  const [devices, setDevices] = useState<SNDevice[]>([
    {
      id: '1',
      sn: 'SN001',
      password: '****',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Connected',
      lastRecords: 125
    },
    {
      id: '2',
      sn: 'SN002',
      password: '****',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Connected',
      lastRecords: 89
    },
    {
      id: '3',
      sn: 'SN003',
      password: '****',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Failed',
      lastRecords: 0
    }
  ]);

  const [newDevice, setNewDevice] = useState({
    sn: '',
    password: '',
    startDate: '',
    endDate: ''
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return <Badge className="status-success">Connected</Badge>;
      case 'Failed':
        return <Badge className="status-error">Failed</Badge>;
      case 'Processing':
        return <Badge className="status-info">Processing</Badge>;
      case 'Idle':
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddDevice = () => {
    if (newDevice.sn && newDevice.password) {
      const device: SNDevice = {
        id: Date.now().toString(),
        sn: newDevice.sn,
        password: newDevice.password,
        startDate: newDevice.startDate,
        endDate: newDevice.endDate,
        status: 'Idle',
        lastRecords: 0
      };
      setDevices([...devices, device]);
      setNewDevice({ sn: '', password: '', startDate: '', endDate: '' });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id));
  };

  const handleTestConnection = (sn: string) => {
    setDevices(devices.map(device => 
      device.sn === sn 
        ? { ...device, status: 'Processing' as const }
        : device
    ));
    
    // Simulate connection test
    setTimeout(() => {
      setDevices(devices.map(device => 
        device.sn === sn 
          ? { ...device, status: Math.random() > 0.3 ? 'Connected' as const : 'Failed' as const }
          : device
      ));
    }, 2000);
  };

  const handleFetchData = (sn: string) => {
    setDevices(devices.map(device => 
      device.sn === sn 
        ? { ...device, status: 'Processing' as const }
        : device
    ));
    
    // Simulate data fetch
    setTimeout(() => {
      const newRecords = Math.floor(Math.random() * 200) + 50;
      setDevices(devices.map(device => 
        device.sn === sn 
          ? { 
              ...device, 
              status: 'Connected' as const,
              lastRecords: newRecords
            }
          : device
      ));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SN Device Management</h2>
          <p className="text-muted-foreground">Manage your serial number devices and credentials</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white border-0 hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New SN Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sn">Serial Number</Label>
                <Input
                  id="sn"
                  placeholder="Enter SN (e.g., SN001)"
                  value={newDevice.sn}
                  onChange={(e) => setNewDevice({...newDevice, sn: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter device password"
                  value={newDevice.password}
                  onChange={(e) => setNewDevice({...newDevice, password: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newDevice.startDate}
                    onChange={(e) => setNewDevice({...newDevice, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newDevice.endDate}
                    onChange={(e) => setNewDevice({...newDevice, endDate: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddDevice} className="w-full gradient-primary text-white border-0">
                Add Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Devices Table */}
      <Card className="gradient-card border-border/50">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{device.sn}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {device.startDate} to {device.endDate}
                  </TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{device.lastRecords.toLocaleString()}</span>
                      {device.lastRecords > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{device.lastRecords}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(device.sn)}
                        disabled={device.status === 'Processing'}
                        className="hover:bg-status-info/10 hover:border-status-info"
                      >
                        {device.status === 'Processing' ? (
                          <Square className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFetchData(device.sn)}
                        disabled={device.status !== 'Connected'}
                        className="hover:bg-status-success/10 hover:border-status-success"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-muted/50"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDevice(device.id)}
                        className="hover:bg-status-error/10 hover:border-status-error"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bulk Actions */}
      <Card className="gradient-card border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Operations</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="hover:bg-status-success/10 hover:border-status-success">
              <Download className="w-4 h-4 mr-2" />
              Fetch All Data
            </Button>
            <Button variant="outline" className="hover:bg-status-warning/10 hover:border-status-warning">
              <Settings className="w-4 h-4 mr-2" />
              Compact All
            </Button>
            <Button variant="outline" className="hover:bg-status-info/10 hover:border-status-info">
              <Play className="w-4 h-4 mr-2" />
              Test All Connections
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
