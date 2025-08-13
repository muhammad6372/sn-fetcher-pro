
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchRequest {
  sn: string;
  password: string;
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sn, password, startDate, endDate }: FetchRequest = await req.json();
    
    console.log(`Fetching data for SN: ${sn}, Start: ${startDate}, End: ${endDate}`);

    // Step 1: Initial request to get cookies
    const initialResponse = await fetch("http://www.solutioncloud.co.id/sc_pro.asp", {
      method: 'GET',
    });

    // Extract cookies from initial response
    const setCookieHeaders = initialResponse.headers.get('set-cookie');
    let cookies = '';
    if (setCookieHeaders) {
      cookies = setCookieHeaders.split(',').map(cookie => cookie.split(';')[0]).join('; ');
    }

    console.log('Initial cookies:', cookies);

    // Step 2: Login with SN and password
    const loginParams = new URLSearchParams();
    loginParams.append('sn', sn);
    loginParams.append('pass', password);

    const loginResponse = await fetch("http://www.solutioncloud.co.id/sc_pro.asp", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
      },
      body: loginParams.toString(),
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }

    // Update cookies with login response
    const loginSetCookies = loginResponse.headers.get('set-cookie');
    if (loginSetCookies) {
      const newCookies = loginSetCookies.split(',').map(cookie => cookie.split(';')[0]).join('; ');
      cookies = cookies ? `${cookies}; ${newCookies}` : newCookies;
    }

    console.log('Login successful, updated cookies:', cookies);

    // Step 3: Fetch attendance data
    const dataResponse = await fetch("http://www.solutioncloud.co.id/view.asp", {
      method: 'GET',
      headers: {
        'Cookie': cookies,
      },
    });

    if (dataResponse.status !== 200) {
      throw new Error(`Data fetch failed with status: ${dataResponse.status}`);
    }

    const htmlContent = await dataResponse.text();
    console.log('Data response length:', htmlContent.length);
    
    // Debug: Log first 1000 characters to see HTML structure
    console.log('HTML sample:', htmlContent.substring(0, 1000));

    // Step 4: Parse the HTML content to extract attendance data
    const attendanceRecords = parseAttendanceData(htmlContent, sn, startDate, endDate);
    
    console.log(`Parsed ${attendanceRecords.length} attendance records`);

    return new Response(JSON.stringify({
      success: true,
      records: attendanceRecords,
      count: attendanceRecords.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-attendance function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      records: [],
      count: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseAttendanceData(htmlContent: string, sn: string, startDate: string, endDate: string) {
  const records = [];
  const startDateTime = startDate ? new Date(startDate) : new Date('1900-01-01');
  const endDateTime = endDate ? new Date(endDate) : new Date('2100-01-01');
  
  try {
    console.log('Starting to parse HTML content...');
    
    // Multiple parsing strategies to handle different HTML formats
    
    // Strategy 1: Look for data in <pre> tags (common for raw data)
    const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
    const preMatches = htmlContent.match(preRegex);
    
    if (preMatches) {
      console.log(`Found ${preMatches.length} <pre> blocks`);
      for (const preMatch of preMatches) {
        const preContent = preMatch.replace(/<\/?pre[^>]*>/gi, '');
        const preRecords = parseTabDelimitedData(preContent, sn, startDateTime, endDateTime);
        records.push(...preRecords);
      }
    }
    
    // Strategy 2: Look for tab-delimited data directly in HTML
    const lines = htmlContent.split(/\r?\n/);
    console.log(`Processing ${lines.length} lines`);
    
    for (const line of lines) {
      const cleanLine = line.replace(/<[^>]*>/g, '').trim();
      if (!cleanLine) continue;
      
      // Look for tab-separated data (empCode\tpunchTime\tverifyType\tstatus\tworkCode)
      const tabParts = cleanLine.split('\t');
      if (tabParts.length >= 5) {
        const record = parseDataLine(tabParts, sn, startDateTime, endDateTime);
        if (record) {
          records.push(record);
        }
      }
      
      // Also try space-separated or other delimiters
      const spaceParts = cleanLine.split(/\s+/);
      if (spaceParts.length >= 5) {
        const record = parseDataLine(spaceParts, sn, startDateTime, endDateTime);
        if (record) {
          records.push(record);
        }
      }
    }
    
    // Strategy 3: Look for table data
    const tableRecords = parseTableData(htmlContent, sn, startDateTime, endDateTime);
    records.push(...tableRecords);
    
    console.log(`Total records found: ${records.length}`);
    
  } catch (error) {
    console.error('Error parsing HTML content:', error);
  }
  
  return records;
}

function parseTabDelimitedData(content: string, sn: string, startDateTime: Date, endDateTime: Date) {
  const records = [];
  const lines = content.split(/\r?\n/);
  
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 5) {
      const record = parseDataLine(parts, sn, startDateTime, endDateTime);
      if (record) {
        records.push(record);
      }
    }
  }
  
  return records;
}

function parseTableData(htmlContent: string, sn: string, startDateTime: Date, endDateTime: Date) {
  const records = [];
  
  try {
    // Look for table rows with attendance data
    const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = htmlContent.match(tableRowRegex) || [];
    
    for (const row of rows) {
      const cells = [];
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gi;
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        const cellContent = cellMatch[1].replace(/<[^>]*>/g, '').trim();
        if (cellContent) {
          cells.push(cellContent);
        }
      }
      
      if (cells.length >= 5) {
        const record = parseDataLine(cells, sn, startDateTime, endDateTime);
        if (record) {
          records.push(record);
        }
      }
    }
  } catch (error) {
    console.error('Error parsing table data:', error);
  }
  
  return records;
}

function parseDataLine(parts: string[], sn: string, startDateTime: Date, endDateTime: Date) {
  try {
    const [empCodeStr, punchTimeStr, verifyTypeStr, statusStr, workCodeStr] = parts;
    
    // Skip header rows or invalid data
    if (!empCodeStr || 
        empCodeStr.toLowerCase().includes('emp') || 
        empCodeStr.toLowerCase().includes('code') ||
        empCodeStr.toLowerCase().includes('id')) {
      return null;
    }
    
    // Validate empCode (should be numeric)
    if (!/^\d+$/.test(empCodeStr.trim())) {
      return null;
    }
    
    // Parse punch time
    let punchTime;
    try {
      const timeStr = punchTimeStr.trim();
      
      // Try various date formats
      if (timeStr.includes('-')) {
        punchTime = new Date(timeStr);
      } else if (timeStr.includes('/')) {
        punchTime = new Date(timeStr);
      } else if (timeStr.includes(' ')) {
        punchTime = new Date(timeStr);
      } else {
        // If it's just numbers, might be timestamp
        const num = parseInt(timeStr);
        if (!isNaN(num) && num > 1000000000) {
          punchTime = new Date(num * 1000); // Convert from seconds to milliseconds
        } else {
          punchTime = new Date(timeStr);
        }
      }
    } catch (e) {
      console.warn('Failed to parse date:', punchTimeStr);
      return null;
    }
    
    // Validate date
    if (isNaN(punchTime.getTime())) {
      return null;
    }
    
    // Filter by date range if specified
    if (startDateTime && endDateTime) {
      if (punchTime < startDateTime || punchTime > endDateTime) {
        return null;
      }
    }
    
    // Parse numeric values with defaults
    const verifyType = parseInt(verifyTypeStr?.trim()) || 1;
    const status = parseInt(statusStr?.trim()) || 0;
    const workCode = parseInt(workCodeStr?.trim()) || 1;
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sn: sn,
      empCode: empCodeStr.trim(),
      punchTime: punchTime.toISOString(),
      verifyType: verifyType,
      status: status,
      workCode: workCode
    };
    
  } catch (error) {
    console.error('Error parsing data line:', parts, error);
    return null;
  }
}
