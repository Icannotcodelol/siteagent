import Papa from 'papaparse';

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
    const parseResult = Papa.parse(csvContent, {
      delimiter,
      skipEmptyLines,
      header: false, // We'll handle headers manually for better control
      transform: (value: string) => {
        // Clean up common CSV issues
        return value.trim();
      },
    });

    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing warnings:', parseResult.errors);
    }

    const data = parseResult.data as string[][];
    
    if (!data || data.length === 0) {
      return {
        text: '',
        rowCount: 0,
        columnCount: 0,
        errors: ['No data found in CSV file'],
      };
    }

    // Limit rows to prevent memory issues
    const limitedData = data.slice(0, maxRows);
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
      errors: parseResult.errors.map(error => error.message || 'Unknown parsing error'),
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

    // Basic CSV validation
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return false;
    }

    // Check if first few lines have consistent comma structure
    const firstLineCommas = (lines[0].match(/,/g) || []).length;
    if (firstLineCommas === 0) {
      // Single column CSV is valid
      return true;
    }

    // Check if at least the first 3 lines (if available) have similar comma counts
    const linesToCheck = Math.min(3, lines.length);
    for (let i = 1; i < linesToCheck; i++) {
      const commaCount = (lines[i].match(/,/g) || []).length;
      // Allow some variation in comma count (for incomplete rows)
      if (Math.abs(commaCount - firstLineCommas) > firstLineCommas * 0.5) {
        return false;
      }
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