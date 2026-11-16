/** Kids Do single-project entry point. Other server functions are organized in .gs modules. */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Kids Do | คิดดี พูดดี ทำดี')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
