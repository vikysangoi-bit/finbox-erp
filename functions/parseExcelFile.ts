import * as XLSX from 'xlsx';

export default async function parseExcelFile({ file_url, json_schema }) {
  try {
    // Fetch the Excel file
    const response = await fetch(file_url);
    if (!response.ok) {
      return {
        status: 'error',
        details: 'Failed to download the file'
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        status: 'error',
        details: 'No sheets found in the Excel file'
      };
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    if (!jsonData || jsonData.length === 0) {
      return {
        status: 'error',
        details: 'No data found in the Excel file'
      };
    }

    // Process the data based on schema
    const processedData = jsonData.map(row => {
      const processed = {};
      const schemaProps = json_schema.items?.properties || json_schema.properties || {};
      
      for (const [key, value] of Object.entries(row)) {
        const schemaProp = schemaProps[key];
        if (!schemaProp) continue;
        
        // Handle different types
        if (schemaProp.type === 'number') {
          processed[key] = value === '' ? 0 : parseFloat(value) || 0;
        } else if (schemaProp.type === 'boolean') {
          processed[key] = value === 'true' || value === true || value === 1;
        } else if (schemaProp.type === 'array') {
          processed[key] = typeof value === 'string' ? value.split(',').map(v => v.trim()) : value;
        } else {
          processed[key] = value === '' ? undefined : String(value);
        }
      }
      
      return processed;
    });

    return {
      status: 'success',
      output: processedData
    };

  } catch (error) {
    return {
      status: 'error',
      details: error.message || 'Failed to parse Excel file'
    };
  }
}