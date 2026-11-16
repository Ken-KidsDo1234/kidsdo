function getSettings() { try{return response_(settingObject_());}catch(e){return error_(e);} }
function saveSettings(token,obj) {
  try {
    requireRole_(token,['Super Admin','Admin']);
    if(!obj || typeof obj!=='object') throw new Error('ข้อมูลตั้งค่าไม่ถูกต้อง');
    Object.keys(obj).forEach(function(k){var id='SETTING_'+k;writeRow_('Settings',{id:id,key:k,value:obj[k]});});
    clearRuntimeCaches_(); log_(session_(token).username,'update','Settings','แก้ไขการตั้งค่าเว็บไซต์');
    return response_(settingObject_());
  }catch(e){return error_(e);}
}
function sessions_(){return PropertiesService.getScriptProperties();}
function session_(token) {
  if(!token) throw new Error('กรุณาเข้าสู่ระบบ');
  var raw=sessions_().getProperty('S_'+token), s=safeJson_(raw,null);
  if(!s || !s.expires || new Date(s.expires).getTime()<Date.now()) {sessions_().deleteProperty('S_'+token);throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');}
  var u=rows_('Users').filter(function(x){return x.id===s.userId && (x.status==='active'||x.status==='pending');})[0];
  if(!u) throw new Error('บัญชีนี้ไม่สามารถใช้งานได้');
  return {token:token,userId:u.id,username:u.username,name:u.name,role:u.role,status:u.status,downloadAllowed:u.downloadAllowed===true || String(u.downloadAllowed)==='true',mustChangePassword:u.mustChangePassword===true || String(u.mustChangePassword)==='true'};
}
function requireRole_(token,roles) {
  var s=session_(token);
  if(s.status!=='active') throw new Error('บัญชียังอยู่ระหว่างรออนุมัติ ใช้ได้เฉพาะการส่งข้อความถึง Admin');
  if(roles.indexOf(s.role)<0) throw new Error('คุณไม่มีสิทธิ์ดำเนินการนี้');
  return s;
}
function login(username,password,remember) {
  try {
    var u=rows_('Users').filter(function(x){return x.username===String(username) && (x.status==='active'||x.status==='pending');})[0];
    if(!u || u.passwordHash!==hash_(password)) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    var token=Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid();
    var days=remember ? 30 : 8;
    var expires=new Date(Date.now()+days*86400000).toISOString();
    sessions_().setProperty('S_'+token,JSON.stringify({userId:u.id,expires:expires}));
    log_(u.username,'login','Auth','เข้าสู่ระบบ');
    return response_({token:token,user:{id:u.id,username:u.username,name:u.name,role:u.role,status:u.status,downloadAllowed:u.downloadAllowed===true || String(u.downloadAllowed)==='true',mustChangePassword:u.mustChangePassword===true || String(u.mustChangePassword)==='true'},expires:expires});
  }catch(e){return error_(e);}
}
function logout(token) {
  try {var s=session_(token);sessions_().deleteProperty('S_'+token);log_(s.username,'logout','Auth','ออกจากระบบ');return response_(true);}catch(e){return error_(e);}
}
function checkSession(token) {try{return response_(session_(token));}catch(e){return error_(e);}}
function changePassword(token,oldPassword,newPassword) {
  try {
    var s=session_(token),u=rows_('Users').filter(function(x){return x.id===s.userId;})[0];
    var mustChange=u.mustChangePassword===true || String(u.mustChangePassword)==='true';
    if(!mustChange && u.passwordHash!==hash_(oldPassword)) throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
    if(Array.from(String(newPassword || '')).length<6) throw new Error('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
    u.passwordHash=hash_(newPassword);u.mustChangePassword=false;writeRow_('Users',u);
    log_(u.username,'changePassword','Users','เปลี่ยนรหัสผ่าน');
    return response_(true);
  }catch(e){return error_(e);}
}
