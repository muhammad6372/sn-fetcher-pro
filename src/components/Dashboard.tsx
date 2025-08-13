
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SNList } from './SNList';
import { DataViewer } from './DataViewer';
import { OverviewStats } from './OverviewStats';
import { Database, Download, Trash2, Settings, Activity } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const { devices, fetchData, clearRecords } = useDataStore();
  const { toast } = useToast();

  const handleFetchAllData = async () => {
    setIsProcessing(true);
    const connectedDevices = devices.filter(d => d.status === 'Connected');
    
    if (connectedDevices.length === 0) {
      toast({
        title: "No Connected Devices",
        description: "Please connect some devices first before fetching data.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    try {
      let totalRecords = 0;
      for (const device of connectedDevices) {
        const records = await fetchData(device.id);
        totalRecords += records;
      }
      
      toast({
        title: "Data Fetch Complete",
        description: `Successfully fetched ${totalRecords} new records from ${connectedDevices.length} devices.`
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: "An error occurred while fetching data.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompactAll = async () => {
    setIsProcessing(true);
    
    // Simulate compact operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Compact Complete",
      description: "All device data has been compacted successfully."
    });
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SN Fetcher Pro</h1>
                <p className="text-sm text-muted-foreground">Industrial Data Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleFetchAllData}
                disabled={isProcessing}
                className="hover:bg-status-success/10 hover:border-status-success hover:text-status-success transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                {isProcessing ? 'Fetching...' : 'Fetch All Data'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCompactAll}
                disabled={isProcessing}
                className="hover:bg-status-warning/10 hover:border-status-warning hover:text-status-warning transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isProcessing ? 'Compacting...' : 'Compact All'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="sn-list" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>SN List</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Data Viewer</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewStats />
          </TabsContent>

          <TabsContent value="sn-list" className="space-y-6">
            <SNList />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataViewer />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Logs</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="text-status-success">✓ [2024-08-13 10:30] Data fetch completed successfully</div>
                <div className="text-status-success">✓ [2024-08-13 10:29] {devices.filter(d => d.status === 'Connected').length} devices connected</div>
                <div className="text-status-warning">⚠ [2024-08-13 10:28] {devices.filter(d => d.status === 'Failed').length} devices failed to connect</div>
                <div className="text-status-info">ℹ [2024-08-13 10:27] System initialized with {devices.length} devices</div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
