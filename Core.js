/* Kids Do Website - Google Apps Script backend
 * Round 7: Calendar groups, server-assigned source roles/colours and member approval workflow. 
 * Configure IDs for the isolated test copy. Initial admin password is stored in Script Properties.
 */
const SHEET_ID = "1k2KF_yaveq0pivXVtl2A22jeoynogXQEydSGNU3PXJs";
const WEB_APP_URL = "PASTE_TEST_WEB_APP_URL_HERE";
const FOLDER_ID = "1SkqO0qa-EgnNlOXVqFG3f8ULVROV4LAO";

// Kids Do public library folders (TEST)
const KIDS_LIBRARY_FOLDERS_ = {
  Music: '1So-lZ1wDQJ1t2pDAhiz1lYwuplUev8zw',
  Picture: '1qu_U599KwsN-In3VnzhIkf5a9E3CUS5u',
  Document: '1j71MhkIIO4Q_jV54g0QFrDHiU_98vZ0H'
};
const DOWNLOAD_MAX_BYTES_ = 15 * 1024 * 1024;

const TABLES_ = {
  Settings: ['key','value','updatedAt'],
  Users: ['id','username','passwordHash','name','role','status','mustChangePassword','downloadAllowed','createdAt','updatedAt'],
  News: ['id','title','category','summary','content','coverImage','images','fileUrl','author','views','pinned','status','publishDate','createdAt','updatedAt'],
  Activities: ['id','title','description','date','location','coverImage','images','status','createdAt','updatedAt'],
  Staff: ['id','prefix','firstname','lastname','position','academicRank','department','photo','phone','email','order','status','createdAt','updatedAt'],
  Banners: ['id','title','description','image','url','buttonText','startDate','endDate','order','status','createdAt','updatedAt'],
  Awards: ['id','type','title','level','organization','recipient','image','date','description','status','createdAt','updatedAt'],
  Documents: ['id','title','category','fileUrl','fileName','fileType','fileSize','downloads','date','status','createdAt','updatedAt'],
  Links: ['id','name','category','description','logo','url','order','status','createdAt','updatedAt'],
  Calendar: ['id','title','description','startDate','endDate','location','group','groupId','groupName','category','submittedBy','submittedRole','approvedBy','approvedAt','color','status','createdAt','updatedAt'],
  Visitors: ['id','date','ipHash','userAgent','count','createdAt'],
  Popups: ['id','title','description','image','url','startDate','endDate','status','createdAt','updatedAt'],
  Logs: ['id','username','action','module','detail','timestamp']
};
const DRIVE_FOLDERS_ = ['Banner','News','Activities','Staff','Awards','Documents','Website','Backup'];
const PUBLIC_TABLES_ = ['News','Activities','Staff','Banners','Awards','Documents','Links','Calendar','Popups'];
const EDITOR_TABLES_ = ['News','Activities','Calendar'];

function safeArray_(v) { return Array.isArray(v) ? v : []; }
function safeJson_(v, fallback) {
  if (v === null || v === undefined || v === '') return fallback;
  try {
    var p = JSON.parse(v);
    if (Array.isArray(fallback)) return Array.isArray(p) ? p : fallback;
    if (fallback && typeof fallback === 'object') return p && typeof p === 'object' && !Array.isArray(p) ? p : fallback;
    return p === null || p === undefined ? fallback : p;
  } catch (e) { return fallback; }
}
/** Convert values returned through google.script.run to JSON/RPC-safe values.
 * SpreadsheetApp.getValues() may return Date objects. Date objects cannot be
 * passed directly through google.script.run, which can make executions show
 * Completed while the browser's failure handler fires. */
function toClientSafe_(value, depth) {
  depth = depth || 0;
  if (depth > 20) return null;
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return isFinite(value) ? value : null;
  if (Array.isArray(value)) {
    return value.map(function(item) { return toClientSafe_(item, depth + 1); });
  }
  if (typeof value === 'object') {
    var out = {};
    Object.keys(value).forEach(function(key) {
      var item = value[key];
      if (typeof item !== 'function' && item !== undefined) {
        out[key] = toClientSafe_(item, depth + 1);
      }
    });
    return out;
  }
  return String(value);
}
function response_(data) { return {success:true,data:toClientSafe_(data)}; }
function error_(e) {
  console.error(e && e.stack ? e.stack : e);
  return {success:false,message:String(e && e.message ? e.message : e || 'เกิดข้อผิดพลาด')};
}
function now_() { return new Date().toISOString(); }
function uid_(prefix) { return (prefix || 'ID') + '_' + Utilities.getUuid().replace(/-/g,'').substring(0,16); }
function hash_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return bytes.map(function(b){ var n=(b+256)%256; return ('0'+n.toString(16)).slice(-2); }).join('');
}
function db_() { return SpreadsheetApp.openById(SHEET_ID); }
function sheet_(name) {
  var sh = db_().getSheetByName(name);
  if (!sh) throw new Error('ไม่พบ Sheet: ' + name + ' กรุณารัน setupSystem()');
  return sh;
}
function rows_(name) {
  var sh = sheet_(name), values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return [];
  var heads = values[0], out=[];
  for (var i=1;i<values.length;i++) {
    if (values[i].join('') === '') continue;
    var o={}; for (var j=0;j<heads.length;j++) o[heads[j]]=values[i][j];
    out.push(o);
  }
  return out;
}
function writeRow_(name, obj) {
  // Header-driven writes prevent column corruption when existing Sheets contain
  // additional/reordered columns. Never create columns as a side effect here.
  var sh=sheet_(name), lastCol=Math.max(sh.getLastColumn(),1), headers=sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
  var data=rows_(name), keyField=name==='Settings'?'key':'id';
  var id=String(obj[keyField] || uid_(name.toUpperCase()));
  obj[keyField]=id; obj.updatedAt=now_();
  var idx=-1;
  for(var i=0;i<data.length;i++) if(String(data[i][keyField])===id){idx=i+2;break;}
  if(idx<0){obj.createdAt=obj.createdAt || now_();idx=sh.getLastRow()+1;}
  var row=headers.map(function(k){return Object.prototype.hasOwnProperty.call(obj,k) ? obj[k] : '';});
  sh.getRange(idx,1,1,headers.length).setValues([row]);
  return obj;
}
function deleteRow_(name,id) {
  var sh=sheet_(name), values=sh.getDataRange().getValues();
  if(!values || values.length<2) return false;
  var heads=values[0].map(String), idCol=heads.indexOf(name==='Settings'?'key':'id');
  if(idCol<0) throw new Error('ไม่พบคอลัมน์ ID ใน Sheet '+name);
  for(var i=1;i<values.length;i++) {
    if(values[i].join('')==='' ) continue;
    if(String(values[i][idCol])===String(id)){sh.deleteRow(i+1);return true;}
  }
  return false;
}
function log_(username,action,module,detail) {
  try { writeRow_('Logs',{id:uid_('LOG'),username:username || 'public',action:action,module:module,detail:String(detail || ''),timestamp:now_()}); } catch(e) { console.warn(e); }
}
function clearRuntimeCaches_() {
  var c=CacheService.getScriptCache();
  ['settings','publicHome','links','banners','staff','online'].forEach(function(k){c.remove(k);});
}
function setupSystem() {
  try {
    if(!SHEET_ID || !FOLDER_ID || !WEB_APP_URL) throw new Error('กรุณาตรวจ Configuration ทั้ง 4 ค่า');
    var ss=db_();
    Object.keys(TABLES_).forEach(function(name){
      var sh=ss.getSheetByName(name);
      if(!sh) sh=ss.insertSheet(name);
      if(sh.getLastRow()===0) sh.appendRow(TABLES_[name]);
      else {
        var current=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0];
        TABLES_[name].forEach(function(h){if(current.indexOf(h)<0){sh.getRange(1,sh.getLastColumn()+1).setValue(h);current.push(h);}});
      }
      sh.setFrozenRows(1);
    });
    var root=DriveApp.getFolderById(FOLDER_ID);
    DRIVE_FOLDERS_.forEach(function(n){var it=root.getFoldersByName(n);if(!it.hasNext())root.createFolder(n);});
    var users=rows_('Users'), admin=null;
    users.forEach(function(u){if(u.username==='admin')admin=u;});
    if(!admin){
      var initialPassword=PropertiesService.getScriptProperties().getProperty('INITIAL_ADMIN_PASSWORD');
      if(!initialPassword || String(initialPassword).length<8) throw new Error('ยังไม่มีบัญชี Super Admin กรุณากำหนด Script Property ชื่อ INITIAL_ADMIN_PASSWORD อย่างน้อย 8 ตัวอักษรก่อน Setup');
      writeRow_('Users',{id:'USER_ADMIN',username:'admin',passwordHash:hash_(initialPassword),name:'Super Admin',role:'Super Admin',status:'active',mustChangePassword:true});
    }
    var settings=rows_('Settings');
    if(!settings.some(function(x){return x.key==='siteName';})) {
      var defaults={siteName:'Kids Do • คิดดี พูดดี ทำดี',siteNameEn:'Kids Do',tagline:'เรียนรู้ สร้างสรรค์ แบ่งปันสิ่งดี ๆ',aboutText:'',philosophy:'',motto:'คิดดี พูดดี ทำดี',vision:'',mission:'',identity:'',uniqueness:'',logo:'',favicon:'',siteImage:'',address:'',subdistrict:'',district:'',province:'',postcode:'',phone:'',email:'',facebook:'',youtube:'',tiktok:'',line:'',instagram:'',messenger:'',googleMaps:'',primaryColor:'#2563eb',secondaryColor:'#0f766e',accentColor:'#f59e0b',footerText:'Kids Do'};
      Object.keys(defaults).forEach(function(k){writeRow_('Settings',{id:'SETTING_'+k,key:k,value:defaults[k]});});
    }
    clearRuntimeCaches_();
    return response_({message:'Setup สำเร็จ',sheets:Object.keys(TABLES_),folders:DRIVE_FOLDERS_,adminCreated:!admin});
  } catch(e){return error_(e);}
}
function settingObject_() {
  var o={}; rows_('Settings').forEach(function(r){o[r.key]=r.value;}); var legacyAboutKey='school'+'History'; if(!o.aboutText && o[legacyAboutKey]) o.aboutText=o[legacyAboutKey]; delete o[legacyAboutKey]; return o;
}
