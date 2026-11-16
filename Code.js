/** Kids Do single-project entry point. Other server functions are organized in .gs modules. */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Kids Do | คิดดี พูดดี ทำดี')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


Code.js
หน้าที่

Entry Point ของระบบ
เริ่มต้น Web App
Functions

doGet(e)
หน้าที่

เปิดไฟล์ Index.html เป็นหน้าแรกของระบบ
โค้ด

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Kids Do | คิดดี พูดดี ทำดี')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}