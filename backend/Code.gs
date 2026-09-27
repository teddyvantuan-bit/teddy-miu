/**
 * Backend for the wedding invitation (Google Apps Script bound to a Google Sheet).
 * doPost  – saves an RSVP or a wish as a new row.
 * doGet   – returns the wishes to show on the website.
 * To hide a wish from the website, untick its "Hiện trên web" checkbox in the sheet.
 */
const SHEET_NAME = 'RSVP';
const HEADERS = ['Thời gian', 'Loại', 'Họ và tên', 'Số điện thoại', 'Tham dự', 'Tham dự bên', 'Số người', 'Lời chúc', 'Hiện trên web', 'Link khách'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f3e7e4');
  }
  return sh;
}

function clean_(value, max) {
  return String(value == null ? '' : value).trim().replace(/^[=+\-@]/, "'$&").slice(0, max);
}

function doPost(e) {
  let data = {};
  try { data = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false }); }
  if (data.website) return json_({ ok: true }); // spam trap
  const name = clean_(data.name, 80);
  if (!name) return json_({ ok: false, error: 'name' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    sh.appendRow([
      new Date(),
      data.type === 'wish' ? 'Lời chúc' : 'Xác nhận',
      name,
      clean_(data.phone, 20),
      clean_(data.attending, 40),
      clean_(data.side, 40),
      clean_(data.guests, 3),
      clean_(data.wish, 500),
      true,
      clean_(data.invitee, 80)
    ]);
    sh.getRange(sh.getLastRow(), 9).insertCheckboxes().setValue(true);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const wishes = rows
    .filter(r => String(r[7]).trim() && r[8] !== false)
    .slice(-80)
    .reverse()
    .map(r => ({ name: String(r[2]), wish: String(r[7]) }));
  return json_({ wishes: wishes });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
