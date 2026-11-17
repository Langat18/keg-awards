const COLUMNS = {
  name: ['name', 'names', 'fullname', 'staffname', 'employeename'],
  department: ['department', 'dept', 'section', 'division', 'unit'],
  email: ['email', 'emailaddress', 'mail'],
  pf_number: ['pf', 'pfnumber', 'pfno', 'staffnumber', 'staffno', 'payrollnumber', 'personalnumber'],
};

const TEMPLATE_HEADERS = ['Name', 'Department', 'Email', 'PF number'];

function key(header) {
  return String(header ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cell(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',' || ch === ';' || ch === '\t') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function rowsFromSheet(matrix) {
  const headerIndex = matrix.slice(0, 10).findIndex(row => row.some(h => COLUMNS.name.includes(key(h))));

  if (headerIndex === -1) {
    throw new Error('The file needs a column headed "Name". Download the template to see the layout.');
  }

  const headers = matrix[headerIndex].map(key);
  const position = Object.fromEntries(
    Object.entries(COLUMNS).map(([field, names]) => [field, headers.findIndex(h => names.includes(h))])
  );

  return matrix
    .slice(headerIndex + 1)
    .map((row, i) => {
      const value = field => (position[field] === -1 ? '' : cell(row[position[field]]));
      return {
        line: headerIndex + i + 2,
        name: value('name'),
        department: value('department'),
        email: value('email'),
        pf_number: value('pf_number'),
      };
    })
    .filter(row => row.name || row.department || row.email || row.pf_number);
}

export async function readStaffFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    const text = (await file.text()).replace(/^﻿/, '');
    return rowsFromSheet(parseCsv(text));
  }

  if (name.endsWith('.xlsx')) {
    const { readSheet } = await import('read-excel-file/browser');
    return rowsFromSheet(await readSheet(file));
  }

  throw new Error('Use an Excel (.xlsx) or CSV file. Older .xls files can be saved as .xlsx from Excel first.');
}

export async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  sheet['!cols'] = [30, 30, 34, 14].map(wch => ({ wch }));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Staff');
  XLSX.writeFile(book, 'staff_list_template.xlsx');
}
