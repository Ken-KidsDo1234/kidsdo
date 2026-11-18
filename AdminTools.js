function auditSheetData() {
  var spreadsheet = db_();
  var patterns = ["'", '"', '\\', '</script>', '<script', 'javascript:', 'onclick=', 'onerror=', ';'];
  var findings = [];

  spreadsheet.getSheets().forEach(function(sh) {
    var lastRow = sh.getLastRow(), lastColumn = sh.getLastColumn();
    if (lastRow < 2 || lastColumn < 1) return;

    var data = sh.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
    var headers = data[0];
    for (var r = 1; r < data.length; r++) {
      for (var c = 0; c < data[r].length; c++) {
        var value = data[r][c];
        if (!value) continue;
        var normalized = value.toLowerCase();
        var columnName = String(headers[c] || ('Column ' + (c + 1)));
        var redact = /password|passwd|secret|token|credential|api.?key|private.?key/i.test(columnName);
        patterns.forEach(function(pattern) {
          if (normalized.indexOf(pattern.toLowerCase()) >= 0) {
            findings.push([
              sh.getName(),
              r + 1,
              columnName,
              pattern,
              redact ? '[REDACTED]' : value
            ]);
          }
        });
      }
    }
  });

  var rows = [['Sheet', 'Row', 'Column', 'Pattern', 'Value']].concat(findings);
  var csv = '\uFEFF' + rows.map(function(row) {
    return row.map(function(value) {
      var text = String(value === null || value === undefined ? '' : value);
      if (/^[=+\-@]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    }).join(',');
  }).join('\r\n');
  var file = DriveApp.getRootFolder().createFile('suspicious_data_report.csv', csv, MimeType.CSV);
  return file.getUrl();
}

function createBackup(token) {
  try {
    var s=requireRole_(token,['Super Admin']);
    var root=DriveApp.getFolderById(FOLDER_ID),it=root.getFoldersByName('Backup'),folder=it.hasNext()?it.next():root.createFolder('Backup');
    var date=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd_HHmm');
    var copy=DriveApp.getFileById(SHEET_ID).makeCopy('KidsDo_Backup_'+date,folder);
    log_(s.username,'backup','Backup',copy.getName());return response_({name:copy.getName(),url:copy.getUrl()});
  }catch(e){return error_(e);}
}
function createDemoData(token) {
  try {
    var s=requireRole_(token,['Super Admin','Admin']);
    var samples={
      Banners:[{id:'DEMO_BANNER_001',title:'ยินดีต้อนรับสู่ Kids Do',description:'พื้นที่แห่งการเรียนรู้และการแบ่งปัน',image:'',buttonText:'อ่านเพิ่มเติม',status:'published',order:1}],
      News:[{id:'DEMO_NEWS_001',title:'เปิดบ้าน Kids Do',category:'ประชาสัมพันธ์',summary:'กิจกรรมแนะนำพื้นที่ Kids Do',content:'ยินดีต้อนรับทุกคนสู่เว็บไซต์ Kids Do',author:'ผู้ดูแลระบบ',views:0,pinned:true,status:'published',publishDate:now_()}],
      Activities:[{id:'DEMO_ACTIVITY_001',title:'กิจกรรมสร้างสรรค์ความดี',description:'เรียนรู้ผ่านการลงมือทำ',date:now_(),location:'ชุมชน Kids Do',status:'published'}],
      Staff:[{id:'DEMO_STAFF_001',prefix:'คุณครู',firstname:'ใจดี',lastname:'ตัวอย่าง',position:'ครู',department:'ทั่วไป',order:1,status:'published'}],
      Awards:[{id:'DEMO_AWARD_001',type:'ผลงาน',title:'รางวัลตัวอย่าง Kids Do',recipient:'สมาชิก Kids Do',level:'Kids Do',organization:'Kids Do',date:now_(),status:'published'}],
      Documents:[{id:'DEMO_DOCUMENT_001',title:'คู่มือแนะนำเว็บไซต์',category:'คู่มือ',fileUrl:'',fileName:'คู่มือ.pdf',fileType:'PDF',downloads:0,date:now_(),status:'published'}],
      Links:[{id:'DEMO_LINK_001',name:'เว็บไซต์ที่เกี่ยวข้อง',url:'https://www.moe.go.th',order:1,status:'published'}],
      Calendar:[{id:'DEMO_CALENDAR_001',title:'วันกิจกรรมตัวอย่าง',description:'กิจกรรมตัวอย่าง',startDate:now_(),endDate:now_(),location:'ชุมชน Kids Do',color:'#2563eb',status:'published'}],
      Popups:[{id:'DEMO_POPUP_001',title:'ยินดีต้อนรับ',description:'ขอบคุณที่เยี่ยมชมเว็บไซต์ Kids Do',startDate:now_(),status:'draft'}]
    };
    Object.keys(samples).forEach(function(n){samples[n].forEach(function(r){writeRow_(n,r);});});
    clearRuntimeCaches_();log_(s.username,'createDemo','Demo','สร้างข้อมูลตัวอย่าง');return response_('สร้างหรืออัปเดต Demo สำเร็จ');
  }catch(e){return error_(e);}
}
function clearDemoData(token) {
  try {
    var s=requireRole_(token,['Super Admin','Admin']), count=0;
    Object.keys(TABLES_).forEach(function(n){
      if(['Settings','Users','Visitors','Logs'].indexOf(n)>=0)return;
      var sh=sheet_(n), data=rows_(n);
      for(var i=data.length-1;i>=0;i--) if(String(data[i].id).indexOf('DEMO_')===0){sh.deleteRow(i+2);count++;}
    });
    clearRuntimeCaches_();log_(s.username,'clearDemo','Demo','ลบ Demo '+count+' รายการ');return response_({deleted:count});
  }catch(e){return error_(e);}
}
Here is the full source of `auditSheetData()`:

```javascript
function auditSheetData() {
  var spreadsheet = db_();
  var patterns = ["'", '"', '\\', '</script>', '<script', 'javascript:', 'onclick=', 'onerror=', ';'];
  var findings = [];

  spreadsheet.getSheets().forEach(function(sh) {
    var lastRow = sh.getLastRow(), lastColumn = sh.getLastColumn();
    if (lastRow < 2 || lastColumn < 1) return;

    var data = sh.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
    var headers = data[0];
    for (var r = 1; r < data.length; r++) {
      for (var c = 0; c < data[r].length; c++) {
        var value = data[r][c];
        if (!value) continue;
        var normalized = value.toLowerCase();
        var columnName = String(headers[c] || ('Column ' + (c + 1)));
        var redact = /password|passwd|secret|token|credential|api.?key|private.?key/i.test(columnName);
        patterns.forEach(function(pattern) {
          if (normalized.indexOf(pattern.toLowerCase()) >= 0) {
            findings.push([
              sh.getName(),
              r + 1,
              columnName,
              pattern,
              redact ? '[REDACTED]' : value
            ]);
          }
        });
      }
    }
  });

  var rows = [['Sheet', 'Row', 'Column', 'Pattern', 'Value']].concat(findings);
  var csv = '\uFEFF' + rows.map(function(row) {
    return row.map(function(value) {
      var text = String(value === null || value === undefined ? '' : value);
      if (/^[=+\-@]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    }).join(',');
  }).join('\r\n');
  var file = DriveApp.getRootFolder().createFile('suspicious_data_report.csv', csv, MimeType.CSV);
  return file.getUrl();
}
```