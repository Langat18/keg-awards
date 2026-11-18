function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

export async function downloadCredentials(list) {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.json_to_sheet(list.map(c => ({
    Name: c.name,
    Department: c.department || '',
    'Sign-in ID': c.login_id,
    Email: c.email || '',
    'Temporary password': c.password,
  })));
  sheet['!cols'] = [30, 26, 12, 32, 20].map(wch => ({ wch }));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Sign-in details');
  XLSX.writeFile(book, `sign_in_details_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function printSlips(list) {
  const url = `${window.location.origin}/login`;

  const slips = list.map(c => `
    <section class="slip">
      <p class="org">Kenya School of Government, Mombasa Campus</p>
      <h2>${escape(c.name)}</h2>
      ${c.department ? `<p class="dept">${escape(c.department)}</p>` : ''}
      <p>Your account for Staff Rewards and Recognition is ready. Sign in at <strong>${escape(url)}</strong></p>
      <dl>
        <dt>Sign-in ID</dt><dd>${escape(c.login_id)}</dd>
        ${c.email ? `<dt>or email</dt><dd>${escape(c.email)}</dd>` : ''}
        <dt>Temporary password</dt><dd class="pw">${escape(c.password)}</dd>
      </dl>
      <p class="note">You will be asked to choose your own password the first time you sign in. Keep this slip private.</p>
    </section>`).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Sign-in slips</title>
    <style>
      body { font-family: system-ui, sans-serif; color: #3E2F14; margin: 0; padding: 16px; }
      .slip { border: 1px dashed #7F622C; padding: 16px 20px; margin-bottom: 16px; break-inside: avoid; }
      .org { margin: 0; font-size: 11px; color: #6E6656; }
      h2 { margin: 6px 0 0; font-size: 18px; color: #7F622C; }
      .dept { margin: 2px 0 0; font-size: 13px; color: #6E6656; }
      p { font-size: 13px; }
      dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 10px 0; font-size: 14px; }
      dt { color: #6E6656; }
      dd { margin: 0; font-weight: 700; font-family: ui-monospace, monospace; }
      .pw { font-size: 16px; letter-spacing: 0.05em; }
      .note { font-size: 11px; color: #6E6656; margin-bottom: 0; }
    </style></head><body>${slips}</body></html>`;

  const win = window.open('', '_blank', 'width=720,height=900');
  if (!win) return false;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
