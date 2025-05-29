// CSV processor for Deno runtime (Supabase Edge Functions)
// Using a simple manual CSV parser since Papa Parse might not be available in Deno

export interface CsvProcessingOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  skipEmptyLines?: boolean;
  maxRows?: number;
}

export interface CsvProcessingResult {
  text: string;
  rowCount: number;
  columnCount: number;
  headers?: string[];
  errors: string[];
}

/**
 * Simple CSV parser for Deno runtime
 * @param csvContent - Raw CSV content as string
 * @param delimiter - CSV delimiter (default: ',')
 * @returns Parsed CSV data as array of arrays
 */
export function parseSimpleCsv(csvContent: string, delimiter: string = ','): string[][] {
  const lines = csvContent.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
}

/**
 * Processes CSV content and converts it to readable text format for RAG
 * @param csvContent - Raw CSV content as string
 * @param options - Processing options
 * @returns Processed result with text content and metadata
 */
export function processCsvToText(
  csvContent: string,
  options: CsvProcessingOptions = {}
): CsvProcessingResult {
  const {
    includeHeaders = true,
    delimiter = ',',
    skipEmptyLines = true,
    maxRows = 10000, // Prevent processing extremely large files
  } = options;

  try {
    // Parse CSV content
    const data = parseSimpleCsv(csvContent, delimiter);
    
    if (!data || data.length === 0) {
      return {
        text: '',
        rowCount: 0,
        columnCount: 0,
        errors: ['No data found in CSV file'],
      };
    }

    // Filter empty lines if requested
    const filteredData = skipEmptyLines 
      ? data.filter(row => row.some(cell => cell.trim() !== ''))
      : data;

    // Limit rows to prevent memory issues
    const limitedData = filteredData.slice(0, maxRows);
    const headers = limitedData[0] || [];
    const dataRows = limitedData.slice(1);

    // Generate human-readable text content
    const textParts: string[] = [];

    // Add headers information if requested
    if (includeHeaders && headers.length > 0) {
      textParts.push(`This CSV file contains ${headers.length} columns: ${headers.join(', ')}.`);
      textParts.push(''); // Empty line for readability
    }

    // Convert rows to readable format
    dataRows.forEach((row, index) => {
      if (row.length === 0) return; // Skip empty rows

      const rowParts: string[] = [];
      
      row.forEach((cell, cellIndex) => {
        if (cell && cell.trim()) {
          const columnName = headers[cellIndex] || `Column ${cellIndex + 1}`;
          rowParts.push(`${columnName}: ${cell}`);
        }
      });

      if (rowParts.length > 0) {
        textParts.push(`Row ${index + 1} - ${rowParts.join(', ')}`);
      }
    });

    // Add summary information
    if (textParts.length > 0) {
      textParts.unshift(`CSV Data Summary: ${dataRows.length} records with ${headers.length} columns.`);
      textParts.unshift(''); // Empty line
    }

    const result: CsvProcessingResult = {
      text: textParts.join('\n'),
      rowCount: dataRows.length,
      columnCount: headers.length,
      headers: includeHeaders ? headers : undefined,
      errors: [],
    };

    return result;

  } catch (error) {
    return {
      text: '',
      rowCount: 0,
      columnCount: 0,
      errors: [`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Validates if a file appears to be a valid CSV
 * @param content - File content as string
 * @returns True if content appears to be valid CSV
 */
export function isValidCsv(content: string): boolean {
  try {
    if (!content || content.trim().length === 0) {
      return false;
    }

    const trimmedContent = content.trim();
    
    // Reject content that looks like HTML/XML
    if (trimmedContent.includes('<html') || 
        trimmedContent.includes('<!DOCTYPE') || 
        trimmedContent.includes('<head>') ||
        trimmedContent.includes('<body>') ||
        trimmedContent.includes('<div') ||
        trimmedContent.includes('<span') ||
        trimmedContent.includes('<p>') ||
        trimmedContent.includes('<script') ||
        trimmedContent.includes('<style')) {
      return false;
    }

    // Reject content that looks like JSON
    if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
        (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
      return false;
    }

    // Reject content that looks like markdown or other formats
    if (trimmedContent.includes('# ') || 
        trimmedContent.includes('## ') ||
        trimmedContent.includes('### ') ||
        trimmedContent.includes('**') ||
        trimmedContent.includes('```')) {
      return false;
    }

    // Basic CSV validation
    const lines = trimmedContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) { // Need at least header + 1 data row
      return false;
    }

    // For a file to be considered CSV, we need:
    // 1. Consistent delimiter usage across lines
    // 2. At least 2 columns (some delimiter count)
    // 3. Reasonable structure consistency

    // Check the first few lines for consistent structure
    const sampleSize = Math.min(5, lines.length);
    const sampleLines = lines.slice(0, sampleSize);
    
    // Try common delimiters
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = '';
    let maxConsistency = 0;

    for (const delimiter of delimiters) {
      const counts = sampleLines.map(line => (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length);
      
      // All lines should have at least 1 delimiter (2+ columns)
      if (counts.some(count => count === 0)) continue;
      
      // Calculate consistency (variance should be low for CSV)
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      if (avgCount < 1) continue; // Need at least 2 columns
      
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length;
      const consistency = avgCount / (1 + variance);

      if (consistency > maxConsistency) {
        maxConsistency = consistency;
        bestDelimiter = delimiter;
      }
    }

    // Require high consistency and at least 2 columns
    if (maxConsistency < 1.5 || !bestDelimiter) {
      return false;
    }

    // Additional check: lines shouldn't be too long (likely prose text if very long)
    const avgLineLength = sampleLines.reduce((sum, line) => sum + line.length, 0) / sampleLines.length;
    if (avgLineLength > 500) { // Arbitrary threshold for very long lines
      return false;
    }

    // Check if content has too much natural language text patterns
    const textContent = trimmedContent.toLowerCase();
    const naturalLanguageIndicators = [
      'the ', 'and ', 'or ', 'but ', 'in ', 'on ', 'at ', 'to ', 'for ', 'of ', 'with ', 'by ',
      'http://', 'https://', 'www.', '.com', '.de', '.org', '.net',
      'ich ', 'ist ', 'das ', 'der ', 'die ', 'und ', 'oder ', 'für ', 'mit ', // German
    ];
    
    const naturalLanguageMatches = naturalLanguageIndicators.filter(indicator => 
      textContent.includes(indicator)
    ).length;
    
    // If too many natural language patterns, probably not CSV
    if (naturalLanguageMatches > 10) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Detects the most likely delimiter in a CSV file
 * @param content - CSV content sample
 * @returns Detected delimiter
 */
export function detectCsvDelimiter(content: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const sampleLines = content.split('\n').slice(0, 5).join('\n');
  
  let bestDelimiter = ',';
  let maxConsistency = 0;

  for (const delimiter of delimiters) {
    const lines = sampleLines.split('\n').filter(line => line.trim());
    if (lines.length < 2) continue;

    const counts = lines.map(line => (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length);
    const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
    
    // Calculate consistency (how close counts are to average)
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / counts.length;
    const consistency = avgCount > 0 ? avgCount / (1 + variance) : 0;

    if (consistency > maxConsistency) {
      maxConsistency = consistency;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
} 