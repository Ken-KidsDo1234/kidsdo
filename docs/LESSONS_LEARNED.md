
# KidsDo Lessons Learned

## Findings

- Google Sheet ID ถูกต้อง
- Google Drive Folder IDs ถูกต้อง
- include('MemberComms') ต้องเปลี่ยนเป็น include('MemberCommsUI')
- Code.js เคยมีข้อความเอกสารปะปน
- Deployment ต้องตรวจสอบด้วย TEST VERSION
- Apps Script และ VS Code ต้องเป็นโค้ดชุดเดียวกัน

## Open Issues

- Console ยังแสดง:
  - Unexpected token ';'
  - userCodeAppPanel line 273

## Next Steps

1. ตรวจ MemberCommsUI.html
2. ตรวจ document.write()
3. ตรวจ appendChild()
4. หา source ของ SyntaxError line 273


## Investigation Result

- Deployment ได้รับโค้ดล่าสุดแล้ว
- TEST VERSION แสดงผลสำเร็จ
- MemberCommsUI parse ผ่าน
- No stray semicolon found
- 21 onclick handlers use escapeHtml but are not proven to cause the SyntaxError
- Remaining suspect: Apps Script template output rendered into client JavaScript

# KidsDo Lessons Learned

## 2026-11-15 Investigation Summary

### Confirmed

- Google Sheet ID works correctly:
  - 1k2KF_yaveq0pivXVtl2A22jeoynogXQEydSGNU3PXJs

- Google Drive root folder works correctly:
  - 1SkqO0qa-EgnNlOXVqFG3f8ULVROV4LAO

- Apps Script deployment is now connected to the current source code.

- TEST VERSION banner successfully appeared in production deployment.

- MemberComms include was updated to:
  - include('MemberCommsUI')

### Not The Cause

- Code.js
- escapeHtml() syntax fix
- Deployment mismatch
- Missing openLogin()
- Missing MemberCommsUI.html
- Stray semicolon in source files

### Current Open Issue

Browser console still reports:

userCodeAppPanel:273
Uncaught SyntaxError: Unexpected token ';'

Source files parse correctly.

Possible remaining cause:
- JavaScript generated dynamically through HTML strings
- Dynamic onclick handlers
- Apps Script rendered output differs from static source analysis

### Next Investigation

Inspect:
- dynamic onclick strings
- MemberCommsUI.html
- rendered Apps Script output

### Important Discovery

If TEST VERSION banner appears in browser:

- Deployment is using the latest source code.
- Deployment mismatch is no longer a valid debugging hypothesis.

## 2026-11-15 Deep Investigation

### Confirmed Working

- Apps Script deployment uses latest source code.
- TEST VERSION banner appeared successfully.
- Google Sheet connection verified.
- Google Drive connection verified.
- include('MemberCommsUI') verified.

### Ruled Out

- Code.js syntax issues
- Deployment mismatch
- Missing include files
- Apps Script template expansion
- Merged inline script syntax errors
- Stray semicolons in source
- Missing openLogin() definition

### Findings

- Browser still reports:
  userCodeAppPanel:273
  Unexpected token ';'

- Static source code parses successfully.

- Template includes found:
  - PublicPagesStyles
  - PublicPages
  - MemberCommsUI

- No malformed Apps Script template output found.

- 21 dynamic onclick handlers use escapeHtml()
  where JavaScript-string escaping would be safer.

### Remaining Suspects

1. Runtime-generated HTML
2. Dynamically generated onclick attributes
3. Data values from Google Sheets or runtime API responses
4. Browser-rendered code differs from static file parsing

### Suspicious Sheet Data

Potentially dangerous values found:

- Users.username = O'Brien
- Users.name = John\Smith
- Calendar.title = Meeting;Test
- Links.url = javascript:alert(1)
- News.title = </script>
- Settings.siteName = Kids "Do"

Highest priority:
1. </script>
2. javascript:alert(1)

## 2026-11-15 Progress

### Confirmed

- Google Sheet connection verified
- Google Drive connection verified
- Deployment uses latest source code
- TEST VERSION banner appeared successfully
- MemberCommsUI include verified

### Investigation

Browser still reports:

userCodeAppPanel:273
Unexpected token ';'

Source code parses successfully.

### Current Hypothesis

The error is likely caused by runtime-rendered content or data retrieved from Google Sheets rather than static source files.

### Next Step

Run auditSheetData() and review suspicious_data_report.csv.

## Added Tools

### auditSheetData()

Purpose:
- Scan all Google Sheets tabs
- Detect suspicious values
- Export suspicious_data_report.csv

Patterns checked:

- '
- "
- \
- </script>
- <script
- javascript:
- onclick=
- onerror=
- ;

Output:
suspicious_data_report.csv

### Current Primary Suspect

MemberCommsUI.html

Function:
commShowAttachment_()

Current code uses:

w.document.write(...)

Potential issue:
Runtime-generated HTML may differ from static parse results.

Recommended improvement:
Replace document.write() with DOM-based rendering.

# KidsDo Debug Session

Date: 2026-11-15

## สิ่งที่ตรวจสอบแล้ว

### GitHub

✅ GitHub ทำงานปกติ

✅ Push สำเร็จ

✅ โค้ดในเครื่องและ GitHub ตรงกัน

---

### Google Integration

✅ Google Sheet เชื่อมต่อได้

SHEET_ID

1k2KF_yaveq0pivXVtl2A22jeoynogXQEydSGNU3PXJs

✅ Google Drive เชื่อมต่อได้

FOLDER_ID

1SkqO0qa-EgnNlOXVqFG3f8ULVROV4LAO

---

### Source Code

✅ Code.js ถูกตรวจสอบแล้ว

✅ doGet() ถูกต้อง

✅ openLogin() มีอยู่จริง

✅ MemberComms → MemberCommsUI ถูกแก้แล้ว

✅ escapeHtml() ถูกแก้แล้ว

✅ Source Code Parse ผ่าน

✅ Index.html Parse ผ่าน

✅ PublicPages.html Parse ผ่าน

✅ MemberCommsUI.html Parse ผ่าน

---

### Deployment

✅ TEST VERSION แสดงผลบนหน้าเว็บ

ข้อสรุป:

Apps Script Deployment ใช้โค้ดล่าสุดจริง

ไม่ใช่ปัญหา Version mismatch

---

### Data Audit

✅ สร้าง auditSheetData()

✅ ตรวจ Users

✅ ตรวจ News

✅ สร้าง suspicious_data_report.csv

ผลลัพธ์:

ไม่พบข้อมูลอันตรายที่อธิบาย Error ได้

พบเพียง User-Agent ใน Sheet Visitors

---

## ปัญหาที่ยังเหลือ

Browser Console

```text
userCodeAppPanel:273
Uncaught SyntaxError: Unexpected token ';'
```

ยังไม่สามารถระบุต้นเหตุได้

---

## ผู้ต้องสงสัยหลัก

### MemberCommsUI.html

ฟังก์ชัน

```javascript
commShowAttachment_()
```

ใช้

```javascript
document.write(...)
```

AI แนะนำให้เปลี่ยนเป็น

```javascript
createElement()
appendChild()
```

แทน

ยังไม่ได้พิสูจน์ว่าเป็นสาเหตุ 100%

แต่เป็นผู้ต้องสงสัยอันดับ 1

---

## สิ่งที่ต้องทำต่อ

1. แก้ commShowAttachment_() ตาม Diff ที่ AI แนะนำ

2. Deploy ใหม่

3. ตรวจ Console อีกครั้ง

4. หาก Error ยังอยู่

ให้ตรวจ HTML/JavaScript ที่ถูก Render จริงจาก Browser

5. ห้ามเสียเวลาตรวจ

- Code.js
- doGet()
- Deployment mismatch
- Google Sheet ID
- Google Drive ID

เพราะพิสูจน์แล้วว่าไม่ใช่ต้นเหตุ