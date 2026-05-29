/**
 * SNED-LINK+ CSV Export Utility
 * Provides a standardized and professional method for generating 
 * and downloading system-wide reports in CSV format.
 */

/**
 * Converts a 2D array to a CSV string and triggers a browser download.
 * Handles memory management and character escaping for professional use.
 * 
 * @param filename - The target filename including extension (e.g., 'report.csv')
 * @param data - 2D array representing rows and columns of report data
 */
export const exportToCSV = (filename: string, data: (string | number | null | undefined)[][]): void => {
  const csvContent = data
    .map((row) =>
      row
        .map((cell) => {
          const sanitized = String(cell ?? '').replace(/"/g, '""');
          return `"${sanitized}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the object URL after download to free up system memory
  setTimeout(() => URL.revokeObjectURL(url), 100);
};