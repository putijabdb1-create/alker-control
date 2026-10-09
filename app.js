const CONFIG = {
  SPREADSHEET_ID: "",          // kosong = gunakan spreadsheet yang terikat ke script
  DRIVE_FOLDER_ID: "",         // kosong = buat folder ALKER_CONTROL_FILES
  SESSION_HOURS: 12
};

const SHEETS = [
  "USERS","LOKERS","MASTER_ALKER","TEKNISI","INVENTORY","INITIAL_INVENTORY",
  "REQUESTS","RECEIVING","DISTRIBUTION","RETURNS","ISSUES","PROCUREMENT",
  "HISTORY","AUDIT","MASTER_ALKER_LOKER","TEKNISI_TEAM","MASTER_ALKER_PRICE"
];

const HEADERS = {
  USERS:["userId","username","passwordHash","name","role","loker","active","createdAt","leaderId"],
  LOKERS:["lokerId","name","status","createdAt"],
  MASTER_ALKER:["itemId","itemName","category","unit","standardPrice","lokers","spec","active","createdAt","photoMode"],
  TEKNISI:["technicianId","name","username","loker","phone","status","createdAt"],
  INVENTORY:["inventoryId","itemId","itemName","category","brand","type","serialNumber","price","condition","status","location","loker","holderId","holder","photoUrl","serialPhotoUrl","receivedAt","source","notes","updatedAt"],
  INITIAL_INVENTORY:["initialId","itemId","itemName","technicianId","technician","loker","brand","type","serialNumber","condition",
  "price","photoUrl","serialPhotoUrl","note","status","date","reviewNote","givenStatus"], 
  REQUESTS:["requestId","itemId","itemName","technicianId","technician","loker","requestType","qty","priority","reason","photoUrl","status","leaderDecision","warehouseDecision","date","updatedAt","note"],
  RECEIVING:["receivingId","itemId","itemName","qty","brand","type","serialNumber","price","supplier","reference","photoUrl","docPhotoUrl","note","status","date","actor"],
  DISTRIBUTION:["distributionId","inventoryId","itemId","itemName","technicianId","technician","loker","condition","note","status","date","actor"],
  RETURNS:["returnId","inventoryId","itemId","itemName","technicianId","technician","loker","condition","note","photoUrl","serialPhotoUrl","status","date","actor","reviewNote","reviewedAt","reviewedBy"],
  ISSUES:["issueId","inventoryId","itemId","itemName","technicianId","technician","loker","issueType","note","photoUrl","status","date","updatedAt"],
  PROCUREMENT:["procurementId","itemId","itemName","qty","estimate","priority","reason","status","requestId","date","updatedAt","actor"],
  HISTORY:["historyId","actorId","actor","action","description","date"],
  AUDIT:["auditId","actorId","actor","action","description","date"],
  MASTER_ALKER_LOKER:["mappingId","itemId","loker","active","createdAt"],
  TEKNISI_TEAM:["teamId","loker","technicianId","partnerId","active","createdAt","updatedAt"],
  MASTER_ALKER_PRICE:["priceId","itemId","itemName","brand","type","price","active","createdAt","updatedAt"]
};

const SEED_LOKERS = [
  "IOAN / ASSURANCE","PSB / FULFILLMENT","MAINTENANCE / OSP","LEADER","GUDANG"
];

const SEED_USERS = [
  ["USR-ADMIN","admin","","Administrator","ADMIN","","Y",""],
  ["USR-GUDANG","gudang","","SPV Gudang","SPV_GUDANG","GUDANG","Y",""],
  ["USR-LEADER","leader","","Leader Utama","LEADER","LEADER","Y",""],
  ["USR-TEKNISI","teknisi","","Teknisi Demo","TEKNISI","PSB / FULFILLMENT","Y",""]
];

// Master ALKER disatukan per jenis, tetapi kolom lokers mempertahankan loker pengguna.
const SEED_ITEMS = [
  // IOAN / ASSURANCE
  ["ALK-IOAN-001","Splicer","ALKER","UNIT",0,"IOAN / ASSURANCE","Asuransi dan pajak; Maintenance Service; SUCA dan elektroda","Y"],
  ["ALK-IOAN-002","Unit Splicer","ALKER","UNIT",0,"IOAN / ASSURANCE","","Y"],
  ["ALK-IOAN-003","ARC Count","ALKER","UNIT",0,"IOAN / ASSURANCE","","Y"],
  ["ALK-IOAN-004","Testphone","Alat Komunikasi","UNIT",0,"IOAN / ASSURANCE","Chino-E C019","Y"],
  ["ALK-IOAN-005","Tone Checker","Alat Komunikasi","UNIT",0,"IOAN / ASSURANCE","Pantong (TGP 42)","Y"],
  ["ALK-IOAN-006","LAN Tester","Alat Ukur","UNIT",0,"IOAN / ASSURANCE","Nankai RJ11/RJ45-SY-468","Y"],
  ["ALK-IOAN-007","Optical Power Meter","Alat Ukur","UNIT",0,"IOAN / ASSURANCE","Joinwit, BND, Senter, F2H, AMG","Y"],
  ["ALK-IOAN-008","VFL (Visible Fault Locator) 20km","Alat Ukur","UNIT",0,"IOAN / ASSURANCE","Joinwit, Senter","Y"],
  ["ALK-IOAN-009","Optical Fiber Ranger","Alat Ukur","UNIT",0,"IOAN / ASSURANCE","Joinwit, Comptcyo, Novker","Y"],
  ["ALK-IOAN-010","One Click Cleaner (Fiber Cleaner)","Kelengkapan","UNIT",0,"IOAN / ASSURANCE","Cleaner EC/SC/ST","Y"],
  ["ALK-IOAN-011","Toolkit FO (Fiber Stripper)","Kelengkapan","UNIT",0,"IOAN / ASSURANCE","Ilsintech, Swift (DropcoreStripper)","Y"],
  ["ALK-IOAN-012","Tangga Dorong Aluminium 5.1 Meter","Kelengkapan","UNIT",0,"IOAN / ASSURANCE","Tangga Teleskopik 5.1 m","Y"],
  ["ALK-IOAN-013","Toolkit Set","Kelengkapan","SET",0,"IOAN / ASSURANCE","Tang potong; tang jepit; tang kombinasi; testpen","Y"],
  ["ALK-IOAN-014","Alat komunikasi (HP Android)","Komunikasi","UNIT",0,"IOAN / ASSURANCE","Android RAM minimal 4GB","Y"],
  ["ALK-IOAN-015","Crimping Tools RJ11 dan RJ45 Cat-5","Kelengkapan","UNIT",0,"IOAN / ASSURANCE","Trendnet (Crimping Tool RJ45/RJ11)","Y"],
  ["ALK-IOAN-016","Paket internet & Pulsa","Operasional","PAKET",0,"IOAN / ASSURANCE","TelkomGroup, minimal 2GB","Y"],
  ["ALK-IOAN-017","Body Harness","APD","UNIT",0,"IOAN / ASSURANCE","Krisbow atau setara","Y"],
  ["ALK-IOAN-018","Helm pengaman","APD","UNIT",0,"IOAN / ASSURANCE","Krisbow atau setara","Y"],
  ["ALK-IOAN-019","Kaos tangan","APD","PASANG",0,"IOAN / ASSURANCE","Krisbow atau setara","Y"],
  ["ALK-IOAN-020","Jas Hujan","APD","UNIT",0,"IOAN / ASSURANCE","AXIO AX-882 Europe, AXIO AX-661","Y"],
  ["ALK-IOAN-021","Tas Punggung","Kelengkapan","UNIT",0,"IOAN / ASSURANCE","Kuat & cukup untuk membawa alat kerja","Y"],
  ["ALK-IOAN-022","Powerbank Valins","Elektronik","UNIT",0,"IOAN / ASSURANCE","Robot atau Xiaomi","Y"],
  ["ALK-IOAN-023","Converter Type-C to RJ45","Elektronik","UNIT",0,"IOAN / ASSURANCE","Non-brand","Y"],
  ["ALK-IOAN-024","KBM R2","Kendaraan","UNIT",0,"IOAN / ASSURANCE","Motor operasional","Y"],
  ["ALK-IOAN-025","BBM","Operasional","LITER",0,"IOAN / ASSURANCE","Pertalite","Y"],
  // PSB / FULFILLMENT
  ["ALK-PSB-001","Splicer","ALKER","UNIT",0,"PSB / FULFILLMENT","Asuransi dan pajak; Maintenance Service; SUCA dan elektroda","Y"],
  ["ALK-PSB-002","ARC Count","ALKER","UNIT",0,"PSB / FULFILLMENT","","Y"],
  ["ALK-PSB-003","Testphone","Alat Komunikasi","UNIT",0,"PSB / FULFILLMENT","Chino-E C019","Y"],
  ["ALK-PSB-004","Optical Power Meter","Alat Ukur","UNIT",0,"PSB / FULFILLMENT","Joinwit, BND, Senter, F2H, AMG","Y"],
  ["ALK-PSB-005","One Click Cleaner (Fiber Cleaner)","Kelengkapan","UNIT",0,"PSB / FULFILLMENT","Cleaner MU/LC","Y"],
  ["ALK-PSB-006","Toolkit FO (Fiber Stripper)","Kelengkapan","UNIT",0,"PSB / FULFILLMENT","Swift (DropcoreStripper)","Y"],
  ["ALK-PSB-007","Tangga Dorong Aluminium 5.1 Meter","Kelengkapan","UNIT",0,"PSB / FULFILLMENT","Tangga Teleskopik 5.1 m","Y"],
  ["ALK-PSB-008","Toolkit Set","Kelengkapan","SET",0,"PSB / FULFILLMENT","Toolkit Set 8 pcs","Y"],
  ["ALK-PSB-009","Alat komunikasi (HP Android)","Komunikasi","UNIT",0,"PSB / FULFILLMENT","Android RAM minimal 4GB, Dual Band","Y"],
  ["ALK-PSB-010","Paket internet & Pulsa","Operasional","PAKET",0,"PSB / FULFILLMENT","TelkomGroup, minimal 2GB","Y"],
  ["ALK-PSB-011","Body Harness","APD","UNIT",0,"PSB / FULFILLMENT","Krisbow atau setara","Y"],
  ["ALK-PSB-012","Helm pengaman","APD","UNIT",0,"PSB / FULFILLMENT","Krisbow atau setara","Y"],
  ["ALK-PSB-013","Kaos tangan","APD","PASANG",0,"PSB / FULFILLMENT","Krisbow atau setara","Y"],
  ["ALK-PSB-014","Jas Hujan","APD","UNIT",0,"PSB / FULFILLMENT","AXIO AX-882 Europe, AXIO AX-661","Y"],
  ["ALK-PSB-015","Tas Punggung","Kelengkapan","UNIT",0,"PSB / FULFILLMENT","Kuat & cukup untuk membawa Alat Kerja","Y"],
  ["ALK-PSB-016","Pakaian Seragam","APD","SET",0,"PSB / FULFILLMENT","Design yang ditetapkan Telkom Akses","Y"],
  ["ALK-PSB-017","Powerbank Valins","Elektronik","UNIT",0,"PSB / FULFILLMENT","Robot atau Xiaomi (1000 mAH)","Y"],
  ["ALK-PSB-018","Converter Type-C to RJ45","Elektronik","UNIT",0,"PSB / FULFILLMENT","Non-brand","Y"],
  ["ALK-PSB-019","Bor","Alat Kerja","UNIT",0,"PSB / FULFILLMENT","Bosch, Black+Decker, Makita","Y"],
  ["ALK-PSB-020","Mata bor berbagai ukuran","Alat Kerja","SET",0,"PSB / FULFILLMENT","Non-brand","Y"],
  ["ALK-PSB-021","Safety Shoes","APD","PASANG",0,"PSB / FULFILLMENT","Krisbow (MAXI 4 in)","Y"],
  ["ALK-PSB-022","KBM R2","Kendaraan","UNIT",0,"PSB / FULFILLMENT","Motor Matic/110cc maksimal 8 tahun atau motor listrik baterai 72v","Y"],
  ["ALK-PSB-023","BBM","Operasional","LITER",0,"PSB / FULFILLMENT","Pertalite","Y"],
  // MAINTENANCE / OSP
  ["ALK-OSP-001","Splicer","ALKER","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-002","Testphone","Alat Komunikasi","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-003","Tone Checker","Alat Komunikasi","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-004","Mini OTDR","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-005","Optical Fiber Ranger","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-006","Baterai Capacity Tester","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-007","Megger Earth Tester","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-008","Tang Ampere","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-009","Termo Hygrometer","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-010","One Click Cleaner Tipe FC/SC/ST","Kelengkapan","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-011","Toolkit FO (Fiber Stripper)","Kelengkapan","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-012","Tangga Dorong Aluminium 5.1 Meter","Kelengkapan","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-013","Toolkit Set","Kelengkapan","SET",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-014","Alat komunikasi (HP Android 4G)","Komunikasi","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-015","PC Help Desk (HD/Admin)","Perangkat IT","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-016","Laptop / Net Book (TL)","Perangkat IT","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-017","Alat Bersih-bersih","Operasional","UNIT",0,"MAINTENANCE / OSP","Vacuum Cleaner, Kain Majun","Y"],
  ["ALK-OSP-018","Terpal Plastik","Operasional","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-019","Genset 1000 Watt + Lampu Penerangan","Peralatan Tim","SET",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-020","Alat Gali","Peralatan Tim","SET",0,"MAINTENANCE / OSP","Linggis, Cangkul, Sabit, Pengki Plastik","Y"],
  ["ALK-OSP-021","Paket Internet & Pulsa","Operasional","PAKET",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-022","Seragam","APD","SET",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-023","ID Card","Identitas","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-024","Working / Body Harness","APD","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-025","Helm Pengaman","APD","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-026","Kaos Tangan","APD","PASANG",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-027","Jas Hujan","APD","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-028","Safety Shoes","APD","PASANG",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-029","Tas Punggung","Kelengkapan","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-030","Rompi Teknisi","APD","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-031","Head Lamp","Kelengkapan","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-032","Bor Listrik","Alat Kerja","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-033","Track Tang","Alat Kerja","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-034","Alat Buka Tutup Man Hole","Alat Kerja","SET",0,"MAINTENANCE / OSP","Takel, Tripod","Y"],
  ["ALK-OSP-035","Pompa Air","Peralatan Tim","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-036","Cable Fault Locator","Alat Ukur","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-037","KBM Roda 2","Kendaraan","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-038","Tang Potong atau Tang Baja","Alat Kerja","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-039","Chainsaw Machine Portable","Peralatan Tim","UNIT",0,"MAINTENANCE / OSP","","Y"],
  ["ALK-OSP-040","Aksesoris Material Bantu","Consumable","PAKET",0,"MAINTENANCE / OSP","0,5 liter; tisu 1 pack kecil; lakban 1 roll; tali montage 67 m; isolasi ban 0,25 roll; parapon 0,25 kg","Y"],
  // LEADER
  ["ALK-LDR-001","Laptop","Perangkat IT","UNIT",0,"LEADER","","Y"],
  ["ALK-LDR-002","HP","Komunikasi","UNIT",0,"LEADER","","Y"],
  ["ALK-LDR-003","Motor","Kendaraan","UNIT",0,"LEADER","","Y"]
];

function ss_(){
  if(CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}
function now_(){return Utilities.formatDate(new Date(),Session.getScriptTimeZone()||"Asia/Jakarta","yyyy-MM-dd HH:mm:ss")}
function id_(p){return p+"-"+Utilities.getUuid().slice(0,8).toUpperCase()}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function ok_(data){return json_({ok:true,data})}
function fail_(m){return json_({ok:false,message:m})}
function sheet_(n){return ss_().getSheetByName(n)}
function rows_(n){
  const sh=sheet_(n); if(!sh||sh.getLastRow()<2)return [];
  const h=HEADERS[n]||sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  return sh.getRange(2,1,sh.getLastRow()-1,h.length).getValues().map(r=>Object.fromEntries(h.map((x,i)=>[x,r[i]])));
}
function append_(n,obj){
  const sh=sheet_(n), h=HEADERS[n];
  sh.appendRow(h.map(k=>obj[k]??""));
}
function updateById_(n,key,val,obj){
  const sh=sheet_(n),h=HEADERS[n], vals=sh.getDataRange().getValues();
  const idx=h.indexOf(key); if(idx<0)return false;
  for(let i=1;i<vals.length;i++) if(String(vals[i][idx])===String(val)){
    h.forEach((k,j)=>{if(Object.prototype.hasOwnProperty.call(obj,k))sh.getRange(i+1,j+1).setValue(obj[k])});
    return true;
  } return false;
}
/*************************************************
 * RETURNS - ENSURE COLUMNS
 *************************************************/

function ensureReturnsSheet_(){

  const sh =
    sheet_("RETURNS");

  if(!sh){
    throw new Error(
      "Sheet RETURNS tidak ditemukan."
    );
  }

  const headers =
    HEADERS.RETURNS;

  const current =
    sh
      .getRange(
        1,
        1,
        1,
        Math.max(
          sh.getLastColumn(),
          headers.length
        )
      )
      .getValues()[0];

  let changed = false;

  headers.forEach(
    (header,index) => {

      if(
        String(
          current[index] || ""
        ).trim() !==
        header
      ){

        sh
          .getRange(
            1,
            index + 1
          )
          .setValue(
            header
          );

        changed = true;

      }

    }
  );

  if(changed){
    sh.setFrozenRows(1);
    SpreadsheetApp.flush();
  }

}
function hash_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8).map(b=>(b<0?b+256:b).toString(16).padStart(2,"0")).join("")}
function folder_(){
  if(CONFIG.DRIVE_FOLDER_ID)return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const it=DriveApp.getFoldersByName("ALKER_CONTROL_FILES"); return it.hasNext()?it.next():DriveApp.createFolder("ALKER_CONTROL_FILES");
}
/*************************************************
 * GOOGLE DRIVE — ALKER
 *
 * Struktur:
 *
 * ALKER_CONTROL_FILES
 *   └── NAMA ALKER
 *       └── TEKNISI - SERIAL
 *           ├── FOTO_ALKER.jpg
 *           └── FOTO_SERIAL.jpg
 *************************************************/

function getAlkerRootFolder_(){

  if(CONFIG.DRIVE_FOLDER_ID){

    return DriveApp.getFolderById(
      CONFIG.DRIVE_FOLDER_ID
    );

  }

  const folders =
    DriveApp.getFoldersByName(
      "ALKER_CONTROL_FILES"
    );

  if(folders.hasNext()){

    return folders.next();

  }

  return DriveApp.createFolder(
    "ALKER_CONTROL_FILES"
  );

}


function cleanFolderName_(name){

  return String(
    name || "ALKER"
  )
  .replace(
    /[\\\/:*?"<>|#%{}\[\]]/g,
    " "
  )
  .replace(
    /\s+/g,
    " "
  )
  .trim()
  .substring(0,120);

}


function getAlkerFolder_(
  itemName
){

  const root =
    getAlkerRootFolder_();

  const folderName =
    cleanFolderName_(
      itemName
    );

  const folders =
    root.getFoldersByName(
      folderName
    );

  if(folders.hasNext()){

    return folders.next();

  }

  return root.createFolder(
    folderName
  );

}


function getTechnicianFolder_(
  alkerFolder,
  technician,
  serialNumber
){

  const tech =
    cleanFolderName_(
      technician ||
      "TEKNISI"
    );

  const serial =
    cleanFolderName_(
      serialNumber ||
      "TANPA_SN"
    );

  const folderName =
    tech +
    " - " +
    serial;

  const folders =
    alkerFolder.getFoldersByName(
      folderName
    );

  if(folders.hasNext()){

    return folders.next();

  }

  return alkerFolder.createFolder(
    folderName
  );

}


function savePhoto_(
  dataUrl,
  filename,
  folder
){

  if(!dataUrl){

    return "";

  }

  const match =
    String(dataUrl).match(
      /^data:(.+);base64,(.*)$/
    );

  if(!match){

    return "";

  }

  const mime =
    match[1];

  const bytes =
    Utilities.base64Decode(
      match[2]
    );

  const blob =
    Utilities.newBlob(
      bytes,
      mime,
      filename ||
        ("foto_" +
        Date.now() +
        ".jpg")
    );

  const file =
    folder
      ? folder.createFile(blob)
      : getAlkerRootFolder_()
          .createFile(blob);

  return file.getUrl();

}


function actor_(token){
  const t=PropertiesService.getScriptProperties().getProperty("SESSION_"+token);
  if(!t)throw new Error("Sesi tidak valid. Silakan login kembali.");
  const x=JSON.parse(t); if(new Date(x.exp)<new Date()){PropertiesService.getScriptProperties().deleteProperty("SESSION_"+token);throw new Error("Sesi berakhir.");}
  return x;
}
function requireRole_(u,roles){if(!roles.includes(u.role))throw new Error("Akses tidak diizinkan untuk role ini.")}
function audit_(u,action,description){
  const x={auditId:id_("AUD"),actorId:u.userId,actor:u.name,action,description,date:now_()};
  append_("AUDIT",x); append_("HISTORY",{historyId:id_("HIS"),actorId:u.userId,actor:u.name,action,description,date:x.date});
}

/**
 * FINAL MASTER ALKER
 * Mengubah daftar ALKER yang sebelumnya terduplikasi antar-divisi
 * menjadi satu MASTER ALKER + mapping loker.
 *
 * Contoh:
 * Splicer = satu item master
 * MASTER_ALKER_LOKER = IOAN / ASSURANCE, PSB / FULFILLMENT, MAINTENANCE / OSP
 *
 * Jalankan SEKALI setelah mengganti Code.gs dengan versi ini:
 * 1. simpan
 * 2. pilih migrateMasterFinal
 * 3. jalankan
 */
function normalizeName_(s){
  return String(s||"").toLowerCase()
    .replace(/\([^)]*\)/g,"")
    .replace(/\s+/g," ")
    .trim();
}

function migrateMasterFinal(){
  const old = rows_("MASTER_ALKER");
  if(!old.length){
    setupSystem();
    return;
  }

  // Kumpulkan item berdasarkan nama normalisasi.
  const grouped = {};
  old.forEach(x=>{
    const key = normalizeName_(x.itemName);
    if(!key) return;
    if(!grouped[key]) grouped[key]={
      itemName:x.itemName,
      category:x.category||"ALKER",
      unit:x.unit||"UNIT",
      standardPrice:Number(x.standardPrice||0),
      spec:x.spec||"",
      lokers:new Set()
    };
    const g=grouped[key];
    if(!g.category && x.category) g.category=x.category;
    if(!g.unit && x.unit) g.unit=x.unit;
    if(Number(x.standardPrice||0)>g.standardPrice) g.standardPrice=Number(x.standardPrice||0);
    if(x.spec && !g.spec) g.spec=x.spec;
    String(x.lokers||"").split("|").map(s=>s.trim()).filter(Boolean).forEach(l=>g.lokers.add(l));
  });

  // Jika mapping lama belum ada, ambil loker dari item lama.
  // Data item yang sama otomatis digabung.
  const newItems=[];
  const mappings=[];
  let no=1;
  Object.keys(grouped).sort().forEach(key=>{
    const g=grouped[key];
    const itemId="ALK-"+String(no++).padStart(4,"0");
    newItems.push({
      itemId,
      itemName:g.itemName,
      category:g.category,
      unit:g.unit,
      standardPrice:g.standardPrice,
      lokers:Array.from(g.lokers).join("|"),
      spec:g.spec,
      active:"Y",
      createdAt:now_()
    });
    Array.from(g.lokers).forEach(l=>{
      mappings.push({mappingId:id_("MAP"),itemId,loker:l,active:"Y",createdAt:now_()});
    });
  });

  // Buat mapping sheet jika belum ada.
  let mapSh=sheet_("MASTER_ALKER_LOKER");
  if(!mapSh){
    mapSh=ss_().insertSheet("MASTER_ALKER_LOKER");
    mapSh.appendRow(HEADERS.MASTER_ALKER_LOKER);
  }

  // Simpan isi lama sebagai backup sheet sebelum mengganti master.
  const ss=ss_();
  let backup=ss.getSheetByName("MASTER_ALKER_BACKUP");
  if(!backup){
    backup=ss.insertSheet("MASTER_ALKER_BACKUP");
    backup.getRange(1,1,1,HEADERS.MASTER_ALKER.length).setValues([HEADERS.MASTER_ALKER]);
  }
  old.forEach(x=>backup.appendRow(HEADERS.MASTER_ALKER.map(h=>x[h]??"")));

  // Mapping old itemId -> canonical itemId.
  const oldToNew={};
  old.forEach(x=>{
    const key=normalizeName_(x.itemName);
    const match=newItems.find(n=>normalizeName_(n.itemName)===key);
    if(match)oldToNew[x.itemId]=match.itemId;
  });

  // Rewrite master.
  const masterSh=sheet_("MASTER_ALKER");
  if(masterSh.getLastRow()>1)masterSh.getRange(2,1,masterSh.getLastRow()-1,HEADERS.MASTER_ALKER.length).clearContent();
  if(newItems.length)masterSh.getRange(2,1,newItems.length,HEADERS.MASTER_ALKER.length)
    .setValues(newItems.map(x=>HEADERS.MASTER_ALKER.map(h=>x[h]??"")));

  // Rewrite mapping.
  if(mapSh.getLastRow()>1)mapSh.getRange(2,1,mapSh.getLastRow()-1,HEADERS.MASTER_ALKER_LOKER.length).clearContent();
  if(mappings.length)mapSh.getRange(2,1,mappings.length,HEADERS.MASTER_ALKER_LOKER.length)
    .setValues(mappings.map(x=>HEADERS.MASTER_ALKER_LOKER.map(h=>x[h]??"")));

  // Update foreign keys in transactional tables.
  ["INVENTORY","INITIAL_INVENTORY","REQUESTS","RECEIVING","PROCUREMENT"].forEach(sheetName=>{
    const data=rows_(sheetName);
    data.forEach(row=>{
      if(row.itemId && oldToNew[row.itemId]){
        updateById_(sheetName,
          HEADERS[sheetName][0],
          row[HEADERS[sheetName][0]],
          {itemId:oldToNew[row.itemId]}
        );
      }
    });
  });

  audit_(
    {userId:"SYSTEM",name:"SYSTEM"},
    "MASTER_MIGRATION",
    "Master ALKER dinormalisasi menjadi "+newItems.length+" jenis unik dan mapping loker dibuat."
  );
  SpreadsheetApp.flush();
  Logger.log("FINAL MASTER OK: "+newItems.length+" item unik, "+mappings.length+" mapping loker.");
}

function getAllowedLokerItems_(loker){
  const maps=rows_("MASTER_ALKER_LOKER").filter(x=>x.loker===loker&&String(x.active||"Y").toUpperCase()==="Y");
  const ids=new Set(maps.map(x=>x.itemId));
  return rows_("MASTER_ALKER").filter(x=>ids.has(x.itemId)&&x.active==="Y");
}

function setupSystem(){
  const ss=ss_();
  SHEETS.forEach(n=>{
    let sh=ss.getSheetByName(n); if(!sh)sh=ss.insertSheet(n);
    if(sh.getLastRow()===0)sh.appendRow(HEADERS[n]);
    else {
      const expected=HEADERS[n]||[];
      const current=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0];
      expected.forEach((header,i)=>{ if(!current[i]) sh.getRange(1,i+1).setValue(header); });
    }
    sh.setFrozenRows(1);
  });
  if(rows_("LOKERS").length===0)SEED_LOKERS.forEach((name,i)=>append_("LOKERS",{lokerId:id_("LOK"),name,status:"AKTIF",createdAt:now_()}));
  if(rows_("MASTER_ALKER").length===0)SEED_ITEMS.forEach(x=>append_("MASTER_ALKER",{itemId:x[0],itemName:x[1],category:x[2],unit:x[3],standardPrice:x[4],lokers:x[5],spec:x[6],active:x[7],createdAt:now_()}));
  ensureSplicerBrandPrices_();
  if(rows_("USERS").length===0){
    SEED_USERS.forEach((x,i)=>append_("USERS",{userId:x[0],username:x[1],passwordHash:hash_(["admin123","gudang123","leader123","teknisi123"][i]),name:x[3],role:x[4],loker:x[5],active:"Y",createdAt:now_()}));
  }
  ensureTechnicianMirror_();
  // Jika mapping kosong dan master masih berisi daftar lama, buat mapping awal.
  if(rows_("MASTER_ALKER_LOKER").length===0){
    rows_("MASTER_ALKER").forEach(x=>{
      String(x.lokers||"").split("|").map(s=>s.trim()).filter(Boolean).forEach(l=>{
        append_("MASTER_ALKER_LOKER",{mappingId:id_("MAP"),itemId:x.itemId,loker:l,active:"Y",createdAt:now_()});
      });
    });
  }
  SpreadsheetApp.flush();
  Logger.log("ALKER CONTROL siap.");
}
/*************************************************
 * TEKNISI TEAM
 *************************************************/

function technicianUsers_(){
  return rows_("USERS")
    .filter(x =>
      String(x.role || "").toUpperCase() === "TEKNISI" &&
      String(x.active || "").toUpperCase() === "Y"
    )
    .map(x => ({
      userId: x.userId,
      username: x.username,
      name: x.name,
      loker: x.loker,
      active: x.active,
      leaderId: x.leaderId || ""
    }));
}


function technicianTeams_(){

  const users = technicianUsers_();
  const userMap = {};

  users.forEach(x => {
    userMap[x.userId] = x;
  });

  return rows_("TEKNISI_TEAM")
    .filter(x =>
      String(x.active || "").toUpperCase() === "Y"
    )
    .map(x => ({
      teamId: x.teamId,
      loker: x.loker,

      technicianId: x.technicianId,
      technicianName:
        userMap[x.technicianId]?.name || "-",

      partnerId: x.partnerId || "",
      partnerName: x.partnerId
        ? (userMap[x.partnerId]?.name || "-")
        : "",

      active: x.active,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt
    }));
}


/**
 * Mengambil data tim + daftar teknisi.
 *
 * TEKNISI:
 *   hanya melihat tim yang mengandung dirinya.
 *
 * LEADER:
 *   hanya melihat teknisi/tim pada lokernya.
 *
 * ADMIN / SPV_GUDANG:
 *   melihat semua.
 */
function technicianTeam_(u){

  const teams =
    technicianTeams_();

  const users =
    technicianUsers_();


  /*
   * ==========================================
   * TEKNISI
   * ==========================================
   */

  if(
    u.role === "TEKNISI"
  ){

    const mine =
      teams.find(
        x =>
          x.technicianId ===
            u.userId
          ||
          x.partnerId ===
            u.userId
      );


    return {

      team:
        mine || null,

      technicians:
        users.filter(
          x =>
            x.loker ===
            u.loker
        )

    };

  }


  /*
   * ==========================================
   * LEADER
   * ==========================================
   *
   * Leader mengelola seluruh
   * loker operasional.
   */

  if(
    u.role === "LEADER"
  ){

    const operationalLokers = [

      "IOAN / ASSURANCE",

      "PSB / FULFILLMENT",

      "MAINTENANCE / OSP"

    ];


    return {

      teams:
        teams.filter(
          x => {
            const memberIds = [String(x.technicianId || ""), String(x.partnerId || "")];
            return operationalLokers.includes(x.loker) &&
              users.some(t => memberIds.includes(String(t.userId)) && String(t.leaderId || "") === String(u.userId));
          }
        ),

      technicians:
        users.filter(
          x =>
            String(x.leaderId || "") === String(u.userId) &&
            operationalLokers.includes(x.loker)
        )

    };

  }


  /*
   * ==========================================
   * ADMIN / SPV GUDANG
   * ==========================================
   */

  if(
    u.role === "ADMIN" ||
    u.role === "SPV_GUDANG"
  ){

    return {

      teams:
        teams,

      technicians:
        users

    };

  }


  throw new Error(
    "Akses data tim teknisi tidak diizinkan."
  );

}

/**
 * Membuat / memperbarui tim.
 */
function saveTechnicianTeam_(u,p){

  requireRole_(
    u,
    [
      "ADMIN",
      "LEADER"
    ]
  );


  const technicianId =
    String(
      p.technicianId || ""
    ).trim();


  const partnerId =
    String(
      p.partnerId || ""
    ).trim();


  const teamId =
    String(
      p.teamId || ""
    ).trim();


  if(!technicianId){

    throw new Error(
      "Teknisi Utama / Teknisi 1 wajib dipilih."
    );

  }


  if(
    partnerId &&
    technicianId === partnerId
  ){

    throw new Error(
      "Teknisi Utama dan Teknisi 2 tidak boleh orang yang sama."
    );

  }


  const users =
    technicianUsers_();


  const technician =
    users.find(
      x =>
        x.userId ===
        technicianId
    );


  if(!technician){

    throw new Error(
      "Teknisi Utama tidak ditemukan."
    );

  }


  /*
   * ==========================================
   * TEKNISI UTAMA WAJIB PUNYA ALKER
   * ==========================================
   */

  const mainInventory =
    rows_("INVENTORY").filter(
      x =>

        String(
          x.holderId || ""
        ) === technicianId

        &&

        String(
          x.status || ""
        ).toUpperCase() ===
        "DIPAKAI"

        &&

        String(
          x.location || ""
        ).toUpperCase() ===
        "TEKNISI"
    );


  if(
    mainInventory.length === 0
  ){

    throw new Error(
      "Teknisi Utama belum memiliki ALKER resmi. Teknisi tersebut belum dapat dijadikan Teknisi 1."
    );

  }


  /*
   * ==========================================
   * PARTNER / TEKNISI 2
   * ==========================================
   */

  let partner = null;


  if(partnerId){

    partner =
      users.find(
        x =>
          x.userId ===
          partnerId
      );


    if(!partner){

      throw new Error(
        "Teknisi 2 / Partner tidak ditemukan."
      );

    }


    /*
     * Teknisi 2 tidak wajib punya ALKER,
     * tetapi harus satu loker dengan Teknisi 1.
     */

    if(
      partner.loker !==
      technician.loker
    ){

      throw new Error(
        "Teknisi 1 dan Teknisi 2 harus berada pada loker/divisi yang sama."
      );

    }

  }


  /*
   * ==========================================
   * LEADER
   * ==========================================
   */

  if(
    u.role === "LEADER"
  ){

    const operationalLokers = [

      "IOAN / ASSURANCE",

      "PSB / FULFILLMENT",

      "MAINTENANCE / OSP"

    ];


    if(
      !operationalLokers.includes(
        technician.loker
      )
    ){

      throw new Error(
        "Loker teknisi tidak valid."
      );

    }

  }


  /*
   * ==========================================
   * CEK TEKNISI SUDAH ADA DI TEAM LAIN
   * ==========================================
   */

  const activeTeams =
    rows_("TEKNISI_TEAM")
      .filter(
        x =>
          String(
            x.active || ""
          ).toUpperCase() ===
          "Y"
      )
      .filter(
        x =>
          x.teamId !==
          teamId
      );


  const conflict =
    activeTeams.find(
      x => {

        const ids = [

          x.technicianId,

          x.partnerId

        ].filter(Boolean);


        return (

          ids.includes(
            technicianId
          )

          ||

          (
            partnerId &&
            ids.includes(
              partnerId
            )
          )

        );

      }
    );


  if(conflict){

    throw new Error(
      "Teknisi 1 atau Teknisi 2 sudah berada dalam Team aktif lain."
    );

  }


  /*
   * ==========================================
   * UPDATE
   * ==========================================
   */

  if(teamId){

    const existing =
      rows_(
        "TEKNISI_TEAM"
      ).find(
        x =>
          x.teamId ===
          teamId
      );


    if(!existing){

      throw new Error(
        "Team yang akan diperbarui tidak ditemukan."
      );

    }


    updateById_(
      "TEKNISI_TEAM",
      "teamId",
      teamId,
      {

        loker:
          technician.loker,

        technicianId:
          technicianId,

        partnerId:
          partnerId,

        active:
          "Y",

        updatedAt:
          now_()

      }
    );


    audit_(
      u,
      "TEAM_UPDATE",
      teamId +
      " : " +
      technician.name +
      (
        partner
          ? " + " +
            partner.name
          : ""
      )
    );


    return ok_({

      teamId:
        teamId,

      message:
        "Team teknisi berhasil diperbarui."

    });

  }


  /*
   * ==========================================
   * CREATE
   * ==========================================
   */

  const newTeamId =
    id_("TIM");


  append_(
    "TEKNISI_TEAM",
    {

      teamId:
        newTeamId,

      loker:
        technician.loker,

      technicianId:
        technicianId,

      partnerId:
        partnerId,

      active:
        "Y",

      createdAt:
        now_(),

      updatedAt:
        now_()

    }
  );


  audit_(
    u,
    "TEAM_CREATE",
    newTeamId +
    " : " +
    technician.name +
    (
      partner
        ? " + " +
          partner.name
        : ""
    )
  );


  return ok_({

    teamId:
      newTeamId,

    message:
      "Team teknisi berhasil dibuat."

  });

}

/**
 * Nonaktifkan tim.
 * Data tidak dihapus.
 */
function deleteTechnicianTeam_(u,p){

  requireRole_(u,[
    "ADMIN",
    "SPV_GUDANG",
    "LEADER"
  ]);

  const teamId =
    String(p.teamId || "").trim();


  if(!teamId){
    throw new Error(
      "ID tim tidak ditemukan."
    );
  }


  const team =
    rows_("TEKNISI_TEAM")
      .find(x =>
        x.teamId === teamId
      );


  if(!team){
    throw new Error(
      "Tim tidak ditemukan."
    );
  }


  updateById_(
    "TEKNISI_TEAM",
    "teamId",
    teamId,
    {
      active: "N",
      updatedAt: now_()
    }
  );


  audit_(
    u,
    "TEAM_DELETE",
    teamId
  );


  return ok_({
    message:
      "Tim berhasil dinonaktifkan."
  });
}
function doGet(e){return json_({ok:true,service:"ALKER CONTROL API",time:now_()})}
function doPost(e){
  try{
    const p=e.parameter||{}, action=p.action||"";
    if(action==="login")return login_(p);
    const u=actor_(p.token);
    switch(action){
      case "me":return ok_({session:u});
      case "dashboard":return ok_(dashboard_(u));
      case "masters":return ok_(masters_(u));
      case "inventory":return ok_(inventory_(u,p.scope));
      case "leaderOwnInventoryAdd":return leaderOwnInventoryAdd_(u,p);
      case "leaderAddInventory":return leaderAddInventory_(u,p);
      case "initialSubmit":return initialSubmit_(u,p);
      case "initialResubmit":return initialResubmit_(u,p);
      case "initialMine":return ok_(initialMine_(u));
      case "leaderInitialReports":return ok_(leaderInitialReports_(u));
      case "initialPending":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("INITIAL_INVENTORY").filter(x=>x.status==="MENUNGGU VERIFIKASI"));
      case "initialDecision":return initialDecision_(u,p);
      case "requests":return ok_(requests_(u,p.scope));
      case "createRequest":return createRequest_(u,p);
      case "requestDecision":return requestDecision_(u,p);
      case "issues":return ok_(issues_(u,p.scope));
      case "reportIssue":return reportIssue_(u,p);
      case "returns":return ok_(returns_(u,p.scope));
      case "returnItem":return returnItem_(u,p);
	  case "returnDecision":return returnDecision_(u,p);
      case "warehouse":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(warehouse_());
	  case "masterPrices":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(masterPrices_(u));
      case "masterBrandPrices":return ok_(masterBrandPrices_(u,p.itemId));
      case "updateMasterBrandPrices":return updateMasterBrandPrices_(u,p);
      case "receiving":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("RECEIVING"));
      case "receive":return receive_(u,p);
      case "warehouseStockAdd":return warehouseStockAdd_(u,p);
      case "distribution":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("DISTRIBUTION"));
      case "distribute":return distribute_(u,p);
      case "procurement":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("PROCUREMENT"));
      case "createProcurement":return createProcurement_(u,p);
      case "technicians":return technicians_(u,p.scope);
      case "users":return ok_(users_(u));
      case "saveUser":return saveUser_(u,p);
	  case "deleteUser":return deleteUser_(u,p);
      case "technicianTeam": return ok_(technicianTeam_(u));
      case "saveTechnicianTeam":return saveTechnicianTeam_(u,p);
      case "photoPreview":return photoPreview_(u,p);
      case "deleteTechnicianTeam":return deleteTechnicianTeam_(u,p);
      case "addMasterItem":requireRole_(u,["ADMIN"]);return addMasterItem_(u,p);
      case "updateMasterItemStatus":return updateMasterItemStatus_(u,p);
      case "updateMasterItemLokers":return updateMasterItemLokers_(u,p);
      case "updateMasterPhotoMode":return updateMasterPhotoMode_(u,p);
	  case "updateMasterPrice":requireRole_(u,["SPV_GUDANG","ADMIN"]);return updateMasterPrice_(u,p);
      case "migrateMasterFinal":requireRole_(u,["ADMIN"]);migrateMasterFinal();return ok_({message:"Master ALKER berhasil dinormalisasi."});
      case "audit":requireRole_(u,["ADMIN"]);return ok_(rows_("AUDIT").slice(-500).reverse());
      default:throw new Error("Action tidak dikenal.");
    }
  }catch(err){

  console.error(err);

  return fail_(
    "ERROR: " +
    (err && err.message
      ? err.message
      : String(err))
  );

}
}
function login_(p){
  const username = String(p.username || "").trim();
  const password = String(p.password || "");

  const us = rows_("USERS").find(x =>
    String(x.username || "").trim().toLowerCase() === username.toLowerCase() &&
    String(x.active || "").trim().toUpperCase() === "Y"
  );

  if(!us){
    throw new Error("Username tidak ditemukan atau tidak aktif.");
  }

  if(String(us.passwordHash).trim() !== hash_(password)){
    throw new Error("Password salah.");
  }

  const token=Utilities.getUuid();

  const obj={
    token,
    userId:us.userId,
    name:us.name,
    role:us.role,
    loker:us.loker,
    leaderId:us.leaderId || "",
    exp:new Date(
      Date.now()+CONFIG.SESSION_HOURS*3600000
    ).toISOString()
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "SESSION_"+token,
      JSON.stringify(obj)
    );

  return ok_({session:obj});
}
function ensureMasterPhotoModeColumn_(){
  const sh=sheet_("MASTER_ALKER");
  if(!sh) return;
  const col=HEADERS.MASTER_ALKER.indexOf("photoMode")+1;
  if(col>0 && String(sh.getRange(1,col).getValue()||"").trim()==="") sh.getRange(1,col).setValue("photoMode");
}

function masters_(u){
  ensureMasterPhotoModeColumn_();
  const lokers=rows_("LOKERS").filter(x=>x.status==="AKTIF");
  let items=rows_("MASTER_ALKER").filter(x=>String(x.active||"Y").toUpperCase()==="Y");
  if(u.role==="ADMIN") items=rows_("MASTER_ALKER");
  if(u.role==="TEKNISI" && u.loker) items=getAllowedLokerItems_(u.loker);
  return {
    lokers,
    items,
    mappings:rows_("MASTER_ALKER_LOKER").filter(x=>x.active==="Y")
  };
}
/*************************************************
 * MASTER USER / MASTER TEKNISI
 *************************************************/

function users_(u){

  requireRole_(u,[
    "ADMIN",
    "LEADER"
  ]);


  let users =
    rows_("USERS");


  /*
   * ==========================================
   * LEADER
   * ==========================================
   *
   * Leader hanya melihat TEKNISI.
   *
   * Leader dapat mengelola teknisi
   * dari tiga loker operasional:
   *
   * IOAN / ASSURANCE
   * PSB / FULFILLMENT
   * MAINTENANCE / OSP
   */

  if(
    u.role ===
    "LEADER"
  ){

    users =
      users.filter(
        x =>
          String(x.role || "").toUpperCase() === "TEKNISI" &&
          String(x.leaderId || "") === String(u.userId)
      );

  }


  /*
   * ==========================================
   * ADMIN
   * ==========================================
   *
   * Admin tetap melihat seluruh user.
   */

  const allUsers = rows_("USERS");
  const leaderNames = Object.fromEntries(
    allUsers.filter(x => String(x.role || "").toUpperCase() === "LEADER")
      .map(x => [String(x.userId), String(x.name || x.username || "Leader")])
  );

  return users.map(
    x => ({
      userId: x.userId,
      username: x.username,
      name: x.name,
      role: x.role,
      loker: x.loker,
      active: x.active,
      createdAt: x.createdAt,
      leaderId: x.leaderId || "",
      leaderName: leaderNames[String(x.leaderId || "")] || "Belum ditentukan"
    })
  );

}

/*************************************************
 * CREATE / UPDATE USER
 *************************************************/

function saveUser_(u,p){

  requireRole_(u,[
    "ADMIN",
    "LEADER"
  ]);


  const userId =
    String(
      p.userId || ""
    ).trim();


  const username =
    String(
      p.username || ""
    ).trim();


  const name =
    String(
      p.name || ""
    ).trim();


  const role =
    String(
      p.role || ""
    )
    .trim()
    .toUpperCase();


  let loker =
    String(
      p.loker || ""
    ).trim();

  let leaderId = String(p.leaderId || "").trim();


  const password =
    String(
      p.password || ""
    );


  const active =
    String(
      p.active || "Y"
    ).toUpperCase() === "N"
      ? "N"
      : "Y";


  if(!username){

    throw new Error(
      "Username wajib diisi."
    );

  }


  if(!name){

    throw new Error(
      "Nama wajib diisi."
    );

  }


  /*
   * ==========================================
   * LEADER
   * ==========================================
   *
   * Leader hanya boleh membuat / mengubah
   * user TEKNISI.
   */

  if(u.role === "LEADER"){

    if(role !== "TEKNISI"){

      throw new Error(
        "Leader hanya dapat membuat user TEKNISI."
      );

    }


    const teknisiLokers = [

      "IOAN / ASSURANCE",

      "PSB / FULFILLMENT",

      "MAINTENANCE / OSP"

    ];


    if(
      !teknisiLokers.includes(loker)
    ){

      throw new Error(
        "Pilih loker teknisi yang valid."
      );

    }

  }


  /*
   * ==========================================
   * ADMIN
   * ==========================================
   */

  if(u.role === "ADMIN"){

    const allowedRoles = [

      "ADMIN",

      "SPV_GUDANG",

      "LEADER",

      "TEKNISI"

    ];


    if(
      !allowedRoles.includes(role)
    ){

      throw new Error(
        "Role tidak valid."
      );

    }

  }


  /*
   * TEKNISI harus berada pada
   * loker operasional.
   */

  if(role === "TEKNISI"){

    const teknisiLokers = [

      "IOAN / ASSURANCE",

      "PSB / FULFILLMENT",

      "MAINTENANCE / OSP"

    ];


    if(
      !teknisiLokers.includes(loker)
    ){

      throw new Error(
        "Loker teknisi tidak valid."
      );

    }

  }


  // Penempatan Leader hanya dapat ditentukan oleh ADMIN.
  if(role === "TEKNISI") {
    if(u.role === "LEADER") {
      leaderId = u.userId;
    } else if(u.role === "ADMIN" && leaderId) {
      const selectedLeader = rows_("USERS").find(x =>
        String(x.userId) === leaderId &&
        String(x.role || "").toUpperCase() === "LEADER" &&
        String(x.active || "Y").toUpperCase() === "Y"
      );
      if(!selectedLeader) throw new Error("Leader yang dipilih tidak ditemukan atau tidak aktif.");
      if(selectedLeader.loker && selectedLeader.loker !== "LEADER") {
        // Loker operasional teknisi tetap ditentukan pada akun teknisi.
      }
    } else if(u.role !== "ADMIN" && u.role !== "LEADER") {
      leaderId = "";
    }
  } else {
    leaderId = "";
  }

  /*
   * ==========================================
   * CEK USERNAME
   * ==========================================
   */

  const duplicate =
    rows_("USERS").find(x =>

      String(x.username || "")
        .trim()
        .toLowerCase()
      ===
      username.toLowerCase()

      &&
      x.userId !== userId

    );


  if(duplicate){

    throw new Error(
      "Username sudah digunakan."
    );

  }


  /*
   * ==========================================
   * UPDATE
   * ==========================================
   */

  if(userId){

    const existing =
      rows_("USERS").find(
        x =>
          x.userId === userId
      );


    if(!existing){

      throw new Error(
        "User yang akan diperbarui tidak ditemukan."
      );

    }


    /*
     * Leader tidak boleh mengubah
     * user menjadi bukan TEKNISI.
     */

    if(
      u.role === "LEADER" &&
      existing.role !== "TEKNISI"
    ){

      throw new Error(
        "Leader hanya dapat mengelola user TEKNISI."
      );

    }


    const patch = {

      name:
        name,

      username:
        username,

      role:
        role,

      loker:
        loker,

      active:
        active,

      leaderId: leaderId,

      updatedAt:
        now_()

    };


    if(password){

      patch.passwordHash =
        hash_(password);

    }


    updateById_(
      "USERS",
      "userId",
      userId,
      patch
    );


    audit_(
      u,
      "USER_UPDATE",
      userId +
      " : " +
      name
    );


    return ok_({

      userId:
        userId,

      message:
        "User berhasil diperbarui."

    });

  }


  /*
   * ==========================================
   * CREATE
   * ==========================================
   */

  if(!password){

    throw new Error(
      "Password wajib diisi."
    );

  }


  const newUserId =
    id_("USR");


  append_(
    "USERS",
    {

      userId:
        newUserId,

      username:
        username,

      passwordHash:
        hash_(password),

      name:
        name,

      role:
        role,

      loker:
        loker,

      active:
        active,

      createdAt:
        now_(),

      leaderId: leaderId

    }
  );


  audit_(
    u,
    "USER_CREATE",
    newUserId +
    " : " +
    name +
    " : " +
    role +
    " : " +
    loker
  );


  return ok_({

    userId:
      newUserId,

    message:
      "User berhasil dibuat."

  });

}

/*************************************************
 * NONAKTIFKAN USER TEKNISI
 *
 * ADMIN  : boleh menonaktifkan TEKNISI
 * LEADER : boleh menonaktifkan TEKNISI
 *
 * Tidak menghapus data USERS secara fisik.
 * Data inventory / request / audit tetap aman.
 *************************************************/

function deleteUser_(u,p){

  requireRole_(u,[
    "ADMIN",
    "LEADER"
  ]);


  const userId =
    String(
      p.userId || ""
    ).trim();


  if(!userId){

    throw new Error(
      "ID user tidak ditemukan."
    );

  }


  const target =
    rows_("USERS").find(
      x =>
        String(x.userId) ===
        userId
    );


  if(!target){

    throw new Error(
      "User tidak ditemukan."
    );

  }


  const targetRole =
    String(
      target.role || ""
    )
    .trim()
    .toUpperCase();


  /*
   * HANYA TEKNISI
   */

  if(
    targetRole !==
    "TEKNISI"
  ){

    throw new Error(
      "Yang dapat dinonaktifkan dari menu ini hanya user TEKNISI."
    );

  }


  /*
   * Jangan sampai akun sendiri
   * dinonaktifkan.
   */

  if(
    target.userId ===
    u.userId
  ){

    throw new Error(
      "Anda tidak dapat menonaktifkan akun sendiri."
    );

  }


  /*
   * Sudah nonaktif
   */

  if(
    String(
      target.active || ""
    ).toUpperCase() ===
    "N"
  ){

    throw new Error(
      "Teknisi tersebut sudah NONAKTIF."
    );

  }


  /*
   * ==========================================
   * NONAKTIFKAN USER
   * ==========================================
   */

  updateById_(
    "USERS",
    "userId",
    userId,
    {
      active:
        "N",

      updatedAt:
        now_()
    }
  );


  /*
   * ==========================================
   * NONAKTIFKAN MIRROR TEKNISI
   * ==========================================
   */

  const technician =
    rows_("TEKNISI")
      .find(
        x =>
          String(
            x.technicianId || ""
          ) ===
          userId
      );


  if(technician){

    updateById_(
      "TEKNISI",
      "technicianId",
      userId,
      {
        status:
          "NONAKTIF"
      }
    );

  }


  /*
   * ==========================================
   * NONAKTIFKAN TIM AKTIF
   * ==========================================
   *
   * Teknisi yang sudah resign
   * tidak boleh tetap tercatat
   * sebagai anggota tim aktif.
   */

  const teams =
    rows_("TEKNISI_TEAM");


  teams
    .filter(
      x =>
        String(
          x.technicianId || ""
        ) === userId
        ||
        String(
          x.partnerId || ""
        ) === userId
    )
    .filter(
      x =>
        String(
          x.active || ""
        ).toUpperCase() ===
        "Y"
    )
    .forEach(
      x => {

        updateById_(
          "TEKNISI_TEAM",
          "teamId",
          x.teamId,
          {
            active:
              "N",

            updatedAt:
              now_()
          }
        );

      }
    );


  /*
   * ==========================================
   * AUDIT
   * ==========================================
   */

  audit_(
    u,
    "USER_DEACTIVATE",
    userId +
    " : " +
    target.name +
    " / " +
    target.username
  );


  return ok_({

    userId:
      userId,

    message:
      "Teknisi berhasil dinonaktifkan."

  });

}

/*************************************************
 * SYNC USER -> TEKNISI
 *************************************************/

function syncTechnicianUser_(userId){

  const user =
    rows_("USERS")
      .find(x =>
        x.userId === userId
      );

  if(!user){
    return;
  }


  const technicians =
    rows_("TEKNISI");


  const existing =
    technicians.find(x =>
      x.technicianId === userId
    );


  /*
   * Jika bukan TEKNISI,
   * hapus/nonaktifkan mirror.
   */
  if(user.role !== "TEKNISI"){

    if(existing){

      updateById_(
        "TEKNISI",
        "technicianId",
        userId,
        {
          status: "NONAKTIF"
        }
      );

    }

    return;
  }


  /*
   * Jika sudah ada,
   * update datanya.
   */
  if(existing){

    updateById_(
      "TEKNISI",
      "technicianId",
      userId,
      {
        name: user.name,
        username: user.username,
        loker: user.loker,
        status:
          user.active === "Y"
            ? "AKTIF"
            : "NONAKTIF"
      }
    );

    return;

  }


  /*
   * Jika belum ada,
   * buat mirror baru.
   */
  append_(
    "TEKNISI",
    {
      technicianId:
        user.userId,

      name:
        user.name,

      username:
        user.username,

      loker:
        user.loker,

      phone: "",

      status:
        user.active === "Y"
          ? "AKTIF"
          : "NONAKTIF",

      createdAt:
        user.createdAt ||
        now_()
    }
  );

}
function technicians_(u,scope){
  requireRole_(u,["LEADER","SPV_GUDANG","ADMIN"]);
  let a=rows_("TEKNISI"); if(!a.length){
    // fallback: users ber-role teknisi
    a=rows_("USERS").filter(x=>x.role==="TEKNISI").map(x=>({technicianId:x.userId,name:x.name,username:x.username,loker:x.loker,status:"AKTIF"}));
  }
  if(scope==="loker"&&u.role==="LEADER")a=a.filter(x=>x.loker===u.loker);
  return ok_(a.map(x=>({id:x.technicianId||x.userId,name:x.name,loker:x.loker,status:x.status||"AKTIF"})));
}
function inventory_(u,scope){
  let a=rows_("INVENTORY");
  if(scope==="leaderOwn"){
    requireRole_(u,["LEADER"]);
    a=a.filter(x=>x.holderId===u.userId&&x.location==="LEADER");
  }else if(scope==="mine"||u.role==="TEKNISI"){
    a=a.filter(x=>x.holderId===u.userId);
  }else if(scope==="loker"&&u.role==="LEADER"){
    a=a.filter(x=>x.loker===u.loker&&x.location!=="LEADER");
  }
  return a;
}

/**
 * ALKER MILIK LEADER: disimpan terpisah dari inventory teknisi.
 * Harga dihitung di backend dari Master Harga, tidak menerima harga dari browser.
 */
function leaderOwnInventoryAdd_(u,p){
  requireRole_(u,["LEADER"]);
  const itemId=String(p.itemId||"").trim();
  const serialNumber=String(p.serialNumber||"").trim();
  if(!itemId) throw new Error("ALKER wajib dipilih.");
  if(!serialNumber) throw new Error("Serial Number wajib diisi.");
  if(!p.photo) throw new Error("Foto ALKER wajib diunggah.");
  const item=rows_("MASTER_ALKER").find(x=>String(x.itemId||"")===itemId&&String(x.active||"Y").toUpperCase()==="Y");
  if(!item) throw new Error("Master ALKER tidak ditemukan atau tidak aktif.");
  const brand=String(p.brand||"").trim();
  if(isSplicer_(item.itemName)&&!brand) throw new Error("Merek Splicer wajib dipilih.");
  const condition=String(p.condition||"BAIK").trim().toUpperCase();
  if(!["BAIK","RUSAK RINGAN","RUSAK BERAT"].includes(condition)) throw new Error("Kondisi ALKER tidak valid.");
  const duplicate=rows_("INVENTORY").find(x=>String(x.itemId||"")===itemId&&String(x.serialNumber||"").trim().toLowerCase()===serialNumber.toLowerCase()&&serialNumber!=="");
  if(duplicate) throw new Error("Serial Number tersebut sudah terdaftar di Inventory.");
  const price=getMasterPrice_(item.itemId,brand);
  if(!Number.isFinite(Number(price))||Number(price)<0) throw new Error("Harga Master ALKER tidak valid.");
  const inventoryId=id_("INV");
  append_("INVENTORY",{
    inventoryId:inventoryId,itemId:item.itemId,itemName:item.itemName,category:item.category,
    brand:brand,type:String(p.type||"").trim(),serialNumber:serialNumber,price:Number(price),
    condition:condition,status:"DIPAKAI",location:"LEADER",loker:String(u.loker||"LEADER"),
    holderId:u.userId,holder:u.name,photoUrl:savePhoto_(p.photo,"leader_own_"+inventoryId+".jpg"),
    serialPhotoUrl:p.serialPhoto?savePhoto_(p.serialPhoto,"leader_own_serial_"+inventoryId+".jpg"):"",
    receivedAt:now_(),source:"LEADER OWN INVENTORY",notes:String(p.note||"").trim(),updatedAt:now_()
  });
  audit_(u,"LEADER_OWN_ALKER_ADD",inventoryId+" | "+item.itemName+" | SN "+serialNumber+" | harga master="+price);
  return ok_({inventoryId:inventoryId,message:"ALKER berhasil dicatat atas nama Leader."});
}

/**
 * LEADER INPUT ALKER LANGSUNG KE TEKNISI
 * Harga selalu diambil dari MASTER ALKER / MASTER ALKER PRICE.
 * Leader tidak pernah mengirim atau mengubah harga.
 */
function leaderAddInventory_(u,p){
  requireRole_(u,["LEADER"]);

  const technicianId=String(p.technicianId||"").trim();
  const itemId=String(p.itemId||"").trim();
  if(!technicianId) throw new Error("Teknisi wajib dipilih.");
  if(!itemId) throw new Error("ALKER wajib dipilih.");

  const tech=rows_("TEKNISI").find(x=>String(x.technicianId||"")===technicianId);
  const userTech=rows_("USERS").find(x=>String(x.userId||"")===technicianId && x.role==="TEKNISI");
  const t=tech || userTech;
  if(!t) throw new Error("Teknisi tidak ditemukan.");
  if(String(t.loker||"")!==String(u.loker||"")) throw new Error("Teknisi bukan bagian dari loker Leader ini.");

  const item=rows_("MASTER_ALKER").find(x=>String(x.itemId||"")===itemId && String(x.active||"Y").toUpperCase()==="Y");
  if(!item) throw new Error("Master ALKER tidak ditemukan atau tidak aktif.");

  const brand=String(p.brand||"").trim();
  const type=String(p.type||"").trim();
  const serialNumber=String(p.serialNumber||"").trim();
  const condition=String(p.condition||"BAIK").trim().toUpperCase();
  const note=String(p.note||"").trim();

  if(isSplicer_(item.itemName) && !brand) throw new Error("Merek Splicer wajib dipilih.");
  if(!["BAIK","RUSAK RINGAN","RUSAK BERAT"].includes(condition)) throw new Error("Kondisi ALKER tidak valid.");
  if(!serialNumber) throw new Error("Serial Number wajib diisi untuk input ALKER Leader.");

  const duplicate=rows_("INVENTORY").find(x=>
    String(x.itemId||"")===itemId &&
    String(x.serialNumber||"").trim().toLowerCase()===serialNumber.toLowerCase() &&
    serialNumber!==""
  );
  if(duplicate) throw new Error("Serial Number tersebut sudah terdaftar di Inventory.");

  const masterPrice=getMasterPrice_(item.itemId,brand);
  const inventoryId=id_("INV");

  append_("INVENTORY",{
    inventoryId:inventoryId,
    itemId:item.itemId,
    itemName:item.itemName,
    category:item.category,
    brand:brand,
    type:type,
    serialNumber:serialNumber,
    price:masterPrice,
    condition:condition,
    status:"DIPAKAI",
    location:"TEKNISI",
    loker:u.loker,
    holderId:technicianId,
    holder:t.name,
    photoUrl:savePhoto_(p.photo,"leader_"+inventoryId+".jpg"),
    serialPhotoUrl:savePhoto_(p.serialPhoto,"leader_serial_"+inventoryId+".jpg"),
    receivedAt:now_(),
    source:"LEADER INPUT",
    notes:note,
    updatedAt:now_()
  });

  audit_(u,"LEADER_INPUT_ALKER",inventoryId+" | "+item.itemName+" | "+t.name+" | harga master="+masterPrice);

  return ok_({
    inventoryId:inventoryId,
    itemName:item.itemName,
    technician:t.name,
    price:masterPrice,
    message:"ALKER berhasil ditambahkan ke teknisi dengan harga Master ALKER."
  });
}
function dashboard_(u){

  /*
   * ==========================================
   * INVENTORY SESUAI ROLE
   * ==========================================
   */

  let inv =
    inventory_(
      u,
      u.role === "TEKNISI"
        ? "mine"
        : u.role === "LEADER"
          ? "loker"
          : "all"
    );


  /*
   * ==========================================
   * RINGKASAN INVENTORY
   * ==========================================
   */

  const totalValue =
    inv.reduce(
      (s,x) =>
        s + Number(x.price || 0),
      0
    );


  const cond = {};

  inv.forEach(
    x => {

      const key =
        x.condition ||
        "BELUM DIKETAHUI";

      cond[key] =
        (cond[key] || 0) + 1;

    }
  );


  const loc = {};

  inv.forEach(
    x => {

      const key =
        x.location ||
        "UNKNOWN";


      if(!loc[key]){

        loc[key] = {

          name:
            key,

          count:
            0,

          value:
            0

        };

      }


      loc[key].count++;

      loc[key].value +=
        Number(
          x.price || 0
        );

    }
  );


  /*
   * ==========================================
   * DATA AKTIVITAS
   * ==========================================
   */

  const req =
    rows_("REQUESTS");

  const ini =
    rows_("INITIAL_INVENTORY");

  const pro =
    rows_("PROCUREMENT");


  const filter =
    a => {

      if(
        u.role ===
        "TEKNISI"
      ){

        return a.filter(
          x =>
            x.technicianId ===
            u.userId
        );

      }


      if(
        u.role ===
        "LEADER"
      ){

        return a.filter(
          x =>
            x.loker ===
            u.loker
        );

      }


      return a;

    };


  /*
   * ==========================================
   * KHUSUS TEKNISI
   *
   * Bandingkan:
   *
   * MASTER ALKER LOKER
   * VS
   * INVENTORY TEKNISI
   * VS
   * INITIAL_INVENTORY
   * ==========================================
   */

  let technicianReport = null;


  if(
    u.role ===
    "TEKNISI"
  ){

    const allowed =
      getAllowedLokerItems_(
        u.loker
      );


    const myInitial =
      ini.filter(
        x =>
          x.technicianId ===
          u.userId
      );


    /*
     * Ambil pengajuan TERAKHIR
     * untuk setiap item.
     *
     * Supaya pengajuan lama
     * tidak mengacaukan status.
     */

    const latestInitial = {};


    myInitial.forEach(
      x => {

        const old =
          latestInitial[
            x.itemId
          ];


        if(
          !old ||
          String(
            x.date || ""
          ) >
          String(
            old.date || ""
          )
        ){

          latestInitial[
            x.itemId
          ] = x;

        }

      }
    );


    const rows =
      allowed.map(
        item => {

          const itemInv =
            inv.find(
              x =>
                x.itemId ===
                item.itemId
            );


          const initial =
            latestInitial[
              item.itemId
            ];


          let status =
            "BELUM DILAPORKAN";


          let statusKey =
            "BELUM";


          /*
           * 1. Sudah menjadi inventory resmi
           */

          if(itemInv){

            status =
              "SUDAH DILAPORKAN";

            statusKey =
              "SUDAH";

          }


          /*
           * 2. Sedang revisi
           */

          else if(
            initial &&
            String(
              initial.status || ""
            ).toUpperCase() ===
              "REVISI"
          ){

            status =
              "PERLU REVISI";

            statusKey =
              "REVISI";

          }


          /*
           * 3. Belum diberikan
           */

          else if(
            initial &&
            String(
              initial.givenStatus || ""
            ).toUpperCase() ===
              "BELUM DIBERIKAN"
          ){

            status =
              "BELUM DIBERIKAN";

            statusKey =
              "PENGADAAN";

          }


          /*
           * 4. Menunggu verifikasi
           */

          else if(
            initial &&
            String(
              initial.status || ""
            ).toUpperCase() ===
              "MENUNGGU VERIFIKASI"
          ){

            status =
              "MENUNGGU VERIFIKASI";

            statusKey =
              "MENUNGGU";

          }


          return {

            itemId:
              item.itemId,

            itemName:
              item.itemName,

            category:
              item.category || "",

            status:
              status,

            statusKey:
              statusKey,

            inventoryId:
              itemInv
                ? itemInv.inventoryId
                : "",

            condition:
              itemInv
                ? itemInv.condition
                : "",

            price:
              itemInv
                ? Number(
                    itemInv.price || 0
                  )
                : 0,

            initialId:
              initial
                ? initial.initialId
                : "",

            givenStatus:
              initial
                ? initial.givenStatus || ""
                : "",

            reviewNote:
              initial
                ? initial.reviewNote || ""
                : ""

          };

        }
      );


    technicianReport = {

      total:
        rows.length,

      reported:
        rows.filter(
          x =>
            x.statusKey ===
            "SUDAH"
        ).length,

      pending:
        rows.filter(
          x =>
            x.statusKey ===
            "MENUNGGU"
        ).length,

      revision:
        rows.filter(
          x =>
            x.statusKey ===
            "REVISI"
        ).length,

      notGiven:
        rows.filter(
          x =>
            x.statusKey ===
            "PENGADAAN"
        ).length,

      notReported:
        rows.filter(
          x =>
            x.statusKey ===
            "BELUM"
        ).length,

      items:
        rows

    };

  }


  /*
   * ==========================================
   * RETURN DASHBOARD
   * ==========================================
   */

  return {

    totalInventory:
      inv.length,

    inWarehouse:
      inv.filter(
        x =>
          x.location ===
          "GUDANG"
      ).length,

    withTechnicians:
      inv.filter(
        x =>
          x.location ===
          "TEKNISI"
      ).length,

    totalValue:
      totalValue,

    conditions:
      cond,

    locations:
      Object.values(
        loc
      ),

    inventoryDetails: (() => {
      // Ringkasan Gudang per nama ALKER, tanpa memecah berdasarkan teknisi/loker.
      const grouped = {};
      inv.forEach(x => {
        const name = String(x.itemName || "-").trim() || "-";
        const key = name.toUpperCase();
        const condition = String(x.condition || "").trim().toUpperCase();
        if (!grouped[key]) grouped[key] = {itemName:name,count:0,baik:0,rusakRingan:0,rusakBerat:0,value:0};
        grouped[key].count += 1;
        if (condition === "BAIK") grouped[key].baik += 1;
        else if (condition === "RUSAK RINGAN") grouped[key].rusakRingan += 1;
        else if (condition === "RUSAK BERAT") grouped[key].rusakBerat += 1;
        grouped[key].value += Number(x.price || 0);
      });
      return Object.values(grouped).sort((a,b)=>String(a.itemName).localeCompare(String(b.itemName),"id"));
    })(),

    pending: {

      "Inventory awal menunggu":
        filter(ini)
          .filter(
            x =>
              x.status ===
              "MENUNGGU VERIFIKASI"
          )
          .length,

      "Request menunggu":
        filter(req)
          .filter(
            x =>
              /MENUNGGU/
                .test(
                  x.status
                )
          )
          .length,

      "Pengadaan aktif":
        pro.filter(
          x =>
            !/SELESAI|DITOLAK/
              .test(
                x.status
              )
        ).length

    },

    technicianReport:
      technicianReport

  };

}
/*************************************************
 * INPUT ALKER AWAL - TEKNISI
 *
 * Harga/Nilai TIDAK BOLEH diinput teknisi.
 * Nilai akan ditentukan Gudang saat verifikasi.
 *************************************************/
/*************************************************
 * ALKER AWAL TEKNISI
 * STATUS / RIWAYAT PENGAJUAN
 *************************************************/

/*************************************************
 * ALKER AWAL TEKNISI
 * STATUS / RIWAYAT PENGAJUAN
 *************************************************/

function leaderInitialReports_(u){
  requireRole_(u,["LEADER"]);

  // Daftar teknisi diambil dari penugasan Leader, bukan dari loker Leader.
  // Loker Leader biasanya bernama LEADER, sedangkan teknisi ada di loker operasional.
  const assigned = rows_("USERS").filter(x =>
    String(x.role || "").toUpperCase() === "TEKNISI" &&
    String(x.active || "").toUpperCase() === "Y" &&
    String(x.leaderId || "") === String(u.userId || "")
  );

  const assignedIds = new Set(assigned.map(x => String(x.userId || "")));
  const reports = rows_("INITIAL_INVENTORY").filter(x =>
    assignedIds.has(String(x.technicianId || ""))
  );

  const submittedIds = new Set(reports.map(x => String(x.technicianId || "")));
  const notSubmitted = assigned
    .filter(x => !submittedIds.has(String(x.userId || "")))
    .map(x => ({
      initialId: "",
      technicianId: x.userId || "",
      technician: x.name || x.username || "-",
      loker: x.loker || "-",
      date: "",
      itemName: "-",
      brand: "",
      type: "",
      serialNumber: "",
      condition: "-",
      status: "BELUM INPUT ALKER",
      price: 0,
      reviewNote: "Teknisi belum mengirim laporan ALKER awal."
    }));

  const submitted = reports.map(x => ({...x, inputStatus: "SUDAH INPUT ALKER"}));
  return submitted.concat(notSubmitted).sort((a,b) => {
    const aName = String(a.technician || "");
    const bName = String(b.technician || "");
    if (a.inputStatus !== b.inputStatus) return a.inputStatus === "SUDAH INPUT ALKER" ? -1 : 1;
    return aName.localeCompare(bName);
  });
}

function initialMine_(u){

  requireRole_(
    u,
    ["TEKNISI"]
  );

  return rows_("INITIAL_INVENTORY")
    .filter(x =>
      x.technicianId === u.userId
    )
    .reverse();
}


/*************************************************
 * SUBMIT ALKER AWAL
 *
 * givenStatus:
 *
 * SUDAH DIBERIKAN
 *   -> wajib data fisik ALKER
 *
 * BELUM DIBERIKAN
 *   -> tidak perlu data fisik
 *   -> akan masuk proses pengadaan
 *************************************************/

function initialSubmit_(u,p){

  requireRole_(
    u,
    ["TEKNISI"]
  );


  const itemId =
    String(
      p.itemId || ""
    ).trim();


  const givenStatus =
    String(
      p.givenStatus ||
      ""
    ).trim()
    .toUpperCase();


  if(
    ![
      "SUDAH DIBERIKAN",
      "BELUM DIBERIKAN"
    ].includes(givenStatus)
  ){

    throw new Error(
      "Status pemberian ALKER wajib dipilih."
    );

  }


  const item =
    getAllowedLokerItems_(
      u.loker
    ).find(
      x =>
        x.itemId === itemId
    );


  if(!item){

    throw new Error(
      "ALKER tidak tersedia untuk loker Anda."
    );

  }


  /*
   * Jangan izinkan pengajuan aktif
   * yang sama.
   */

  const existing =
    rows_("INITIAL_INVENTORY")
      .find(
        x =>
          x.technicianId === u.userId &&
          x.itemId === item.itemId &&
          (
            x.status ===
              "MENUNGGU VERIFIKASI" ||

            x.status ===
              "REVISI"
          )
      );


  if(existing){

    throw new Error(
      "ALKER ini sudah memiliki pengajuan aktif."
    );

  }


  /*
   * DATA FISIK
   */

  let brand = "";
  let type = "";
  let serialNumber = "";
  let condition = "BELUM DIVERIFIKASI";
  let photoUrl = "";
  let serialPhotoUrl = "";


  if(
    givenStatus ===
    "SUDAH DIBERIKAN"
  ){

    brand =
      String(
        p.brand || ""
      ).trim();

    type =
      String(
        p.type || ""
      ).trim();

    serialNumber =
      String(
        p.serialNumber || ""
      ).trim();

    condition =
      String(
        p.condition ||
        "BAIK"
      ).trim();


    /*
     * Untuk ALKER yang sudah diberikan,
     * foto disimpan.
     */

    const alkerFolder =
      getAlkerFolder_(
        item.itemName
      );


    const technicianFolder =
      getTechnicianFolder_(
        alkerFolder,
        u.name,
        serialNumber
      );


    const timestamp =
      Date.now();


    photoUrl =
      savePhoto_(
        p.photo,
        "FOTO_ALKER_" +
          timestamp +
          ".jpg",
        technicianFolder
      );


    serialPhotoUrl =
      savePhoto_(
        p.serialPhoto,
        "FOTO_SERIAL_" +
          timestamp +
          ".jpg",
        technicianFolder
      );

  }


  /*
   * KETERANGAN
   */

  const note =
    String(
      p.note || ""
    ).trim();


  /*
   * DATA PENGAJUAN
   */

  const x = {

    initialId:
      id_("INI"),

    itemId:
      item.itemId,

    itemName:
      item.itemName,

    technicianId:
      u.userId,

    technician:
      u.name,

    loker:
      u.loker,

    brand:
      brand,

    type:
      type,

    serialNumber:
      serialNumber,

    condition:
      condition,

    /*
     * Harga TIDAK berasal dari teknisi.
     */
    price:
      0,

    photoUrl:
      photoUrl,

    serialPhotoUrl:
      serialPhotoUrl,

    note:
      note,

    status:
      "MENUNGGU VERIFIKASI",

    date:
      now_(),

    reviewNote:
      "",

    givenStatus:
      givenStatus

  };


  append_(
    "INITIAL_INVENTORY",
    x
  );


  audit_(
    u,
    "INITIAL_SUBMIT",
    x.itemName +
      " / " +
      givenStatus +
      " / " +
      u.name
  );


  return ok_({

    initialId:
      x.initialId,

    message:
      "ALKER berhasil dikirim ke Gudang untuk verifikasi."

  });

}


/*************************************************
 * RESUBMIT REVISI
 *************************************************/

function initialResubmit_(u,p){

  requireRole_(
    u,
    ["TEKNISI"]
  );


  const initialId =
    String(
      p.initialId || ""
    ).trim();


  if(!initialId){

    throw new Error(
      "ID pengajuan tidak ditemukan."
    );

  }


  const existing =
    rows_("INITIAL_INVENTORY")
      .find(
        x =>
          x.initialId === initialId
      );


  if(!existing){

    throw new Error(
      "Pengajuan ALKER tidak ditemukan."
    );

  }


  if(
    existing.technicianId !==
    u.userId
  ){

    throw new Error(
      "Anda tidak memiliki akses ke pengajuan ini."
    );

  }


  if(
    String(
      existing.status
    ).toUpperCase() !==
      "REVISI"
  ){

    throw new Error(
      "ALKER ini tidak sedang dalam status REVISI."
    );

  }


  const givenStatus =
    String(
      p.givenStatus ||
      existing.givenStatus ||
      ""
    ).trim()
    .toUpperCase();


  if(
    ![
      "SUDAH DIBERIKAN",
      "BELUM DIBERIKAN"
    ].includes(givenStatus)
  ){

    throw new Error(
      "Status pemberian ALKER tidak valid."
    );

  }


  const item =
    getAllowedLokerItems_(
      u.loker
    ).find(
      x =>
        x.itemId ===
        existing.itemId
    );


  if(!item){

    throw new Error(
      "ALKER tidak tersedia untuk loker Anda."
    );

  }


  let brand = "";
  let type = "";
  let serialNumber = "";
  let condition = "BELUM DIVERIFIKASI";

  let photoUrl =
    existing.photoUrl || "";

  let serialPhotoUrl =
    existing.serialPhotoUrl || "";


  if(
    givenStatus ===
    "SUDAH DIBERIKAN"
  ){

    brand =
      String(
        p.brand || ""
      ).trim();

    type =
      String(
        p.type || ""
      ).trim();

    serialNumber =
      String(
        p.serialNumber || ""
      ).trim();

    condition =
      String(
        p.condition ||
        "BAIK"
      ).trim();


    const alkerFolder =
      getAlkerFolder_(
        item.itemName
      );


    const technicianFolder =
      getTechnicianFolder_(
        alkerFolder,
        u.name,
        serialNumber
      );


    const timestamp =
      Date.now();


    if(p.photo){

      photoUrl =
        savePhoto_(
          p.photo,
          "FOTO_ALKER_REVISI_" +
            timestamp +
            ".jpg",
          technicianFolder
        );

    }


    if(p.serialPhoto){

      serialPhotoUrl =
        savePhoto_(
          p.serialPhoto,
          "FOTO_SERIAL_REVISI_" +
            timestamp +
            ".jpg",
          technicianFolder
        );

    }

  }


  updateById_(
    "INITIAL_INVENTORY",
    "initialId",
    initialId,
    {

      brand:
        brand,

      type:
        type,

      serialNumber:
        serialNumber,

      condition:
        condition,

      price:
        0,

      photoUrl:
        photoUrl,

      serialPhotoUrl:
        serialPhotoUrl,

      note:
        String(
          p.note || ""
        ).trim(),

      givenStatus:
        givenStatus,

      status:
        "MENUNGGU VERIFIKASI",

      date:
        now_(),

      reviewNote:
        ""

    }
  );


  audit_(
    u,
    "INITIAL_RESUBMIT",
    initialId +
      " / " +
      givenStatus
  );


  return ok_({

    initialId:
      initialId,

    message:
      "Perbaikan ALKER berhasil dikirim kembali ke Gudang."

  });

}


/*************************************************
 * KEPUTUSAN GUDANG
 *************************************************/

function initialDecision_(u,p){

  requireRole_(
    u,
    ["SPV_GUDANG","ADMIN"]
  );


  const initialId =
    String(
      p.initialId || ""
    ).trim();


  const a =
    rows_("INITIAL_INVENTORY")
      .find(
        x =>
          x.initialId ===
          initialId
      );


  if(!a){

    throw new Error(
      "Data ALKER tidak ditemukan."
    );

  }


  if(
    a.status !==
      "MENUNGGU VERIFIKASI"
  ){

    throw new Error(
      "Data ini sudah diproses."
    );

  }


  const decision =
    String(
      p.decision || ""
    ).trim()
    .toUpperCase();


  const givenStatus =
    String(
      a.givenStatus ||
      "BELUM DIBERIKAN"
    ).trim()
    .toUpperCase();


  /*
   * =========================================
   * REVISI
   * =========================================
   */

  if(
    decision ===
    "REVISION"
  ){

    const note =
      String(
        p.note ||
        "Mohon perbaiki data ALKER."
      ).trim();


    updateById_(
      "INITIAL_INVENTORY",
      "initialId",
      initialId,
      {

        status:
          "REVISI",

        reviewNote:
          note

      }
    );


    audit_(
      u,
      "INITIAL_REVISION",
      initialId +
        " / " +
        note
    );


    return ok_({

      message:
        "ALKER dikembalikan kepada teknisi untuk diperbaiki."

    });

  }


  /*
   * =========================================
   * APPROVE
   * =========================================
   */

  if(
    decision !==
    "APPROVE"
  ){

    throw new Error(
      "Keputusan verifikasi tidak valid."
    );

  }


  /*
   * =========================================
   * BELUM DIBERIKAN
   * =========================================
   *
   * Jangan buat INVENTORY.
   *
   * Buat REQUEST PROCUREMENT.
   */

  if(
    givenStatus ===
    "BELUM DIBERIKAN"
  ){

    /*
     * Cegah procurement ganda.
     */

    const existingPO =
      rows_("PROCUREMENT")
        .find(
          x =>
            String(
              x.requestId || ""
            ) === initialId
        );


    let procurementId = "";


    if(existingPO){

      procurementId =
        existingPO.procurementId;

    }else{

      procurementId =
        id_("PO");


      append_(
        "PROCUREMENT",
        {

          procurementId:
            procurementId,

          itemId:
            a.itemId,

          itemName:
            a.itemName,

          qty:
            1,

          estimate:
            0,

          priority:
            "NORMAL",

          reason:
            "ALKER belum diberikan kepada teknisi " +
            a.technician,

          status:
            "MENUNGGU PROSES PENGADAAN",

          requestId:
            initialId,

          date:
            now_(),

          updatedAt:
            now_(),

          actor:
            u.name

        }
      );

    }


    updateById_(
      "INITIAL_INVENTORY",
      "initialId",
      initialId,
      {

        status:
          "PENGADAAN",

        givenStatus:
          "BELUM DIBERIKAN",

        reviewNote:
          "Diverifikasi Gudang. " +
          "Diteruskan ke proses pengadaan. " +
          "PO: " +
          procurementId

      }
    );


    audit_(
      u,
      "INITIAL_PROCUREMENT",
      initialId +
        " -> " +
        procurementId
    );


    return ok_({

      message:
        "ALKER belum diberikan. Data diteruskan ke proses pengadaan.",

      procurementId:
        procurementId

    });

  }


  /*
   * =========================================
   * SUDAH DIBERIKAN
   * =========================================
   *
   * Baru dibuat sebagai INVENTORY teknisi.
   */

  if(
    givenStatus !==
    "SUDAH DIBERIKAN"
  ){

    throw new Error(
      "Status pemberian ALKER tidak valid."
    );

  }


  const master =
    rows_("MASTER_ALKER")
      .find(
        x =>
          x.itemId ===
          a.itemId
      );


  const inv = {

    inventoryId:
      id_("INV"),

    itemId:
      a.itemId,

    itemName:
      a.itemName,

    category:
      master?.category ||
      "",

    brand:
      a.brand,

    type:
      a.type,

    serialNumber:
      a.serialNumber,

    /*
     * Harga ditentukan Gudang.
     * Untuk sementara menggunakan harga master.
     */

    price:
      getMasterPrice_(
        a.itemId,
        a.brand
      ),

    condition:
      a.condition ||
      "BAIK",

    status:
      "DIPAKAI",

    location:
      "TEKNISI",

    loker:
      a.loker,

    holderId:
      a.technicianId,

    holder:
      a.technician,

    photoUrl:
      a.photoUrl,

    serialPhotoUrl:
      a.serialPhotoUrl,

    receivedAt:
      a.date,

    source:
      "INVENTORY AWAL",

    notes:
      a.note,

    updatedAt:
      now_()

  };


  append_(
    "INVENTORY",
    inv
  );


  updateById_(
    "INITIAL_INVENTORY",
    "initialId",
    initialId,
    {

      status:
        "APPROVED",

      givenStatus:
        "SUDAH DIBERIKAN",

      reviewNote:
        "Approved oleh " +
        u.name

    }
  );


  audit_(
    u,
    "INITIAL_APPROVE",
    initialId +
      " -> " +
      inv.inventoryId
  );


  return ok_({

    message:
      "ALKER berhasil diverifikasi dan menjadi inventory teknisi.",

    inventoryId:
      inv.inventoryId

  });

}
function requests_(u, scope){

  let a = rows_("REQUESTS");

  /*
   * =====================================================
   * TEKNISI
   * =====================================================
   * Teknisi hanya melihat request miliknya sendiri.
   */
  if(u.role === "TEKNISI"){

    a = a.filter(x =>
      String(x.technicianId || "") ===
      String(u.userId || "")
    );

  }

  /*
   * =====================================================
   * LEADER
   * =====================================================
   *
   * Untuk saat ini Leader Utama melihat seluruh request
   * yang menunggu validasi Leader.
   *
   * Ini diperlukan karena akun Leader Utama saat ini
   * mempunyai loker = "LEADER", sedangkan teknisi
   * mempunyai loker seperti:
   *
   * IOAN / ASSURANCE
   * PSB / FULFILLMENT
   *
   * Jadi tidak boleh menggunakan:
   *
   * x.loker === u.loker
   *
   * untuk Leader Utama.
   */
  else if(u.role === "LEADER"){

    /*
     * Jika halaman meminta data khusus loker
     * dan nanti Leader sudah mempunyai loker yang benar,
     * filter bisa digunakan.
     *
     * Tetapi Leader Utama saat ini melihat semua.
     */
    if(
      scope === "loker" &&
      String(u.loker || "").toUpperCase() !== "LEADER"
    ){

      a = a.filter(x =>
        String(x.loker || "") ===
        String(u.loker || "")
      );

    }

  }

  /*
   * =====================================================
   * ADMIN / SPV GUDANG
   * =====================================================
   *
   * Bisa melihat seluruh request.
   */

  /*
   * Urutkan terbaru di atas.
   */
  return a.reverse();
}
function createRequest_(u,p){
  requireRole_(u,["TEKNISI"]);
  const item=getAllowedLokerItems_(u.loker).find(x=>x.itemId===p.itemId);if(!item)throw new Error("Alker tidak tersedia untuk loker Anda.");
  const x={requestId:id_("REQ"),itemId:item.itemId,itemName:item.itemName,technicianId:u.userId,technician:u.name,loker:u.loker,requestType:p.requestType,qty:Number(p.qty||1),priority:p.priority,reason:p.reason,photoUrl:savePhoto_(p.photo,"request_"+Date.now()+".jpg"),status:"MENUNGGU VALIDASI LEADER",leaderDecision:"",warehouseDecision:"",date:now_(),updatedAt:now_(),note:""};
  append_("REQUESTS",x);audit_(u,"REQUEST_CREATE",x.requestId+" "+x.itemName);return ok_(x);
}
function requestDecision_(u,p){
  const x=rows_("REQUESTS").find(a=>a.requestId===p.requestId);if(!x)throw new Error("Request tidak ditemukan.");
  if(u.role==="LEADER"){
    if(x.loker!==u.loker)throw new Error("Request bukan dari loker Anda.");
    const s=p.decision==="APPROVE"?"MENUNGGU PROSES GUDANG":"DITOLAK LEADER";
    updateById_("REQUESTS","requestId",x.requestId,{status:s,leaderDecision:p.decision,note:p.note||"",updatedAt:now_()});
    audit_(u,"REQUEST_LEADER_"+p.decision,x.requestId);return ok_({message:"Berhasil"});
  }
  if(u.role==="SPV_GUDANG"||u.role==="ADMIN"){
    if(!/MENUNGGU PROSES GUDANG/.test(x.status))throw new Error("Request belum masuk tahap Gudang.");
    const stock=rows_("INVENTORY").filter(i=>i.location==="GUDANG"&&i.itemId===x.itemId&&(i.condition==="BAIK"||i.condition==="RUSAK RINGAN")&&i.status==="READY").length;
    if(p.decision==="APPROVE"){
      updateById_("REQUESTS","requestId",x.requestId,{status:stock>=x.qty?"DISETUJUI - SIAP DISTRIBUSI":"DISETUJUI - STOK KURANG",warehouseDecision:"APPROVE",updatedAt:now_()});
    }else updateById_("REQUESTS","requestId",x.requestId,{status:"DITOLAK GUDANG",warehouseDecision:"REJECT",note:p.note||"",updatedAt:now_()});
    audit_(u,"REQUEST_WAREHOUSE_"+p.decision,x.requestId+" stock="+stock);return ok_({message:"Berhasil",stock});
  }
  throw new Error("Role tidak dapat memproses request.");
}
function issues_(u,scope){let a=rows_("ISSUES");if(scope==="mine"||u.role==="TEKNISI")a=a.filter(x=>x.technicianId===u.userId);else if(u.role==="LEADER")a=a.filter(x=>x.loker===u.loker);return a.reverse()}
function reportIssue_(u,p){
  requireRole_(u,["TEKNISI"]);
  const inv=rows_("INVENTORY").find(x=>x.inventoryId===p.inventoryId&&x.holderId===u.userId);if(!inv)throw new Error("Inventory tidak ditemukan atau bukan tanggung jawab Anda.");
  const x={issueId:id_("ISS"),inventoryId:inv.inventoryId,itemId:inv.itemId,itemName:inv.itemName,technicianId:u.userId,technician:u.name,loker:u.loker,issueType:p.issueType,note:p.note,photoUrl:savePhoto_(p.photo,"issue_"+Date.now()+".jpg"),status:"MENUNGGU VERIFIKASI",date:now_(),updatedAt:now_()};
  append_("ISSUES",x);updateById_("INVENTORY","inventoryId",inv.inventoryId,{condition:p.issueType==="HILANG"?"HILANG":"RUSAK",status:p.issueType==="HILANG"?"HILANG":"RUSAK",updatedAt:now_()});audit_(u,"ISSUE_REPORT",inv.inventoryId+" "+p.issueType);return ok_(x);
}
function returns_(u,scope){

  ensureReturnsSheet_();

  let a =
    rows_("RETURNS");

  if(
    scope === "mine" ||
    u.role === "TEKNISI"
  ){

    a =
      a.filter(
        x =>
          x.technicianId ===
          u.userId
      );

  }

  else if(
    u.role === "LEADER"
  ){

    a =
      a.filter(
        x =>
          x.loker ===
          u.loker
      );

  }

  /*
   * SPV GUDANG / ADMIN
   * dapat melihat seluruh pengembalian
   */

  return a.reverse();

}
function warehouse_(){

  const inv =
    rows_("INVENTORY")
      .filter(
        x =>
          String(
            x.location || ""
          ).toUpperCase() ===
          "GUDANG"
      );


  /*
   * ==========================================
   * GROUP PER ALKER
   * ==========================================
   */

  const grouped = {};


  inv.forEach(
    x => {

      const key =
        x.itemId ||
        x.itemName ||
        "UNKNOWN";


      if(
        !grouped[key]
      ){

        grouped[key] = {

          itemId:
            x.itemId || "",

          itemName:
            x.itemName || "",

          category:
            x.category || "",

          total:
            0,

          baik:
            0,

          rusakRingan:
            0,

          rusakBerat:
            0,

          hilang:
            0,

          siapDipakai:
            0,

          nilai:
            0,

          items:
            []

        };

      }


      const g =
        grouped[key];


      g.total++;


      const condition =
        String(
          x.condition || ""
        ).toUpperCase();


      if(
        condition ===
        "BAIK"
      ){

        g.baik++;

      }
      else if(
        condition ===
        "RUSAK RINGAN"
      ){

        g.rusakRingan++;

      }
      else if(
        condition ===
        "RUSAK BERAT"
      ){

        g.rusakBerat++;

      }
      else if(
        condition ===
        "HILANG"
      ){

        g.hilang++;

      }


      /*
       * SIAP DIPAKAI
       *
       * Hanya:
       * kondisi BAIK atau RUSAK RINGAN
       * status READY
       */

      if(
        (condition === "BAIK" || condition === "RUSAK RINGAN") &&
        String(
          x.status || ""
        ).toUpperCase() ===
          "READY"
      ){

        g.siapDipakai++;

      }


      g.nilai +=
        Number(
          x.price || 0
        );


      g.items.push(x);

    }
  );


  const summary =
    Object.values(
      grouped
    );


  /*
   * Urutkan berdasarkan nama ALKER
   */

  summary.sort(
    (a,b) =>
      String(
        a.itemName
      ).localeCompare(
        String(
          b.itemName
        )
      )
  );


  return {

    items:
      inv,

    summary: {

      count:
        inv.length,

      value:
        inv.reduce(
          (s,x) =>
            s +
            Number(
              x.price || 0
            ),
          0
        ),

      requests:
        rows_("REQUESTS")
          .filter(
            x =>
              /GUDANG|STOK KURANG/
                .test(
                  String(
                    x.status || ""
                  )
                )
          )
          .length,

      procurement:
        rows_("PROCUREMENT")
          .filter(
            x =>
              !/SELESAI|DITOLAK/
                .test(
                  String(
                    x.status || ""
                  )
                )
          )
          .length

    },

    byItem:
      summary

  };

}
/*************************************************
 * BARANG MASUK GUDANG
 *
 * HARGA OTOMATIS DARI MASTER ALKER
 *
 * PENTING:
 * Harga dari frontend / p.price DIABAIKAN.
 * Backend selalu mengambil:
 *
 * MASTER_ALKER.standardPrice
 *
 * Jadi harga tidak bisa dimanipulasi
 * melalui browser.
 *************************************************/

function warehouseStockAdd_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const item=rows_("MASTER_ALKER").find(x=>String(x.itemId)===String(p.itemId||""));
  if(!item) throw new Error("Master ALKER tidak ditemukan.");
  const quantity=Number(p.quantity||1);
  if(!Number.isInteger(quantity)||quantity<1||quantity>500) throw new Error("Quantity harus bilangan bulat antara 1 sampai 500.");
  const serialNumber=String(p.serialNumber||"").trim();
  if(quantity===1&&!serialNumber) throw new Error("Nomor seri wajib diisi jika quantity 1.");
  if(quantity>1&&serialNumber) throw new Error("Untuk quantity lebih dari 1, kosongkan kolom nomor seri. Catat daftar SN tiap unit pada keterangan.");
  if(!p.photo) throw new Error("Foto ALKER wajib diunggah sebagai bukti validasi.");
  const condition=String(p.condition||"").trim().toUpperCase();
  const allowed=["BAIK","RUSAK RINGAN","RUSAK BERAT","HILANG"];
  if(!allowed.includes(condition)) throw new Error("Kondisi ALKER tidak valid.");
  const brand=String(p.brand||"").trim();
  const masterPrice=getMasterPrice_(item.itemId,brand);
  if(!Number.isFinite(masterPrice)||masterPrice<0) throw new Error("Harga Master ALKER tidak valid.");
  if(serialNumber){
    const existing=rows_("INVENTORY").find(x=>String(x.location||"").toUpperCase()==="GUDANG"&&String(x.serialNumber||"").trim().toLowerCase()===serialNumber.toLowerCase()&&String(x.itemId||"")===String(item.itemId));
    if(existing) throw new Error("Nomor seri ini sudah tercatat di Stok Gudang.");
  }
  const photoUrl=savePhoto_(p.photo,"validasi_stok_batch_"+now_()+".jpg");
  const serialPhotoUrl=p.serialPhoto?savePhoto_(p.serialPhoto,"validasi_serial_batch_"+now_()+".jpg"):"";
  const created=[];
  for(let i=0;i<quantity;i++){
    const inventoryId=id_("INV");
    const unitSerial=quantity===1?serialNumber:"";
    const status=(condition==="BAIK"||condition==="RUSAK RINGAN")?"READY":condition==="HILANG"?"HILANG":"TIDAK SIAP PAKAI";
    append_("INVENTORY",{
      inventoryId:inventoryId,itemId:item.itemId,itemName:item.itemName,category:item.category,
      brand:brand,type:String(p.type||"").trim(),serialNumber:unitSerial,price:masterPrice,
      condition:condition,status:status,location:"GUDANG",loker:"GUDANG",holderId:"",holder:"",
      photoUrl:photoUrl,serialPhotoUrl:serialPhotoUrl,
      receivedAt:now_(),source:"VALIDASI STOK LAMA",notes:String(p.note||"").trim()+(quantity>1?" | Batch quantity: "+quantity+" unit; SN tiap unit belum dicatat di kolom SN":""),updatedAt:now_()
    });
    created.push(inventoryId);
  }
  audit_(u,"VALIDASI_STOK_GUDANG","Validasi stok lama: "+item.itemName+" / quantity "+quantity+" / kondisi "+condition+(serialNumber?" / SN "+serialNumber:""));
  return ok_({inventoryIds:created,quantity:quantity,message:quantity+" unit stok lama berhasil dicatat."});
}

function receive_(u,p){

  requireRole_(
    u,
    [
      "SPV_GUDANG",
      "ADMIN"
    ]
  );


  /*
   * ==========================================
   * CARI MASTER ALKER
   * ==========================================
   */

  const item =
    rows_("MASTER_ALKER")
      .find(
        x =>
          String(x.itemId) ===
          String(p.itemId || "")
      );


  if(!item){

    throw new Error(
      "Master ALKER tidak ditemukan."
    );

  }


  /*
   * ==========================================
   * HARGA MASTER
   * ==========================================
   *
   * TIDAK MENGAMBIL p.price
   */

  const masterPrice =
    getMasterPrice_(
      item.itemId,
      p.brand
    );


  if(
    !Number.isFinite(masterPrice) ||
    masterPrice < 0
  ){

    throw new Error(
      "Harga Master ALKER tidak valid."
    );

  }


  /*
   * ==========================================
   * JUMLAH
   * ==========================================
   */

  const qty =
    Math.max(
      1,
      Number(
        p.qty || 1
      )
    );


  const rid =
    id_("RCV");


  /*
   * ==========================================
   * SIMPAN INVENTORY
   * ==========================================
   */

  for(
    let i = 0;
    i < qty;
    i++
  ){

    const serialNumber =
      qty === 1

        ? String(
            p.serialNumber || ""
          ).trim()

        : (
            p.serialNumber
              ? String(
                  p.serialNumber
                ).trim() +
                "-" +
                (i + 1)

              : ""
          );


    const inventoryId =
      id_("INV");


    append_(
      "INVENTORY",
      {

        inventoryId:
          inventoryId,

        itemId:
          item.itemId,

        itemName:
          item.itemName,

        category:
          item.category,

        brand:
          String(
            p.brand || ""
          ).trim(),

        type:
          String(
            p.type || ""
          ).trim(),

        serialNumber:
          serialNumber,

        /*
         * ==================================
         * HARGA MASTER
         * ==================================
         */

        price:
          masterPrice,

        condition:
          "BAIK",

        status:
          "READY",

        location:
          "GUDANG",

        loker:
          "GUDANG",

        holderId:
          "",

        holder:
          "",

        photoUrl:
          savePhoto_(
            p.photo,
            "receive_" +
              rid +
              "_" +
              i +
              ".jpg"
          ),

        serialPhotoUrl:
          "",

        receivedAt:
          now_(),

        source:
          "BARANG MASUK",

        notes:
          String(
            p.note || ""
          ).trim(),

        updatedAt:
          now_()

      }
    );

  }


  /*
   * ==========================================
   * SIMPAN LOG RECEIVING
   * ==========================================
   *
   * Harga juga dicatat berdasarkan
   * MASTER ALKER, bukan harga dari form.
   */

  append_(
    "RECEIVING",
    {

      receivingId:
        rid,

      itemId:
        item.itemId,

      itemName:
        item.itemName,

      qty:
        qty,

      brand:
        String(
          p.brand || ""
        ).trim(),

      type:
        String(
          p.type || ""
        ).trim(),

      serialNumber:
        String(
          p.serialNumber || ""
        ).trim(),

      price:
        masterPrice,

      supplier:
        String(
          p.supplier || ""
        ).trim(),

      reference:
        String(
          p.reference || ""
        ).trim(),

      photoUrl:
        savePhoto_(
          p.photo,
          "receiving_" +
            rid +
            ".jpg"
        ),

      docPhotoUrl:
        savePhoto_(
          p.docPhoto,
          "document_" +
            rid +
            ".jpg"
        ),

      note:
        String(
          p.note || ""
        ).trim(),

      status:
        "SELESAI",

      date:
        now_(),

      actor:
        u.name

    }
  );


  /*
   * ==========================================
   * AUDIT
   * ==========================================
   */

  audit_(
    u,
    "RECEIVING",
    rid +
      " " +
      item.itemName +
      " qty " +
      qty +
      " harga master=" +
      masterPrice
  );


  return ok_({

    receivingId:
      rid,

    itemId:
      item.itemId,

    itemName:
      item.itemName,

    qty:
      qty,

    price:
      masterPrice,

    message:
      "Barang berhasil masuk Gudang dengan harga Master ALKER."

  });

}
function distribute_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const inv=rows_("INVENTORY").find(x=>x.inventoryId===p.inventoryId&&x.location==="GUDANG"&&x.status==="READY"&&(x.condition==="BAIK"||x.condition==="RUSAK RINGAN"));if(!inv)throw new Error("Inventory tidak tersedia di Gudang. Hanya kondisi BAIK atau RUSAK RINGAN yang dapat disalurkan.");
  const t=rows_("USERS").find(x=>x.userId===p.technicianId&&x.role==="TEKNISI");if(!t)throw new Error("Teknisi tidak ditemukan.");
  updateById_("INVENTORY","inventoryId",inv.inventoryId,{location:"TEKNISI",loker:t.loker,holderId:t.userId,holder:t.name,condition:inv.condition,status:"DIPAKAI",updatedAt:now_()});
  const did=id_("DST");append_("DISTRIBUTION",{distributionId:did,inventoryId:inv.inventoryId,itemId:inv.itemId,itemName:inv.itemName,technicianId:t.userId,technician:t.name,loker:t.loker,condition:inv.condition,note:p.note,status:"SELESAI",date:now_(),actor:u.name});
  audit_(u,"DISTRIBUTION",inv.inventoryId+" -> "+t.name);return ok_({distributionId:did});
}
function createProcurement_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const item=rows_("MASTER_ALKER").find(x=>x.itemId===p.itemId);if(!item)throw new Error("Alker tidak ditemukan.");
  const x={procurementId:id_("PO"),itemId:item.itemId,itemName:item.itemName,qty:Number(p.qty||1),estimate:Number(p.estimate||0),priority:p.priority,reason:p.reason,status:"MENUNGGU APPROVAL PEMBELIAN",requestId:p.requestId||"",date:now_(),updatedAt:now_(),actor:u.name};
  append_("PROCUREMENT",x);audit_(u,"PROCUREMENT_CREATE",x.procurementId+" "+x.itemName);return ok_(x);
}
function addMasterItem_(u,p){
  ensureMasterPhotoModeColumn_();
  requireRole_(u,["ADMIN"]);
  const itemName=String(p.itemName||"").trim();
  const category=String(p.category||"").trim();
  const unit=String(p.unit||"UNIT").trim()||"UNIT";
  const rawLokers=String(p.lokers||"").split("|").map(x=>x.trim()).filter(Boolean);
  const spec=String(p.spec||"").trim();
  const price=Number(p.price||0);
  if(!itemName) throw new Error("Nama ALKER wajib diisi.");
  if(!category) throw new Error("Kategori ALKER wajib diisi.");
  if(!rawLokers.length) throw new Error("Pilih minimal satu loker pengguna.");
  if(!Number.isFinite(price)||price<0) throw new Error("Harga standar tidak valid.");
  const activeLokers=rows_("LOKERS").filter(x=>String(x.status||"").toUpperCase()==="AKTIF").map(x=>x.name);
  const lokers=[...new Set(rawLokers)];
  if(lokers.some(x=>x==="GUDANG"||!activeLokers.includes(x))) throw new Error("Loker pengguna tidak valid. Gudang bukan loker tujuan master ALKER.");
  const duplicate=rows_("MASTER_ALKER").find(x=>normalizeName_(x.itemName)===normalizeName_(itemName));
  if(duplicate) throw new Error("Nama ALKER sudah ada di Master. Aktifkan kembali item tersebut jika sebelumnya dinonaktifkan.");
  const photoMode=String(p.photoMode||"CAMERA").trim().toUpperCase()==="GALLERY"?"GALLERY":"CAMERA";
  const x={itemId:id_("ALK"),itemName,category,unit,standardPrice:price,lokers:lokers.join("|"),spec,active:"Y",createdAt:now_(),photoMode};
  append_("MASTER_ALKER",x);
  lokers.forEach(loker=>append_("MASTER_ALKER_LOKER",{mappingId:id_("MAP"),itemId:x.itemId,loker,active:"Y",createdAt:now_()}));
  if(isSplicer_(itemName)) ensureSplicerBrandPrices_();
  audit_(u,"MASTER_ITEM_ADD",x.itemName+" | aktif langsung | "+x.lokers);
  return ok_({...x,message:"Master ALKER aktif dan langsung tersedia untuk pengguna pada loker yang dipilih; tidak perlu melalui Gudang."});
}

function updateMasterItemLokers_(u,p){
  requireRole_(u,["ADMIN"]);
  const itemId=String(p.itemId||"").trim();
  const rawLokers=String(p.lokers||"").split("|").map(x=>x.trim()).filter(Boolean);
  if(!itemId) throw new Error("ID Master ALKER wajib diisi.");
  if(!rawLokers.length) throw new Error("Pilih minimal satu loker pengguna.");
  const item=rows_("MASTER_ALKER").find(x=>String(x.itemId)===itemId);
  if(!item) throw new Error("Master ALKER tidak ditemukan.");
  const activeLokers=rows_("LOKERS").filter(x=>String(x.status||"").toUpperCase()==="AKTIF").map(x=>String(x.name||""));
  const lokers=[...new Set(rawLokers)];
  if(lokers.some(x=>x==="GUDANG"||!activeLokers.includes(x))) throw new Error("Loker pengguna tidak valid. Gudang bukan loker tujuan master ALKER.");

  // Perbarui daftar loker pada master tanpa mengubah status aktif/nonaktif ALKER.
  updateById_("MASTER_ALKER","itemId",itemId,{lokers:lokers.join("|")});

  // Sinkronkan tabel mapping: mapping lama yang tidak dipilih dinonaktifkan,
  // mapping yang dipilih diaktifkan kembali, dan mapping baru dibuat bila perlu.
  const mappings=rows_("MASTER_ALKER_LOKER").filter(x=>String(x.itemId)===itemId);
  lokers.forEach(loker=>{
    const found=mappings.find(x=>String(x.loker)===loker);
    if(found){
      updateById_("MASTER_ALKER_LOKER","mappingId",found.mappingId,{active:"Y"});
    }else{
      append_("MASTER_ALKER_LOKER",{mappingId:id_("MAP"),itemId,loker,active:"Y",createdAt:now_()});
    }
  });
  mappings.filter(x=>!lokers.includes(String(x.loker))).forEach(x=>updateById_("MASTER_ALKER_LOKER","mappingId",x.mappingId,{active:"N"}));
  audit_(u,"MASTER_ITEM_LOKERS_UPDATE",itemId+" | "+item.itemName+" | "+lokers.join("|"));
  return ok_({itemId,itemName:item.itemName,lokers:lokers.join("|"),message:"Loker ALKER berhasil diperbarui."});
}

function updateMasterItemStatus_(u,p){
  requireRole_(u,["ADMIN"]);
  const itemId=String(p.itemId||"").trim();
  const active=String(p.active||"").trim().toUpperCase();
  if(!itemId) throw new Error("ID Master ALKER wajib diisi.");
  if(!["Y","N"].includes(active)) throw new Error("Status aktif tidak valid.");
  const item=rows_("MASTER_ALKER").find(x=>String(x.itemId)===itemId);
  if(!item) throw new Error("Master ALKER tidak ditemukan.");
  updateById_("MASTER_ALKER","itemId",itemId,{active});
  // Mapping tetap tersimpan agar ketika diaktifkan kembali item kembali tersedia di loker semula.
  audit_(u,active==="Y"?"MASTER_ITEM_ENABLE":"MASTER_ITEM_DISABLE",itemId+" | "+item.itemName);
  return ok_({itemId,itemName:item.itemName,active,message:active==="Y"?"ALKER berhasil diaktifkan.":"ALKER berhasil dinonaktifkan dari pilihan pengguna."});
}
function updateMasterPhotoMode_(u,p){
  requireRole_(u,["ADMIN"]);
  ensureMasterPhotoModeColumn_();
  const itemId=String(p.itemId||"").trim();
  const photoMode=String(p.photoMode||"").trim().toUpperCase();
  if(!itemId) throw new Error("ID Master ALKER wajib diisi.");
  if(!["CAMERA","GALLERY"].includes(photoMode)) throw new Error("Pengaturan foto tidak valid.");
  const item=rows_("MASTER_ALKER").find(x=>String(x.itemId)===itemId);
  if(!item) throw new Error("Master ALKER tidak ditemukan.");
  updateById_("MASTER_ALKER","itemId",itemId,{photoMode});
  audit_(u,"MASTER_ITEM_PHOTO_MODE",itemId+" | "+item.itemName+" | "+photoMode);
  return ok_({itemId,itemName:item.itemName,photoMode,message:"Pengaturan foto berhasil diperbarui."});
}

/*************************************************
 * MASTER HARGA ALKER
 * LIST MASTER HARGA
 *************************************************/


/*************************************************
 * MASTER HARGA PER MEREK
 * KHUSUS ALKER SPlicer
 *************************************************/

const SPlicer_BRANDS = [
  "Sumitomo",
  "Jointwit",
  "Fujikura",
  "INO",
  "ADV",
  "TUMTEC"
];

function isSplicer_(itemName){
  return normalizeName_(itemName) === "splicer";
}

function ensureMasterPriceSheet_(){

  const ss = ss_();
  let sh = ss.getSheetByName("MASTER_ALKER_PRICE");

  if(!sh){
    sh = ss.insertSheet("MASTER_ALKER_PRICE");
    sh.appendRow(HEADERS.MASTER_ALKER_PRICE);
    sh.setFrozenRows(1);
  }else if(sh.getLastRow() === 0){
    sh.appendRow(HEADERS.MASTER_ALKER_PRICE);
    sh.setFrozenRows(1);
  }

  return sh;
}

function ensureSplicerBrandPrices_(){

  ensureMasterPriceSheet_();

  const masters = rows_("MASTER_ALKER")
    .filter(x => isSplicer_(x.itemName));

  if(!masters.length) return;

  const existing = rows_("MASTER_ALKER_PRICE");

  masters.forEach(item => {

    SPlicer_BRANDS.forEach(brand => {

      const found = existing.find(x =>
        String(x.itemId || "") === String(item.itemId || "") &&
        String(x.brand || "").trim().toLowerCase() === brand.toLowerCase()
      );

      if(!found){

        append_("MASTER_ALKER_PRICE", {
          priceId: id_("PRC"),
          itemId: item.itemId,
          itemName: item.itemName,
          brand: brand,
          type: "",
          price: 0,
          active: "Y",
          createdAt: now_(),
          updatedAt: now_()
        });

      }

    });

  });

}

function getMasterPrice_(itemId, brand){

  const item =
    rows_("MASTER_ALKER")
      .find(x =>
        String(x.itemId || "") === String(itemId || "")
      );

  if(!item){
    throw new Error("Master ALKER tidak ditemukan.");
  }

  if(isSplicer_(item.itemName)){

    ensureSplicerBrandPrices_();

    const b =
      String(brand || "").trim().toLowerCase();

    if(!b){
      throw new Error(
        "Merek Splicer wajib dipilih."
      );
    }

    const variant =
      rows_("MASTER_ALKER_PRICE")
        .find(x =>
          String(x.itemId || "") === String(item.itemId || "") &&
          String(x.brand || "").trim().toLowerCase() === b &&
          String(x.active || "Y").toUpperCase() === "Y"
        );

    if(!variant){
      throw new Error(
        "Merek Splicer belum tersedia di Master Harga."
      );
    }

    const price =
      Number(variant.price || 0);

    if(!Number.isFinite(price) || price < 0){
      throw new Error(
        "Harga Master Splicer tidak valid."
      );
    }

    return price;
  }

  const price =
    Number(item.standardPrice || 0);

  if(!Number.isFinite(price) || price < 0){
    throw new Error(
      "Harga Master ALKER tidak valid."
    );
  }

  return price;
}

function masterBrandPrices_(u, itemId){

  requireRole_(u,[
    "SPV_GUDANG",
    "ADMIN"
  ]);

  ensureSplicerBrandPrices_();

  const item =
    rows_("MASTER_ALKER")
      .find(x =>
        String(x.itemId || "") === String(itemId || "")
      );

  if(!item){
    throw new Error("Master ALKER tidak ditemukan.");
  }

  if(!isSplicer_(item.itemName)){
    throw new Error(
      "ALKER ini tidak menggunakan harga berdasarkan merek."
    );
  }

  return rows_("MASTER_ALKER_PRICE")
    .filter(x =>
      String(x.itemId || "") === String(item.itemId || "") &&
      String(x.active || "Y").toUpperCase() === "Y"
    )
    .map(x => ({
      priceId: x.priceId,
      itemId: x.itemId,
      itemName: item.itemName,
      brand: x.brand,
      type: x.type || "",
      price: Number(x.price || 0)
    }));
}

function updateMasterBrandPrices_(u,p){

  requireRole_(u,[
    "SPV_GUDANG",
    "ADMIN"
  ]);

  const itemId =
    String(p.itemId || "").trim();

  if(!itemId){
    throw new Error("ID ALKER tidak ditemukan.");
  }

  const item =
    rows_("MASTER_ALKER")
      .find(x =>
        String(x.itemId || "") === itemId
      );

  if(!item){
    throw new Error("Master ALKER tidak ditemukan.");
  }

  if(!isSplicer_(item.itemName)){
    throw new Error(
      "Perubahan harga per merek hanya untuk Splicer."
    );
  }

  ensureSplicerBrandPrices_();

  /*
   * Frontend mengirim array melalui POST sebagai JSON string.
   * Tetap dukung array langsung agar kompatibel dengan versi lama.
   */
  let prices = [];

  if (Array.isArray(p.prices)) {
    prices = p.prices;
  } else if (typeof p.prices === "string" && p.prices.trim()) {
    try {
      prices = JSON.parse(p.prices);
    } catch (err) {
      throw new Error(
        "Format daftar harga Splicer tidak valid."
      );
    }
  }

  if(prices.length !== SPlicer_BRANDS.length){
    throw new Error(
      "Daftar harga Splicer tidak lengkap."
    );
  }

  prices.forEach(v => {

    const brand =
      String(v.brand || "").trim();

    if(!SPlicer_BRANDS.some(
      b => b.toLowerCase() === brand.toLowerCase()
    )){
      throw new Error(
        "Merek Splicer tidak valid: " + brand
      );
    }

    const raw =
      String(v.price ?? "")
        .replace(/[^\d]/g,"");

    if(raw === ""){
      throw new Error(
        "Harga untuk " + brand + " wajib diisi."
      );
    }

    const price =
      Number(raw);

    if(!Number.isFinite(price) || price < 0){
      throw new Error(
        "Harga untuk " + brand + " tidak valid."
      );
    }

    const row =
      rows_("MASTER_ALKER_PRICE")
        .find(x =>
          String(x.itemId || "") === itemId &&
          String(x.brand || "").trim().toLowerCase() === brand.toLowerCase()
        );

    if(row){

      updateById_(
        "MASTER_ALKER_PRICE",
        "priceId",
        row.priceId,
        {
          price: price,
          updatedAt: now_()
        }
      );

    }

  });

  audit_(
    u,
    "MASTER_BRAND_PRICE_UPDATE",
    itemId + " | " + item.itemName
  );

  return ok_({
    itemId: itemId,
    itemName: item.itemName,
    message:
      "Harga Splicer per merek berhasil diperbarui."
  });
}

function masterPrices_(u){

  requireRole_(u,[
    "SPV_GUDANG",
    "ADMIN"
  ]);

  ensureSplicerBrandPrices_();

  return rows_("MASTER_ALKER")
    .filter(
      x =>
        String(x.active || "Y")
          .toUpperCase() === "Y"
    )
    .map(
      x => ({
        itemId: x.itemId,
        itemName: x.itemName,
        category: x.category,
        unit: x.unit || "UNIT",
        price: Number(x.standardPrice || 0),
        spec: x.spec || "",
        lokers: x.lokers || "",
        active: x.active,
        priceMode: isSplicer_(x.itemName)
          ? "BY_BRAND"
          : "STANDARD",
        brands: isSplicer_(x.itemName)
          ? masterBrandPrices_(u, x.itemId)
          : []
      })
    );
}

/**
 * ==========================================
 * UPDATE HARGA MASTER ALKER
 * ==========================================
 *
 * Harga master hanya dapat diubah
 * oleh GUDANG / ADMIN.
 *
 * Perubahan ini HANYA mengubah
 * MASTER_ALKER.standardPrice.
 *
 * INVENTORY yang sudah ada TIDAK ikut berubah.
 */
function updateMasterPrice_(u,p){

  requireRole_(u,[
    "SPV_GUDANG",
    "ADMIN"
  ]);


  const itemId =
    String(
      p.itemId || ""
    ).trim();


  if(!itemId){

    throw new Error(
      "ID ALKER tidak ditemukan."
    );

  }


  /*
   * Harga harus berupa angka.
   */

  const rawPrice =
    String(
      p.price ?? ""
    ).replace(
      /[^\d]/g,
      ""
    );


  if(!rawPrice){

    throw new Error(
      "Harga ALKER wajib diisi."
    );

  }


  const price =
    Number(rawPrice);


  if(
    !Number.isFinite(price) ||
    price < 0
  ){

    throw new Error(
      "Harga ALKER tidak valid."
    );

  }


  /*
   * Cari master ALKER.
   */

  const item =
    rows_(
      "MASTER_ALKER"
    ).find(
      x =>
        String(x.itemId) ===
        itemId
    );


  if(!item){

    throw new Error(
      "Master ALKER tidak ditemukan."
    );

  }


  if(isSplicer_(item.itemName)){

    throw new Error(
      "Splicer menggunakan harga per merek. Gunakan menu Harga per Merek."
    );

  }


  const oldPrice =
    Number(
      item.standardPrice || 0
    );


  /*
   * Update hanya harga master.
   */

  updateById_(
    "MASTER_ALKER",
    "itemId",
    itemId,
    {

      standardPrice:
        price,

      updatedAt:
        now_()

    }
  );


  /*
   * Catat perubahan.
   */

  audit_(
    u,
    "MASTER_PRICE_UPDATE",
    itemId +
    " : " +
    item.itemName +
    " | " +
    oldPrice +
    " -> " +
    price
  );


  return ok_({

    itemId:
      itemId,

    itemName:
      item.itemName,

    oldPrice:
      oldPrice,

    standardPrice:
      price,

    message:
      "Harga master ALKER berhasil diperbarui."

  });

}
// Placeholder for explicit return transaction. Kept separate so later approval can be expanded.
/*************************************************
 * PENGAJUAN PENGEMBALIAN ALKER
 *
 * TEKNISI
 *
 * ALUR:
 * TEKNISI
 *    ↓
 * MENUNGGU VERIFIKASI
 *    ↓
 * SPV GUDANG
 *
 * INVENTORY BELUM DIPINDAHKAN KE GUDANG
 *************************************************/

function returnItem_(u,p){

  requireRole_(
    u,
    ["TEKNISI"]
  );

  ensureReturnsSheet_();


  const inventoryId =
    String(
      p.inventoryId || ""
    ).trim();


  if(!inventoryId){

    throw new Error(
      "Inventory tidak ditemukan."
    );

  }


  /*
   * ==========================================
   * CARI INVENTORY MILIK TEKNISI
   * ==========================================
   */

  const inv =
    rows_("INVENTORY")
      .find(
        x =>
          x.inventoryId ===
            inventoryId &&

          x.holderId ===
            u.userId
      );


  if(!inv){

    throw new Error(
      "ALKER tidak ditemukan atau bukan tanggung jawab Anda."
    );

  }


  /*
   * ==========================================
   * CEK STATUS
   * ==========================================
   */

  if(
    inv.status ===
    "PENGEMBALIAN"
  ){

    throw new Error(
      "ALKER ini sudah menunggu verifikasi Gudang."
    );

  }


  if(
    inv.location !==
    "TEKNISI"
  ){

    throw new Error(
      "ALKER ini tidak sedang berada pada teknisi."
    );

  }


  /*
   * ==========================================
   * CEK PENGEMBALIAN AKTIF
   * ==========================================
   */

  const existing =
    rows_("RETURNS")
      .find(
        x =>
          x.inventoryId ===
            inventoryId &&

          (
            x.status ===
              "MENUNGGU VERIFIKASI" ||

            x.status ===
              "REVISI"
          )
      );


  if(existing){

    throw new Error(
      "Pengembalian ALKER ini masih dalam proses."
    );

  }


  /*
   * ==========================================
   * DATA
   * ==========================================
   */

  const condition =
    String(
      p.condition ||
      "BAIK"
    ).trim();


  const note =
    String(
      p.note ||
      ""
    ).trim();


  if(!p.photo){

    throw new Error(
      "Foto ALKER saat pengembalian wajib diupload."
    );

  }


  /*
   * FOTO SERIAL OPSIONAL
   */

  const returnId =
    id_("RET");


  /*
   * ==========================================
   * FOLDER FOTO
   * ==========================================
   */

  let photoFolder = null;

  try{

    const alkerFolder =
      getAlkerFolder_(
        inv.itemName
      );

    photoFolder =
      getTechnicianFolder_(
        alkerFolder,
        u.name,
        inv.serialNumber
      );

  }catch(err){

    /*
     * Jika struktur folder belum tersedia,
     * tetap lanjut simpan ke folder utama.
     */

    photoFolder = null;

  }


  /*
   * ==========================================
   * SIMPAN FOTO
   * ==========================================
   */

  const returnPhotoUrl =
    savePhoto_(
      p.photo,
      "FOTO_PENGEMBALIAN_" +
      returnId +
      ".jpg",
      photoFolder
    );


  const returnSerialPhotoUrl =
    p.serialPhoto
      ? savePhoto_(
          p.serialPhoto,
          "FOTO_SERIAL_PENGEMBALIAN_" +
          returnId +
          ".jpg",
          photoFolder
        )
      : "";


  if(!returnPhotoUrl){

    throw new Error(
      "Foto pengembalian gagal disimpan."
    );

  }


  /*
   * ==========================================
   * SIMPAN TRANSAKSI RETURNS
   * ==========================================
   */

  const data = {

    returnId:
      returnId,

    inventoryId:
      inv.inventoryId,

    itemId:
      inv.itemId,

    itemName:
      inv.itemName,

    technicianId:
      inv.holderId,

    technician:
      inv.holder,

    loker:
      inv.loker,

    condition:
      condition,

    note:
      note,

    photoUrl:
      returnPhotoUrl,

    serialPhotoUrl:
      returnSerialPhotoUrl,

    status:
      "MENUNGGU VERIFIKASI",

    date:
      now_(),

    actor:
      u.name,

    reviewNote:
      "",

    reviewedAt:
      "",

    reviewedBy:
      ""

  };


  append_(
    "RETURNS",
    data
  );


  /*
   * ==========================================
   * LOCK INVENTORY
   *
   * BELUM PINDAH KE GUDANG
   * ==========================================
   */

  updateById_(
    "INVENTORY",
    "inventoryId",
    inv.inventoryId,
    {

      status:
        "PENGEMBALIAN",

      updatedAt:
        now_()

    }
  );


  /*
   * ==========================================
   * AUDIT
   * ==========================================
   */

  audit_(
    u,
    "RETURN_SUBMIT",
    inv.inventoryId +
    " -> MENUNGGU VERIFIKASI"
  );


  return ok_({

    returnId:
      returnId,

    message:
      "Pengembalian berhasil diajukan dan menunggu verifikasi Gudang."

  });

}
/*************************************************
 * VERIFIKASI PENGEMBALIAN
 *
 * SPV GUDANG / ADMIN
 *
 * APPROVE:
 * INVENTORY -> GUDANG / READY
 *
 * REVISION:
 * INVENTORY -> kembali DIPAKAI
 *************************************************/

function returnDecision_(u,p){

  requireRole_(
    u,
    [
      "SPV_GUDANG",
      "ADMIN"
    ]
  );

  ensureReturnsSheet_();


  const returnId =
    String(
      p.returnId || ""
    ).trim();


  if(!returnId){

    throw new Error(
      "ID pengembalian tidak ditemukan."
    );

  }


  const ret =
    rows_("RETURNS")
      .find(
        x =>
          x.returnId ===
          returnId
      );


  if(!ret){

    throw new Error(
      "Data pengembalian tidak ditemukan."
    );

  }


  if(
    ret.status !==
    "MENUNGGU VERIFIKASI"
  ){

    throw new Error(
      "Pengembalian ini sudah diproses."
    );

  }


  const inv =
    rows_("INVENTORY")
      .find(
        x =>
          x.inventoryId ===
          ret.inventoryId
      );


  if(!inv){

    throw new Error(
      "Inventory asal tidak ditemukan."
    );

  }


  const decision =
    String(
      p.decision || ""
    )
      .trim()
      .toUpperCase();


  /*
   * ==========================================
   * TERIMA
   * ==========================================
   */

  if(
    decision ===
    "APPROVE"
  ){

    updateById_(
      "INVENTORY",
      "inventoryId",
      inv.inventoryId,
      {

        location:
          "GUDANG",

        loker:
          "GUDANG",

        holderId:
          "",

        holder:
          "",

        status:
          "READY",

        condition:
          ret.condition ||
          inv.condition,

        updatedAt:
          now_()

      }
    );


    updateById_(
      "RETURNS",
      "returnId",
      ret.returnId,
      {

        status:
          "DITERIMA GUDANG",

        reviewNote:
          p.note ||
          "Diterima Gudang.",

        reviewedAt:
          now_(),

        reviewedBy:
          u.name,

        actor:
          u.name

      }
    );


    audit_(
      u,
      "RETURN_APPROVE",
      inv.inventoryId +
      " -> GUDANG"
    );


    return ok_({

      message:
        "Pengembalian diterima. ALKER kembali menjadi stok Gudang."

    });

  }


  /*
   * ==========================================
   * REVISI
   * ==========================================
   */

  if(
    decision ===
    "REVISION"
  ){

    const note =
      String(
        p.note || ""
      ).trim();


    if(!note){

      throw new Error(
        "Alasan revisi wajib diisi."
      );

    }


    updateById_(
      "INVENTORY",
      "inventoryId",
      inv.inventoryId,
      {

        status:
          "DIPAKAI",

        updatedAt:
          now_()

      }
    );


    updateById_(
      "RETURNS",
      "returnId",
      ret.returnId,
      {

        status:
          "REVISI",

        reviewNote:
          note,

        reviewedAt:
          now_(),

        reviewedBy:
          u.name,

        actor:
          u.name

      }
    );


    audit_(
      u,
      "RETURN_REVISION",
      inv.inventoryId +
      " -> TEKNISI"
    );


    return ok_({

      message:
        "Pengembalian dikembalikan ke teknisi untuk diperbaiki."

    });

  }


  throw new Error(
    "Keputusan pengembalian tidak dikenal."
  );

}
// Add demo technicians from USERS if TEKNISI sheet is empty.
function ensureTechnicianMirror_(){
  if(rows_("TEKNISI").length===0){
    rows_("USERS").filter(x=>x.role==="TEKNISI").forEach(x=>append_("TEKNISI",{technicianId:x.userId,name:x.name,username:x.username,loker:x.loker,phone:"",status:"AKTIF",createdAt:x.createdAt}));
  }
}

function repairUsersPasswordHash() {
  const sh = sheet_("USERS");
  if (!sh) throw new Error("Sheet USERS tidak ditemukan.");

  const users = [
    ["admin", "admin123"],
    ["gudang", "gudang123"],
    ["leader", "leader123"],
    ["teknisi", "teknisi123"]
  ];

  const values = sh.getDataRange().getValues();
  const headers = HEADERS.USERS;
  const usernameCol = headers.indexOf("username");
  const hashCol = headers.indexOf("passwordHash");

  if (usernameCol < 0 || hashCol < 0) {
    throw new Error("Kolom username/passwordHash tidak ditemukan.");
  }

  let updated = 0;

  for (let i = 1; i < values.length; i++) {
    const username = String(values[i][usernameCol] || "").trim().toLowerCase();

    const found = users.find(x => x[0] === username);

    if (found) {
      sh.getRange(i + 1, hashCol + 1).setValue(hash_(found[1]));
      updated++;
    }
  }

  SpreadsheetApp.flush();

  Logger.log("Password hash berhasil diperbaiki: " + updated + " akun.");
}

/*************************************************
 * PHOTO PREVIEW
 *
 * Foto tetap PRIVATE di Google Drive.
 * Browser tidak membuka Google Drive langsung.
 *************************************************/

function photoPreview_(u,p){

  if(!u || !u.userId){

    throw new Error(
      "Sesi pengguna tidak valid."
    );

  }


  const photoUrl =
    String(
      p.photoUrl || ""
    ).trim();


  if(!photoUrl){

    throw new Error(
      "Foto tidak ditemukan."
    );

  }


  const fileId =
    extractDriveFileId_(
      photoUrl
    );


  if(!fileId){

    throw new Error(
      "ID file foto tidak valid."
    );

  }


  const file =
    DriveApp.getFileById(
      fileId
    );


  const blob =
    file.getBlob();


  const contentType =
    blob.getContentType();


  const base64 =
    Utilities.base64Encode(
      blob.getBytes()
    );


  return ok_({

    fileId:
      fileId,

    name:
      file.getName(),

    mimeType:
      contentType,

    dataUrl:
      "data:" +
      contentType +
      ";base64," +
      base64

  });

}
function extractDriveFileId_(url){

  const s =
    String(
      url || ""
    ).trim();


  if(!s){

    return "";

  }


  /*
   * Format:
   * https://drive.google.com/file/d/FILE_ID/view
   */

  let m =
    s.match(
      /\/file\/d\/([a-zA-Z0-9_-]+)/
    );


  if(m){

    return m[1];

  }


  /*
   * Format:
   * ?id=FILE_ID
   */

  m =
    s.match(
      /[?&]id=([a-zA-Z0-9_-]+)/
    );


  if(m){

    return m[1];

  }


  /*
   * Kalau suatu saat database
   * langsung menyimpan File ID.
   */

  if(
    /^[a-zA-Z0-9_-]{20,}$/.test(s)
  ){

    return s;

  }


  return "";

}
