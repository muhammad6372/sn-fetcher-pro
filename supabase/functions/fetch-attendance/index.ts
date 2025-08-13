
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
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  
  try {
    // Look for table rows with attendance data
    // The format should be: empCode, punchTime, verifyType, status, workCode
    const tableRowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gi;
    
    const rows = htmlContent.match(tableRowRegex) || [];
    
    for (const row of rows) {
      const cells = [];
      let cellMatch;
      
      // Reset regex lastIndex
      cellRegex.lastIndex = 0;
      
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        // Clean up cell content - remove HTML tags and trim
        const cellContent = cellMatch[1].replace(/<[^>]*>/g, '').trim();
        if (cellContent) {
          cells.push(cellContent);
        }
      }
      
      // Skip header rows or invalid data
      if (cells.length >= 5 && !cells[0].toLowerCase().includes('emp') && !cells[0].toLowerCase().includes('code')) {
        const [empCode, punchTimeStr, verifyTypeStr, statusStr, workCodeStr] = cells;
        
        // Parse punch time
        let punchTime;
        try {
          // Try different date formats
          if (punchTimeStr.includes('-')) {
            punchTime = new Date(punchTimeStr);
          } else if (punchTimeStr.includes('/')) {
            // Handle MM/DD/YYYY or DD/MM/YYYY format
            const parts = punchTimeStr.split(/[\s\/]/);
            if (parts.length >= 3) {
              punchTime = new Date(parts.join('/'));
            }
          } else {
            punchTime = new Date(punchTimeStr);
          }
        } catch (e) {
          console.warn('Failed to parse date:', punchTimeStr);
          continue;
        }
        
        // Filter by date range
        if (isNaN(punchTime.getTime()) || punchTime < startDateTime || punchTime > endDateTime) {
          continue;
        }
        
        // Parse numeric values
        const verifyType = parseInt(verifyTypeStr) || 1;
        const status = parseInt(statusStr) || 0;
        const workCode = parseInt(workCodeStr) || 1;
        
        // Validate empCode (should be numeric)
        if (!/^\d+$/.test(empCode)) {
          continue;
        }
        
        records.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sn: sn,
          empCode: empCode,
          punchTime: punchTime.toISOString(),
          verifyType: verifyType,
          status: status,
          workCode: workCode
        });
      }
    }
  } catch (error) {
    console.error('Error parsing HTML content:', error);
  }
  
  return records;
}
