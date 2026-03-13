import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { GeneratedMCQ } from '../services/questionGenService';

const GREEN_DARK = '0D1410';
const GREEN_HEADER = '16A34A';
const GREEN_LIGHT = '0A0F0A';
const GREEN_ALT = '111A11';
const WHITE = 'E2E8F0';
const GREEN_ACCENT = '22C55E';
const BORDER_COLOR = '1B3A1B';

export async function exportMCQsToExcel(
  questions: GeneratedMCQ[],
  hasNos: boolean,
  documentNames: string[],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Syllabus-IQ';
  wb.created = new Date();

  const ws = wb.addWorksheet('MCQ Questions', {
    properties: { defaultColWidth: 18 },
  });

  // ── Title Row ──
  const titleHeaders = hasNos
    ? ['#', 'NOS Code', 'NOS Name', 'Performance Criteria', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Page Ref']
    : ['#', 'Performance Criteria', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Page Ref'];

  // Title
  ws.mergeCells(1, 1, 1, titleHeaders.length);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = 'Syllabus-IQ — Assessment MCQ Report';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: GREEN_ACCENT } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_DARK } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // Subtitle with document names
  ws.mergeCells(2, 1, 2, titleHeaders.length);
  const subtitleCell = ws.getCell(2, 1);
  subtitleCell.value = `Documents: ${documentNames.join(', ')}  |  Generated: ${new Date().toLocaleDateString()}  |  Total: ${questions.length} MCQs`;
  subtitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '94A3B8' } };
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_DARK } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  // Empty spacer row
  ws.getRow(3).height = 6;

  // ── Header Row ──
  const headerRow = ws.getRow(4);
  titleHeaders.forEach((header, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_HEADER } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } },
    };
  });
  headerRow.height = 28;

  // ── Data Rows ──
  questions.forEach((q, idx) => {
    const rowData = hasNos
      ? [idx + 1, q.nos_code || '-', q.nos_name || '-', q.performance_criteria, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.page_reference]
      : [idx + 1, q.performance_criteria, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.page_reference];

    const row = ws.getRow(5 + idx);
    const isEven = idx % 2 === 0;
    const bgColor = isEven ? GREEN_LIGHT : GREEN_ALT;

    rowData.forEach((val, i) => {
      const cell = row.getCell(i + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, color: { argb: WHITE } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'hair', color: { argb: BORDER_COLOR } },
        bottom: { style: 'hair', color: { argb: BORDER_COLOR } },
        left: { style: 'hair', color: { argb: BORDER_COLOR } },
        right: { style: 'hair', color: { argb: BORDER_COLOR } },
      };
    });

    // Style the # column
    const numCell = row.getCell(1);
    numCell.alignment = { horizontal: 'center', vertical: 'top' };
    numCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '94A3B8' } };

    // Style the correct answer column
    const answerColIndex = hasNos ? 10 : 8;
    const answerCell = row.getCell(answerColIndex);
    answerCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: GREEN_ACCENT } };
    answerCell.alignment = { horizontal: 'center', vertical: 'top' };

    // Style NOS code if present
    if (hasNos) {
      const nosCell = row.getCell(2);
      nosCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: GREEN_ACCENT } };
    }

    row.height = 45;
  });

  // ── Column Widths ──
  const colWidths = hasNos
    ? [5, 14, 20, 30, 40, 20, 20, 20, 20, 12, 40, 10]
    : [5, 30, 40, 20, 20, 20, 20, 12, 40, 10];

  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // ── Summary Footer ──
  const footerRowIdx = 5 + questions.length + 1;
  ws.mergeCells(footerRowIdx, 1, footerRowIdx, titleHeaders.length);
  const footerCell = ws.getCell(footerRowIdx, 1);
  footerCell.value = `Generated by Syllabus-IQ | ${questions.length} questions | ${hasNos ? 'NOS mapping included' : 'No NOS detected'}`;
  footerCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: '64748B' } };
  footerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_DARK } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(footerRowIdx).height = 24;

  // ── Auto-filter ──
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4 + questions.length, column: titleHeaders.length },
  };

  // ── Freeze header ──
  ws.views = [{ state: 'frozen', ySplit: 4, xSplit: 0 }];

  // ── Export ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `syllabus-iq-mcqs-${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, filename);
}
