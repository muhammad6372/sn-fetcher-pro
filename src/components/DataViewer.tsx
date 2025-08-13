
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Eye, Trash2 } from 'lucide-react';

interface DataRecord {
  id: string;
  sn: string;
  deviceId: string;
  timestamp: string;
  col3: number;
  col4: number;
  col5: number;
}

export const DataViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSN, setSelectedSN] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Sample data
  const dataRecords: DataRecord[] = [
    {
      id: '1',
      sn: 'SN001',
      deviceId: 'DEV001',
      timestamp: '2024-08-13 10:30:25',
      col3: 25.6,
      col4: 78.2,
      col5: 120.5
    },
    {
      id: '2',
      sn: 'SN001',
      deviceId: 'DEV002',
      timestamp: '2024-08-13 10:29:45',
      col3: 26.1,
      col4: 76.8,
      col5: 118.3
    },
    {
      id: '3',
      sn: 'SN002',
      deviceId: 'DEV001',
      timestamp: '2024-08-13 10:28:15',
      col3: 24.8,
      col4: 79.5,
      col5: 122.1
    },
    {
      id: '4',
      sn: 'SN002',
      deviceId: 'DEV003',
      timestamp: '2024-08-13 10:27:30',
      col3: 27.2,
      col4: 75.6,
      col5: 115.8
    },
    {
      id: '5',
      sn: 'SN004',
      deviceId: 'DEV002',
      timestamp: '2024-08-13 10:26:55',
      col3: 23.9,
      col4: 80.1,
      col5: 125.2
    }
  ];

  const filteredRecords = dataRecords.filter(record => {
    const matchesSearch = record.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSN = selectedSN === 'all' || record.sn === selectedSN;
    const matchesDate = !selectedDate || record.timestamp.startsWith(selectedDate);
    
    return matchesSearch && matchesSN && matchesDate;
  });

  const uniqueSNs = [...new Set(dataRecords.map(record => record.sn))];

  const getValueColor = (value: number, min: number, max: number) => {
    const percentage = (value - min) / (max - min);
    if (percentage < 0.3) return 'text-status-success';
    if (percentage < 0.7) return 'text-status-warning';
    return 'text-status-error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Viewer</h2>
          <p className="text-muted-foreground">View and analyze machine data records</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="hover:bg-status-info/10 hover:border-status-info">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" className="hover:bg-status-error/10 hover:border-status-error">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="gradient-card border-border/50">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SN or Device ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <Select value={selectedSN} onValueChange={setSelectedSN}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by SN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SNs</SelectItem>
                  {uniqueSNs.map(sn => (
                    <SelectItem key={sn} value={sn}>{sn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:w-48">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
            <Button variant="outline" className="lg:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 gradient-card border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{filteredRecords.length}</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </div>
        </Card>
        <Card className="p-4 gradient-card border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-success">{uniqueSNs.length}</p>
            <p className="text-sm text-muted-foreground">Active Devices</p>
          </div>
        </Card>
        <Card className="p-4 gradient-card border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-warning">
              {Math.round(filteredRecords.reduce((acc, r) => acc + r.col3, 0) / filteredRecords.length * 10) / 10}
            </p>
            <p className="text-sm text-muted-foreground">Avg Col3 Value</p>
          </div>
        </Card>
        <Card className="p-4 gradient-card border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-info">
              {filteredRecords.length > 0 ? new Date(filteredRecords[0].timestamp).toLocaleTimeString() : '--'}
            </p>
            <p className="text-sm text-muted-foreground">Last Update</p>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="gradient-card border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Machine Data Records</h3>
            <Badge variant="outline" className="text-xs">
              {filteredRecords.length} of {dataRecords.length} records
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Col3</TableHead>
                  <TableHead className="text-right">Col4</TableHead>
                  <TableHead className="text-right">Col5</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {record.sn}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{record.deviceId}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {record.timestamp}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getValueColor(record.col3, 20, 30)}`}>
                      {record.col3.toFixed(1)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getValueColor(record.col4, 70, 85)}`}>
                      {record.col4.toFixed(1)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getValueColor(record.col5, 110, 130)}`}>
                      {record.col5.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="hover:bg-status-info/10">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-status-error/10">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No records found matching your filters.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
