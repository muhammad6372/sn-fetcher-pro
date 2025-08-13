import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, Trash2 } from 'lucide-react';
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
                           record.empCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSN = selectedSN === 'all' || record.sn === selectedSN;
      const matchesDate = !selectedDate || record.punchTime.startsWith(selectedDate);
      
      return matchesSearch && matchesSN && matchesDate;
    });
  }, [records, searchTerm, selectedSN, selectedDate]);

  const uniqueSNs = [...new Set(records.map(record => record.sn))];

  const getVerifyTypeText = (type: number) => {
    const types: { [key: number]: string } = {
      1: 'Fingerprint', 2: 'Password', 3: 'Card', 4: 'Face', 
      5: 'Password+Fingerprint', 6: 'Password+Card', 7: 'Password+Face',
      8: 'Fingerprint+Card', 9: 'Fingerprint+Face', 10: 'Card+Face',
      11: 'Password+Fingerprint+Card', 12: 'Password+Fingerprint+Face',
      13: 'Password+Card+Face', 14: 'Fingerprint+Card+Face', 15: 'All'
    };
    return types[type] || `Type ${type}`;
  };

  const getStatusText = (status: number) => {
    const statuses: { [key: number]: string } = {
      0: 'Check In', 1: 'Check Out', 2: 'Break Out', 3: 'Break In', 4: 'Overtime'
    };
    return statuses[status] || `Status ${status}`;
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-status-success'; // Check In
      case 1: return 'text-status-error';   // Check Out
      case 2: return 'text-status-warning'; // Break Out
      case 3: return 'text-status-info';    // Break In
      case 4: return 'text-status-warning'; // Overtime
      default: return 'text-muted-foreground';
    }
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

    const headers = ['Employee Code', 'Punch Time', 'Verify Type', 'Status', 'Work Code'];
    const csvContent = [
      headers.join('\t'),
      ...filteredRecords.map(record => [
        record.empCode,
        new Date(record.punchTime).toISOString().replace('T', ' ').replace('Z', ''),
        record.verifyType,
        record.status,
        record.workCode
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filteredRecords[0]?.sn || 'attendance'}_attlog.dat`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredRecords.length} attendance records to .dat file.`
    });
  };

  const handleClearData = () => {
    clearRecords();
    toast({
      title: "Data Cleared",
      description: "All attendance records have been cleared."
    });
  };

  const uniqueEmployees = [...new Set(filteredRecords.map(r => r.empCode))].length;
  const lastUpdate = filteredRecords.length > 0 
    ? new Date(Math.max(...filteredRecords.map(r => new Date(r.punchTime).getTime()))).toLocaleTimeString()
    : '--';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Records</h2>
          <p className="text-muted-foreground">View and analyze attendance data from devices</p>
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
                  placeholder="Search by SN or Employee Code..."
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
            <p className="text-2xl font-bold text-status-warning">{uniqueEmployees}</p>
            <p className="text-sm text-muted-foreground">Unique Employees</p>
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
            <h3 className="text-lg font-semibold">Attendance Records</h3>
            <Badge variant="outline" className="text-xs">
              {filteredRecords.length} of {records.length} records
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Punch Time</TableHead>
                  <TableHead>Verify Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {records.length === 0 
                          ? "No attendance records available. Fetch data from devices to see records here."
                          : "No records found matching your filters."
                        }
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.slice(0, 100).map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium font-mono">
                        {record.empCode}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {new Date(record.punchTime).toLocaleString('sv-SE').replace('T', ' ')}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {record.verifyType}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.workCode}
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
