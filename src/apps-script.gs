const SHEET_NAME = "이안 리버파크 여주 - 관심고객";
const HEADERS = ["접수일시", "이름", "연락처", "거주지", "개인정보동의", "유입페이지", "브라우저"];
const PHONE_PATTERN = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = e.parameter;
    const name = String(data.name || "").trim();
    const phone = String(data.phone || "").trim();
    const area = String(data.area || "").trim();
    const privacy = String(data.privacy || "").trim();
    const page = String(data.page || "").trim();
    const userAgent = String(data.userAgent || "").trim();

    if (!name || !phone || !area || privacy !== "true") {
      return jsonResponse({ ok: false, error: "필수 항목이 누락되었습니다." });
    }

    if (!PHONE_PATTERN.test(phone)) {
      return jsonResponse({ ok: false, error: "연락처 형식이 올바르지 않습니다." });
    }

    const sheet = getLeadSheet_();
    sheet.appendRow([
      new Date(),
      name,
      phone,
      area,
      privacy === "true" ? "동의" : "미동의",
      page,
      userAgent,
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.testPost === "1") {
    return testPost();
  }

  return ContentService.createTextOutput("OK");
}

function setup() {
  getLeadSheet_();
}

function testPost() {
  return doPost({
    parameter: {
      name: "테스트",
      phone: "010-1234-5678",
      area: "여주시",
      privacy: "true",
      page: "apps-script-test",
      userAgent: "Apps Script testPost",
    },
  });
}

function getLeadSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
