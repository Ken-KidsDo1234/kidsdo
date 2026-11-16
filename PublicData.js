function getPublicHomeData() {
  try {
    var out={settings:settingObject_()};
    PUBLIC_TABLES_.forEach(function(n){out[n]=rows_(n).filter(function(r){return String(r.status)==='published' || String(r.status)==='active';});});
    out.News.sort(function(a,b){return String(b.publishDate).localeCompare(String(a.publishDate));});
    out.Activities.sort(function(a,b){return String(a.date||'').localeCompare(String(b.date||''));});
    out.Staff.sort(function(a,b){return Number(a.order||0)-Number(b.order||0);});
    out.Links.sort(function(a,b){return Number(a.order||0)-Number(b.order||0);});
    out.Calendar.sort(function(a,b){return String(a.startDate||'').localeCompare(String(b.startDate||''));});
    out.Banners=out.Banners.filter(function(b){var t=Date.now(),s=b.startDate?new Date(b.startDate).getTime():0,e=b.endDate?new Date(b.endDate).getTime():Infinity;return (!s||s<=t)&&(!e||e>=t);});
    out.Banners.sort(function(a,b){return Number(a.order||0)-Number(b.order||0);});
    out.Popups=out.Popups.filter(function(b){var t=Date.now(),s=b.startDate?new Date(b.startDate).getTime():0,e=b.endDate?new Date(b.endDate).getTime():Infinity;return (!s||s<=t)&&(!e||e>=t);});
    return response_(out);
  }catch(e){return error_(e);}
}
function getModule_(name,token) {
  try {
    if (Object.prototype.hasOwnProperty.call(TABLES_,name) === false) throw new Error('ไม่พบหมวดข้อมูล: '+name);
    if (token) {
      var s=session_(token);
      if (s.role==='Editor' && EDITOR_TABLES_.indexOf(name)<0) throw new Error('บัญชี Editor ไม่มีสิทธิ์เข้าถึงหมวดนี้');
      if (['Super Admin','Admin','Editor'].indexOf(s.role)<0) throw new Error('ไม่มีสิทธิ์เข้าถึงข้อมูล');
      return response_(rows_(name));
    }
    if (PUBLIC_TABLES_.indexOf(name)<0) throw new Error('กรุณาเข้าสู่ระบบ');
    return response_(rows_(name).filter(function(r){return String(r.status)==='published'||String(r.status)==='active';}));
  }catch(e){return error_(e);}
}
function getNews(token){return getModule_('News',token);}
function getNewsById(id,token){try{var r=rows_('News').filter(function(x){return x.id===id;})[0];if(token){var u=session_(token);if(['Super Admin','Admin','Editor'].indexOf(u.role)<0)throw new Error('ไม่มีสิทธิ์');}else if(!r||['published','active'].indexOf(String(r.status))<0)r=null;if(!r)throw new Error('ไม่พบข่าว');return response_(r);}catch(e){return error_(e);}}
function getActivities(token){return getModule_('Activities',token);}
function getActivityById(id,token){try{var r=rows_('Activities').filter(function(x){return x.id===id;})[0];if(token){var u=session_(token);if(['Super Admin','Admin','Editor'].indexOf(u.role)<0)throw new Error('ไม่มีสิทธิ์');}else if(!r||['published','active'].indexOf(String(r.status))<0)r=null;if(!r)throw new Error('ไม่พบกิจกรรม');return response_(r);}catch(e){return error_(e);}}
function getStaff(token){return getModule_('Staff',token);}
function getBanners(token){return getModule_('Banners',token);}
function getAwards(token){return getModule_('Awards',token);}
function getDocuments(token){return getModule_('Documents',token);}
function getLinks(token){return getModule_('Links',token);}
function getCalendarEvents(token){return getModule_('Calendar',token);}
const DEFAULT_CALENDAR_CATEGORIES_ = ['ทั่วไป','ดนตรี','ศิลปะ','กีฬา','การเรียนรู้','จิตอาสา'];
