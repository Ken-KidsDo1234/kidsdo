function registerMember(username,password,name) {
  // Public self-registration is intentionally paused per site-owner request.
  return error_(new Error('ขณะนี้ยังไม่เปิดรับสมัครสมาชิกใหม่ กรุณาติดต่อผู้ดูแลระบบ'));
}

function getUsers(token){try{requireRole_(token,['Super Admin','Admin']);return response_(rows_('Users').map(function(u){delete u.passwordHash;return u;}));}catch(e){return error_(e);}}
function approveMember(token,id) {
  try {
    var actor=requireRole_(token,['Super Admin','Admin']);
    var u=rows_('Users').filter(function(x){return String(x.id)===String(id);})[0];
    if(!u) throw new Error('ไม่พบบัญชีผู้ใช้');
    if(u.role!=='Member') throw new Error('อนุมัติได้เฉพาะบัญชี Member เท่านั้น');
    if(u.status!=='pending') throw new Error('บัญชีนี้ไม่ได้อยู่ในสถานะ Pending');
    u.role='Member';u.status='active';u.downloadAllowed=false;u.mustChangePassword=false;
    writeRow_('Users',u);log_(actor.username,'approveMember','Users',u.username);
    return response_({id:u.id,username:u.username,status:'active',role:'Member'});
  } catch(e) { return error_(e); }
}
function rejectMember(token,id) {
  try {
    var actor=requireRole_(token,['Super Admin','Admin']);
    var u=rows_('Users').filter(function(x){return String(x.id)===String(id);})[0];
    if(!u) throw new Error('ไม่พบบัญชีผู้ใช้');
    if(u.role!=='Member' || u.status!=='pending') throw new Error('ปฏิเสธได้เฉพาะบัญชี Member ที่รออนุมัติ');
    u.status='rejected';writeRow_('Users',u);log_(actor.username,'rejectMember','Users',u.username);
    return response_({id:u.id,username:u.username,status:'rejected'});
  } catch(e) { return error_(e); }
}
function saveUser(token,obj) {
  try {
    var s=requireRole_(token,['Super Admin','Admin']);
    if(!obj.username || !obj.role) throw new Error('กรุณาระบุ Username และ Role');
    if(['Super Admin','Admin','Editor','Member'].indexOf(String(obj.role))<0) throw new Error('Role ไม่ถูกต้อง');
    if(s.role==='Admin' && obj.role!=='Member') throw new Error('Admin แก้ไขได้เฉพาะบัญชี Member');
    if(obj.role==='Super Admin' && s.role!=='Super Admin') throw new Error('เฉพาะ Super Admin เท่านั้นที่กำหนดสิทธิ์ Super Admin ได้');
    var existing=rows_('Users').filter(function(u){return u.username===obj.username && u.id!==obj.id;})[0];
    if(existing) throw new Error('Username นี้ถูกใช้แล้ว');
    var u={id:obj.id||uid_('USER'),username:String(obj.username),name:String(obj.name||obj.username),role:obj.role,status:obj.status||'active',mustChangePassword:!!obj.mustChangePassword,downloadAllowed:obj.role==='Super Admin'?true:!!obj.downloadAllowed,createdAt:obj.createdAt||now_()};
    if(obj.password) {if(Array.from(String(obj.password)).length<6)throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');u.passwordHash=hash_(obj.password);}
    else if(obj.id){var old=rows_('Users').filter(function(x){return x.id===obj.id;})[0];u.passwordHash=old.passwordHash;if(obj.downloadAllowed===undefined)u.downloadAllowed=old.downloadAllowed===true||String(old.downloadAllowed)==='true';}
    else throw new Error('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร');
    var saved=writeRow_('Users',u);log_(s.username,'saveUser','Users',saved.username);return response_({id:saved.id,username:saved.username});
  }catch(e){return error_(e);}
}
function resetUserPassword(token,id,newPassword) {
  try {
    var s=requireRole_(token,['Super Admin']);
    if(Array.from(String(newPassword || '')).length<6) throw new Error('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
    var u=rows_('Users').filter(function(x){return String(x.id)===String(id);})[0];
    if(!u) throw new Error('ไม่พบบัญชีผู้ใช้นี้');
    u.passwordHash=hash_(newPassword);u.mustChangePassword=true;writeRow_('Users',u);
    log_(s.username,'resetPassword','Users','รีเซ็ตรหัสผ่านให้ '+u.username);
    return response_(true);
  } catch(e) { return error_(e); }
}
function deleteUser(token,id){try{var s=requireRole_(token,['Super Admin']);if(id==='USER_ADMIN')throw new Error('ไม่สามารถลบ Admin เริ่มต้นได้');deleteRow_('Users',id);log_(s.username,'delete','Users',id);return response_(true);}catch(e){return error_(e);}}
function getLogs(token){try{requireRole_(token,['Super Admin','Admin']);return response_(rows_('Logs').slice(-500).reverse());}catch(e){return error_(e);}}
