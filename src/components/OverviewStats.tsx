import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Database, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';

export const OverviewStats = () => {
  const { devices, records } = useDataStore();

  const connectedDevices = devices.filter(d => d.status === 'Connected').length;
  const failedDevices = devices.filter(d => d.status === 'Failed').length;
  const processingDevices = devices.filter(d => d.status === 'Processing').length;
  const lastSync = devices
    .filter(d => d.lastSync)
    .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0]?.lastSync;

  const stats = [
    {
      title: 'Total SN Devices',
      value: devices.length.toString(),
      change: `${connectedDevices} connected`,
      icon: Database,
      gradient: 'gradient-primary'
    },
    {
      title: 'Connected',
      value: connectedDevices.toString(),
      change: `${Math.round((connectedDevices / Math.max(devices.length, 1)) * 100)}%`,
      icon: CheckCircle,
      gradient: 'gradient-success'
    },
    {
      title: 'Total Records',
      value: records.length > 999 ? `${(records.length / 1000).toFixed(1)}K` : records.length.toString(),
      change: `${records.filter(r => new Date(r.punchTime) > new Date(Date.now() - 86400000)).length} today`,
      icon: Activity,
      gradient: 'gradient-primary'
    },
    {
      title: 'Last Sync',
      value: lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never',
      change: lastSync ? 'Recent' : 'No data',
      icon: Clock,
      gradient: lastSync ? 'gradient-success' : 'gradient-warning'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="w-4 h-4 text-status-success" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-status-error" />;
      case 'Processing':
        return <Zap className="w-4 h-4 text-status-info animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return <Badge className="status-success">Connected</Badge>;
      case 'Failed':
        return <Badge className="status-error">Failed</Badge>;
      case 'Processing':
        return <Badge className="status-info">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-status-success mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.gradient}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Device Status Table */}
      <Card className="gradient-card border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Device Status</h3>
            <Badge variant="outline" className="text-xs">
              Real-time monitoring
            </Badge>
          </div>

          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No devices configured. Add some devices in the SN List tab to get started.
              </div>
            ) : (
              devices.map((device) => (
                <div 
                  key={device.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(device.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{device.sn}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {device.lastSync ? new Date(device.lastSync).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{device.lastRecords.toLocaleString()} records</p>
                      <Progress value={Math.min((device.lastRecords / 500) * 100, 100)} className="w-20 h-2 mt-1" />
                    </div>
                    {getStatusBadge(device.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 gradient-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Connected Devices</span>
              <span className="text-sm font-medium">{Math.round((connectedDevices / Math.max(devices.length, 1)) * 100)}%</span>
            </div>
            <Progress value={(connectedDevices / Math.max(devices.length, 1)) * 100} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Data Storage</span>
              <span className="text-sm font-medium">{Math.min(Math.round((records.length / 10000) * 100), 100)}%</span>
            </div>
            <Progress value={Math.min((records.length / 10000) * 100, 100)} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">System Load</span>
              <span className="text-sm font-medium">{processingDevices > 0 ? '85%' : '12%'}</span>
            </div>
            <Progress value={processingDevices > 0 ? 85 : 12} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 gradient-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            {devices.length === 0 ? (
              <div className="text-muted-foreground">No activity yet. Add and connect devices to see activity.</div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-status-success"></div>
                  <span>{connectedDevices} devices connected</span>
                  <span className="text-xs text-muted-foreground ml-auto">Now</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-status-info"></div>
                  <span>{records.length} total records stored</span>
                  <span className="text-xs text-muted-foreground ml-auto">Now</span>
                </div>
                {failedDevices > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-status-error"></div>
                    <span>{failedDevices} devices failed to connect</span>
                    <span className="text-xs text-muted-foreground ml-auto">Recent</span>
                  </div>
                )}
                {processingDevices > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-status-warning"></div>
                    <span>{processingDevices} devices processing</span>
                    <span className="text-xs text-muted-foreground ml-auto">Now</span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
