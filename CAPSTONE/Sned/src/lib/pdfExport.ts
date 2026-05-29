import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  headers: string[];
  data: any[][];
  summaryStats?: { label: string; value: string | number }[];
  charts?: {
    title: string;
    type: 'bar' | 'line';
    data: { label: string; value: number }[];
  }[];
}

/**
 * SNED-LINK+ Professional PDF Export Utility
 * Generates a branded, detailed behavioral and academic record.
 */
export const exportToPDF = ({
  title,
  subtitle,
  filename,
  headers,
  data,
  summaryStats,
  charts
}: PDFExportOptions): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Neural Blue Branding
  doc.setFillColor(47, 74, 138); // #2F4A8A
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SNED-LINK+', 14, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Assisted Behavioral Monitoring System', 14, 28);
  
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });

  // Document Title
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 55);
  
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 62);
  }

  // Detailed Summary Section
  if (summaryStats && summaryStats.length > 0) {
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 70, pageWidth - 14, 70);
    
    let xPos = 14;
    const colWidth = (pageWidth - 28) / summaryStats.length;
    summaryStats.forEach(stat => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 120, 120);
      doc.text(stat.label.toUpperCase(), xPos, 80);
      
      doc.setFontSize(12);
      doc.setTextColor(47, 74, 138);
      doc.text(String(stat.value), xPos, 88);
      xPos += colWidth;
    });
    
    doc.line(14, 95, pageWidth - 14, 95);
  }

  // Main Data Table
  autoTable(doc, {
    startY: summaryStats ? 105 : 75,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: { fillColor: [47, 74, 138], textColor: 255, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: 50 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 20 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
  });

  doc.save(filename);
};