function recordVisitor(clientKey,userAgent) {
  try {
    var day=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd'), id='VIS_'+day+'_'+hash_(clientKey || Utilities.getUuid()).substring(0,12);
    var sh=sheet_('Visitors'), list=rows_('Visitors'), found=list.filter(function(x){return x.id===id;})[0];
    if(!found) writeRow_('Visitors',{id:id,date:day,ipHash:hash_(clientKey || Utilities.getUuid()),userAgent:String(userAgent||'').substring(0,180),count:1});
    var total=rows_('Visitors').reduce(function(a,r){return a+Number(r.count||0);},0);
    return response_({total:total,today:rows_('Visitors').filter(function(r){return String(r.date)===day;}).length});
  }catch(e){return error_(e);}
}
function getDashboardStats(token) {
  try {
    var s=requireRole_(token,['Super Admin','Admin','Editor']);
    var names=['News','Activities','Staff','Awards','Documents'], counts={};
    names.forEach(function(n){counts[n]=rows_(n).length;});
    counts.libraryMusic=0;counts.libraryPicture=0;counts.libraryDocuments=0;counts.driveWarnings=[];
    Object.keys(KIDS_LIBRARY_FOLDERS_).forEach(function(k){
      try {
        var it=DriveApp.getFolderById(KIDS_LIBRARY_FOLDERS_[k]).getFiles(),n=0;
        while(it.hasNext()){it.next();n++;}
        if(k==='Music')counts.libraryMusic=n;else if(k==='Picture')counts.libraryPicture=n;else if(k==='Document')counts.libraryDocuments=n;
      } catch(driveError) { counts.driveWarnings.push(k+': '+String(driveError&&driveError.message||driveError)); }
    });
    counts.users=rows_('Users').length;
    counts.activeUsers=rows_('Users').filter(function(u){return String(u.status)==='active';}).length;
    counts.visitors=rows_('Visitors').reduce(function(a,r){return a+Number(r.count||0);},0);
    counts.monthVisitors=rows_('Visitors').filter(function(r){return String(r.date).substring(0,7)===Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM');}).reduce(function(a,r){return a+Number(r.count||0);},0);
    counts.todayVisitors=rows_('Visitors').filter(function(r){return String(r.date)===Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyy-MM-dd');}).length;
    counts.role=s.role;
    return response_(counts);
  }catch(e){return error_(e);}
}
