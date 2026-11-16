function uploadFile(token,fileObj,folderName) {
  try {
    var s=requireRole_(token,['Super Admin','Admin','Editor']);
    if(!fileObj || !fileObj.data || !fileObj.name) throw new Error('ไม่พบไฟล์');
    var folder=DriveApp.getFolderById(FOLDER_ID), it=folder.getFoldersByName(folderName || 'Website');
    if(it.hasNext()) folder=it.next();
    var bytes=Utilities.base64Decode(String(fileObj.data).split(',').pop());
    var blob=Utilities.newBlob(bytes,fileObj.mimeType || 'application/octet-stream',fileObj.name);
    var f=folder.createFile(blob);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
    try { Drive.Files.update({copyRequiresWriterPermission:true},f.getId()); } catch(ignore) {}
    var id=f.getId(), key='';
    try {key=f.getResourceKey() || '';}catch(e){}
    var url='https://drive.google.com/thumbnail?id='+id+'&sz=w1600'+(key?'&resourcekey='+encodeURIComponent(key):'');
    log_(s.username,'upload','Drive',fileObj.name);
    return response_({id:id,name:f.getName(),url:url,downloadUrl:f.getUrl(),resourceKey:key,size:f.getSize(),mimeType:f.getMimeType()});
  }catch(e){return error_(e);}
}
/** Public listing: only metadata + safe preview URLs are returned. */
function getKidsLibrary(category) {
  try {
    var key=String(category||'');
    if(!KIDS_LIBRARY_FOLDERS_[key]) throw new Error('ไม่พบหมวดหมู่ไฟล์');
    var folder=DriveApp.getFolderById(KIDS_LIBRARY_FOLDERS_[key]);
    var it=folder.getFiles(), out=[];
    while(it.hasNext()) {
      var f=it.next(), id=f.getId(), mime=f.getMimeType();
      out.push({id:id,name:f.getName(),mimeType:mime,size:f.getSize(),updated:f.getLastUpdated().toISOString(),
        previewUrl:'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview',
        thumbnailUrl:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w600'});
    }
    out.sort(function(a,b){return a.name.localeCompare(b.name);});
    return response_({category:key,files:out});
  } catch(e) { return error_(e); }
}
/** Public cover lookup for the three approved artwork files in the user's shared image folder.
 * This folder is only the source of the three home-page cover images; the actual library folders remain unchanged.
 */
function getKidsLibraryCovers() {
  try {
    var folder=DriveApp.getFolderById('1qu_U599KwsN-In3VnzhIkf5a9E3CUS5u');
    var wanted={Music:'Music Kids.png',Picture:'Picture Kids.png',Document:'Doc Kids.png'};
    var result={};
    Object.keys(wanted).forEach(function(category){
      var files=folder.getFilesByName(wanted[category]), found=null;
      while(files.hasNext()) {
        var f=files.next();
        if(String(f.getMimeType()).indexOf('image/')===0) { found=f; break; }
      }
      result[category]=found?{found:true,name:found.getName(),mimeType:found.getMimeType(),
        thumbnailUrl:'https://drive.google.com/thumbnail?id='+encodeURIComponent(found.getId())+'&sz=w1200',
        viewUrl:'https://drive.google.com/uc?export=view&id='+encodeURIComponent(found.getId())}
        :{found:false,name:wanted[category]};
    });
    return response_(result);
  } catch(e) { return error_(e); }
}
function getKidsLibraryFile(token,fileId) {
  try {
    var s=session_(token);
    var allowed=s.role==='Super Admin' || (s.role==='Admin' && (function(){var u=rows_('Users').filter(function(x){return x.id===s.userId;})[0];return u && (u.downloadAllowed===true || String(u.downloadAllowed)==='true');})());
    if(!allowed) throw new Error('บัญชีนี้ไม่ได้รับอนุญาตให้ดาวน์โหลด');
    var file=DriveApp.getFileById(String(fileId));
    var parentOk=false;
    Object.keys(KIDS_LIBRARY_FOLDERS_).forEach(function(k){var parents=file.getParents();while(parents.hasNext()){if(parents.next().getId()===KIDS_LIBRARY_FOLDERS_[k])parentOk=true;}});
    if(!parentOk) throw new Error('ไฟล์นี้ไม่ได้อยู่ในคลัง Kids Do');
    if(file.getSize()>DOWNLOAD_MAX_BYTES_) throw new Error('ไฟล์ใหญ่เกิน 15 MB สำหรับดาวน์โหลดผ่านเว็บไซต์ กรุณาให้ผู้ดูแลส่งไฟล์ด้วยวิธีอื่น');
    var blob=file.getBlob();
    return response_({name:file.getName(),mimeType:file.getMimeType(),base64:Utilities.base64Encode(blob.getBytes())});
  } catch(e) { return error_(e); }
}
/** Run once after enabling Advanced Google service Drive API. Applies public view-only and blocks Drive download/copy for viewers where Google supports it. */
function secureKidsLibraryFolders(token) {
  requireRole_(token,['Super Admin']);
  var report=[];
  Object.keys(KIDS_LIBRARY_FOLDERS_).forEach(function(k){
    var folder=DriveApp.getFolderById(KIDS_LIBRARY_FOLDERS_[k]), it=folder.getFiles(), count=0, failed=[];
    while(it.hasNext()) {
      var f=it.next();
      try {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
        // Requires Services > + > Drive API (Advanced Google service).
        Drive.Files.update({copyRequiresWriterPermission:true},f.getId());
        count++;
      } catch(e) { failed.push(f.getName()+': '+e.message); }
    }
    report.push({folder:k,secured:count,failed:failed});
  });
  return response_(report);
}

