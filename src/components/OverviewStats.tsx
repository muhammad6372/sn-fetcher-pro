
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Database, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export const OverviewStats = () => {
  const stats = [
    {
      title: 'Total SN Devices',
      value: '12',
      change: '+2',
      icon: Database,
      gradient: 'gradient-primary'
    },
    {
      title: 'Connected',
      value: '9',
      change: '75%',
      icon: CheckCircle,
      gradient: 'gradient-success'
    },
    {
      title: 'Total Records',
      value: '15.2K',
      change: '+1.2K',
      icon: Activity,
      gradient: 'gradient-primary'
    },
    {
      title: 'Last Sync',
      value: '2m ago',
      change: 'Active',
      icon: Clock,
      gradient: 'gradient-success'
    }
  ];

  const deviceStatus = [
    { sn: 'SN001', name: 'Machine A1', status: 'Connected', lastSync: '1m ago', records: 1250 },
    { sn: 'SN002', name: 'Machine B2', status: 'Connected', lastSync: '2m ago', records: 890 },
    { sn: 'SN003', name: 'Machine C3', status: 'Failed', lastSync: '5m ago', records: 0 },
    { sn: 'SN004', name: 'Machine D4', status: 'Connected', lastSync: '1m ago', records: 2100 },
    { sn: 'SN005', name: 'Machine E5', status: 'Processing', lastSync: 'Now', records: 450 }
  ];

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
            {deviceStatus.map((device) => (
              <div 
                key={device.sn} 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(device.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{device.sn}</span>
                      <span className="text-sm text-muted-foreground">({device.name})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Last sync: {device.lastSync}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{device.records.toLocaleString()} records</p>
                    <Progress value={device.records / 25} className="w-20 h-2 mt-1" />
                  </div>
                  {getStatusBadge(device.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 gradient-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">CPU Usage</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <Progress value={45} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Memory</span>
              <span className="text-sm font-medium">62%</span>
            </div>
            <Progress value={62} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Storage</span>
              <span className="text-sm font-medium">38%</span>
            </div>
            <Progress value={38} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 gradient-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-status-success"></div>
              <span>SN001 data sync completed</span>
              <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-status-success"></div>
              <span>SN004 connected successfully</span>
              <span className="text-xs text-muted-foreground ml-auto">3m ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-status-error"></div>
              <span>SN003 connection failed</span>
              <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-status-warning"></div>
              <span>Compact operation started</span>
              <span className="text-xs text-muted-foreground ml-auto">8m ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
