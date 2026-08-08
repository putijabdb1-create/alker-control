const API_URL = "https://script.google.com/macros/s/AKfycbwjCqfw5duO4yJh5lO4sA0UmZiIcEj437TgFNBuGJ71o-yj0lZnaWstO8NTlNXWmU2DsA/exec";
let session = null;
let cache = {};

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const badge = (s='') => {
  const x = String(s).toUpperCase();
  let c='gray'; if(/BAIK|APPROVED|SELESAI|READY|AKTIF/.test(x)) c='green'; else if(/MENUNGGU|REVISI|PENDING/.test(x)) c='yellow'; else if(/HILANG|DITOLAK/.test(x)) c='red'; else if(/SERVICE|PROSES|DISTRIBUSI/.test(x)) c='blue'; else if(/RUSAK/.test(x)) c='red';
  return `<span class="badge ${c}">${esc(s)}</span>`;
};

async function api(action, data={}) {
  if(API_URL.includes("PASTE_")) throw new Error("API_URL belum diisi di app.js");
  const body = new URLSearchParams({action, ...data});
  if(session?.token) body.set("token", session.token);
  const res = await fetch(API_URL,{method:"POST",body});
  const json = await res.json();
  if(!json.ok) throw new Error(json.message || "Terjadi kesalahan");
  return json;
}
async function fileToBase64(file, max=1200){
  if(!file) return "";
  const img = await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=URL.createObjectURL(file)});
  const scale=Math.min(1,max/Math.max(img.width,img.height));
  const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg",.78);
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function openModal(title,html){$("modalTitle").textContent=title;$("modalBody").innerHTML=html;$("modal").classList.remove("hidden")}
function closeModal(){$("modal").classList.add("hidden")}
window.closeModal=closeModal;

$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault(); $("loginMsg").textContent="Memproses...";
  try{const r=await api("login",{username:$("username").value.trim(),password:$("password").value});session=r.session;localStorage.setItem("alker_session",JSON.stringify(session));initApp()}
  catch(err){$("loginMsg").textContent=err.message}
});
$("logoutBtn").onclick=()=>{localStorage.removeItem("alker_session");session=null;$("mainView").classList.add("hidden");$("loginView").classList.remove("hidden")};
$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");

async function initApp(){
  $("loginView").classList.add("hidden");
  $("mainView").classList.remove("hidden");
  const name=session?.name||"User";
  const role=session?.role||"ROLE";
  const loker=session?.loker||"-";
  $("topUser").textContent=name;
  if($("topUserRole")) $("topUserRole").textContent=`${role} • ${loker}`;
  if($("topUserAvatar")) $("topUserAvatar").textContent=name.slice(0,1).toUpperCase();
  $("sideName").textContent=name;
  $("sideRole").textContent=role;
  $("sideLoker").textContent=loker;
  $("avatar").textContent=name.slice(0,1).toUpperCase();
  buildNav();
  await route("dashboard");
}
function buildNav(){
  const r=session?.role||"";
  const groups=[{title:"UTAMA",items:[["dashboard","⌂","Dashboard"]]}];

  if(r==="TEKNISI"){
    groups.push(
      {title:"ALKER SAYA",items:[
        ["myinventory","▣","Alker Saya"],
        ["initialReport","▤","Laporan Alker"],
        ["requests","＋","Request Alker"],
        ["issues","!","Rusak / Hilang"],
        ["returns","↩","Pengembalian"]
      ]}
    );
  }else if(r==="LEADER"){
    groups.push(
      {title:"TIM",items:[
        ["team","♙","Teknisi Loker"],
        ["teamrequests","✓","Validasi Request"],
        ["teaminventory","▣","Inventory Loker"]
      ]}
    );
  }else if(r==="SPV_GUDANG"){
    groups.push(
      {title:"GUDANG",items:[
        ["warehouse","▦","Stok Gudang"],
        ["initial","✓","Verifikasi Inventory"],
        ["requests","＋","Request Teknisi"],
        ["receiving","↓","Barang Masuk"],
        ["distribution","↑","Distribusi"],
        ["returns","↩","Pengembalian"]
      ]},
      {title:"PENGADAAN",items:[["procurement","▤","Pengadaan"]]},
      {title:"INVENTORY",items:[["allinventory","▣","Seluruh Inventory"]]}
    );
  }else if(r==="ADMIN"){
    groups.push(
      {title:"CONTROL",items:[
        ["master","⚙","Master Data"],
        ["allinventory","▣","Seluruh Inventory"],
        ["warehouse","▦","Stok Gudang"],
        ["procurement","▤","Pengadaan"],
        ["audit","◷","Audit Trail"]
      ]}
    );
  }else{
    groups.push({title:"SISTEM",items:[["dashboard","⌂","Dashboard"]]});
  }

  $("nav").innerHTML=groups.map(g=>`
    <div class="nav-group">
      <div class="nav-group-title">${g.title}</div>
      ${g.items.map(x=>`<button type="button" class="nav-btn" data-route="${x[0]}">
        <span class="nav-icon">${x[1]}</span><span>${x[2]}</span>
      </button>`).join("")}
    </div>`).join("");

  const buttons=[...document.querySelectorAll(".nav-btn")];
  buttons.forEach(b=>b.onclick=async()=>{
    buttons.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    await route(b.dataset.route);
    $("sidebar").classList.remove("open");
  });
  const first=buttons.find(b=>b.dataset.route==="dashboard");
  if(first) first.classList.add("active");
}
async function route(name){
  const page=$("page");
  if(!page){
    console.error("Elemen #page tidak ditemukan.");
    return;
  }

  page.innerHTML=`<div class="card"><strong>Memuat halaman...</strong><p class="muted">${esc(name)}</p></div>`;

  try{
    if(name==="dashboard") return await renderDashboard();
    if(name==="myinventory") return await renderMyInventory();
    if(name==="initialReport") return await renderInitialReport();
    if(name==="requests") return await renderRequests();
    if(name==="issues") return await renderIssues();
    if(name==="returns") return await renderReturns();
    if(name==="team") return await renderTeam();
    if(name==="teamrequests") return await renderTeamRequests();
    if(name==="teaminventory") return await renderTeamInventory();
    if(name==="warehouse") return await renderWarehouse();
    if(name==="initial") return await renderInitial();
    if(name==="receiving") return await renderReceiving();
    if(name==="distribution") return await renderDistribution();
    if(name==="procurement") return await renderProcurement();
    if(name==="allinventory") return await renderAllInventory();
    if(name==="master") return await renderMaster();
    if(name==="audit") return await renderAudit();

    page.innerHTML=`<div class="card"><strong>Menu belum tersedia</strong><p class="muted">Route: ${esc(name)}</p></div>`;
  }catch(e){
    console.error("ROUTE ERROR:",name,e);
    page.innerHTML=`<div class="card"><strong>Gagal memuat halaman</strong><p class="danger-text">${esc(e.message||e)}</p><button class="btn secondary" onclick="route('${esc(name)}')">Coba Lagi</button></div>`;
  }
}

async function dashboardData(){return api("dashboard")}
async function renderDashboard(){
  $("page").innerHTML=`<div class="page-head"><div><h2>Dashboard</h2><div class="muted">${esc(session.loker||"Semua")} • ${esc(session.name)}</div></div></div><div id="dashBody"></div>`;
  const r=await dashboardData(), d=r.data;
  $("dashBody").innerHTML=`
  <div class="grid cards">
    ${metric("Total Inventory",d.totalInventory,"unit")}
    ${metric("Di Gudang",d.inWarehouse,"unit")}
    ${metric("Di Teknisi",d.withTechnicians,"unit")}
    ${metric("Nilai Aset",money(d.totalValue),"inventory")}
  </div>
  <div style="height:15px"></div>
  <div class="grid two">
    <div class="card"><h3>Ringkasan Kondisi</h3>${Object.entries(d.conditions||{}).map(([k,v])=>`<div class="kpi-line"><span>${esc(k)}</span><strong>${v}</strong></div>`).join("")||'<div class="empty">Belum ada data.</div>'}</div>
    <div class="card"><h3>Aktivitas Menunggu</h3>${Object.entries(d.pending||{}).map(([k,v])=>`<div class="kpi-line"><span>${esc(k)}</span><strong>${v}</strong></div>`).join("")||'<div class="empty">Tidak ada.</div>'}</div>
  </div>
  <div style="height:15px"></div>
  <div class="card"><h3>Posisi Inventory</h3><div class="table-wrap"><table class="table"><thead><tr><th>Loker/Lokasi</th><th>Jumlah</th><th>Nilai</th></tr></thead><tbody>${(d.locations||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${x.count}</td><td>${money(x.value)}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function metric(a,b,c){return `<div class="card metric"><div class="label">${a}</div><div class="value">${b}</div><div class="sub">${c}</div></div>`}

async function renderMyInventory(){
  $("page").innerHTML=`<div class="page-head"><div><h2>Alker Saya</h2><p class="muted">Inventory yang secara resmi menjadi tanggung jawab Anda.</p></div><div class="actions"><button class="btn primary" onclick="showInitialForm()">+ Input Alker Awal</button></div></div><div id="myInv"></div>`;
  const r=await api("inventory",{scope:"mine"});renderInventoryTable($("myInv"),r.data,"mine");
}
function renderInventoryTable(el,data,scope){
  el.innerHTML=`<div class="card" style="margin-bottom:15px"><div class="detail-grid">
  <div class="detail-box"><span>Item</span><strong>${data.length}</strong></div>
  <div class="detail-box"><span>Nilai</span><strong>${money(data.reduce((a,x)=>a+Number(x.price||0),0))}</strong></div>
  <div class="detail-box"><span>Masalah</span><strong>${data.filter(x=>/RUSAK|HILANG/.test(x.condition||"")).length}</strong></div></div></div>
  <div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Alker</th><th>Merk/Type</th><th>SN</th><th>Lokasi</th><th>Pemegang</th><th>Kondisi</th><th>Nilai</th><th></th></tr></thead><tbody>
  ${data.map(x=>`<tr><td>${esc(x.inventoryId)}</td><td><strong>${esc(x.itemName)}</strong></td><td>${esc(x.brand)} / ${esc(x.type)}</td><td>${esc(x.serialNumber||"-")}</td><td>${esc(x.location)}</td><td>${esc(x.holder||"-")}</td><td>${badge(x.condition)}</td><td>${money(x.price)}</td><td><button class="btn secondary" onclick='showInventoryDetail(${JSON.stringify(x)})'>Detail</button></td></tr>`).join("")||'<tr><td colspan="9"><div class="empty">Belum ada inventory.</div></td></tr>'}
  </tbody></table></div>`;
}
window.showInventoryDetail=x=>openModal("Detail Inventory",`<div class="detail-grid">${[['ID',x.inventoryId],['Alker',x.itemName],['Kategori',x.category],['Merk',x.brand],['Type',x.type],['Serial Number',x.serialNumber],['Lokasi',x.location],['Pemegang',x.holder],['Loker',x.loker],['Kondisi',x.condition],['Status',x.status],['Nilai',money(x.price)]].map(a=>`<div class="detail-box"><span>${esc(a[0])}</span><strong>${esc(a[1]||"-")}</strong></div>`).join("")}</div>${x.photoUrl?`<p><a href="${esc(x.photoUrl)}" target="_blank">Buka foto</a></p>`:""}<div class="actions"><button class="btn warning" onclick="closeModal();showIssueForm('${esc(x.inventoryId)}')">Lapor Masalah</button></div>`);

async function renderInitialReport(){
  $("page").innerHTML=`
    <div class="page-head">
      <div>
        <h2>Laporan Alker</h2>
        <p class="muted">Laporkan kondisi ALKER yang Anda pegang. Data awal akan diverifikasi Gudang sebelum menjadi inventory resmi.</p>
      </div>
      <div class="actions">
        <button class="btn primary" onclick="showInitialForm()">+ Tambah Laporan</button>
      </div>
    </div>
    <div id="reportBody"></div>`;
  try{
    const r=await api("inventory",{scope:"mine"});
    const issues=await api("issues",{scope:"mine"});
    const items=r.data||[];
    const problems=(issues.data||[]).filter(x=>/MENUNGGU|PROSES/.test(String(x.status||"")));
    $("reportBody").innerHTML=`
      <div class="grid cards">
        ${metric("ALKER Tercatat",items.length,"tanggung jawab")}
        ${metric("Kondisi Bermasalah",items.filter(x=>/RUSAK|HILANG/.test(String(x.condition||""))).length,"perlu perhatian")}
        ${metric("Laporan Masalah",problems.length,"menunggu proses")}
      </div>
      <div style="height:15px"></div>
      <div class="card">
        <div class="section-head"><div><h3>ALKER Saya</h3><p class="muted">Gunakan tombol detail untuk melihat kondisi dan melaporkan masalah.</p></div></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>ALKER</th><th>Merk / Type</th><th>SN</th><th>Kondisi</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${items.map(x=>`<tr>
                <td><strong>${esc(x.itemName)}</strong><div class="small muted">${esc(x.inventoryId)}</div></td>
                <td>${esc(x.brand||"-")} / ${esc(x.type||"-")}</td>
                <td>${esc(x.serialNumber||"-")}</td>
                <td>${badge(x.condition)}</td>
                <td>${badge(x.status)}</td>
                <td><button class="btn secondary" onclick='showInventoryDetail(${JSON.stringify(x)})'>Detail / Lapor Kondisi</button></td>
              </tr>`).join("")||'<tr><td colspan="6"><div class="empty">Belum ada ALKER yang disetujui Gudang.</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  }catch(e){
    $("reportBody").innerHTML=`<div class="card"><strong>Gagal memuat laporan</strong><p class="danger-text">${esc(e.message)}</p></div>`;
  }
}

async function renderRequests(){
  $("page").innerHTML=`<div class="page-head"><div><h2>Request Alker</h2><p class="muted">Request baru atau penggantian mengikuti alur validasi.</p></div><button class="btn primary" onclick="showRequestForm()">+ Request</button></div><div id="req"></div>`;
  const r=await api("requests",{scope:"mine"});$("req").innerHTML=tableRequests(r.data);
}
function tableRequests(a){return `<div class="table-wrap"><table class="table"><thead><tr><th>Request</th><th>Teknisi</th><th>Alker</th><th>Jenis</th><th>Qty</th><th>Status</th><th>Tanggal</th><th></th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.requestId)}</td><td>${esc(x.technician)}</td><td>${esc(x.itemName)}</td><td>${esc(x.requestType)}</td><td>${x.qty}</td><td>${badge(x.status)}</td><td>${esc(x.date)}</td><td><button class="btn secondary" onclick='showRequestDetail(${JSON.stringify(x)})'>Detail</button></td></tr>`).join("")||'<tr><td colspan="8"><div class="empty">Belum ada request.</div></td></tr>'}</tbody></table></div>`}
window.showRequestDetail=x=>openModal("Detail Request",`<div class="detail-grid">${[['Request',x.requestId],['Teknisi',x.technician],['Loker',x.loker],['Alker',x.itemName],['Jenis',x.requestType],['Qty',x.qty],['Status',x.status],['Tanggal',x.date]].map(a=>`<div class="detail-box"><span>${esc(a[0])}</span><strong>${esc(a[1])}</strong></div>`).join("")}</div><div class="card" style="margin-top:12px"><strong>Alasan</strong><p>${esc(x.reason||"-")}</p></div>`);

window.showRequestForm=async()=>{
  const r=await api("masters");
  openModal("Request ALKER",`<form id="requestForm"><div class="form-grid">
  <label>Alker<select name="itemId" required>${r.data.items.map(x=>`<option value="${esc(x.itemId)}">${esc(x.itemName)} — ${esc(x.category)}</option>`).join("")}</select></label>
  <label>Jenis Request<select name="requestType"><option>BARU</option><option>PENGGANTIAN</option></select></label>
  <label>Qty<input name="qty" type="number" min="1" value="1" required></label>
  <label>Prioritas<select name="priority"><option>NORMAL</option><option>TINGGI</option><option>MENDESAK</option></select></label>
  <label class="full-col">Alasan<textarea name="reason" required></textarea></label>
  <label class="full-col">Foto pendukung<input name="photo" type="file" accept="image/*" capture="environment"></label></div><div class="actions" style="margin-top:15px"><button class="btn primary">Kirim Request</button></div></form>`);
  $("requestForm").onsubmit=async e=>{e.preventDefault();const f=e.target;const photo=await fileToBase64(f.photo.files[0]);try{await api("createRequest",{itemId:f.itemId.value,requestType:f.requestType.value,qty:f.qty.value,priority:f.priority.value,reason:f.reason.value,photo});closeModal();toast("Request berhasil dikirim");renderRequests()}catch(err){toast(err.message)}};
};

window.showInitialForm=async()=>{
  const r=await api("masters");
  openModal("Input Alker yang Saat Ini Dipegang",`<p class="muted">Data ini masuk verifikasi Gudang. Belum menjadi inventory resmi sampai disetujui.</p><form id="initialForm"><div class="form-grid">
  <label>Alker<select name="itemId" required>${r.data.items.map(x=>`<option value="${esc(x.itemId)}">${esc(x.itemName)}</option>`).join("")}</select></label>
  <label>Merk<input name="brand"></label><label>Type<input name="type"></label><label>Serial Number<input name="serialNumber"></label>
  <label>Kondisi<select name="condition"><option>BAIK</option><option>RUSAK RINGAN</option><option>RUSAK BERAT</option></select></label>
  <label>Nilai/ Harga<input name="price" type="number" min="0"></label>
  <label class="full-col">Keterangan<textarea name="note"></textarea></label>
  <label>Foto Alker<input name="photo" type="file" accept="image/*" capture="environment"></label>
  <label>Foto Serial/Label<input name="serialPhoto" type="file" accept="image/*" capture="environment"></label>
  </div><div class="actions" style="margin-top:15px"><button class="btn primary">Submit Verifikasi</button></div></form>`);
  $("initialForm").onsubmit=async e=>{e.preventDefault();const f=e.target;try{await api("initialSubmit",{itemId:f.itemId.value,brand:f.brand.value,type:f.type.value,serialNumber:f.serialNumber.value,condition:f.condition.value,price:f.price.value,note:f.note.value,photo:await fileToBase64(f.photo.files[0]),serialPhoto:await fileToBase64(f.serialPhoto.files[0])});closeModal();toast("Inventory dikirim ke Gudang");}catch(err){toast(err.message)}};
};

async function renderIssues(){
  $("page").innerHTML=`<div class="page-head"><div><h2>Rusak / Hilang</h2><p class="muted">Laporkan kondisi ALKER yang menjadi tanggung jawab Anda.</p></div></div><div id="issues"></div>`;
  const r=await api("issues",{scope:"mine"});$("issues").innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Tanggal</th><th>Inventory</th><th>Alker</th><th>Jenis</th><th>Keterangan</th><th>Status</th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.inventoryId)}</td><td>${esc(x.itemName)}</td><td>${esc(x.issueType)}</td><td>${esc(x.note)}</td><td>${badge(x.status)}</td></tr>`).join("")||'<tr><td colspan="6"><div class="empty">Belum ada laporan.</div></td></tr>'}</tbody></table></div>`;
}
window.showIssueForm=async id=>{openModal("Lapor Rusak / Hilang",`<form id="issueForm"><div class="form-grid"><label>Inventory<input name="inventoryId" value="${esc(id)}" readonly></label><label>Jenis<select name="issueType"><option>RUSAK</option><option>HILANG</option></select></label><label class="full-col">Keterangan<textarea name="note" required></textarea></label><label class="full-col">Foto<input name="photo" type="file" accept="image/*" capture="environment"></label></div><div class="actions" style="margin-top:15px"><button class="btn danger">Kirim Laporan</button></div></form>`);$("issueForm").onsubmit=async e=>{e.preventDefault();const f=e.target;try{await api("reportIssue",{inventoryId:f.inventoryId.value,issueType:f.issueType.value,note:f.note.value,photo:await fileToBase64(f.photo.files[0])});closeModal();toast("Laporan dikirim");renderIssues()}catch(err){toast(err.message)}}};

async function renderReturns(){
  $("page").innerHTML=`<div class="page-head"><div><h2>Pengembalian</h2><p class="muted">Pengembalian membuat alat kembali ke kontrol Gudang setelah diverifikasi.</p></div></div><div id="returns"></div>`;
  const r=await api("returns",{scope:"mine"});$("returns").innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Tanggal</th><th>Inventory</th><th>Alker</th><th>Kondisi</th><th>Status</th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.inventoryId)}</td><td>${esc(x.itemName)}</td><td>${badge(x.condition)}</td><td>${badge(x.status)}</td></tr>`).join("")||'<tr><td colspan="5"><div class="empty">Belum ada pengembalian.</div></td></tr>'}</tbody></table></div>`;
}
async function renderHistory(){const r=await api("history",{scope:"mine"});$("page").innerHTML=`<div class="page-head"><div><h2>Riwayat</h2><p class="muted">Jejak aktivitas yang terkait dengan akun Anda.</p></div></div><div class="card"><div class="timeline">${r.data.map(x=>`<div class="timeline-item"><strong>${esc(x.action)}</strong><div>${esc(x.description)}</div><div class="small muted">${esc(x.date)} • ${esc(x.actor)}</div></div>`).join("")||'<div class="empty">Belum ada histori.</div>'}</div></div>`}

async function renderTeam(){
  $("page").innerHTML=`<div class="page-head"><div><h2>Teknisi Loker</h2><p class="muted">${esc(session.loker)}</p></div></div><div id="team"></div>`;
  const r=await api("technicians",{scope:"loker"});$("team").innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Teknisi</th><th>Loker</th><th>Inventory</th><th>Nilai</th><th>Masalah</th></tr></thead><tbody>${r.data.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.loker)}</td><td>${x.count}</td><td>${money(x.value)}</td><td>${x.issues}</td></tr>`).join("")}</tbody></table></div>`;
}
async function renderTeamInventory(){const r=await api("inventory",{scope:"loker"});$("page").innerHTML=`<div class="page-head"><div><h2>Inventory Loker</h2><p class="muted">${esc(session.loker)}</p></div></div><div id="teamInv"></div>`;renderInventoryTable($("teamInv"),r.data,"loker")}
async function renderTeamRequests(){const r=await api("requests",{scope:"loker"});$("page").innerHTML=`<div class="page-head"><div><h2>Validasi Request</h2><p class="muted">Validasi kebutuhan teknisi sebelum diteruskan ke Gudang.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Request</th><th>Teknisi</th><th>Alker</th><th>Jenis</th><th>Qty</th><th>Status</th><th></th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.requestId)}</td><td>${esc(x.technician)}</td><td>${esc(x.itemName)}</td><td>${esc(x.requestType)}</td><td>${x.qty}</td><td>${badge(x.status)}</td><td>${/MENUNGGU VALIDASI/.test(x.status)?`<button class="btn success" onclick="approveRequest('${esc(x.requestId)}')">Approve</button> <button class="btn danger" onclick="rejectRequest('${esc(x.requestId)}')">Tolak</button>`:""}</td></tr>`).join("")}</tbody></table></div>`}
window.approveRequest=async id=>{try{await api("requestDecision",{requestId:id,decision:"APPROVE"});toast("Request disetujui");renderTeamRequests()}catch(e){toast(e.message)}}
window.rejectRequest=async id=>{const note=prompt("Alasan penolakan:");if(note===null)return;try{await api("requestDecision",{requestId:id,decision:"REJECT",note});toast("Request ditolak");renderTeamRequests()}catch(e){toast(e.message)}}

async function renderWarehouse(){
  const r=await api("warehouse");$("page").innerHTML=`<div class="page-head"><div><h2>Stok Gudang</h2><p class="muted">Stok aktual yang berada di lokasi GUDANG.</p></div><button class="btn primary" onclick="showReceivingForm()">+ Barang Masuk</button></div><div class="grid cards">${metric("Item Gudang",r.summary.count,"unit")}${metric("Nilai Stok",money(r.summary.value),"inventory")}${metric("Request",r.summary.requests,"menunggu")}${metric("Pengadaan",r.summary.procurement,"aktif")}</div><div style="height:15px"></div><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Alker</th><th>Merk/Type</th><th>SN</th><th>Kondisi</th><th>Status</th><th>Nilai</th></tr></thead><tbody>${r.items.map(x=>`<tr><td>${esc(x.inventoryId)}</td><td>${esc(x.itemName)}</td><td>${esc(x.brand)} / ${esc(x.type)}</td><td>${esc(x.serialNumber||"-")}</td><td>${badge(x.condition)}</td><td>${badge(x.status)}</td><td>${money(x.price)}</td></tr>`).join("")||'<tr><td colspan="7"><div class="empty">Stok kosong.</div></td></tr>'}</tbody></table></div>`}
async function renderInitial(){const r=await api("initialPending");$("page").innerHTML=`<div class="page-head"><div><h2>Verifikasi Inventory Awal</h2><p class="muted">Periksa ALKER yang dilaporkan teknisi sebelum menjadi inventory resmi.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Teknisi</th><th>Loker</th><th>Alker</th><th>SN</th><th>Kondisi</th><th>Tanggal</th><th></th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.technician)}</td><td>${esc(x.loker)}</td><td>${esc(x.itemName)}</td><td>${esc(x.serialNumber||"-")}</td><td>${badge(x.condition)}</td><td>${esc(x.date)}</td><td><button class="btn success" onclick="initialDecision('${esc(x.initialId)}','APPROVE')">Approve</button> <button class="btn warning" onclick="initialDecision('${esc(x.initialId)}','REVISION')">Revisi</button></td></tr>`).join("")||'<tr><td colspan="7"><div class="empty">Tidak ada yang menunggu.</div></td></tr>'}</tbody></table></div>`}
window.initialDecision=async(id,decision)=>{let note="";if(decision==="REVISION"){note=prompt("Catatan revisi:")||"";if(!note)return}try{await api("initialDecision",{initialId:id,decision,note});toast("Berhasil diproses");renderInitial()}catch(e){toast(e.message)}}
async function renderReceiving(){const r=await api("receiving");$("page").innerHTML=`<div class="page-head"><div><h2>Barang Masuk Gudang</h2><p class="muted">Setiap barang baru yang diterima menjadi transaksi inventory resmi.</p></div><button class="btn primary" onclick="showReceivingForm()">+ Catat Barang Masuk</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Transaksi</th><th>Alker</th><th>Qty</th><th>Supplier</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.receivingId)}</td><td>${esc(x.itemName)}</td><td>${x.qty}</td><td>${esc(x.supplier)}</td><td>${esc(x.date)}</td><td>${badge(x.status)}</td></tr>`).join("")||'<tr><td colspan="6"><div class="empty">Belum ada penerimaan.</div></td></tr>'}</tbody></table></div>`}
window.showReceivingForm=async()=>{const r=await api("masters");openModal("Catat Barang Baru Masuk Gudang",`<form id="receivingForm"><div class="form-grid"><label>Alker<select name="itemId">${r.data.items.map(x=>`<option value="${esc(x.itemId)}">${esc(x.itemName)}</option>`).join("")}</select></label><label>Qty<input name="qty" type="number" min="1" value="1"></label><label>Merk<input name="brand"></label><label>Type<input name="type"></label><label>Serial Number<input name="serialNumber"></label><label>Harga per Unit<input name="price" type="number" min="0"></label><label>Supplier<input name="supplier"></label><label>No. PO/Invoice<input name="reference"></label><label class="full-col">Keterangan<textarea name="note"></textarea></label><label>Foto Barang<input name="photo" type="file" accept="image/*" capture="environment"></label><label>Foto Invoice/Surat Jalan<input name="docPhoto" type="file" accept="image/*" capture="environment"></label></div><div class="actions" style="margin-top:15px"><button class="btn primary">Simpan & Masuk Gudang</button></div></form>`);$("receivingForm").onsubmit=async e=>{e.preventDefault();const f=e.target;try{await api("receive",{itemId:f.itemId.value,qty:f.qty.value,brand:f.brand.value,type:f.type.value,serialNumber:f.serialNumber.value,price:f.price.value,supplier:f.supplier.value,reference:f.reference.value,note:f.note.value,photo:await fileToBase64(f.photo.files[0]),docPhoto:await fileToBase64(f.docPhoto.files[0])});closeModal();toast("Barang masuk dan stok bertambah");renderReceiving()}catch(err){toast(err.message)}}}

async function renderDistribution(){const r=await api("distribution");$("page").innerHTML=`<div class="page-head"><div><h2>Distribusi</h2><p class="muted">Pencatatan barang keluar dari Gudang menuju teknisi/loker.</p></div><button class="btn primary" onclick="showDistributionForm()">+ Distribusi</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Transaksi</th><th>Alker</th><th>Tujuan</th><th>Pemegang</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.distributionId)}</td><td>${esc(x.itemName)}</td><td>${esc(x.loker)}</td><td>${esc(x.holder)}</td><td>${esc(x.date)}</td><td>${badge(x.status)}</td></tr>`).join("")||'<tr><td colspan="6"><div class="empty">Belum ada distribusi.</div></td></tr>'}</tbody></table></div>`}
window.showDistributionForm=async()=>{const [m,w,t]=await Promise.all([api("masters"),api("warehouse"),api("technicians",{scope:"all"})]);openModal("Distribusi Alker",`<form id="distributionForm"><div class="form-grid"><label>Inventory Gudang<select name="inventoryId">${w.items.map(x=>`<option value="${esc(x.inventoryId)}">${esc(x.inventoryId)} — ${esc(x.itemName)} ${esc(x.serialNumber||"")}</option>`).join("")}</select></label><label>Teknisi<select name="technician">${t.data.map(x=>`<option value="${esc(x.id)}">${esc(x.name)} — ${esc(x.loker)}</option>`).join("")}</select></label><label>Kondisi saat diserahkan<select name="condition"><option>BAIK</option><option>RUSAK RINGAN</option></select></label><label class="full-col">Catatan<textarea name="note"></textarea></label></div><div class="actions" style="margin-top:15px"><button class="btn primary">Distribusikan</button></div></form>`);$("distributionForm").onsubmit=async e=>{e.preventDefault();const f=e.target;try{await api("distribute",{inventoryId:f.inventoryId.value,technicianId:f.technician.value,condition:f.condition.value,note:f.note.value});closeModal();toast("Distribusi berhasil dicatat");renderDistribution()}catch(err){toast(err.message)}}}

async function renderProcurement(){const r=await api("procurement");$("page").innerHTML=`<div class="page-head"><div><h2>Pengadaan</h2><p class="muted">Jika stok tidak cukup, kebutuhan dapat diproses sebagai pengadaan.</p></div><button class="btn primary" onclick="showProcurementForm()">+ Pengajuan Pembelian</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Pengadaan</th><th>Alker</th><th>Qty</th><th>Estimasi</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.procurementId)}</td><td>${esc(x.itemName)}</td><td>${x.qty}</td><td>${money(x.estimate)}</td><td>${badge(x.status)}</td><td>${esc(x.date)}</td></tr>`).join("")||'<tr><td colspan="6"><div class="empty">Belum ada pengadaan.</div></td></tr>'}</tbody></table></div>`}
window.showProcurementForm=async()=>{const r=await api("masters");openModal("Pengajuan Pembelian",`<form id="procForm"><div class="form-grid"><label>Alker<select name="itemId">${r.data.items.map(x=>`<option value="${esc(x.itemId)}">${esc(x.itemName)}</option>`).join("")}</select></label><label>Qty<input name="qty" type="number" min="1" value="1"></label><label>Estimasi harga/unit<input name="estimate" type="number" min="0"></label><label>Prioritas<select name="priority"><option>NORMAL</option><option>TINGGI</option><option>MENDESAK</option></select></label><label class="full-col">Alasan<textarea name="reason" required></textarea></label></div><div class="actions" style="margin-top:15px"><button class="btn primary">Ajukan</button></div></form>`);$("procForm").onsubmit=async e=>{e.preventDefault();const f=e.target;try{await api("createProcurement",{itemId:f.itemId.value,qty:f.qty.value,estimate:f.estimate.value,priority:f.priority.value,reason:f.reason.value});closeModal();toast("Pengadaan diajukan");renderProcurement()}catch(err){toast(err.message)}}}

async function renderAllInventory(){const r=await api("inventory",{scope:"all"});$("page").innerHTML=`<div class="page-head"><div><h2>Seluruh Inventory</h2><p class="muted">Pusat pencarian posisi seluruh ALKER/SALKER.</p></div></div><div class="toolbar"><input id="invSearch" placeholder="Cari ID, nama, SN, teknisi..."></div><div id="allInv"></div>`;let a=r.data;const draw=()=>{const q=$("invSearch").value.toLowerCase();renderInventoryTable($("allInv"),a.filter(x=>JSON.stringify(x).toLowerCase().includes(q)),"all")};$("invSearch").oninput=draw;draw()}
async function renderMaster(){const r=await api("masters");$("page").innerHTML=`<div class="page-head"><div><h2>Master Data</h2><p class="muted">Daftar loker dan master ALKER. Tambah item baru dapat dilakukan dari sini.</p></div><button class="btn primary" onclick="showMasterForm()">+ Tambah ALKER</button></div><div class="grid two"><div class="card"><h3>Loker</h3>${r.data.lokers.map(x=>`<div class="kpi-line"><span>${esc(x.name)}</span>${badge(x.status||"AKTIF")}</div>`).join("")}</div><div class="card"><h3>Master ALKER (${r.data.items.length})</h3>${r.data.items.slice(0,40).map(x=>`<div class="kpi-line"><span>${esc(x.itemName)}<small class="muted"> ${esc(x.category)}</small></span><span>${esc(x.lokers||"-")}</span></div>`).join("")}</div></div>`}
window.showMasterForm=async()=>{const r=await api("masters");openModal("Tambah Master ALKER",`<form id="masterForm"><div class="form-grid"><label>Nama ALKER<input name="itemName" required></label><label>Kategori<input name="category" required></label><label>Satuan<input name="unit" value="UNIT"></label><label>Harga standar<input name="price" type="number" min="0"></label><label class="full-col">Loker pengguna<select name="loker" multiple size="5">${r.data.lokers.filter(x=>x.name!=="GUDANG").map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join("")}</select></label><label class="full-col">Merk/Spesifikasi<textarea name="spec"></textarea></label></div><div class="actions" style="margin-top:15px"><button class="btn primary">Simpan</button></div></form>`);$("masterForm").onsubmit=async e=>{e.preventDefault();const f=e.target;const lokers=[...f.loker.selectedOptions].map(o=>o.value).join("|");try{await api("addMasterItem",{itemName:f.itemName.value,category:f.category.value,unit:f.unit.value,price:f.price.value,lokers,spec:f.spec.value});closeModal();toast("Master ALKER ditambahkan");renderMaster()}catch(err){toast(err.message)}}}
async function renderAudit(){const r=await api("audit");$("page").innerHTML=`<div class="page-head"><div><h2>Audit Trail</h2><p class="muted">Catatan aktivitas sistem.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Tanggal</th><th>Actor</th><th>Action</th><th>Deskripsi</th></tr></thead><tbody>${r.data.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.actor)}</td><td>${esc(x.action)}</td><td>${esc(x.description)}</td></tr>`).join("")||'<tr><td colspan="4"><div class="empty">Belum ada audit.</div></td></tr>'}</tbody></table></div>`}

(async()=>{try{const s=JSON.parse(localStorage.getItem("alker_session")||"null");if(s){session=s;const v=await api("me");if(v.ok)initApp()} }catch(e){localStorage.removeItem("alker_session")}})();
