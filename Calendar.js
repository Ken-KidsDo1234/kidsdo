function calendarCategories_() {
  var row=rows_('Settings').filter(function(x){return String(x.key)==='calendarCategories';})[0];
  var saved=safeJson_(row&&row.value,[]), list=DEFAULT_CALENDAR_CATEGORIES_.slice();
  if(Array.isArray(saved)) saved.forEach(function(x){var n=String(x||'').trim().substring(0,60);if(n&&list.indexOf(n)<0)list.push(n);});
  rows_('Calendar').forEach(function(e){var n=String(e.category||'').trim().substring(0,60);if(n&&list.indexOf(n)<0)list.push(n);});
  return list;
}
function getCalendarCategories(token) {
  try { if(token) requireRole_(token,['Member','Editor','Admin','Super Admin']); return response_(calendarCategories_()); }
  catch(e){return error_(e);}
}
function addCalendarCategory(token,name) {
  try {
    var s=requireRole_(token,['Admin','Super Admin']);
    var value=String(name||'').trim().replace(/\s+/g,' ').substring(0,60);
    if(!value) throw new Error('กรุณาระบุชื่อประเภทกิจกรรม');
    var list=calendarCategories_();
    if(list.some(function(x){return x.toLowerCase()===value.toLowerCase();})) throw new Error('มีประเภทกิจกรรมนี้อยู่แล้ว');
    list.push(value);
    writeRow_('Settings',{id:'SETTING_calendarCategories',key:'calendarCategories',value:JSON.stringify(list)});
    log_(s.username,'create','CalendarCategory','เพิ่มประเภทกิจกรรม '+value);
    clearRuntimeCaches_(); return response_(list);
  } catch(e){return error_(e);}
}
function getCalendarGroups(token) {
  try {
    if(token) requireRole_(token,['Member','Editor','Admin','Super Admin']);
    var map={};
    rows_('Calendar').filter(function(e){return String(e.status)==='published' && String(e.groupId||'') && String(e.groupName||e.group||'').trim();}).forEach(function(e){
      var id=String(e.groupId), name=String(e.groupName||e.group||'').trim();
      if(!map[id]) map[id]={id:id,name:name,count:0}; map[id].count++;
    });
    return response_(Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return a.name.localeCompare(b.name,'th');}));
  } catch(e) { return error_(e); }
}
function getPopups(token){return getModule_('Popups',token);}

function submitMemberCalendarEvent(token,obj) {
  try {
    var s=requireRole_(token,['Member']);
    if(!obj || typeof obj!=='object') throw new Error('ข้อมูลกิจกรรมไม่ถูกต้อง');
    var title=String(obj.title||'').trim(), start=String(obj.startDate||'').trim(), end=String(obj.endDate||'').trim();
    if(!title) throw new Error('กรุณาระบุชื่อกิจกรรม');
    if(!start) throw new Error('กรุณาระบุวันเริ่มกิจกรรม');
    if(end && end.slice(0,10)<start.slice(0,10)) throw new Error('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
    var allowedCategories=calendarCategories_();
    var category=String(obj.category||'ทั่วไป').trim();
    if(allowedCategories.indexOf(category)<0) throw new Error('ไม่พบประเภทกิจกรรมที่เลือก');
    var groupId=String(obj.groupId||'').trim();
    var groupName='';
    if(groupId) {
      var groupRows=rows_('Calendar').filter(function(e){return String(e.status)==='published' && String(e.groupId||'')===groupId && String(e.groupName||e.group||'').trim();});
      if(!groupRows.length) throw new Error('ไม่พบกลุ่มกิจกรรมที่เปิดให้สมาชิกเลือก');
      groupName=String(groupRows[0].groupName||groupRows[0].group||'').trim();
    }
    var saved=writeRow_('Calendar',{id:uid_('CAL'),title:title,description:String(obj.description||'').substring(0,2000),startDate:start,endDate:end,location:String(obj.location||'').substring(0,250),group:groupName,groupId:groupId,groupName:groupName,category:category,submittedBy:s.userId,submittedRole:'Member',status:'pending',color:'#16a34a'});
    log_(s.username,'submit','Calendar','ส่งกิจกรรมรออนุมัติ '+saved.id);
    clearRuntimeCaches_();
    return response_({id:saved.id,status:'pending',message:'ส่งกิจกรรมแล้ว กรุณารอผู้ดูแลอนุมัติ'});
  } catch(e) { return error_(e); }
}
function reviewCalendarEvent(token,id,decision) {
  try {
    var s=requireRole_(token,['Super Admin','Admin']);
    if(['approve','reject'].indexOf(String(decision))<0) throw new Error('คำสั่งไม่ถูกต้อง');
    var ev=rows_('Calendar').filter(function(x){return String(x.id)===String(id);})[0];
    if(!ev) throw new Error('ไม่พบกิจกรรม');
    if(ev.status!=='pending') throw new Error('กิจกรรมนี้ไม่ได้อยู่ในสถานะรออนุมัติ');
    ev.status=decision==='approve'?'published':'rejected';
    ev.approvedBy=decision==='approve'?s.userId:''; ev.approvedAt=decision==='approve'?now_():'';
    writeRow_('Calendar',ev); log_(s.username,'reviewCalendar','Calendar',decision+' '+id); clearRuntimeCaches_();
    return response_({id:id,status:ev.status});
  } catch(e) { return error_(e); }
}

