function saveModule_(token,name,obj) {
  try {
    var allowed=EDITOR_TABLES_.indexOf(name)>=0?['Super Admin','Admin','Editor']:['Super Admin','Admin'];
    var s=requireRole_(token,allowed);
    if(!obj || typeof obj!=='object') throw new Error('ข้อมูลไม่ถูกต้อง');
    var clean={}; TABLES_[name].forEach(function(k){if(obj[k]!==undefined)clean[k]=obj[k];});
    // Preserve optional fields only when their columns already exist in the Sheet.
    if(name==='Links') {
      if(!String(clean.name||'').trim()) throw new Error('กรุณาระบุชื่อเว็บไซต์');
      var linkUrl=String(clean.url||'').trim();
      if(!/^https:\/\//i.test(linkUrl)) throw new Error('URL ต้องขึ้นต้นด้วย https://');
      clean.url=linkUrl;
      if(clean.name!==undefined) clean.name=String(clean.name).trim();
      if(clean.category!==undefined) clean.category=String(clean.category).trim().substring(0,60);
      if(clean.description!==undefined) clean.description=String(clean.description).trim().substring(0,500);
    }
    if(name==='Calendar') {
      if(!String(clean.title||'').trim()) throw new Error('กรุณาระบุชื่อกิจกรรม');
      if(!clean.startDate) throw new Error('กรุณาระบุวันและเวลาเริ่มกิจกรรม');
      if(clean.endDate && String(clean.endDate)<String(clean.startDate)) throw new Error('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
      clean.title=String(clean.title).trim().substring(0,160);
      clean.description=String(clean.description||'').substring(0,2000);
      clean.location=String(clean.location||'').trim().substring(0,250);
      clean.category=String(clean.category||'ทั่วไป').trim().substring(0,60);
      clean.groupName=String(clean.groupName||clean.group||'').trim().substring(0,100);
      clean.group=clean.groupName;
      clean.groupId=clean.groupName ? (String(clean.groupId||'').trim() || ('GRP_'+hash_(clean.groupName.toLowerCase()).substring(0,12))) : '';
      if(clean.status===undefined || clean.status===null || String(clean.status).trim()==='') clean.status='published';
      // Source role and colour are assigned by the server, never trusted from the browser.
      var oldCalendar=clean.id ? rows_('Calendar').filter(function(r){return String(r.id)===String(clean.id);})[0] : null;
      if(oldCalendar) {
        clean.submittedBy=oldCalendar.submittedBy || '';
        clean.submittedRole=oldCalendar.submittedRole || 'Admin';
        clean.approvedBy=oldCalendar.approvedBy || '';
        clean.approvedAt=oldCalendar.approvedAt || '';
      } else {
        clean.submittedBy=s.userId;
        clean.submittedRole=s.role;
        clean.approvedBy=''; clean.approvedAt='';
      }
      clean.color=(clean.submittedRole==='Member')?'#16a34a':'#2563eb';
    }
    clean.id=clean.id || uid_(name.toUpperCase());
    var existing=rows_(name).some(function(r){return r.id===clean.id;});
    if(!existing && (clean.status===undefined || clean.status===null || String(clean.status).trim()==='')) clean.status='published';
    var saved=writeRow_(name,clean);
    log_(s.username,existing?'update':'create',name,(existing?'แก้ไข ':'เพิ่ม ')+name+' '+saved.id);
    clearRuntimeCaches_(); return response_(saved);
  }catch(e){return error_(e);}
}
/** Member-submitted calendar events are always Pending; role and approval fields are server-controlled. */

function deleteModule_(token,name,id) {
  try {
    var allowed=EDITOR_TABLES_.indexOf(name)>=0?['Super Admin','Admin','Editor']:['Super Admin','Admin'];
    var s=requireRole_(token,allowed);
    if(!id || typeof id!=='string') throw new Error('ID ไม่ถูกต้อง');
    var deleted=deleteRow_(name,id); if(!deleted) throw new Error('ไม่พบรายการที่ต้องการลบ');log_(s.username,'delete',name,'ลบ '+id);clearRuntimeCaches_();return response_(true);
  }catch(e){return error_(e);}
}
function saveNews(t,o){return saveModule_(t,'News',o);} function deleteNews(t,id){return deleteModule_(t,'News',id);}
function saveActivity(t,o){return saveModule_(t,'Activities',o);} function deleteActivity(t,id){return deleteModule_(t,'Activities',id);}
function saveStaff(t,o){return saveModule_(t,'Staff',o);} function deleteStaff(t,id){return deleteModule_(t,'Staff',id);}
function saveBanner(t,o){return saveModule_(t,'Banners',o);} function deleteBanner(t,id){return deleteModule_(t,'Banners',id);}
function saveAward(t,o){return saveModule_(t,'Awards',o);} function deleteAward(t,id){return deleteModule_(t,'Awards',id);}
function saveDocument(t,o){return saveModule_(t,'Documents',o);} function deleteDocument(t,id){return deleteModule_(t,'Documents',id);}
function saveLink(t,o){return saveModule_(t,'Links',o);} function deleteLink(t,id){return deleteModule_(t,'Links',id);}
function saveCalendarEvent(t,o){return saveModule_(t,'Calendar',o);} function deleteCalendarEvent(t,id){return deleteModule_(t,'Calendar',id);}
function savePopup(t,o){return saveModule_(t,'Popups',o);} function deletePopup(t,id){return deleteModule_(t,'Popups',id);}
function increaseNewsView(id){try{var r=rows_('News').filter(function(x){return x.id===id;})[0];if(r){r.views=Number(r.views||0)+1;writeRow_('News',r);}return response_(true);}catch(e){return error_(e);}}
function increaseDownloadCount(id){try{var r=rows_('Documents').filter(function(x){return x.id===id;})[0];if(r){r.downloads=Number(r.downloads||0)+1;writeRow_('Documents',r);}return response_(true);}catch(e){return error_(e);}}
