/** 
 * Moon Sleep Tracker - Backend Script (ID FIX Version)
 * 
 * [주의] SPREADSHEET_ID에 실제 구글 시트의 ID를 넣어야 정확히 작동합니다.
 * 주소창의 spreadhseets/d/ 뒤의 긴 문자열이 ID입니다.
 */

const SPREADSHEET_ID = "REPLACE_WITH_YOUR_ACTUAL_ID"; 
const SHEET_NAME = "Sheet1";
const API_TOKEN = "your-secret-token";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== API_TOKEN) return response({ success: false, message: "Token Error" });
    if (data.action === "write") return writeData(data.payload);
  } catch (err) {
    return response({ success: false, message: err.toString() });
  }
}

function doGet(e) {
  try {
    if (e.parameter.token !== API_TOKEN) return response({ success: false, message: "Token Error" });
    if (e.parameter.action === "read") return readData(e.parameter.userName, e.parameter.days || 14);
  } catch (err) {
    return response({ success: false, message: err.toString() });
  }
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function writeData(payload) {
  // getActiveSpreadsheet() 대신 ID를 명시하여 엉뚱한 곳에 쓰는 것을 방지합니다.
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  
  sheet.appendRow([
    payload.date,
    payload.userName,
    payload.sleepTime,
    payload.wakeTime,
    payload.durationMinutes,
    payload.rating,
    payload.memo
  ]);
  return response({ success: true, message: "Written to: " + sheet.getName() });
}

function readData(userName, days) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return response({ success: true, data: [] });
  const headers = data.shift();
  const filteredData = data.filter(row => row[1] === userName).slice(-days).map(row => {
    let obj = {}; headers.forEach((header, i) => { obj[header] = row[i]; }); return obj;
  });
  return response({ success: true, data: filteredData });
}
