/**
 * Математическое моделирование — журнал результатов в Google Таблице.
 * Установите код через "Расширения → Apps Script" внутри приватной таблицы.
 * Deploy → New deployment → Web app:
 * Execute as: Me; Who has access: Anyone.
 * Ссылка /exec вставляется в CLOUD_ENDPOINT сайта.
 * Код не раскрывает строки публичным посетителям — доступ к таблице только через Google.
 * ВНИМАНИЕ: веб-хук доступен для отправки всем, кто знает URL. Используйте коды учеников.
 */
function safe_(v, max) {
  var s = String(v == null ? '' : v).trim().slice(0, max);
  return /^[=+@-]/.test(s) ? "'" + s : s;
}
function doGet() {
  return ContentService.createTextOutput('Этот адрес принимает только результаты. Журнал доступен в приватной Google Таблице.');
}
function doPost(e) {
  try {
    if (!e || !e.postData || e.postData.contents.length > 12000) throw Error('Bad request');
    var d = JSON.parse(e.postData.contents);
    if (!d || typeof d !== 'object') throw Error('Invalid data');
    var id = safe_(d.id, 80), code = safe_(d.student, 50), cls = safe_(d.class, 15);
    var grade = Number(d.grade), pts = Number(d.points), total = Number(d.total), help = Number(d.help);
    var percent = Math.round(pts / total * 100);
    if (!id || !code || !cls || ![1,2,3,4].includes(grade) ||
        !Number.isInteger(pts) || !Number.isInteger(total) || !Number.isInteger(help) ||
        total < 1 || total > 50 || pts < 0 || pts > total || help < 0 || help > total) throw Error('Validation failed');
    var topic = safe_(d.topic, 160), test = safe_(d.test, 60);
    var mistakes = Array.isArray(d.details) ? d.details.filter(function(x){return x && !x.ok}).slice(0,50).map(function(x){return safe_(x.question,200)}).join(' | ') : '';
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var book = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = book.getSheetByName('Результаты') || book.insertSheet('Результаты');
      if (sheet.getLastRow() === 0) sheet.appendRow(['Дата получения','ID попытки','Код ученика','Класс','Параллель','Тема','Тест','Баллы','Всего','Процент','Подсказки','Ошибки']);
      sheet.appendRow([new Date(),id,code,cls,grade,topic,test,pts,total,percent,help,mistakes]);
    } finally {lock.releaseLock();}
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('ERROR');
  }
}
