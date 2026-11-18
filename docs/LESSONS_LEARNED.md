
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