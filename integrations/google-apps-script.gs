/**
 * BLYNX lead intake — Google Apps Script Web App.
 *
 * Setup:
 * 1. Create a new Google Sheet (sheets.new). Name it e.g. "BLYNX Leads".
 * 2. Extensions -> Apps Script. Delete the placeholder code and paste this file's contents.
 * 3. Replace NOTIFY_EMAIL below with the inbox that should receive lead alerts.
 * 4. Deploy -> New deployment -> type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, then "Authorize access" and approve (Advanced -> Go to project (unsafe) is
 *    expected/safe here since this is your own script).
 * 6. Copy the Web App URL (ends in /exec) and give it to be set as LEAD_WEBHOOK_URL in
 *    assets/site.js.
 *
 * Every submission is appended as a new row to a "Leads" sheet (created automatically, with
 * columns added automatically if the form ever changes) and triggers an email notification.
 */

const NOTIFY_EMAIL = "hello@blynxsystems.com";
const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    appendRow(sheet, data);
    sendNotificationEmail(data);
    return ContentService.createTextOutput(JSON.stringify({ result: "success" })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("BLYNX lead intake is running.");
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp"]);
  }
  return sheet;
}

function appendRow(sheet, data) {
  const lastColumn = sheet.getLastColumn();
  let headers = lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [];
  if (headers.length === 0 || headers[0] === "") headers = ["Timestamp"];

  let headersChanged = lastColumn === 0;
  Object.keys(data).forEach((key) => {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
      headersChanged = true;
    }
  });

  if (headersChanged) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const row = headers.map((header) => {
    if (header === "Timestamp") return new Date();
    const value = data[header];
    if (value === undefined || value === null) return "";
    return Array.isArray(value) ? value.join(", ") : value;
  });

  sheet.appendRow(row);
}

function sendNotificationEmail(data) {
  const formType = data.formType || "form";
  const name = data.fullName || "(no name)";
  const business = data.businessName || "(no business name)";

  const body = Object.keys(data)
    .filter((key) => key !== "formType")
    .map((key) => `${key}: ${Array.isArray(data[key]) ? data[key].join(", ") : data[key]}`)
    .join("\n");

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New BLYNX ${formType} lead: ${business} (${name})`,
    body: body
  });
}
