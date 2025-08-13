
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Play, Square, Download, Settings } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';

export const SNList = () => {
  const { devices, addDevice, deleteDevice, testConnection, fetchData } = useDataStore();
  const { toast } = useToast();

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
      addDevice({
        sn: newDevice.sn,
        password: newDevice.password,
        startDate: newDevice.startDate,
        endDate: newDevice.endDate
      });
      
      setNewDevice({ sn: '', password: '', startDate: '', endDate: '' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Device Added",
        description: `SN ${newDevice.sn} has been added successfully.`
      });
    }
  };

  const handleDeleteDevice = (id: string, sn: string) => {
    deleteDevice(id);
    toast({
      title: "Device Removed",
      description: `SN ${sn} has been removed from the list.`
    });
  };

  const handleTestConnection = async (id: string, sn: string) => {
    try {
      const success = await testConnection(id);
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: `SN ${sn} connection test ${success ? 'passed' : 'failed'}.`,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: `Failed to test connection for SN ${sn}.`,
        variant: "destructive"
      });
    }
  };

  const handleFetchData = async (id: string, sn: string) => {
    const device = devices.find(d => d.id === id);
    if (device?.status !== 'Connected') {
      toast({
        title: "Device Not Connected",
        description: `Please test connection for SN ${sn} first.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const recordCount = await fetchData(id);
      toast({
        title: "Data Fetch Complete",
        description: `Successfully fetched ${recordCount} records from SN ${sn}.`
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: `Failed to fetch data from SN ${sn}.`,
        variant: "destructive"
      });
    }
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
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No devices added yet. Click "Add Device" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
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
                          onClick={() => handleTestConnection(device.id, device.sn)}
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
                          onClick={() => handleFetchData(device.id, device.sn)}
                          disabled={device.status !== 'Connected'}
                          className="hover:bg-status-success/10 hover:border-status-success"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDevice(device.id, device.sn)}
                          className="hover:bg-status-error/10 hover:border-status-error"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
