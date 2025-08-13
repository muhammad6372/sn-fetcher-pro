
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Eye, Trash2 } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';

export const DataViewer = () => {
  const { devices, records, clearRecords } = useDataStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSN, setSelectedSN] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSN = selectedSN === 'all' || record.sn === selectedSN;
      const matchesDate = !selectedDate || record.timestamp.startsWith(selectedDate);
      
      return matchesSearch && matchesSN && matchesDate;
    });
  }, [records, searchTerm, selectedSN, selectedDate]);

  const uniqueSNs = [...new Set(records.map(record => record.sn))];

  const getValueColor = (value: number, min: number, max: number) => {
    const percentage = (value - min) / (max - min);
    if (percentage < 0.3) return 'text-status-success';
    if (percentage < 0.7) return 'text-status-warning';
    return 'text-status-error';
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No records match your current filters.",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Serial Number', 'Device ID', 'Timestamp', 'Col3', 'Col4', 'Col5'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.sn,
        record.deviceId,
        record.timestamp,
        record.col3,
        record.col4,
        record.col5
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machine_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredRecords.length} records to CSV.`
    });
  };

  const handleClearData = () => {
    clearRecords();
    toast({
      title: "Data Cleared",
      description: "All machine data records have been cleared."
    });
  };

  const avgCol3 = filteredRecords.length > 0 
    ? Math.round(filteredRecords.reduce((acc, r) => acc + r.col3, 0) / filteredRecords.length * 10) / 10
    : 0;

  const lastUpdate = filteredRecords.length > 0 
    ? new Date(Math.max(...filteredRecords.map(r => new Date(r.timestamp).getTime()))).toLocaleTimeString()
    : '--';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Viewer</h2>
          <p className="text-muted-foreground">View and analyze machine data records</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="hover:bg-status-info/10 hover:border-status-info"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearData}
            disabled={records.length === 0}
            className="hover:bg-status-error/10 hover:border-status-error"
          >
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
            <p className="text-2xl font-bold text-status-warning">{avgCol3}</p>
            <p className="text-sm text-muted-foreground">Avg Col3 Value</p>
          </div>
        </Card>
        <Card className="p-4 gradient-card border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-info">{lastUpdate}</p>
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
              {filteredRecords.length} of {records.length} records
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
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {records.length === 0 
                          ? "No data records available. Fetch data from devices to see records here."
                          : "No records found matching your filters."
                        }
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.slice(0, 100).map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {record.sn}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{record.deviceId}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length > 100 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing first 100 of {filteredRecords.length} records. Use filters to narrow down results.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
