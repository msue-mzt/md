/**
 * MD засварлагч — Google Drive-д зориулсан Apps Script вэб апп.
 *
 * Нээх арга:
 *   1) Drive-ийн "Open with" цэсээр  → ?state={"ids":["FILE_ID"],"action":"open",...}
 *   2) Drive-ийн "New" цэсээр        → ?state={"folderId":"...","action":"create",...}
 *   3) Шууд линкээр                  → .../exec?id=FILE_ID
 *   4) Параметргүй                   → жишээ текст, "Нээх" товчоор Drive линк оруулна
 *
 * Зураг: ![нэр](a.png) гэж бичвэл .md файлтай нэг хавтаснаас хайна.
 *
 * ЧУХАЛ: Deploy → Execute as: "User accessing the web app".
 */

var MAX_BYTES = 10 * 1024 * 1024;   // DriveApp setContent/createFile-ийн хязгаар

function doGet(e) {
  var id = '', folderId = '';
  var p = (e && e.parameter) || {};

  if (p.state) {
    try {
      var state = JSON.parse(p.state);
      if (state.ids && state.ids.length) id = state.ids[0];
      else if (state.folderId) folderId = state.folderId;
    } catch (err) {}
  }
  if (!id && p.id) id = p.id;

  var t = HtmlService.createTemplateFromFile('Index');
  t.fileId = cleanId_(id);
  t.folderId = cleanId_(folderId);
  return t.evaluate()
    .setTitle('MD засварлагч')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Файлын агуулгыг уншина. */
function loadContent(id) {
  var f = DriveApp.getFileById(cleanId_(id));
  return {
    id: f.getId(),
    name: f.getName(),
    text: f.getBlob().getDataAsString('UTF-8').replace(/^\uFEFF/, ''),
    ts: f.getLastUpdated().getTime()
  };
}

/**
 * Байгаа файлыг дарж бичнэ (линк, хуваалцах тохиргоо хэвээр).
 * expectedTs өгвөл, файл тэр хугацаанаас хойш өөрчлөгдсөн бол дарж бичихгүй.
 */
function saveContent(id, text, expectedTs) {
  checkSize_(text);
  var f = DriveApp.getFileById(cleanId_(id));
  if (expectedTs && f.getLastUpdated().getTime() !== expectedTs) {
    return { conflict: true, name: f.getName() };
  }
  f.setContent(text);
  var g = DriveApp.getFileById(f.getId());
  return { id: g.getId(), name: g.getName(), ts: g.getLastUpdated().getTime() };
}

/**
 * Шинэ файл үүсгэнэ.
 * folderId өгвөл тэр хавтсанд, үгүй бол nearId файлын хавтсанд, аль нь ч үгүй бол My Drive-д.
 */
function createContent(name, text, nearId, folderId) {
  checkSize_(text);
  var folder = DriveApp.getRootFolder();
  try {
    if (folderId) {
      folder = DriveApp.getFolderById(cleanId_(folderId));
    } else if (nearId) {
      var parents = DriveApp.getFileById(cleanId_(nearId)).getParents();
      if (parents.hasNext()) folder = parents.next();
    }
  } catch (err) {}
  var f = folder.createFile(String(name), text, 'text/markdown');
  return { id: f.getId(), name: f.getName(), ts: f.getLastUpdated().getTime() };
}

/* ===================== Зураг ===================== */
var IMG_MAX_BYTES = 5 * 1024 * 1024;   // нэг зургийн дээд хэмжээ

/**
 * Markdown дахь зургийн холбоосуудыг data URI болгож буцаана.
 * ref: "a.png", "img/a.png", "../a.png" (.md файлын хавтаснаас),
 *      "drive:FILE_ID", эсвэл Drive-ийн линк.
 */
function resolveImages(mdId, refs) {
  var folder = parentFolder_(mdId);
  var out = {};
  (refs || []).slice(0, 20).forEach(function (ref) {
    try {
      var f = null, id = driveIdFrom_(ref);
      if (id) f = DriveApp.getFileById(id);
      else if (folder) f = findInFolder_(folder, ref);
      if (!f) { out[ref] = { error: 'Олдсонгүй' }; return; }
      var blob = f.getBlob(), type = blob.getContentType();
      if (!/^image\//.test(type)) { out[ref] = { error: 'Зураг биш' }; return; }
      var bytes = blob.getBytes();
      if (bytes.length > IMG_MAX_BYTES) { out[ref] = { error: 'Хэт том (' + (bytes.length / 1048576).toFixed(1) + ' MB)' }; return; }
      out[ref] = { src: 'data:' + type + ';base64,' + Utilities.base64Encode(bytes) };
    } catch (err) {
      out[ref] = { error: 'Нээх эрхгүй эсвэл олдсонгүй' };
    }
  });
  return out;
}

/** .md файлын хавтсан дахь зургуудын жагсаалт. */
function listImages(mdId) {
  var folder = parentFolder_(mdId);
  if (!folder) return { folder: '', items: [] };
  var items = [], it = folder.getFiles();
  while (it.hasNext() && items.length < 300) {
    var f = it.next();
    if (/^image\//.test(f.getMimeType())) items.push({ name: f.getName(), id: f.getId() });
  }
  items.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return { folder: folder.getName(), items: items };
}

/** Зургийг .md файлын хавтсанд хадгалж, markdown-д бичих нэрийг буцаана. */
function uploadImage(mdId, baseName, dataUri) {
  var m = /^data:(image\/[\w.+-]+);base64,(.+)$/.exec(String(dataUri));
  if (!m) throw new Error('Зургийн өгөгдөл буруу байна.');
  var ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
              'image/webp': 'webp', 'image/svg+xml': 'svg' }[m[1]] || 'png';
  var folder = parentFolder_(mdId) || DriveApp.getRootFolder();
  var base = String(baseName || 'image').replace(/[\\\/:*?"<>|()\[\]\s]+/g, '-')
               .replace(/^-+|-+$/g, '') || 'image';
  var name = base + '.' + ext, i = 1;
  while (folder.getFilesByName(name).hasNext()) name = base + '-' + (i++) + '.' + ext;
  var bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > IMG_MAX_BYTES) throw new Error('Зураг хэт том байна.');
  folder.createFile(Utilities.newBlob(bytes, m[1], name));
  return { ref: name };
}

function parentFolder_(mdId) {
  if (!mdId) return null;
  try {
    var ps = DriveApp.getFileById(cleanId_(mdId)).getParents();
    return ps.hasNext() ? ps.next() : null;
  } catch (err) { return null; }
}

function driveIdFrom_(ref) {
  var s = String(ref || ''), m;
  if ((m = /^drive:([-\w]{20,})$/i.exec(s))) return m[1];
  if (/^https?:\/\/(drive|docs)\.google\.com\//i.test(s)) {
    if ((m = /\/d\/([-\w]{20,})/.exec(s)) || (m = /[?&]id=([-\w]{20,})/.exec(s))) return m[1];
  }
  return '';
}

/** "img/a.png", "./a.png", "../x/a.png" зэрэг замаар файл хайна. */
function findInFolder_(folder, ref) {
  var path = String(ref);
  try { path = decodeURIComponent(path); } catch (err) {}
  var parts = path.split('/').filter(function (x) { return x && x !== '.'; });
  if (!parts.length) return null;
  for (var i = 0; i < parts.length - 1; i++) {
    if (parts[i] === '..') {
      var ps = folder.getParents();
      if (!ps.hasNext()) return null;
      folder = ps.next();
    } else {
      var fs = folder.getFoldersByName(parts[i]);
      if (!fs.hasNext()) return null;
      folder = fs.next();
    }
  }
  var it = folder.getFilesByName(parts[parts.length - 1]);
  return it.hasNext() ? it.next() : null;
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function cleanId_(id) {
  return String(id || '').replace(/[^-\w]/g, '');
}

function checkSize_(text) {
  var bytes = Utilities.newBlob(String(text)).getBytes().length;
  if (bytes > MAX_BYTES) {
    throw new Error('Файл хэт том байна (' + (bytes / 1048576).toFixed(1) +
      ' MB, хязгаар 10 MB). Ихэвчлэн зураг шалтгаан болдог — цөөн эсвэл жижиг зураг ашиглана уу.');
  }
}