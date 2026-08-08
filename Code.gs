const CONFIG = {
  SPREADSHEET_ID: "",          // kosong = gunakan spreadsheet yang terikat ke script
  DRIVE_FOLDER_ID: "",         // kosong = buat folder ALKER_CONTROL_FILES
  SESSION_HOURS: 12
};

const SHEETS = [
  "USERS","LOKERS","MASTER_ALKER","TEKNISI","INVENTORY","INITIAL_INVENTORY",
  "REQUESTS","RECEIVING","DISTRIBUTION","RETURNS","ISSUES","PROCUREMENT",
  "HISTORY","AUDIT"
];

const HEADERS = {
  USERS:["userId","username","passwordHash","name","role","loker","active","createdAt"],
  LOKERS:["lokerId","name","status","createdAt"],
  MASTER_ALKER:["itemId","itemName","category","unit","standardPrice","lokers","spec","active","createdAt"],
  TEKNISI:["technicianId","name","username","loker","phone","status","createdAt"],
  INVENTORY:["inventoryId","itemId","itemName","category","brand","type","serialNumber","price","condition","status","location","loker","holderId","holder","photoUrl","serialPhotoUrl","receivedAt","source","notes","updatedAt"],
  INITIAL_INVENTORY:["initialId","itemId","itemName","technicianId","technician","loker","brand","type","serialNumber","condition","price","photoUrl","serialPhotoUrl","note","status","date","reviewNote"],
  REQUESTS:["requestId","itemId","itemName","technicianId","technician","loker","requestType","qty","priority","reason","photoUrl","status","leaderDecision","warehouseDecision","date","updatedAt","note"],
  RECEIVING:["receivingId","itemId","itemName","qty","brand","type","serialNumber","price","supplier","reference","photoUrl","docPhotoUrl","note","status","date","actor"],
  DISTRIBUTION:["distributionId","inventoryId","itemId","itemName","technicianId","technician","loker","condition","note","status","date","actor"],
  RETURNS:["returnId","inventoryId","itemId","itemName","technicianId","technician","loker","condition","note","photoUrl","status","date","actor"],
  ISSUES:["issueId","inventoryId","itemId","itemName","technicianId","technician","loker","issueType","note","photoUrl","status","date","updatedAt"],
  PROCUREMENT:["procurementId","itemId","itemName","qty","estimate","priority","reason","status","requestId","date","updatedAt","actor"],
  HISTORY:["historyId","actorId","actor","action","description","date"],
  AUDIT:["auditId","actorId","actor","action","description","date"]
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
function hash_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8).map(b=>(b<0?b+256:b).toString(16).padStart(2,"0")).join("")}
function folder_(){
  if(CONFIG.DRIVE_FOLDER_ID)return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const it=DriveApp.getFoldersByName("ALKER_CONTROL_FILES"); return it.hasNext()?it.next():DriveApp.createFolder("ALKER_CONTROL_FILES");
}
function savePhoto_(data,name){
  if(!data||!String(data).startsWith("data:image"))return "";
  const m=String(data).match(/^data:(.*?);base64,(.*)$/); if(!m)return "";
  const blob=Utilities.newBlob(Utilities.base64Decode(m[2]),m[1],name||("foto_"+Date.now()+".jpg"));
  const f=folder_().createFile(blob); return f.getUrl();
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
function setupSystem(){
  const ss=ss_();
  SHEETS.forEach(n=>{
    let sh=ss.getSheetByName(n); if(!sh)sh=ss.insertSheet(n);
    if(sh.getLastRow()===0)sh.appendRow(HEADERS[n]);
    sh.setFrozenRows(1);
  });
  if(rows_("LOKERS").length===0)SEED_LOKERS.forEach((name,i)=>append_("LOKERS",{lokerId:id_("LOK"),name,status:"AKTIF",createdAt:now_()}));
  if(rows_("MASTER_ALKER").length===0)SEED_ITEMS.forEach(x=>append_("MASTER_ALKER",{itemId:x[0],itemName:x[1],category:x[2],unit:x[3],standardPrice:x[4],lokers:x[5],spec:x[6],active:x[7],createdAt:now_()}));
  if(rows_("USERS").length===0){
    SEED_USERS.forEach((x,i)=>append_("USERS",{userId:x[0],username:x[1],passwordHash:hash_(["admin123","gudang123","leader123","teknisi123"][i]),name:x[3],role:x[4],loker:x[5],active:"Y",createdAt:now_()}));
  }
  ensureTechnicianMirror_();
  SpreadsheetApp.flush();
  Logger.log("ALKER CONTROL siap.");
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
      case "initialSubmit":return initialSubmit_(u,p);
      case "initialPending":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("INITIAL_INVENTORY").filter(x=>x.status==="MENUNGGU VERIFIKASI"));
      case "initialDecision":return initialDecision_(u,p);
      case "requests":return ok_(requests_(u,p.scope));
      case "createRequest":return createRequest_(u,p);
      case "requestDecision":return requestDecision_(u,p);
      case "issues":return ok_(issues_(u,p.scope));
      case "reportIssue":return reportIssue_(u,p);
      case "returns":return ok_(returns_(u,p.scope));
      case "returnItem":return returnItem_(u,p);
      case "warehouse":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(warehouse_());
      case "receiving":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("RECEIVING"));
      case "receive":return receive_(u,p);
      case "distribution":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("DISTRIBUTION"));
      case "distribute":return distribute_(u,p);
      case "procurement":requireRole_(u,["SPV_GUDANG","ADMIN"]);return ok_(rows_("PROCUREMENT"));
      case "createProcurement":return createProcurement_(u,p);
      case "technicians":return technicians_(u,p.scope);
      case "addMasterItem":requireRole_(u,["ADMIN","SPV_GUDANG"]);return addMasterItem_(u,p);
      case "audit":requireRole_(u,["ADMIN"]);return ok_(rows_("AUDIT").slice(-500).reverse());
      default:throw new Error("Action tidak dikenal.");
    }
  }catch(err){return fail_(err.message||String(err))}
}
function login_(p){
  const us=rows_("USERS").find(x=>x.username===p.username&&x.active==="Y");
  if(!us||us.passwordHash!==hash_(p.password))throw new Error("Username atau password salah.");
  const token=Utilities.getUuid(), obj={token,userId:us.userId,name:us.name,role:us.role,loker:us.loker,exp:new Date(Date.now()+CONFIG.SESSION_HOURS*3600000).toISOString()};
  PropertiesService.getScriptProperties().setProperty("SESSION_"+token,JSON.stringify(obj));
  return ok_({session:obj});
}
function masters_(u){return {lokers:rows_("LOKERS").filter(x=>x.status==="AKTIF"),items:rows_("MASTER_ALKER").filter(x=>x.active==="Y")}}
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
  if(scope==="mine"||u.role==="TEKNISI")a=a.filter(x=>x.holderId===u.userId);
  else if(scope==="loker"&&u.role==="LEADER")a=a.filter(x=>x.loker===u.loker);
  return a;
}
function dashboard_(u){
  let inv=inventory_(u,u.role==="TEKNISI"?"mine":u.role==="LEADER"?"loker":"all");
  const totalValue=inv.reduce((s,x)=>s+Number(x.price||0),0);
  const cond={};inv.forEach(x=>cond[x.condition]=(cond[x.condition]||0)+1);
  const loc={};inv.forEach(x=>{const k=x.location||"UNKNOWN";if(!loc[k])loc[k]={name:k,count:0,value:0};loc[k].count++;loc[k].value+=Number(x.price||0)});
  const req=rows_("REQUESTS"), ini=rows_("INITIAL_INVENTORY"), pro=rows_("PROCUREMENT");
  const filter=(a)=>u.role==="TEKNISI"?a.filter(x=>x.technicianId===u.userId):u.role==="LEADER"?a.filter(x=>x.loker===u.loker):a;
  return {totalInventory:inv.length,inWarehouse:inv.filter(x=>x.location==="GUDANG").length,withTechnicians:inv.filter(x=>x.location==="TEKNISI").length,totalValue,conditions:cond,locations:Object.values(loc),pending:{
    "Inventory awal menunggu":filter(ini).filter(x=>x.status==="MENUNGGU VERIFIKASI").length,
    "Request menunggu":filter(req).filter(x=>/MENUNGGU/.test(x.status)).length,
    "Pengadaan aktif":pro.filter(x=>!/SELESAI|DITOLAK/.test(x.status)).length
  }};
}
function initialSubmit_(u,p){
  requireRole_(u,["TEKNISI"]);
  const item=rows_("MASTER_ALKER").find(x=>x.itemId===p.itemId);if(!item)throw new Error("Master ALKER tidak ditemukan.");
  const x={initialId:id_("INI"),itemId:item.itemId,itemName:item.itemName,technicianId:u.userId,technician:u.name,loker:u.loker,brand:p.brand,type:p.type,serialNumber:p.serialNumber,condition:p.condition,price:Number(p.price||item.standardPrice||0),photoUrl:savePhoto_(p.photo,"initial_"+Date.now()+".jpg"),serialPhotoUrl:savePhoto_(p.serialPhoto,"serial_"+Date.now()+".jpg"),note:p.note,status:"MENUNGGU VERIFIKASI",date:now_(),reviewNote:""};
  append_("INITIAL_INVENTORY",x);audit_(u,"INITIAL_SUBMIT",x.itemName+" untuk "+u.name);return ok_(x);
}
function initialDecision_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const a=rows_("INITIAL_INVENTORY").find(x=>x.initialId===p.initialId);if(!a)throw new Error("Data tidak ditemukan.");
  if(p.decision==="APPROVE"){
    const inv={inventoryId:id_("INV"),itemId:a.itemId,itemName:a.itemName,category:(rows_("MASTER_ALKER").find(x=>x.itemId===a.itemId)||{}).category||"",brand:a.brand,type:a.type,serialNumber:a.serialNumber,price:a.price,condition:a.condition,status:"DIPAKAI",location:"TEKNISI",loker:a.loker,holderId:a.technicianId,holder:a.technician,photoUrl:a.photoUrl,serialPhotoUrl:a.serialPhotoUrl,receivedAt:a.date,source:"INVENTORY AWAL",notes:a.note,updatedAt:now_()};
    append_("INVENTORY",inv);updateById_("INITIAL_INVENTORY","initialId",a.initialId,{status:"APPROVED",reviewNote:"Approved oleh "+u.name});audit_(u,"INITIAL_APPROVE",a.initialId+" -> "+inv.inventoryId);
  }else{updateById_("INITIAL_INVENTORY","initialId",a.initialId,{status:"REVISI",reviewNote:p.note||"Mohon perbaiki data"});audit_(u,"INITIAL_REVISION",a.initialId);}
  return ok_({message:"Berhasil"});
}
function requests_(u,scope){
  let a=rows_("REQUESTS");
  if(scope==="mine"||u.role==="TEKNISI")a=a.filter(x=>x.technicianId===u.userId);
  else if(scope==="loker"&&u.role==="LEADER")a=a.filter(x=>x.loker===u.loker);
  return a.reverse();
}
function createRequest_(u,p){
  requireRole_(u,["TEKNISI"]);
  const item=rows_("MASTER_ALKER").find(x=>x.itemId===p.itemId);if(!item)throw new Error("Alker tidak ditemukan.");
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
    const stock=rows_("INVENTORY").filter(i=>i.location==="GUDANG"&&i.itemId===x.itemId&&i.condition==="BAIK"&&i.status==="READY").length;
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
function returns_(u,scope){let a=rows_("RETURNS");if(scope==="mine"||u.role==="TEKNISI")a=a.filter(x=>x.technicianId===u.userId);else if(u.role==="LEADER")a=a.filter(x=>x.loker===u.loker);return a.reverse()}
function warehouse_(){
  const inv=rows_("INVENTORY").filter(x=>x.location==="GUDANG");
  return {items:inv,summary:{count:inv.length,value:inv.reduce((s,x)=>s+Number(x.price||0),0),requests:rows_("REQUESTS").filter(x=>/GUDANG|STOK KURANG/.test(x.status)).length,procurement:rows_("PROCUREMENT").filter(x=>!/SELESAI|DITOLAK/.test(x.status)).length}};
}
function receive_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const item=rows_("MASTER_ALKER").find(x=>x.itemId===p.itemId);if(!item)throw new Error("Master ALKER tidak ditemukan.");
  const qty=Math.max(1,Number(p.qty||1)), rid=id_("RCV");
  for(let i=0;i<qty;i++)append_("INVENTORY",{inventoryId:id_("INV"),itemId:item.itemId,itemName:item.itemName,category:item.category,brand:p.brand,type:p.type,serialNumber:qty===1?p.serialNumber:(p.serialNumber?`${p.serialNumber}-${i+1}`:""),price:Number(p.price||item.standardPrice||0),condition:"BAIK",status:"READY",location:"GUDANG",loker:"GUDANG",holderId:"",holder:"",photoUrl:savePhoto_(p.photo,"receive_"+rid+"_"+i+".jpg"),serialPhotoUrl:"",receivedAt:now_(),source:"BARANG MASUK",notes:p.note,updatedAt:now_()});
  append_("RECEIVING",{receivingId:rid,itemId:item.itemId,itemName:item.itemName,qty,brand:p.brand,type:p.type,serialNumber:p.serialNumber,price:Number(p.price||0),supplier:p.supplier,reference:p.reference,photoUrl:savePhoto_(p.photo,"receiving_"+rid+".jpg"),docPhotoUrl:savePhoto_(p.docPhoto,"document_"+rid+".jpg"),note:p.note,status:"SELESAI",date:now_(),actor:u.name});
  audit_(u,"RECEIVING",rid+" "+item.itemName+" qty "+qty);return ok_({receivingId:rid});
}
function distribute_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const inv=rows_("INVENTORY").find(x=>x.inventoryId===p.inventoryId&&x.location==="GUDANG"&&x.status==="READY");if(!inv)throw new Error("Inventory tidak tersedia di Gudang.");
  const t=rows_("USERS").find(x=>x.userId===p.technicianId&&x.role==="TEKNISI");if(!t)throw new Error("Teknisi tidak ditemukan.");
  updateById_("INVENTORY","inventoryId",inv.inventoryId,{location:"TEKNISI",loker:t.loker,holderId:t.userId,holder:t.name,condition:p.condition||"BAIK",status:"DIPAKAI",updatedAt:now_()});
  const did=id_("DST");append_("DISTRIBUTION",{distributionId:did,inventoryId:inv.inventoryId,itemId:inv.itemId,itemName:inv.itemName,technicianId:t.userId,technician:t.name,loker:t.loker,condition:p.condition||"BAIK",note:p.note,status:"SELESAI",date:now_(),actor:u.name});
  audit_(u,"DISTRIBUTION",inv.inventoryId+" -> "+t.name);return ok_({distributionId:did});
}
function createProcurement_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const item=rows_("MASTER_ALKER").find(x=>x.itemId===p.itemId);if(!item)throw new Error("Alker tidak ditemukan.");
  const x={procurementId:id_("PO"),itemId:item.itemId,itemName:item.itemName,qty:Number(p.qty||1),estimate:Number(p.estimate||0),priority:p.priority,reason:p.reason,status:"MENUNGGU APPROVAL PEMBELIAN",requestId:p.requestId||"",date:now_(),updatedAt:now_(),actor:u.name};
  append_("PROCUREMENT",x);audit_(u,"PROCUREMENT_CREATE",x.procurementId+" "+x.itemName);return ok_(x);
}
function addMasterItem_(u,p){
  const x={itemId:id_("ALK"),itemName:p.itemName,category:p.category,unit:p.unit||"UNIT",standardPrice:Number(p.price||0),lokers:p.lokers||"",spec:p.spec||"",active:"Y",createdAt:now_()};
  append_("MASTER_ALKER",x);audit_(u,"MASTER_ITEM_ADD",x.itemName);return ok_(x);
}

// Placeholder for explicit return transaction. Kept separate so later approval can be expanded.
function returnItem_(u,p){
  requireRole_(u,["SPV_GUDANG","ADMIN"]);
  const inv=rows_("INVENTORY").find(x=>x.inventoryId===p.inventoryId);
  if(!inv)throw new Error("Inventory tidak ditemukan.");
  updateById_("INVENTORY","inventoryId",inv.inventoryId,{location:"GUDANG",loker:"GUDANG",holderId:"",holder:"",status:"READY",condition:p.condition||inv.condition,updatedAt:now_()});
  const rid=id_("RET");
  append_("RETURNS",{returnId:rid,inventoryId:inv.inventoryId,itemId:inv.itemId,itemName:inv.itemName,technicianId:inv.holderId,technician:inv.holder,loker:inv.loker,condition:p.condition||inv.condition,note:p.note,photoUrl:savePhoto_(p.photo,"return_"+rid+".jpg"),status:"SELESAI",date:now_(),actor:u.name});
  audit_(u,"RETURN",inv.inventoryId+" -> GUDANG"); return ok_({returnId:rid});
}

// Add demo technicians from USERS if TEKNISI sheet is empty.
function ensureTechnicianMirror_(){
  if(rows_("TEKNISI").length===0){
    rows_("USERS").filter(x=>x.role==="TEKNISI").forEach(x=>append_("TEKNISI",{technicianId:x.userId,name:x.name,username:x.username,loker:x.loker,phone:"",status:"AKTIF",createdAt:x.createdAt}));
  }
}
