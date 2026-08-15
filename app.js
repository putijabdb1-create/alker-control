/*************************************************
 * ALKER CONTROL
 * CHECKPOINT 3.2C
 * FRONTEND
 *************************************************/

const API_URL =
  "https://script.google.com/macros/s/AKfycbwjCqfw5duO4yJh5lO4sA0UmZiIcEj437TgFNBuGJ71o-yj0lZnaWstO8NTlNXWmU2DsA/exec";

let session = null;
let cache = {};

/*************************************************
 * BASIC HELPERS
 *************************************************/

const $ = id => document.getElementById(id);

const esc = s =>
  String(s ?? "").replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );

const money = n =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const badge = (s = "") => {
  const x = String(s).toUpperCase();

  let c = "gray";

  if (/BAIK|APPROVED|SELESAI|READY|AKTIF/.test(x)) {
    c = "green";
  } else if (/MENUNGGU|REVISI|PENDING/.test(x)) {
    c = "yellow";
  } else if (/HILANG|DITOLAK/.test(x)) {
    c = "red";
  } else if (/SERVICE|PROSES|DISTRIBUSI/.test(x)) {
    c = "blue";
  } else if (/RUSAK/.test(x)) {
    c = "red";
  }

  return `<span class="badge ${c}">${esc(s)}</span>`;
};


/*************************************************
 * API
 *************************************************/

async function api(action, data = {}) {

  if (API_URL.includes("PASTE_")) {
    throw new Error("API_URL belum diisi di app.js");
  }

  const body = new URLSearchParams({
    action,
    ...data
  });

  if (session?.token) {
    body.set("token", session.token);
  }

  const res = await fetch(API_URL, {
    method: "POST",
    body
  });

  if (!res.ok) {
    throw new Error("Server API tidak dapat dihubungi.");
  }

  const json = await res.json();

  /*
   * CHECKPOINT 3.2C
   * technicianTeam_ pada beberapa versi Code.gs
   * mengembalikan object data langsung, bukan wrapper ok_.
   * Normalisasi di frontend agar kedua format tetap kompatibel:
   *
   * 1. { ok:true, data:{...} }
   * 2. { teams:[...], technicians:[...] }
   * 3. { team:{...}, technicians:[...] }
   */
  if (action === "technicianTeam") {

    if (json && json.ok === true) {
      return json;
    }

    if (json && (
      Array.isArray(json.teams) ||
      Array.isArray(json.technicians) ||
      Object.prototype.hasOwnProperty.call(json, "team")
    )) {
      return {
        ok: true,
        data: json
      };
    }
  }

  if (!json.ok) {
    throw new Error(
      json.message || "Terjadi kesalahan."
    );
  }

  return json;
}


/*************************************************
 * IMAGE
 *************************************************/

async function fileToBase64(file, max = 1200) {

  if (!file) return "";

  const img = await new Promise((resolve, reject) => {

    const i = new Image();

    i.onload = () => resolve(i);
    i.onerror = reject;

    i.src = URL.createObjectURL(file);
  });

  const scale =
    Math.min(
      1,
      max / Math.max(img.width, img.height)
    );

  const c = document.createElement("canvas");

  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);

  c.getContext("2d").drawImage(
    img,
    0,
    0,
    c.width,
    c.height
  );

  return c.toDataURL(
    "image/jpeg",
    0.78
  );
}


/*************************************************
 * UI
 *************************************************/

function toast(msg) {

  const t = $("toast");

  if (!t) {
    alert(msg);
    return;
  }

  t.textContent = msg;

  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2600);
}


function openModal(title, html) {

  if (!$("modal")) {
    alert(html.replace(/<[^>]+>/g, ""));
    return;
  }

  $("modalTitle").textContent = title;
  $("modalBody").innerHTML = html;
  $("modal").classList.remove("hidden");
}


function closeModal() {

  $("modal")?.classList.add("hidden");
}

window.closeModal = closeModal;


/*************************************************
 * LOGIN
 *************************************************/

function initLogin(){

  const form = $("loginForm");

  if(!form){

    console.warn(
      "loginForm belum tersedia."
    );

    return;

  }


  /*
   * Cegah listener terpasang dua kali
   */
  if(form.dataset.loginReady === "Y"){
    return;
  }

  form.dataset.loginReady = "Y";


  form.addEventListener(
    "submit",
    async e => {

      e.preventDefault();
      e.stopPropagation();


      const usernameEl =
        $("username");

      const passwordEl =
        $("password");

      const msgEl =
        $("loginMsg");


      const username =
        String(
          usernameEl?.value || ""
        ).trim();

      const password =
        String(
          passwordEl?.value || ""
        );


      if(!username){

        if(msgEl){
          msgEl.textContent =
            "Username wajib diisi.";
        }

        usernameEl?.focus();

        return;

      }


      if(!password){

        if(msgEl){
          msgEl.textContent =
            "Password wajib diisi.";
        }

        passwordEl?.focus();

        return;

      }


      if(msgEl){
        msgEl.textContent =
          "Memproses login...";
      }


      /*
       * Disable tombol sementara
       */
      const btn =
        form.querySelector(
          'button[type="submit"]'
        );

      const oldText =
        btn?.textContent ||
        "Masuk ke Sistem";


      if(btn){
        btn.disabled = true;
        btn.textContent =
          "Memproses...";
      }


      try{

        /*
         * Pastikan session lama
         * tidak ikut mengganggu login baru.
         */
        session = null;


        const r =
          await api(
            "login",
            {
              username,
              password
            }
          );


        /*
         * Backend:
         * {
         *   ok:true,
         *   data:{
         *     session:{...}
         *   }
         * }
         */
        const newSession =
          r?.data?.session;


        if(
          !newSession ||
          !newSession.token
        ){

          throw new Error(
            "Login berhasil tetapi session tidak diterima."
          );

        }


        session =
          newSession;


        localStorage.setItem(
          "alker_session",
          JSON.stringify(
            session
          )
        );


        /*
         * Masuk ke aplikasi.
         */
        await initApp();


      }
      catch(err){

        console.error(
          "LOGIN ERROR:",
          err
        );


        /*
         * Jangan hapus session lama
         * sebelum login benar-benar berhasil.
         */
        session = null;


        localStorage.removeItem(
          "alker_session"
        );


        if(msgEl){

          msgEl.textContent =
            err?.message ||
            "Login gagal. Silakan coba lagi.";

        }

      }
      finally{

        if(btn){

          btn.disabled = false;

          btn.textContent =
            oldText;

        }

      }

    }
  );

}


/*
 * Jalankan setelah HTML selesai.
 */
if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    initLogin
  );

}
else{

  initLogin();

}

/*************************************************
 * LOGOUT
 *************************************************/

$("logoutBtn")?.addEventListener(
  "click",
  () => {

    localStorage.removeItem(
      "alker_session"
    );

    session = null;

    $("mainView")?.classList.add(
      "hidden"
    );

    $("loginView")?.classList.remove(
      "hidden"
    );
  }
);


/*************************************************
 * MOBILE
 *************************************************/

$("mobileMenu")?.addEventListener(
  "click",
  () => {
    $("sidebar")?.classList.toggle(
      "open"
    );
  }
);


/*************************************************
 * INIT APP
 *************************************************/

async function initApp() {

  if (!session) return;

  $("loginView")?.classList.add(
    "hidden"
  );

  $("mainView")?.classList.remove(
    "hidden"
  );

  const name =
    session.name || "User";

  const role =
    session.role || "ROLE";

  const loker =
    session.loker || "-";

  if ($("topUser")) {
    $("topUser").textContent =
      name;
  }

  if ($("topUserRole")) {
    $("topUserRole").textContent =
      `${role} • ${loker}`;
  }

  if ($("topUserAvatar")) {
    $("topUserAvatar").textContent =
      name
        .slice(0, 1)
        .toUpperCase();
  }

  if ($("sideName")) {
    $("sideName").textContent =
      name;
  }

  if ($("sideRole")) {
    $("sideRole").textContent =
      role;
  }

  if ($("sideLoker")) {
    $("sideLoker").textContent =
      loker;
  }

  if ($("avatar")) {
    $("avatar").textContent =
      name
        .slice(0, 1)
        .toUpperCase();
  }

  buildNav();

  await route("dashboard");
}


/*************************************************
 * NAVIGATION
 *************************************************/

function buildNav() {

  const r =
    session?.role || "";

  const groups = [
    {
      title: "UTAMA",
      items: [
        ["dashboard", "⌂", "Dashboard"]
      ]
    }
  ];


  /*
   * TEKNISI
   */
  if (r === "TEKNISI") {

    groups.push({

      title: "ALKER SAYA",

      items: [

        [
          "myinventory",
          "▣",
          "Alker Saya"
        ],

        [
          "initialReport",
          "▤",
          "Laporan Alker"
        ],

        [
          "team",
          "♙",
          "Tim Saya"
        ],

        [
          "requests",
          "＋",
          "Request Alker"
        ],

        [
          "issues",
          "!",
          "Rusak / Hilang"
        ],

        [
          "returns",
          "↩",
          "Pengembalian"
        ]
      ]
    });
  }


  /*
   * LEADER
   */
  else if (r === "LEADER") {

    groups.push({

      title: "TIM",

      items: [

        [
          "team",
          "♙",
          "Teknisi Loker"
        ],
		[
		  "users",
		  "♙",
		  "Master Teknisi"
		],
        [
          "teammanage",
          "⚙",
          "Kelola Tim"
        ],

        [
          "teamrequests",
          "✓",
          "Validasi Request"
        ],

        [
          "teaminventory",
          "▣",
          "Inventory Loker"
        ]
      ]
    });
  }


  /*
   * SPV GUDANG
   */
  else if (r === "SPV_GUDANG") {

    groups.push({

      title: "GUDANG",

      items: [

        [
          "warehouse",
          "▦",
          "Stok Gudang"
        ],
		[
		  "masterprice",
		  "💰",
		  "Master Harga ALKER"
		],
        [
          "initial",
          "✓",
          "Verifikasi Inventory"
        ],

        [
          "requests",
          "＋",
          "Request Teknisi"
        ],

        [
          "teammanage",
          "♙",
          "Kelola Tim"
        ],

        [
          "receiving",
          "↓",
          "Barang Masuk"
        ],

        [
          "distribution",
          "↑",
          "Distribusi"
        ],

        [
          "returns",
          "↩",
          "Pengembalian"
        ]
      ]

    });


    groups.push({

      title: "PENGADAAN",

      items: [

        [
          "procurement",
          "▤",
          "Pengadaan"
        ]

      ]

    });


    groups.push({

      title: "INVENTORY",

      items: [

        [
          "allinventory",
          "▣",
          "Seluruh Inventory"
        ]

      ]

    });
  }


  /*
   * ADMIN
   */
  else if (r === "ADMIN") {

  groups.push({

    title: "CONTROL",

    items: [

      [
        "master",
        "⚙",
        "Master ALKER"
      ],

      [
        "users",
        "♙",
        "Master User"
      ],

      [
        "teammanage",
        "♙",
        "Kelola Tim"
      ],

      [
        "allinventory",
        "▣",
        "Seluruh Inventory"
      ],

      [
        "warehouse",
        "▦",
        "Stok Gudang"
      ],

      [
        "procurement",
        "▤",
        "Pengadaan"
      ],

      [
        "audit",
        "◷",
        "Audit Trail"
      ]

    ]

  });

}

  $("nav").innerHTML =
    groups
      .map(g => `

        <div class="nav-group">

          <div class="nav-group-title">
            ${g.title}
          </div>

          ${g.items
            .map(
              x => `

              <button
                type="button"
                class="nav-btn"
                data-route="${x[0]}"
              >

                <span class="nav-icon">
                  ${x[1]}
                </span>

                <span>
                  ${x[2]}
                </span>

              </button>

            `
            )
            .join("")}

        </div>

      `)
      .join("");


  const buttons =
    [
      ...document.querySelectorAll(
        ".nav-btn"
      )
    ];


  buttons.forEach(btn => {

    btn.onclick = async () => {

      buttons.forEach(
        x =>
          x.classList.remove(
            "active"
          )
      );

      btn.classList.add(
        "active"
      );

      await route(
        btn.dataset.route
      );

      $("sidebar")?.classList.remove(
        "open"
      );
    };

  });


  const first =
    buttons.find(
      x =>
        x.dataset.route ===
        "dashboard"
    );

  first?.classList.add(
    "active"
  );
}


/*************************************************
 * ROUTER
 *************************************************/

async function route(name) {

  try {

    if (name === "dashboard")
      return renderDashboard();

    if (name === "myinventory")
      return renderMyInventory();

    if (name === "initialReport")
      return renderInitialReport();

    if (name === "team")
      return renderTeam();

    if (name === "teammanage")
      return renderTeamManage();

    if (name === "requests")
      return renderRequests();

    if (name === "issues")
      return renderIssues();

    if (name === "returns")
      return renderReturns();

    if (name === "teamrequests")
      return renderTeamRequests();

    if (name === "teaminventory")
      return renderTeamInventory();

    if (name === "warehouse")
      return renderWarehouse();
	  
	if (name === "masterprice")
	  return renderMasterPrice();

    if (name === "initial")
      return renderInitial();

    if (name === "receiving")
      return renderReceiving();

    if (name === "distribution")
      return renderDistribution();

    if (name === "procurement")
      return renderProcurement();

    if (name === "allinventory")
      return renderAllInventory();

    if (name === "master")
      return renderMaster();
  
	if(name === "users")
		return renderUsers();
	
    if (name === "audit")
      return renderAudit();

	if (name === "returnVerification")
		return renderReturnVerification();
  
  } catch (e) {

    $("page").innerHTML = `

      <div class="card">

        <strong>
          Gagal memuat halaman
        </strong>

        <p class="danger-text">
          ${esc(e.message)}
        </p>

        <button
          class="btn secondary"
          onclick="route('${esc(name)}')"
        >
          Coba Lagi
        </button>

      </div>

    `;
  }
}


/*************************************************
 * DASHBOARD
 *************************************************/

async function renderDashboard(){

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Dashboard
        </h2>

        <div class="muted">

          ${esc(
            session.loker ||
            "Semua"
          )}

          •

          ${esc(
            session.name
          )}

        </div>

      </div>

    </div>


    <div id="dashBody">

      <div class="card">
        Memuat dashboard...
      </div>

    </div>

  `;


  try{

    const r =
      await api(
        "dashboard"
      );


    const d =
      r.data || {};


    /*
     * ======================================
     * DASHBOARD TEKNISI
     * ======================================
     */

    if(
      session.role ===
      "TEKNISI"
    ){

      renderTechnicianDashboard_(
        d
      );

      return;

    }


    /*
     * ======================================
     * DASHBOARD ROLE LAIN
     * ======================================
     */

    $("dashBody").innerHTML = `

      <div class="grid cards">

        ${metric(
          "Total Inventory",
          d.totalInventory || 0,
          "unit"
        )}

        ${metric(
          "Di Gudang",
          d.inWarehouse || 0,
          "unit"
        )}

        ${metric(
          "Di Teknisi",
          d.withTechnicians || 0,
          "unit"
        )}

        ${metric(
          "Nilai Aset",
          money(
            d.totalValue || 0
          ),
          "inventory"
        )}

      </div>


      <div style="height:15px"></div>


      <div class="grid two">

        <div class="card">

          <h3>
            Ringkasan Kondisi
          </h3>


          ${
            Object.entries(
              d.conditions || {}
            )
              .map(
                ([k,v]) => `

                  <div class="kpi-line">

                    <span>
                      ${esc(k)}
                    </span>

                    <strong>
                      ${v}
                    </strong>

                  </div>

                `
              )
              .join("") ||

            `
              <div class="empty">
                Belum ada data.
              </div>
            `
          }

        </div>


        <div class="card">

          <h3>
            Aktivitas Menunggu
          </h3>


          ${
            Object.entries(
              d.pending || {}
            )
              .map(
                ([k,v]) => `

                  <div class="kpi-line">

                    <span>
                      ${esc(k)}
                    </span>

                    <strong>
                      ${v}
                    </strong>

                  </div>

                `
              )
              .join("") ||

            `
              <div class="empty">
                Tidak ada aktivitas.
              </div>
            `
          }

        </div>

      </div>


      <div style="height:15px"></div>


      <div class="card">

        <h3>
          Posisi Inventory
        </h3>


        <div class="table-wrap">

          <table class="table">

            <thead>

              <tr>

                <th>LOKER / LOKASI</th>
                <th>JUMLAH</th>
                <th>NILAI</th>

              </tr>

            </thead>


            <tbody>

              ${
                (d.locations || [])
                  .map(
                    x => `

                      <tr>

                        <td>
                          ${esc(
                            x.name
                          )}
                        </td>

                        <td>
                          ${x.count}
                        </td>

                        <td>
                          ${money(
                            x.value
                          )}
                        </td>

                      </tr>

                    `
                  )
                  .join("") ||

                `
                  <tr>

                    <td colspan="3">

                      <div class="empty">
                        Belum ada inventory.
                      </div>

                    </td>

                  </tr>
                `
              }

            </tbody>

          </table>

        </div>

      </div>

    `;

  }catch(e){

    $("dashBody").innerHTML = `

      <div class="card">

        <strong>
          Gagal memuat dashboard
        </strong>

        <p class="danger-text">

          ${esc(
            e.message
          )}

        </p>

      </div>

    `;

  }

}

/*************************************************
 * DASHBOARD TEKNISI
 * STATUS ALKER PER LOKER
 *************************************************/

function renderTechnicianDashboard_(
  d
){

  const r =
    d.technicianReport || {

      total: 0,

      reported: 0,

      pending: 0,

      revision: 0,

      notGiven: 0,

      notReported: 0,

      items: []

    };


  $("dashBody").innerHTML = `

    <!-- ==================================
         RINGKASAN INVENTORY
    =================================== -->

    <div class="grid cards">

      ${metric(
        "Total Inventory",
        d.totalInventory || 0,
        "unit"
      )}


      ${metric(
        "Di Gudang",
        d.inWarehouse || 0,
        "unit"
      )}


      ${metric(
        "Di Teknisi",
        d.withTechnicians || 0,
        "unit"
      )}


      ${metric(
        "Nilai Aset",
        money(
          d.totalValue || 0
        ),
        "inventory"
      )}

    </div>


    <div style="height:15px"></div>


    <!-- ==================================
         STATUS ALKER
    =================================== -->

    <div class="grid cards">

      ${metric(
        "Sudah Dilaporkan",
        r.reported,
        "ALKER resmi"
      )}


      ${metric(
        "Menunggu Verifikasi",
        r.pending,
        "diproses Gudang"
      )}


      ${metric(
        "Perlu Revisi",
        r.revision,
        "perbaiki laporan"
      )}


      ${metric(
        "Belum Dilaporkan",
        r.notReported,
        "belum ada laporan"
      )}

    </div>


    <div style="height:15px"></div>


    <!-- ==================================
         STATUS PEMBERIAN
    =================================== -->

    <div class="grid two">

      <div class="card">

        <h3>
          Status ALKER Saya
        </h3>

        <p class="muted">

          Daftar ALKER yang berlaku
          untuk ${esc(
            session.loker ||
            "-"
          )}.

        </p>


        <div class="kpi-line">

          <span>
            Sudah dilaporkan
          </span>

          <strong>
            ${r.reported}
          </strong>

        </div>


        <div class="kpi-line">

          <span>
            Menunggu verifikasi
          </span>

          <strong>
            ${r.pending}
          </strong>

        </div>


        <div class="kpi-line">

          <span>
            Perlu revisi
          </span>

          <strong>
            ${r.revision}
          </strong>

        </div>


        <div class="kpi-line">

          <span>
            Belum diberikan
          </span>

          <strong>
            ${r.notGiven}
          </strong>

        </div>


        <div class="kpi-line">

          <span>
            Belum dilaporkan
          </span>

          <strong>
            ${r.notReported}
          </strong>

        </div>

      </div>


      <!-- ==================================
           AKTIVITAS
      =================================== -->

      <div class="card">

        <h3>
          Aktivitas Menunggu
        </h3>


        ${
          Object.entries(
            d.pending || {}
          )
            .map(
              ([k,v]) => `

                <div class="kpi-line">

                  <span>
                    ${esc(k)}
                  </span>

                  <strong>
                    ${v}
                  </strong>

                </div>

              `
            )
            .join("") ||

          `
            <div class="empty">
              Tidak ada aktivitas.
            </div>
          `
        }

      </div>

    </div>


    <div style="height:15px"></div>


    <!-- ==================================
         DAFTAR ALKER
    =================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h3>
            Daftar ALKER Loker
          </h3>

          <p class="muted">

            Anda dapat langsung melihat
            ALKER mana yang sudah dan
            belum dilaporkan.

          </p>

        </div>

      </div>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>ALKER</th>

              <th>STATUS PELAPORAN</th>

              <th>KONDISI</th>

              <th>INVENTORY</th>

              <th>CATATAN</th>

            </tr>

          </thead>


          <tbody>

            ${
              (r.items || [])
                .map(
                  x => `

                    <tr>

                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div class="small muted">

                          ${esc(
                            x.category ||
                            "-"
                          )}

                        </div>

                      </td>


                      <td>

                        ${technicianReportBadge_(
                          x.status
                        )}

                      </td>


                      <td>

                        ${
                          x.condition
                            ? badge(
                                x.condition
                              )
                            : `
                              <span class="badge gray">
                                -
                              </span>
                            `
                        }

                      </td>


                      <td>

                        ${
                          x.inventoryId

                            ? `

                              <strong>
                                ${esc(
                                  x.inventoryId
                                )}
                              </strong>

                            `

                            : `
                              <span class="muted">
                                -
                              </span>
                            `
                        }

                      </td>


                      <td>

                        ${
                          x.reviewNote

                            ? esc(
                                x.reviewNote
                              )

                            : x.status ===
                                "BELUM DILAPORKAN"

                              ? "Belum ada laporan."

                              : x.status ===
                                  "BELUM DIBERIKAN"

                                ? "Belum menerima ALKER."

                                : "-"

                        }

                      </td>

                    </tr>

                  `
                )
                .join("") ||

              `

                <tr>

                  <td colspan="5">

                    <div class="empty">

                      Belum ada daftar ALKER
                      untuk loker ini.

                    </div>

                  </td>

                </tr>

              `
            }

          </tbody>

        </table>

      </div>

    </div>


    <div style="height:15px"></div>


    <!-- ==================================
         POSISI INVENTORY
    =================================== -->

    <div class="card">

      <h3>
        Posisi Inventory
      </h3>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>LOKER / LOKASI</th>

              <th>JUMLAH</th>

              <th>NILAI</th>

            </tr>

          </thead>


          <tbody>

            ${
              (d.locations || [])
                .map(
                  x => `

                    <tr>

                      <td>
                        ${esc(
                          x.name
                        )}
                      </td>

                      <td>
                        ${x.count}
                      </td>

                      <td>
                        ${money(
                          x.value
                        )}
                      </td>

                    </tr>

                  `
                )
                .join("") ||

              `
                <tr>

                  <td colspan="3">

                    <div class="empty">
                      Belum ada inventory.
                    </div>

                  </td>

                </tr>
              `
            }

          </tbody>

        </table>

      </div>

    </div>

  `;

}


/*************************************************
 * BADGE STATUS ALKER TEKNISI
 *************************************************/

function technicianReportBadge_(
  status
){

  const s =
    String(
      status || ""
    ).toUpperCase();


  if(
    s ===
    "SUDAH DILAPORKAN"
  ){

    return `
      <span class="badge green">
        SUDAH DILAPORKAN
      </span>
    `;

  }


  if(
    s ===
    "MENUNGGU VERIFIKASI"
  ){

    return `
      <span class="badge yellow">
        MENUNGGU VERIFIKASI
      </span>
    `;

  }


  if(
    s ===
    "PERLU REVISI"
  ){

    return `
      <span class="badge red">
        PERLU REVISI
      </span>
    `;

  }


  if(
    s ===
    "BELUM DIBERIKAN"
  ){

    return `
      <span class="badge blue">
        BELUM DIBERIKAN
      </span>
    `;

  }


  return `
    <span class="badge gray">
      BELUM DILAPORKAN
    </span>
  `;

}

function metric(a, b, c) {

  return `

    <div class="card metric">

      <div class="label">
        ${esc(a)}
      </div>

      <div class="value">
        ${b}
      </div>

      <div class="sub">
        ${esc(c)}
      </div>

    </div>

  `;
}


/*************************************************
 * ALKER SAYA
 * INVENTORY + PENGAJUAN AWAL
 *************************************************/

async function renderMyInventory(){

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Alker Saya
        </h2>

        <p class="muted">
          Semua ALKER yang Anda laporkan
          maupun yang sudah resmi menjadi
          tanggung jawab Anda.
        </p>

      </div>

      <div class="actions">

        <button
          class="btn primary"
          onclick="showInitialForm()"
        >
          + Input Alker Awal
        </button>

      </div>

    </div>


    <div id="myInv">

      Memuat...

    </div>

  `;


  try{

    const [
      inv,
      initial
    ] =
      await Promise.all([

        api(
          "inventory",
          {
            scope:"mine"
          }
        ),

        api(
          "initialMine"
        )

      ]);


    renderMyInventoryPage(

      $("myInv"),

      inv.data || [],

      initial.data || []

    );


  }catch(e){

    $("myInv").innerHTML = `

      <div class="card">

        <strong>
          Gagal memuat Alker
        </strong>

        <p class="danger-text">
          ${esc(e.message)}
        </p>

      </div>

    `;

  }

}
function renderMyInventoryPage(
  el,
  inventory,
  initial
){

  const pending =
    initial.filter(
      x =>
        x.status ===
        "MENUNGGU VERIFIKASI"
    );


  const revision =
    initial.filter(
      x =>
        x.status ===
        "REVISI"
    );


  const approved =
    initial.filter(
      x =>
        x.status ===
        "APPROVED"
    );


  const problems =
    inventory.filter(
      x =>
        /RUSAK|HILANG/i.test(
          x.condition || ""
        )
    );


  const totalValue =
    inventory.reduce(
      (sum,x) =>
        sum +
        Number(x.price || 0),
      0
    );


  el.innerHTML = `

    <!-- RINGKASAN -->

    <div class="card">

      <div class="detail-grid">


        <div class="detail-box">

          <span>
            Inventory Resmi
          </span>

          <strong>
            ${inventory.length}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            Menunggu Verifikasi
          </span>

          <strong>
            ${pending.length}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            Perlu Revisi
          </span>

          <strong>
            ${revision.length}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            Nilai Inventory
          </span>

          <strong>
            ${money(totalValue)}
          </strong>

        </div>


      </div>

    </div>


    <div style="height:15px"></div>


    <!-- PENGAJUAN ALKER AWAL -->

    <div class="card">

      <div class="section-head">

        <div>

          <h3>
            Pengajuan Alker Awal
          </h3>

          <p class="muted">
            Status ALKER yang Anda laporkan
            kepada Gudang.
          </p>

        </div>

      </div>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>ALKER</th>

              <th>Merk / Type</th>

              <th>SN</th>

              <th>Kondisi</th>

              <th>Tanggal</th>

              <th>Status</th>

              <th>Keterangan</th>

            </tr>

          </thead>


          <tbody>

            ${
              initial
                .map(
                  x => `

                    <tr>

                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div
                          class="small muted"
                        >
                          ${esc(
                            x.initialId
                          )}
                        </div>

                      </td>


                      <td>

                        ${esc(
                          x.brand || "-"
                        )}

                        /

                        ${esc(
                          x.type || "-"
                        )}

                      </td>


                      <td>
                        ${esc(
                          x.serialNumber ||
                          "-"
                        )}
                      </td>


                      <td>
                        ${badge(
                          x.condition
                        )}
                      </td>


                      <td>
                        ${esc(
                          x.date
                        )}
                      </td>


                      <td>
                        ${initialStatusBadge(
                          x.status
                        )}
                      </td>


                     <td>

  ${
    x.status === "REVISI"

      ? `

        <div class="small danger-text"
             style="margin-bottom:8px">

          ${esc(
            x.reviewNote ||
            "Mohon perbaiki data."
          )}

        </div>

        <button
          class="btn warning"
          onclick='showInitialRevisionForm(${JSON.stringify(x)})'
        >
          Perbaiki & Upload Ulang
        </button>

      `

      : x.status === "APPROVED"

        ? `

          <span
            class="small muted"
          >
            Sudah menjadi
            inventory resmi.
          </span>

        `

        : `

          <span
            class="small muted"
          >
            Menunggu pemeriksaan
            Gudang.
          </span>

        `
  }

</td>

                    </tr>

                  `
                )
                .join("")

              ||

              `

                <tr>

                  <td colspan="7">

                    <div class="empty">

                      Belum ada pengajuan
                      ALKER awal.

                    </div>

                  </td>

                </tr>

              `

            }

          </tbody>

        </table>

      </div>

    </div>


    <div style="height:15px"></div>


    <!-- INVENTORY RESMI -->

    <div class="card">

      <div class="section-head">

        <div>

          <h3>
            Inventory Resmi
          </h3>

          <p class="muted">
            ALKER yang sudah disetujui
            Gudang dan menjadi tanggung
            jawab Anda.
          </p>

        </div>

      </div>


      ${
        inventory.length

          ? renderInventorySimpleTable(
              inventory
            )

          : `

            <div class="empty">

              Belum ada ALKER yang
              disetujui Gudang.

            </div>

          `
      }

    </div>

  `;

}
function renderInventoryTable(
  el,
  data,
  scope
) {

  const total =
    data.reduce(
      (a, x) =>
        a + Number(x.price || 0),
      0
    );


  const problems =
    data.filter(
      x =>
        /RUSAK|HILANG/i.test(
          x.condition || ""
        )
    ).length;


  el.innerHTML = `

    <div
      class="card"
      style="margin-bottom:15px"
    >

      <div class="detail-grid">

        <div class="detail-box">

          <span>
            Item
          </span>

          <strong>
            ${data.length}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            Nilai
          </span>

          <strong>
            ${money(total)}
          </strong>

        </div>


        <div class="detail-box">

          <span>
            Masalah
          </span>

          <strong>
            ${problems}
          </strong>

        </div>

      </div>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>ID</th>
            <th>Alker</th>
            <th>Merk / Type</th>
            <th>SN</th>
            <th>Lokasi</th>
            <th>Pemegang</th>
            <th>Kondisi</th>
            <th>Nilai</th>
            <th></th>

          </tr>

        </thead>

        <tbody>

          ${
            data
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.inventoryId)}
                    </td>

                    <td>
                      <strong>
                        ${esc(x.itemName)}
                      </strong>
                    </td>

                    <td>
                      ${esc(x.brand || "-")}
                      /
                      ${esc(x.type || "-")}
                    </td>

                    <td>
                      ${esc(x.serialNumber || "-")}
                    </td>

                    <td>
                      ${esc(x.location || "-")}
                    </td>

                    <td>
                      ${esc(x.holder || "-")}
                    </td>

                    <td>
                      ${badge(x.condition)}
                    </td>

                    <td>
                      ${money(x.price)}
                    </td>

                    <td>

                      <button
                        class="btn secondary"
                        onclick='showInventoryDetail(${JSON.stringify(x)})'
                      >
                        Detail
                      </button>

                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="9">

                <div class="empty">
                  Belum ada inventory.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


/*************************************************
 * INVENTORY DETAIL
 *************************************************/

window.showInventoryDetail =
  async x => {

    openModal(

      "Detail Inventory",

      `

        <div class="detail-grid">

          ${[
            ["ID",x.inventoryId],
            ["Alker",x.itemName],
            ["Kategori",x.category],
            ["Merk",x.brand],
            ["Type",x.type],
            ["Serial Number",x.serialNumber],
            ["Lokasi",x.location],
            ["Pemegang",x.holder],
            ["Loker",x.loker],
            ["Kondisi",x.condition],
            ["Status",x.status],
            ["Nilai",money(x.price)]
          ]
            .map(
              a => `

                <div class="detail-box">

                  <span>
                    ${esc(a[0])}
                  </span>

                  <strong>
                    ${esc(
                      a[1] || "-"
                    )}
                  </strong>

                </div>

              `
            )
            .join("")}

        </div>


        <div
          id="inventoryPhotoArea"
          style="margin-top:18px"
        >

          <div class="empty">
            Memuat foto...
          </div>

        </div>


        ${
          session.role ===
          "TEKNISI"
            ? `

              <div
                class="actions"
                style="margin-top:15px"
              >

                <button
                  class="btn warning"
                  onclick="
                    closeModal();
                    showIssueForm(
                      '${esc(x.inventoryId)}'
                    )
                  "
                >
                  Lapor Rusak / Hilang
                </button>

              </div>

            `
            : ""
        }

      `

    );


    const photos = [];


    if(
      x.photoUrl
    ){

      const dataUrl =
        await loadPhotoPreview_(
          x.photoUrl
        );


      if(dataUrl){

        photos.push(
          photoBox_(
            "Foto ALKER",
            dataUrl
          )
        );

      }

    }


    if(
      x.serialPhotoUrl
    ){

      const dataUrl =
        await loadPhotoPreview_(
          x.serialPhotoUrl
        );


      if(dataUrl){

        photos.push(
          photoBox_(
            "Foto Serial / Label",
            dataUrl
          )
        );

      }

    }


    const area =
      $("inventoryPhotoArea");


    if(area){

      area.innerHTML =
        photos.length
          ? `

            <div class="photo-grid">
              ${photos.join("")}
            </div>

          `
          : `

            <div class="photo-empty">
              Foto tidak tersedia.
            </div>

          `;

    }

  };


/*************************************************
 * INPUT ALKER AWAL
 *
 * PILIHAN:
 *
 * 1. SUDAH DIBERIKAN
 *    -> Merk
 *    -> Type
 *    -> Serial
 *    -> Kondisi
 *    -> Foto
 *
 * 2. BELUM DIBERIKAN
 *    -> Tidak perlu data fisik
 *    -> Masuk proses pengadaan
 *************************************************/

window.showInitialForm =
  async () => {

    const r =
      await api(
        "masters"
      );


    const items =
      r.data?.items ||
      [];


    openModal(

      "Input Alker Awal",

      `

        <p class="muted">

          Pilih status ALKER terlebih dahulu.
          Data akan diverifikasi oleh Gudang.

        </p>


        <form id="initialForm">

          <div class="form-grid">


            <label>

              Alker

              <select
                name="itemId"
                required
              >

                ${
                  items
                    .map(
                      x => `

                        <option
                          value="${esc(
                            x.itemId
                          )}"
                        >
                          ${esc(
                            x.itemName
                          )}
                        </option>

                      `
                    )
                    .join("")
                }

              </select>

            </label>


            <label>

              Status Pemberian

              <select
                name="givenStatus"
                id="initialGivenStatus"
                required
              >

                <option value="">
                  -- Pilih Status --
                </option>

                <option value="SUDAH DIBERIKAN">
                  SUDAH DIBERIKAN
                </option>

                <option value="BELUM DIBERIKAN">
                  BELUM DIBERIKAN
                </option>

              </select>

            </label>


            <div
              id="initialPhysicalFields"
              class="full-col"
            >

              <div class="form-grid">


                <label>

                  Merk

                  <input
                    name="brand"
                    id="initialBrand"
                  >

                </label>


                <label>

                  Type

                  <input
                    name="type"
                    id="initialType"
                  >

                </label>


                <label>

                  Serial Number

                  <input
                    name="serialNumber"
                    id="initialSerial"
                  >

                </label>


                <label>

                  Kondisi

                  <select
                    name="condition"
                    id="initialCondition"
                  >

                    <option>
                      BAIK
                    </option>

                    <option>
                      RUSAK RINGAN
                    </option>

                    <option>
                      RUSAK BERAT
                    </option>

                  </select>

                </label>


                <label>

                  Foto Alker

                  <input
                    name="photo"
                    id="initialPhoto"
                    type="file"
                    accept="image/*"
                    capture="environment"
                  >

                </label>


                <label>

                  Foto Serial / Label

                  <input
                    name="serialPhoto"
                    id="initialSerialPhoto"
                    type="file"
                    accept="image/*"
                    capture="environment"
                  >

                </label>


              </div>

            </div>


            <label class="full-col">

              Keterangan

              <textarea
                name="note"
                id="initialNote"
                placeholder="Tambahkan keterangan jika diperlukan..."
              ></textarea>

            </label>


          </div>


          <div
            id="initialInfo"
            class="card"
            style="margin-top:15px; display:none"
          ></div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              type="button"
              class="btn secondary"
              onclick="closeModal()"
            >
              Batal
            </button>


            <button
              type="submit"
              class="btn primary"
            >
              Kirim ke Gudang
            </button>

          </div>

        </form>

      `
    );


    const status =
      $("initialGivenStatus");

    const physical =
      $("initialPhysicalFields");

    const info =
      $("initialInfo");


    function updateInitialMode(){

      const value =
        status.value;


      if(
        value ===
        "SUDAH DIBERIKAN"
      ){

        physical.style.display =
          "block";


        $("initialBrand")
          .required = true;

        $("initialType")
          .required = true;

        $("initialSerial")
          .required = false;

        $("initialPhoto")
          .required = true;
		  
		// FOTO SERIAL TIDAK WAJIB
		$("initialSerialPhoto")
		.required = false;

        info.style.display =
          "block";


        info.innerHTML = `

          <strong>
            ALKER SUDAH DIBERIKAN
          </strong>

          <p class="muted">
            Lengkapi data fisik ALKER,
            serial number, kondisi dan foto.
          </p>

        `;

      }

      else if(
        value ===
        "BELUM DIBERIKAN"
      ){

        physical.style.display =
          "none";


        $("initialBrand")
          .required = false;

        $("initialType")
          .required = false;

        $("initialSerial")
          .required = false;

        $("initialPhoto")
          .required = false;

        $("initialSerialPhoto")
          .required = false;


        info.style.display =
          "block";


        info.innerHTML = `

          <strong>
            ALKER BELUM DIBERIKAN
          </strong>

          <p class="muted">
            Data ini tidak akan menjadi
            inventory teknisi.
            Setelah diverifikasi Gudang,
            data akan diteruskan ke proses
            pengadaan.
          </p>

        `;

      }

      else{

        physical.style.display =
          "none";

        info.style.display =
          "none";

      }

    }


    status.onchange =
      updateInitialMode;


$("initialForm").onsubmit =
  async e => {

    e.preventDefault();

    const f = e.target;

    // ==========================================
    // CEGAH DOUBLE SUBMIT
    // ==========================================

    if (f.dataset.saving === "1") {
      return;
    }

    f.dataset.saving = "1";

    const submitBtn =
      f.querySelector(
        'button[type="submit"]'
      );

    const cancelBtn =
      f.querySelector(
        'button[type="button"]'
      );


    // Simpan teks asli
    const originalText =
      submitBtn
        ? submitBtn.textContent
        : "Kirim ke Gudang";


    // ==========================================
    // LOCK FORM
    // ==========================================

    if (submitBtn) {

      submitBtn.disabled = true;

      submitBtn.innerHTML =
        "⏳ Sedang menyimpan...";

    }


    if (cancelBtn) {

      cancelBtn.disabled = true;

    }


    const inputs =
      f.querySelectorAll(
        "input, select, textarea"
      );


    inputs.forEach(
      el => {

        el.disabled = true;

      }
    );


    try {

      const givenStatus =
        f.givenStatus.value;


      if (!givenStatus) {

        throw new Error(
          "Pilih status pemberian ALKER."
        );

      }


      let photo = "";
      let serialPhoto = "";


      // ==========================================
      // ALKER SUDAH DIBERIKAN
      // ==========================================

      if (
        givenStatus ===
        "SUDAH DIBERIKAN"
      ) {

        // Foto ALKER tetap WAJIB
        photo =
          await fileToBase64(
            f.photo.files[0]
          );


        if (!photo) {

          throw new Error(
            "Foto ALKER wajib diupload."
          );

        }


        // ========================================
        // FOTO SERIAL OPSIONAL
        // ========================================

        if (
          f.serialPhoto.files &&
          f.serialPhoto.files[0]
        ) {

          serialPhoto =
            await fileToBase64(
              f.serialPhoto.files[0]
            );

        }

      }


      // ==========================================
      // KIRIM KE SERVER
      // ==========================================

      await api(
        "initialSubmit",
        {

          itemId:
            f.itemId.value,

          givenStatus:
            givenStatus,

          brand:
            givenStatus ===
              "SUDAH DIBERIKAN"
              ? f.brand.value
              : "",

          type:
            givenStatus ===
              "SUDAH DIBERIKAN"
              ? f.type.value
              : "",

          serialNumber:
            givenStatus ===
              "SUDAH DIBERIKAN"
              ? f.serialNumber.value
              : "",

          condition:
            givenStatus ===
              "SUDAH DIBERIKAN"
              ? f.condition.value
              : "BELUM DIVERIFIKASI",

          note:
            f.note.value,

          photo:
            photo,

          serialPhoto:
            serialPhoto

        }
      );


      // ==========================================
      // BERHASIL
      // ==========================================

      closeModal();


      toast(
        givenStatus ===
          "SUDAH DIBERIKAN"

          ? "ALKER berhasil dikirim ke Gudang."

          : "Pengajuan ALKER berhasil dikirim ke Gudang."
      );


      await renderMyInventory();


    } catch (err) {

      // ==========================================
      // GAGAL → BUKA KEMBALI FORM
      // ==========================================

      f.dataset.saving = "0";


      if (submitBtn) {

        submitBtn.disabled = false;

        submitBtn.textContent =
          originalText;

      }


      if (cancelBtn) {

        cancelBtn.disabled = false;

      }


      inputs.forEach(
        el => {

          el.disabled = false;

        }
      );


      toast(
        err.message ||
        "Gagal menyimpan data."
      );

    }

  };

};

/*************************************************
 * LAPORAN ALKER
 *************************************************/

async function renderInitialReport() {

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Laporan Alker
        </h2>

        <p class="muted">

          Laporkan kondisi ALKER
          yang Anda pegang.

        </p>

      </div>


      <button
        class="btn primary"
        onclick="showInitialForm()"
      >
        + Tambah Laporan
      </button>

    </div>


    <div id="reportBody">
      Memuat...
    </div>

  `;


  try {

    const [
      inv,
      issues
    ] =
      await Promise.all([

        api(
          "inventory",
          {scope: "mine"}
        ),

        api(
          "issues",
          {scope: "mine"}
        )

      ]);


    const items =
      inv.data || [];


    const problem =
      (issues.data || [])
        .filter(
          x =>
            /MENUNGGU|PROSES/i.test(
              x.status || ""
            )
        );


    $("reportBody").innerHTML = `

      <div class="grid cards">

        ${metric(
          "ALKER Tercatat",
          items.length,
          "tanggung jawab"
        )}

        ${metric(
          "Kondisi Bermasalah",
          items.filter(
            x =>
              /RUSAK|HILANG/i.test(
                x.condition || ""
              )
          ).length,
          "perlu perhatian"
        )}

        ${metric(
          "Laporan Masalah",
          problem.length,
          "menunggu proses"
        )}

      </div>


      <div style="height:15px"></div>


      <div class="card">

        <h3>
          ALKER Saya
        </h3>

        <div class="table-wrap">

          <table class="table">

            <thead>

              <tr>

                <th>ALKER</th>
                <th>Merk / Type</th>
                <th>SN</th>
                <th>Kondisi</th>
                <th>Status</th>
                <th></th>

              </tr>

            </thead>

            <tbody>

              ${
                items
                  .map(
                    x => `

                      <tr>

                        <td>

                          <strong>
                            ${esc(x.itemName)}
                          </strong>

                          <div class="small muted">
                            ${esc(x.inventoryId)}
                          </div>

                        </td>

                        <td>
                          ${esc(x.brand || "-")}
                          /
                          ${esc(x.type || "-")}
                        </td>

                        <td>
                          ${esc(
                            x.serialNumber || "-"
                          )}
                        </td>

                        <td>
                          ${badge(x.condition)}
                        </td>

                        <td>
                          ${badge(x.status)}
                        </td>

                        <td>

                          <button
                            class="btn secondary"
                            onclick='showInventoryDetail(${JSON.stringify(x)})'
                          >
                            Detail
                          </button>

                        </td>

                      </tr>

                    `
                  )
                  .join("") ||

                `<tr>

                  <td colspan="6">

                    <div class="empty">
                      Belum ada ALKER
                      yang disetujui Gudang.
                    </div>

                  </td>

                </tr>`
              }

            </tbody>

          </table>

        </div>

      </div>

    `;

  } catch (e) {

    $("reportBody").innerHTML = `

      <div class="card">

        <strong>
          Gagal memuat laporan
        </strong>

        <p class="danger-text">
          ${esc(e.message)}
        </p>

      </div>

    `;
  }
}

/*************************************************
 * KEPUTUSAN VERIFIKASI INVENTORY AWAL
 *************************************************/

window.initialDecision =
  async (
    id,
    decision
  ) => {

    if(!id){

      toast(
        "ID pengajuan tidak ditemukan."
      );

      return;

    }


    /*
     * APPROVE / VERIFIKASI
     */

    if(
      decision ===
      "APPROVE"
    ){

      const yakin =
        confirm(
          "Proses pengajuan ALKER ini?"
        );


      if(!yakin){
        return;
      }


      try{

        const r =
          await api(
            "initialDecision",
            {

              initialId:
                id,

              decision:
                "APPROVE"

            }
          );


        toast(
          r.data?.message ||
          "Pengajuan berhasil diproses."
        );


        await renderInitial();

      }catch(err){

        toast(
          err.message ||
          "Gagal memproses pengajuan."
        );

      }

      return;

    }


    /*
     * REVISION
     */

    if(
      decision ===
      "REVISION"
    ){

      const note =
        prompt(
          "Masukkan alasan revisi:"
        );


      if(note === null){
        return;
      }


      if(!note.trim()){

        toast(
          "Alasan revisi wajib diisi."
        );

        return;

      }


      try{

        await api(
          "initialDecision",
          {

            initialId:
              id,

            decision:
              "REVISION",

            note:
              note.trim()

          }
        );


        toast(
          "Pengajuan dikembalikan ke teknisi."
        );


        await renderInitial();

      }catch(err){

        toast(
          err.message ||
          "Gagal mengirim revisi."
        );

      }

      return;

    }


    toast(
      "Keputusan tidak dikenal."
    );

  };

/*************************************************
 * REQUEST
 *************************************************/

async function renderRequests() {

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Request Alker
        </h2>

        <p class="muted">
          Request baru atau penggantian
          mengikuti alur validasi.
        </p>

      </div>


      ${
        session.role === "TEKNISI"
          ? `
            <button
              class="btn primary"
              onclick="showRequestForm()"
            >
              + Request
            </button>
          `
          : ""
      }

    </div>


    <div id="req">
      Memuat...
    </div>

  `;


  const scope =
    session.role === "TEKNISI"
      ? "mine"
      : "loker";


  const r =
    await api(
      "requests",
      {scope}
    );


  $("req").innerHTML =
    tableRequests(
      r.data || []
    );
}


function tableRequests(a) {

  return `

    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Request</th>
            <th>Teknisi</th>
            <th>Alker</th>
            <th>Jenis</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th></th>

          </tr>

        </thead>

        <tbody>

          ${
            a
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.requestId)}
                    </td>

                    <td>
                      ${esc(x.technician)}
                    </td>

                    <td>
                      ${esc(x.itemName)}
                    </td>

                    <td>
                      ${esc(x.requestType)}
                    </td>

                    <td>
                      ${x.qty}
                    </td>

                    <td>
                      ${badge(x.status)}
                    </td>

                    <td>
                      ${esc(x.date)}
                    </td>

                    <td>

                      <button
                        class="btn secondary"
                        onclick='showRequestDetail(${JSON.stringify(x)})'
                      >
                        Detail
                      </button>

                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="8">

                <div class="empty">
                  Belum ada request.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


window.showRequestDetail =
  x => {

    openModal(

      "Detail Request",

      `

        <div class="detail-grid">

          ${[
            ["Request", x.requestId],
            ["Teknisi", x.technician],
            ["Loker", x.loker],
            ["Alker", x.itemName],
            ["Jenis", x.requestType],
            ["Qty", x.qty],
            ["Prioritas", x.priority],
            ["Status", x.status],
            ["Tanggal", x.date]
          ]
            .map(
              a => `

                <div class="detail-box">

                  <span>
                    ${esc(a[0])}
                  </span>

                  <strong>
                    ${esc(a[1] || "-")}
                  </strong>

                </div>

              `
            )
            .join("")}

        </div>


        <div
          class="card"
          style="margin-top:12px"
        >

          <strong>
            Alasan
          </strong>

          <p>
            ${esc(x.reason || "-")}
          </p>

        </div>

      `
    );
  };


window.showRequestForm =
  async () => {

    const r =
      await api("masters");


    openModal(

      "Request ALKER",

      `

        <form id="requestForm">

          <div class="form-grid">


            <label>

              Alker

              <select
                name="itemId"
                required
              >

                ${(
                  r.data?.items || []
                )
                  .map(
                    x => `

                      <option
                        value="${esc(x.itemId)}"
                      >

                        ${esc(x.itemName)}
                        —
                        ${esc(x.category)}

                      </option>

                    `
                  )
                  .join("")}

              </select>

            </label>


            <label>

              Jenis Request

              <select
                name="requestType"
              >

                <option>
                  BARU
                </option>

                <option>
                  PENGGANTIAN
                </option>

              </select>

            </label>


            <label>

              Qty

              <input
                name="qty"
                type="number"
                min="1"
                value="1"
                required
              >

            </label>


            <label>

              Prioritas

              <select
                name="priority"
              >

                <option>
                  NORMAL
                </option>

                <option>
                  TINGGI
                </option>

                <option>
                  MENDESAK
                </option>

              </select>

            </label>


            <label class="full-col">

              Alasan

              <textarea
                name="reason"
                required
              ></textarea>

            </label>


            <label class="full-col">

              Foto Pendukung

              <input
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
              >

            </label>


          </div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              class="btn primary"
              type="submit"
            >
              Kirim Request
            </button>

          </div>

        </form>

      `
    );


    $("requestForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        try {

          await api(
            "createRequest",
            {

              itemId:
                f.itemId.value,

              requestType:
                f.requestType.value,

              qty:
                f.qty.value,

              priority:
                f.priority.value,

              reason:
                f.reason.value,

              photo:
                await fileToBase64(
                  f.photo.files[0]
                )
            }
          );


          closeModal();

          toast(
            "Request berhasil dikirim."
          );


          renderRequests();

        } catch (err) {

          toast(err.message);

        }

      };
  };


/*************************************************
 * RUSAK / HILANG
 *************************************************/

async function renderIssues() {

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Rusak / Hilang
        </h2>

        <p class="muted">
          Laporkan kondisi ALKER
          yang menjadi tanggung jawab Anda.
        </p>

      </div>

    </div>


    <div id="issues">
      Memuat...
    </div>

  `;


  const r =
    await api(
      "issues",
      {scope: "mine"}
    );


  $("issues").innerHTML = `

    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Tanggal</th>
            <th>Inventory</th>
            <th>Alker</th>
            <th>Jenis</th>
            <th>Keterangan</th>
            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          ${
            (r.data || [])
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.date)}
                    </td>

                    <td>
                      ${esc(x.inventoryId)}
                    </td>

                    <td>
                      ${esc(x.itemName)}
                    </td>

                    <td>
                      ${esc(x.issueType)}
                    </td>

                    <td>
                      ${esc(x.note)}
                    </td>

                    <td>
                      ${badge(x.status)}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="6">

                <div class="empty">
                  Belum ada laporan.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


window.showIssueForm =
  async id => {

    openModal(

      "Lapor Rusak / Hilang",

      `

        <form id="issueForm">

          <div class="form-grid">


            <label>

              Jenis Masalah

              <select
                name="issueType"
              >

                <option>
                  RUSAK
                </option>

                <option>
                  HILANG
                </option>

              </select>

            </label>


            <label class="full-col">

              Keterangan

              <textarea
                name="note"
                required
              ></textarea>

            </label>


            <label class="full-col">

              Foto Pendukung

              <input
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
              >

            </label>


          </div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              class="btn warning"
            >
              Kirim Laporan
            </button>

          </div>

        </form>

      `
    );


    $("issueForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        try {

          await api(
            "reportIssue",
            {

              inventoryId: id,

              issueType:
                f.issueType.value,

              note:
                f.note.value,

              photo:
                await fileToBase64(
                  f.photo.files[0]
                )
            }
          );


          closeModal();

          toast(
            "Laporan berhasil dikirim."
          );


          renderIssues();

        } catch (err) {

          toast(err.message);

        }

      };
  };

/*************************************************
 * PENGEMBALIAN
 *
 * TEKNISI:
 * - Ajukan pengembalian
 * - Lihat status
 *
 * SPV GUDANG / ADMIN:
 * - Verifikasi
 * - Detail foto
 * - TERIMA
 * - REVISI
 *************************************************/

async function renderReturns(){

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Pengembalian
        </h2>

        <p class="muted">

          ${
            session.role === "TEKNISI"

              ? "Ajukan dan pantau pengembalian ALKER."

              : "Verifikasi pengembalian ALKER dari teknisi."
          }

        </p>

      </div>

    </div>


    <div id="returns">

      Memuat...

    </div>

  `;


  try{

    /*
     * ==========================================
     * TEKNISI
     * ==========================================
     */

    if(
      session.role ===
      "TEKNISI"
    ){

      const [
        invResult,
        returnResult
      ] =
        await Promise.all([

          api(
            "inventory",
            {
              scope:
                "mine"
            }
          ),

          api(
            "returns",
            {
              scope:
                "mine"
            }
          )

        ]);


      renderTechnicianReturns_(
        invResult.data || [],
        returnResult.data || []
      );

      return;

    }


    /*
     * ==========================================
     * SPV GUDANG / ADMIN
     * ==========================================
     */

    const r =
      await api(
        "returns",
        {
          scope:
            "all"
        }
      );


    renderWarehouseReturns_(
      r.data || []
    );


  }catch(err){

    $("returns").innerHTML = `

      <div class="card">

        <strong>
          Gagal memuat pengembalian
        </strong>

        <p class="danger-text">
          ${esc(
            err.message
          )}
        </p>

      </div>

    `;

  }

}
function renderTechnicianReturns_(
  inventory,
  returns
){

  const pending =
    returns.filter(
      x =>
        x.status ===
        "MENUNGGU VERIFIKASI"
    );


  const revision =
    returns.filter(
      x =>
        x.status ===
        "REVISI"
    );


  /*
   * Inventory yang masih DIPAKAI
   * dapat dikembalikan.
   */

  const canReturn =
    inventory.filter(
      x =>
        x.location ===
          "TEKNISI" &&

        x.holderId ===
          session.userId &&

        x.status ===
          "DIPAKAI"
    );


  $("returns").innerHTML = `

    <div class="grid cards">

      ${metric(
        "ALKER Saya",
        inventory.length,
        "inventory"
      )}

      ${metric(
        "Menunggu Gudang",
        pending.length,
        "verifikasi"
      )}

      ${metric(
        "Perlu Revisi",
        revision.length,
        "pengembalian"
      )}

    </div>


    <div style="height:15px"></div>


    <div class="card">

      <h3>
        ALKER yang Dapat Dikembalikan
      </h3>

      <p class="muted">
        Pilih ALKER yang benar-benar
        sudah Anda serahkan ke Gudang.
      </p>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>ALKER</th>
              <th>Merk / Type</th>
              <th>Serial Number</th>
              <th>Kondisi</th>
              <th>Status</th>
              <th>Aksi</th>

            </tr>

          </thead>


          <tbody>

            ${
              canReturn
                .map(
                  x => `

                    <tr>

                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div class="small muted">
                          ${esc(
                            x.inventoryId
                          )}
                        </div>

                      </td>


                      <td>

                        ${esc(
                          x.brand ||
                          "-"
                        )}

                        /

                        ${esc(
                          x.type ||
                          "-"
                        )}

                      </td>


                      <td>

                        ${esc(
                          x.serialNumber ||
                          "-"
                        )}

                      </td>


                      <td>

                        ${badge(
                          x.condition
                        )}

                      </td>


                      <td>

                        ${badge(
                          x.status
                        )}

                      </td>


                      <td>

                        <button
                          class="btn warning"
                          onclick='showReturnForm(${JSON.stringify(x)})'
                        >
                          ↩ Kembalikan
                        </button>

                      </td>

                    </tr>

                  `
                )
                .join("")

              ||

              `<tr>

                <td colspan="6">

                  <div class="empty">

                    Tidak ada ALKER
                    yang siap dikembalikan.

                  </div>

                </td>

              </tr>`

            }

          </tbody>

        </table>

      </div>

    </div>


    <div style="height:15px"></div>


    <div class="card">

      <h3>
        Riwayat Pengembalian
      </h3>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>Tanggal</th>
              <th>ALKER</th>
              <th>Kondisi</th>
              <th>Status</th>
              <th>Keterangan</th>

            </tr>

          </thead>


          <tbody>

            ${
              returns
                .map(
                  x => `

                    <tr>

                      <td>
                        ${esc(
                          x.date
                        )}
                      </td>

                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div class="small muted">
                          ${esc(
                            x.inventoryId
                          )}
                        </div>

                      </td>

                      <td>
                        ${badge(
                          x.condition
                        )}
                      </td>

                      <td>
                        ${returnStatusBadge_(
                          x.status
                        )}
                      </td>

                      <td>

                        ${
                          x.status ===
                          "REVISI"

                            ? `
                              <span class="danger-text">
                                ${esc(
                                  x.reviewNote ||
                                  "Mohon perbaiki."
                                )}
                              </span>
                            `

                            : esc(
                                x.reviewNote ||
                                x.note ||
                                "-"
                              )
                        }

                      </td>

                    </tr>

                  `
                )
                .join("")

              ||

              `<tr>

                <td colspan="5">

                  <div class="empty">
                    Belum ada riwayat pengembalian.
                  </div>

                </td>

              </tr>`

            }

          </tbody>

        </table>

      </div>

    </div>

  `;

}
/*************************************************
 * SPV GUDANG
 * VERIFIKASI PENGEMBALIAN
 *************************************************/

function renderWarehouseReturns_(
  returns
){

  const pending =
    returns.filter(
      x =>
        x.status ===
        "MENUNGGU VERIFIKASI"
    );


  const approved =
    returns.filter(
      x =>
        x.status ===
        "DITERIMA GUDANG"
    );


  const revision =
    returns.filter(
      x =>
        x.status ===
        "REVISI"
    );


  $("returns").innerHTML = `

    <!-- ==============================
         RINGKASAN
    =============================== -->

    <div class="grid cards">

      ${metric(
        "Menunggu Verifikasi",
        pending.length,
        "perlu diperiksa"
      )}

      ${metric(
        "Diterima Gudang",
        approved.length,
        "sudah kembali"
      )}

      ${metric(
        "Revisi",
        revision.length,
        "dikembalikan ke teknisi"
      )}

    </div>


    <div style="height:15px"></div>


    <!-- ==============================
         MENUNGGU VERIFIKASI
    =============================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h3>
            Menunggu Verifikasi
          </h3>

          <p class="muted">
            Periksa kondisi dan foto sebelum
            ALKER dikembalikan menjadi stok Gudang.
          </p>

        </div>

      </div>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>Tanggal</th>

              <th>Teknisi</th>

              <th>Loker</th>

              <th>ALKER</th>

              <th>Serial Number</th>

              <th>Kondisi</th>

              <th>Aksi</th>

            </tr>

          </thead>


          <tbody>

            ${
              pending
                .map(
                  x => `

                    <tr>

                      <td>
                        ${esc(
                          x.date
                        )}
                      </td>


                      <td>

                        <strong>
                          ${esc(
                            x.technician
                          )}
                        </strong>

                      </td>


                      <td>
                        ${esc(
                          x.loker
                        )}
                      </td>


                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div class="small muted">

                          ${esc(
                            x.inventoryId
                          )}

                        </div>

                      </td>


                      <td>
                        ${esc(
                          x.serialNumber ||
                          "-"
                        )}
                      </td>


                      <td>
                        ${badge(
                          x.condition
                        )}
                      </td>


                      <td>

                        <button
                          class="btn secondary"
                          onclick='showReturnVerificationDetail(${JSON.stringify(x)})'
                        >
                          Detail / Foto
                        </button>

                      </td>

                    </tr>

                  `
                )
                .join("")

              ||

              `

                <tr>

                  <td colspan="7">

                    <div class="empty">

                      Tidak ada pengembalian
                      yang menunggu verifikasi.

                    </div>

                  </td>

                </tr>

              `
            }

          </tbody>

        </table>

      </div>

    </div>


    <div style="height:15px"></div>


    <!-- ==============================
         RIWAYAT
    =============================== -->

    <div class="card">

      <h3>
        Riwayat Verifikasi
      </h3>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>Tanggal</th>

              <th>Teknisi</th>

              <th>ALKER</th>

              <th>Kondisi</th>

              <th>Status</th>

              <th>Catatan</th>

            </tr>

          </thead>


          <tbody>

            ${
              returns
                .filter(
                  x =>
                    x.status !==
                    "MENUNGGU VERIFIKASI"
                )
                .map(
                  x => `

                    <tr>

                      <td>
                        ${esc(
                          x.date
                        )}
                      </td>


                      <td>
                        ${esc(
                          x.technician
                        )}
                      </td>


                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div class="small muted">
                          ${esc(
                            x.inventoryId
                          )}
                        </div>

                      </td>


                      <td>
                        ${badge(
                          x.condition
                        )}
                      </td>


                      <td>
                        ${returnStatusBadge_(
                          x.status
                        )}
                      </td>


                      <td>

                        ${esc(
                          x.reviewNote ||
                          x.note ||
                          "-"
                        )}

                      </td>

                    </tr>

                  `
                )
                .join("")

              ||

              `

                <tr>

                  <td colspan="6">

                    <div class="empty">

                      Belum ada riwayat verifikasi.

                    </div>

                  </td>

                </tr>

              `
            }

          </tbody>

        </table>

      </div>

    </div>

  `;

}
/*************************************************
 * DETAIL VERIFIKASI PENGEMBALIAN
 *************************************************/

window.showReturnVerificationDetail =
  async x => {

    if(!x){
      toast(
        "Data pengembalian tidak ditemukan."
      );
      return;
    }


    openModal(

      "Verifikasi Pengembalian",

      `

        <div class="detail-grid">

          ${[
            [
              "ID Pengembalian",
              x.returnId
            ],

            [
              "Inventory ID",
              x.inventoryId
            ],

            [
              "Teknisi",
              x.technician
            ],

            [
              "Loker",
              x.loker
            ],

            [
              "ALKER",
              x.itemName
            ],

            [
              "Serial Number",
              x.serialNumber
            ],

            [
              "Kondisi Kembali",
              x.condition
            ],

            [
              "Tanggal",
              x.date
            ],

            [
              "Status",
              x.status
            ]

          ]
            .map(
              a => `

                <div class="detail-box">

                  <span>
                    ${esc(a[0])}
                  </span>

                  <strong>
                    ${esc(
                      a[1] || "-"
                    )}
                  </strong>

                </div>

              `
            )
            .join("")}

        </div>


        ${
          x.note

            ? `

              <div
                class="card"
                style="margin-top:15px"
              >

                <strong>
                  Catatan Teknisi
                </strong>

                <p>
                  ${esc(
                    x.note
                  )}
                </p>

              </div>

            `

            : ""
        }


        <div
          id="returnPhotoArea"
          style="margin-top:18px"
        >

          <div class="empty">

            Memuat foto...

          </div>

        </div>


        ${
          x.status ===
          "MENUNGGU VERIFIKASI"

            ? `

              <div
                class="actions"
                style="
                  margin-top:20px;
                  justify-content:flex-end;
                "
              >

                <button
                  class="btn warning"
                  onclick="
                    returnDecision(
                      '${esc(x.returnId)}',
                      'REVISION'
                    )
                  "
                >
                  ❌ Revisi
                </button>


                <button
                  class="btn success"
                  onclick="
                    returnDecision(
                      '${esc(x.returnId)}',
                      'APPROVE'
                    )
                  "
                >
                  ✅ Terima
                </button>

              </div>

            `

            : `

              <div
                class="card"
                style="margin-top:15px"
              >

                ${
                  returnStatusBadge_(
                    x.status
                  )
                }

                ${
                  x.reviewNote
                    ? `
                      <p
                        class="muted"
                        style="margin-top:8px"
                      >
                        ${esc(
                          x.reviewNote
                        )}
                      </p>
                    `
                    : ""
                }

              </div>

            `

        }

      `

    );


    const photos = [];


    /*
     * FOTO ALKER SAAT PENGEMBALIAN
     */

    if(
      x.photoUrl
    ){

      const dataUrl =
        await loadPhotoPreview_(
          x.photoUrl
        );


      if(dataUrl){

        photos.push(
          photoBox_(
            "Foto Saat Dikembalikan",
            dataUrl
          )
        );

      }

    }


    /*
     * FOTO SERIAL SAAT PENGEMBALIAN
     */

    if(
      x.serialPhotoUrl
    ){

      const dataUrl =
        await loadPhotoPreview_(
          x.serialPhotoUrl
        );


      if(dataUrl){

        photos.push(
          photoBox_(
            "Foto Serial Saat Dikembalikan",
            dataUrl
          )
        );

      }

    }


    /*
     * FOTO ASAL INVENTORY
     *
     * Ambil dari inventory asal.
     */

    try{

      const invResult =
        await api(
          "inventory",
          {
            scope:
              "all"
          }
        );


      const inv =
        (invResult.data || [])
          .find(
            i =>
              i.inventoryId ===
              x.inventoryId
          );


      if(inv){

        if(
          inv.photoUrl
        ){

          const dataUrl =
            await loadPhotoPreview_(
              inv.photoUrl
            );


          if(dataUrl){

            photos.unshift(
              photoBox_(
                "Foto ALKER Saat Diberikan",
                dataUrl
              )
            );

          }

        }


        if(
          inv.serialPhotoUrl
        ){

          const dataUrl =
            await loadPhotoPreview_(
              inv.serialPhotoUrl
            );


          if(dataUrl){

            photos.unshift(
              photoBox_(
                "Foto Serial Saat Diberikan",
                dataUrl
              )
            );

          }

        }

      }

    }catch(err){

      console.warn(
        "Foto inventory awal gagal dimuat:",
        err.message
      );

    }


    const area =
      $("returnPhotoArea");


    if(area){

      area.innerHTML =
        photos.length

          ? `

            <div class="photo-grid">

              ${photos.join("")}

            </div>

          `

          : `

            <div class="photo-empty">

              Foto tidak tersedia.

            </div>

          `;

    }

  };
  
  /*************************************************
 * KEPUTUSAN SPV
 * TERIMA / REVISI
 *************************************************/

window.returnDecision =
  async (
    returnId,
    decision
  ) => {

    if(!returnId){

      toast(
        "ID pengembalian tidak ditemukan."
      );

      return;

    }


    /*
     * ==========================================
     * TERIMA
     * ==========================================
     */

    if(
      decision ===
      "APPROVE"
    ){

      const yakin =
        confirm(
          "Terima pengembalian ALKER ini?\n\n" +
          "ALKER akan dipindahkan kembali " +
          "ke stok Gudang."
        );


      if(!yakin){
        return;
      }


      try{

        const r =
          await api(
            "returnDecision",
            {

              returnId:
                returnId,

              decision:
                "APPROVE",

              note:
                "Diterima Gudang."

            }
          );


        closeModal();


        toast(
          r.data?.message ||
          "Pengembalian diterima."
        );


        await renderReturns();


      }catch(err){

        toast(
          err.message ||
          "Gagal menerima pengembalian."
        );

      }

      return;

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
        prompt(
          "Masukkan alasan revisi pengembalian:"
        );


      if(
        note ===
        null
      ){

        return;

      }


      if(
        !note.trim()
      ){

        toast(
          "Alasan revisi wajib diisi."
        );

        return;

      }


      try{

        const r =
          await api(
            "returnDecision",
            {

              returnId:
                returnId,

              decision:
                "REVISION",

              note:
                note.trim()

            }
          );


        closeModal();


        toast(
          r.data?.message ||
          "Pengembalian dikembalikan ke teknisi."
        );


        await renderReturns();


      }catch(err){

        toast(
          err.message ||
          "Gagal mengirim revisi."
        );

      }

      return;

    }


    toast(
      "Keputusan tidak dikenal."
    );

  };
  
  /*************************************************
 * STATUS PENGEMBALIAN
 *************************************************/

function returnStatusBadge_(
  status
){

  const s =
    String(
      status || ""
    ).toUpperCase();


  if(
    s ===
    "MENUNGGU VERIFIKASI"
  ){

    return `
      <span class="badge yellow">
        MENUNGGU VERIFIKASI
      </span>
    `;

  }


  if(
    s ===
    "DITERIMA GUDANG"
  ){

    return `
      <span class="badge green">
        DITERIMA GUDANG
      </span>
    `;

  }


  if(
    s ===
    "REVISI"
  ){

    return `
      <span class="badge red">
        REVISI
      </span>
    `;

  }


  return badge(
    status ||
    "-"
  );

}

/*************************************************
 * TEAM — TEKNISI SAYA
 *************************************************/

async function renderTeam() {

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          ${
            session.role === "TEKNISI"
              ? "Tim Saya"
              : "Teknisi Loker"
          }
        </h2>

        <p class="muted">
          ${esc(session.loker || "")}
        </p>

      </div>

    </div>


    <div id="teamBody">
      Memuat...
    </div>

  `;


  const r =
    await api("technicianTeam");


  const d =
    r.data || {};


  /*
   * TEKNISI
   */
  if (session.role === "TEKNISI") {

    const team =
      d.team;


    if (!team) {

      $("teamBody").innerHTML = `

        <div class="card">

          <h3>
            Belum ada Tim
          </h3>

          <p class="muted">
            Anda belum dimasukkan ke
            Tim Teknisi.
          </p>

        </div>

      `;

      return;
    }


    $("teamBody").innerHTML = `

      <div class="grid two">


        <div class="card">

          <div class="section-head">

            <div>

              <h3>
                Teknisi Utama
              </h3>

              <p class="muted">
                ${esc(team.loker)}
              </p>

            </div>

          </div>


          <div class="detail-box">

            <span>
              Nama
            </span>

            <strong>
              ${esc(team.technicianName)}
            </strong>

          </div>

        </div>


        <div class="card">

          <h3>
            Teknisi 2 / Partner
          </h3>

          <div class="detail-box">

            <span>
              Nama
            </span>

            <strong>
              ${
                esc(
                  team.partnerName ||
                  "Tidak ada partner"
                )
              }
            </strong>

          </div>

        </div>


      </div>

    `;

    return;
  }


  /*
   * LEADER / ADMIN / SPV
   */
  const teams =
    d.teams || [];


  $("teamBody").innerHTML = `

    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Tim</th>
            <th>Loker</th>
            <th>Teknisi Utama</th>
            <th>Partner</th>
            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          ${
            teams
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.teamId)}
                    </td>

                    <td>
                      ${esc(x.loker)}
                    </td>

                    <td>
                      <strong>
                        ${esc(x.technicianName)}
                      </strong>
                    </td>

                    <td>
                      ${
                        esc(
                          x.partnerName ||
                          "-"
                        )
                      }
                    </td>

                    <td>
                      ${badge("AKTIF")}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="5">

                <div class="empty">
                  Belum ada tim.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


/*************************************************
 * KELOLA TIM
 *************************************************/

async function renderTeamManage() {

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Kelola Tim Teknisi
        </h2>

        <p class="muted">
          Atur Teknisi Utama dan Teknisi 2 /
          Partner berdasarkan loker.
        </p>

      </div>


      <button
        class="btn primary"
        onclick="showTeamForm()"
      >
        + Buat Tim
      </button>

    </div>


    <div id="teamManageBody">
      Memuat...
    </div>

  `;


  const r =
    await api(
      "technicianTeam"
    );


  const d =
    r.data || {};


  const teams =
    d.teams || [];


  $("teamManageBody").innerHTML = `

    <div class="grid cards">

      ${metric(
        "Total Tim",
        teams.length,
        "tim aktif"
      )}

      ${metric(
        "Teknisi",
        (d.technicians || []).length,
        "teknisi aktif"
      )}

      ${metric(
        "Dengan Partner",
        teams.filter(
          x => x.partnerId
        ).length,
        "tim"
      )}

    </div>


    <div style="height:15px"></div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Tim</th>
            <th>Loker</th>
            <th>Teknisi Utama</th>
            <th>Partner</th>
            <th></th>

          </tr>

        </thead>

        <tbody>

          ${
            teams
              .map(
                x => `

                  <tr>

                    <td>
                      <strong>
                        ${esc(x.teamId)}
                      </strong>
                    </td>

                    <td>
                      ${esc(x.loker)}
                    </td>

                    <td>
                      ${esc(x.technicianName)}
                    </td>

                    <td>
                      ${
                        esc(
                          x.partnerName ||
                          "-"
                        )
                      }
                    </td>

                   <td>

					<div class="actions">

					<button
					class="btn secondary"
					onclick='editTeam(${JSON.stringify(x)})'
						>
					Edit
					</button>

					<button
					  class="btn danger"
					  onclick="disableTeam('${esc(x.teamId)}')"
					>
					  Nonaktifkan
					</button>

					<span class="badge green">
					  AKTIF
					</span>

				  </div>

				</td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="5">

                <div class="empty">
                  Belum ada tim.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


/*************************************************
 * TEAM FORM
 *************************************************/

window.showTeamForm =
  async () => {

    await openTeamEditor();
  };


window.editTeam =
  async team => {

    await openTeamEditor(team);
  };


async function openTeamEditor(existing = null) {

  const r = await api("technicianTeam");

  const d = r.data || {};

  const technicians = d.technicians || [];

  /*
   * ==========================================
   * LOKER OPERASIONAL
   * ==========================================
   */

  const OPERATIONAL_LOKERS = [
    "IOAN / ASSURANCE",
    "PSB / FULFILLMENT",
    "MAINTENANCE / OSP"
  ];


  /*
   * ==========================================
   * LOKER TERPILIH
   * ==========================================
   */

  const selectedLoker =
    existing?.loker ||
    (
      session.role === "LEADER"
        ? OPERATIONAL_LOKERS[0]
        : session.loker
    );


  /*
   * ==========================================
   * TEKNISI SESUAI LOKER
   * ==========================================
   */

  const available =
    technicians.filter(
      x =>
        x.loker === selectedLoker
    );


  openModal(

    existing
      ? "Edit Tim Teknisi"
      : "Buat Tim Teknisi",

    `

      <form id="teamForm">

        <div class="form-grid">

          <label>

  Loker / Divisi Teknisi


  ${
    isLeader

      ? `

        <select
          name="loker"
          id="userLoker"
          required
        >

          <option value="">
            Pilih Loker Teknisi
          </option>


          <option
            value="IOAN / ASSURANCE"
            ${
              user.loker ===
              "IOAN / ASSURANCE"
                ? "selected"
                : ""
            }
          >
            IOAN / ASSURANCE
          </option>


          <option
            value="PSB / FULFILLMENT"
            ${
              user.loker ===
              "PSB / FULFILLMENT"
                ? "selected"
                : ""
            }
          >
            PSB / FULFILLMENT
          </option>


          <option
            value="MAINTENANCE / OSP"
            ${
              user.loker ===
              "MAINTENANCE / OSP"
                ? "selected"
                : ""
            }
          >
            MAINTENANCE / OSP
          </option>

        </select>

      `

      : `

        <select
          name="loker"
          id="userLoker"
          required
        >

          <option value="">
            Pilih Loker
          </option>


          <option
            value="IOAN / ASSURANCE"
            ${
              user.loker ===
              "IOAN / ASSURANCE"
                ? "selected"
                : ""
            }
          >
            IOAN / ASSURANCE
          </option>


          <option
            value="PSB / FULFILLMENT"
            ${
              user.loker ===
              "PSB / FULFILLMENT"
                ? "selected"
                : ""
            }
          >
            PSB / FULFILLMENT
          </option>


          <option
            value="MAINTENANCE / OSP"
            ${
              user.loker ===
              "MAINTENANCE / OSP"
                ? "selected"
                : ""
            }
          >
            MAINTENANCE / OSP
          </option>


          <option
            value="LEADER"
            ${
              user.loker ===
              "LEADER"
                ? "selected"
                : ""
            }
          >
            LEADER
          </option>


          <option
            value="GUDANG"
            ${
              user.loker ===
              "GUDANG"
                ? "selected"
                : ""
            }
          >
            GUDANG
          </option>


          <option
            value="ADMIN"
            ${
              user.loker ===
              "ADMIN"
                ? "selected"
                : ""
            }
          >
            ADMIN
          </option>

        </select>

      `
  }

</label>


          <label>

            Teknisi Utama

            <select
              name="technicianId"
              id="teamTechnician"
              required
            >

              ${
                available
                  .map(
                    x => `

                      <option
                        value="${esc(x.userId)}"
                        ${
                          x.userId ===
                          existing?.technicianId
                            ? "selected"
                            : ""
                        }
                      >
                        ${esc(x.name)}
                      </option>

                    `
                  )
                  .join("")
              }

            </select>

          </label>


          <label>

            Teknisi 2 / Partner

            <select
              name="partnerId"
              id="teamPartner"
            >

              <option value="">
                -- Tidak ada partner --
              </option>

              ${
                available
                  .map(
                    x => `

                      <option
                        value="${esc(x.userId)}"
                        ${
                          x.userId ===
                          existing?.partnerId
                            ? "selected"
                            : ""
                        }
                      >
                        ${esc(x.name)}
                      </option>

                    `
                  )
                  .join("")
              }

            </select>

          </label>

        </div>


        <div
          class="card"
          style="margin-top:15px"
        >

          <p class="muted">

            Teknisi 1 wajib memiliki
            ALKER resmi.

            Teknisi 2 / Partner tidak wajib
            memiliki ALKER.

            Partner harus berasal dari
            loker/divisi yang sama.

            Satu teknisi tidak boleh berada
            pada dua tim aktif.

          </p>

        </div>


        <div
          class="actions"
          style="margin-top:15px"
        >

          <button
            type="button"
            class="btn secondary"
            onclick="closeModal()"
          >
            Batal
          </button>

          <button
            type="submit"
            class="btn primary"
          >
            ${
              existing
                ? "Simpan Perubahan"
                : "Simpan Tim"
            }
          </button>

        </div>

      </form>

    `
  );


  const lokerSelect =
    $("teamLoker");

  const techSelect =
    $("teamTechnician");

  const partnerSelect =
    $("teamPartner");


  /*
   * ==========================================
   * LOAD TEKNISI SESUAI LOKER
   * ==========================================
   */

  async function reloadTechnicians() {

    const selectedTech =
      techSelect.value;

    const selectedPartner =
      partnerSelect.value;


    const fresh =
      await api(
        "technicianTeam"
      );


    const list =
      (fresh.data?.technicians || [])
        .filter(
          x =>
            x.loker ===
            lokerSelect.value
        );


    techSelect.innerHTML =
      list
        .map(
          x => `

            <option
              value="${esc(x.userId)}"
            >
              ${esc(x.name)}
            </option>

          `
        )
        .join("");


    partnerSelect.innerHTML = `

      <option value="">
        -- Tidak ada partner --
      </option>

      ${
        list
          .map(
            x => `

              <option
                value="${esc(x.userId)}"
              >
                ${esc(x.name)}
              </option>

            `
          )
          .join("")
      }

    `;


    if(
      list.some(
        x =>
          x.userId ===
          selectedTech
      )
    ){

      techSelect.value =
        selectedTech;

    }


    if(
      list.some(
        x =>
          x.userId ===
          selectedPartner
      )
    ){

      partnerSelect.value =
        selectedPartner;

    }


    techSelect.onchange();

  }


  /*
   * GANTI LOKER
   */

  lokerSelect.onchange =
    async () => {

      await reloadTechnicians();

    };


  /*
   * TEKNISI UTAMA
   */

  techSelect.onchange =
    () => {

      if(
        partnerSelect.value ===
        techSelect.value
      ){

        partnerSelect.value = "";

      }


      [
        ...partnerSelect.options
      ].forEach(
        option => {

          option.disabled =
            option.value &&
            option.value ===
              techSelect.value;

        }
      );

    };


  /*
   * SUBMIT TEAM
   */

  $("teamForm").onsubmit =
    async e => {

      e.preventDefault();


      const technicianId =
        techSelect.value;

      const partnerId =
        partnerSelect.value;


      if(!technicianId){

        toast(
          "Teknisi utama wajib dipilih."
        );

        return;

      }


      if(
        partnerId &&
        partnerId === technicianId
      ){

        toast(
          "Teknisi utama dan partner tidak boleh sama."
        );

        return;

      }


      try{

        await api(
          "saveTechnicianTeam",
          {

            teamId:
              existing?.teamId || "",

            technicianId,

            partnerId

          }
        );


        closeModal();


        toast(
          existing
            ? "Tim berhasil diperbarui."
            : "Tim berhasil dibuat."
        );


        if(
          typeof loadTeamManage ===
          "function"
        ){

          await loadTeamManage();

        }

      }catch(err){

        toast(
          err.message ||
          "Gagal menyimpan tim."
        );

      }

    };


  /*
   * LOAD AWAL
   */

  await reloadTechnicians();

}

/*************************************************
 * NONAKTIFKAN TIM
 *************************************************/

window.disableTeam = async teamId => {

  if (!teamId) {
    toast("ID tim tidak ditemukan.");
    return;
  }

  const yakin = confirm(
    "Nonaktifkan tim ini?\n\n" +
    "Tim tidak akan dihapus dari histori, " +
    "tetapi tidak lagi menjadi tim aktif."
  );

  if (!yakin) {
    return;
  }

  try {

    await api(
      "deleteTechnicianTeam",
      {
        teamId: teamId
      }
    );

    toast(
      "Tim berhasil dinonaktifkan."
    );

    await renderTeamManage();

  } catch (err) {

    toast(
      err.message ||
      "Gagal menonaktifkan tim."
    );

  }

};

/*
 * Nonaktifkan tim belum diaktifkan pada CHECKPOINT 3.2C
 * karena endpoint deleteTechnicianTeam belum menjadi bagian
 * dari kontrak backend yang sedang kita pakai.
 */

/*************************************************
 * LEADER TEAM
 *************************************************/

async function renderTeamInventory() {

  const r =
    await api(
      "inventory",
      {
        scope: "loker"
      }
    );


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Inventory Loker
        </h2>

        <p class="muted">
          ${esc(session.loker)}
        </p>

      </div>

    </div>


    <div id="teamInv">
    </div>

  `;


  renderInventoryTable(
    $("teamInv"),
    r.data || [],
    "loker"
  );
}


async function renderTeamRequests() {

  const r =
    await api(
      "requests",
      {
        scope: "loker"
      }
    );


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Validasi Request
        </h2>

        <p class="muted">
          Validasi kebutuhan teknisi
          sebelum diteruskan ke Gudang.
        </p>

      </div>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Request</th>
            <th>Teknisi</th>
            <th>Alker</th>
            <th>Jenis</th>
            <th>Qty</th>
            <th>Status</th>
            <th></th>

          </tr>

        </thead>


        <tbody>

          ${
            (r.data || [])
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.requestId)}
                    </td>

                    <td>
                      ${esc(x.technician)}
                    </td>

                    <td>
                      ${esc(x.itemName)}
                    </td>

                    <td>
                      ${esc(x.requestType)}
                    </td>

                    <td>
                      ${x.qty}
                    </td>

                    <td>
                      ${badge(x.status)}
                    </td>

                    <td>

                      ${
                        /MENUNGGU VALIDASI/.test(
                          x.status || ""
                        )
                          ? `

                            <button
                              class="btn success"
                              onclick="
                                approveRequest(
                                  '${esc(x.requestId)}'
                                )
                              "
                            >
                              Approve
                            </button>

                            <button
                              class="btn danger"
                              onclick="
                                rejectRequest(
                                  '${esc(x.requestId)}'
                                )
                              "
                            >
                              Tolak
                            </button>

                          `
                          : ""
                      }

                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="7">

                <div class="empty">
                  Tidak ada request.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


window.approveRequest =
  async id => {

    try {

      await api(
        "requestDecision",
        {
          requestId: id,
          decision: "APPROVE"
        }
      );


      toast(
        "Request disetujui."
      );


      renderTeamRequests();

    } catch (e) {

      toast(e.message);

    }
  };


window.rejectRequest =
  async id => {

    const note =
      prompt(
        "Alasan penolakan:"
      );


    if (note === null)
      return;


    try {

      await api(
        "requestDecision",
        {
          requestId: id,
          decision: "REJECT",
          note
        }
      );


      toast(
        "Request ditolak."
      );


      renderTeamRequests();

    } catch (e) {

      toast(e.message);

    }
  };


/*************************************************
 * GUDANG
 * STOK PER ALKER
 *************************************************/

async function renderWarehouse(){

  const r =
    await api(
      "warehouse"
    );


  const d =
    r.data || {};


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Stok Gudang
        </h2>

        <p class="muted">
          Stok aktual berdasarkan jenis ALKER
          dan kondisi fisiknya.
        </p>

      </div>


      <button
        class="btn primary"
        onclick="showReceivingForm()"
      >
        + Barang Masuk
      </button>

    </div>


    <!-- ==================================
         RINGKASAN GUDANG
    =================================== -->

    <div class="grid cards">

      ${metric(
        "Total Unit Gudang",
        d.summary?.count || 0,
        "unit"
      )}


      ${metric(
        "Nilai Stok",
        money(
          d.summary?.value || 0
        ),
        "inventory"
      )}


      ${metric(
        "Request",
        d.summary?.requests || 0,
        "menunggu"
      )}


      ${metric(
        "Pengadaan",
        d.summary?.procurement || 0,
        "aktif"
      )}

    </div>


    <div style="height:15px"></div>


    <!-- ==================================
         STOK PER ALKER
    =================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h3>
            Ketersediaan ALKER
          </h3>

          <p class="muted">
            Menampilkan jumlah dan kondisi
            setiap jenis ALKER yang tersedia
            di Gudang.
          </p>

        </div>

      </div>


      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>ALKER</th>

              <th>TOTAL</th>

              <th>BAIK</th>

              <th>RUSAK RINGAN</th>

              <th>RUSAK BERAT</th>

              <th>HILANG</th>

              <th>SIAP DIPAKAI</th>

              <th>NILAI</th>

            </tr>

          </thead>


          <tbody>

            ${
              (d.byItem || [])
                .map(
                  x => `

                    <tr>

                      <td>

                        <strong>
                          ${esc(
                            x.itemName
                          )}
                        </strong>

                        <div class="small muted">

                          ${esc(
                            x.category ||
                            "-"
                          )}

                        </div>

                      </td>


                      <td>

                        <strong>
                          ${x.total}
                        </strong>

                      </td>


                      <td>

                        <span class="badge green">
                          ${x.baik}
                        </span>

                      </td>


                      <td>

                        <span class="badge yellow">
                          ${x.rusakRingan}
                        </span>

                      </td>


                      <td>

                        <span class="badge red">
                          ${x.rusakBerat}
                        </span>

                      </td>


                      <td>

                        ${
                          x.hilang > 0

                            ? `
                              <span class="badge red">
                                ${x.hilang}
                              </span>
                            `

                            : `
                              <span class="badge gray">
                                0
                              </span>
                            `
                        }

                      </td>


                      <td>

                        ${
                          x.siapDipakai > 0

                            ? `
                              <span class="badge green">
                                ${x.siapDipakai}
                              </span>
                            `

                            : `
                              <span class="badge gray">
                                0
                              </span>
                            `
                        }

                      </td>


                      <td>

                        <strong>
                          ${money(
                            x.nilai
                          )}
                        </strong>

                      </td>

                    </tr>

                  `
                )
                .join("") ||

              `

                <tr>

                  <td colspan="8">

                    <div class="empty">

                      Belum ada ALKER
                      di Gudang.

                    </div>

                  </td>

                </tr>

              `
            }

          </tbody>

        </table>

      </div>

    </div>


    <div style="height:15px"></div>


    <!-- ==================================
         DETAIL UNIT
    =================================== -->

    <div class="card">

      <h3>
        Detail Unit Gudang
      </h3>


      ${warehouseTableDetail_(
        d.items || []
      )}

    </div>

  `;

}


function warehouseTableDetail_(
  items
){

  return `

    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>ID</th>

            <th>ALKER</th>

            <th>MERK / TYPE</th>

            <th>SN</th>

            <th>KONDISI</th>

            <th>STATUS</th>

            <th>NILAI</th>

          </tr>

        </thead>


        <tbody>

          ${
            items
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(
                        x.inventoryId
                      )}
                    </td>


                    <td>

                      <strong>
                        ${esc(
                          x.itemName
                        )}
                      </strong>

                    </td>


                    <td>

                      ${esc(
                        x.brand ||
                        "-"
                      )}

                      /

                      ${esc(
                        x.type ||
                        "-"
                      )}

                    </td>


                    <td>
                      ${esc(
                        x.serialNumber ||
                        "-"
                      )}
                    </td>


                    <td>
                      ${badge(
                        x.condition
                      )}
                    </td>


                    <td>
                      ${badge(
                        x.status
                      )}
                    </td>


                    <td>
                      ${money(
                        x.price
                      )}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `

              <tr>

                <td colspan="7">

                  <div class="empty">
                    Stok kosong.
                  </div>

                </td>

              </tr>

            `
          }

        </tbody>

      </table>

    </div>

  `;

}

/*************************************************
 * VERIFIKASI INVENTORY AWAL
 *************************************************/

async function renderInitial(){

  const r =
    await api(
      "initialPending"
    );


  const data =
    r.data || [];


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Verifikasi Inventory Awal
        </h2>

        <p class="muted">
          Periksa ALKER yang dilaporkan
          teknisi sebelum menjadi inventory
          atau diteruskan ke pengadaan.
        </p>

      </div>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Teknisi</th>
            <th>Loker</th>
            <th>ALKER</th>
            <th>Pemberian</th>
            <th>Merk / Type</th>
            <th>SN</th>
            <th>Kondisi</th>
            <th>Tanggal</th>
            <th>Aksi</th>

          </tr>

        </thead>


        <tbody>

          ${
            data
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(
                        x.technician
                      )}
                    </td>

                    <td>
                      ${esc(
                        x.loker
                      )}
                    </td>

                    <td>
                      <strong>
                        ${esc(
                          x.itemName
                        )}
                      </strong>
                    </td>

                    <td>
                      ${badge(
                        x.givenStatus ||
                        "BELUM DIBERIKAN"
                      )}
                    </td>

                    <td>
                      ${
                        x.givenStatus ===
                        "SUDAH DIBERIKAN"

                          ? esc(
                              (
                                x.brand ||
                                "-"
                              ) +
                              " / " +
                              (
                                x.type ||
                                "-"
                              )
                            )

                          : "-"
                      }
                    </td>

                    <td>
                      ${
                        x.givenStatus ===
                        "SUDAH DIBERIKAN"

                          ? esc(
                              x.serialNumber ||
                              "-"
                            )

                          : "-"
                      }
                    </td>

                    <td>
                      ${
                        x.givenStatus ===
                        "SUDAH DIBERIKAN"

                          ? badge(
                              x.condition
                            )

                          : "-"
                      }
                    </td>

                    <td>
                      ${esc(
                        x.date
                      )}
                    </td>
					
	<td>

  <div class="actions">

    <button
      class="btn secondary"
      onclick='showInitialVerificationDetail(${JSON.stringify(x)})'
    >
      Detail / Foto
    </button>

    <button
      class="btn success"
      onclick="
        initialDecision(
          '${esc(x.initialId)}',
          'APPROVE'
        )
      "
    >
      ${
        x.givenStatus ===
        "BELUM DIBERIKAN"
          ? "Verifikasi & Pengadaan"
          : "Approve"
      }
    </button>

    <button
      class="btn warning"
      onclick="
        initialDecision(
          '${esc(x.initialId)}',
          'REVISION'
        )
      "
    >
      Revisi
    </button>

	</div>

		</td>
				
                  </tr>

                `
              )
              .join("")

              ||

              `<tr>

                <td colspan="9">

                  <div class="empty">
                    Tidak ada pengajuan
                    yang menunggu verifikasi.
                  </div>

                </td>

              </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}

/*************************************************
 * BARANG MASUK
 *************************************************/

async function renderReceiving() {

  const r =
    await api(
      "receiving"
    );


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Barang Masuk Gudang
        </h2>

        <p class="muted">
          Setiap barang baru yang diterima
          menjadi inventory resmi.
        </p>

      </div>


      <button
        class="btn primary"
        onclick="showReceivingForm()"
      >
        + Catat Barang Masuk
      </button>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Transaksi</th>
            <th>Alker</th>
            <th>Qty</th>
            <th>Supplier</th>
            <th>Tanggal</th>
            <th>Status</th>

          </tr>

        </thead>


        <tbody>

          ${
            (r.data || [])
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.receivingId)}
                    </td>

                    <td>
                      ${esc(x.itemName)}
                    </td>

                    <td>
                      ${x.qty}
                    </td>

                    <td>
                      ${esc(x.supplier)}
                    </td>

                    <td>
                      ${esc(x.date)}
                    </td>

                    <td>
                      ${badge(x.status)}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="6">

                <div class="empty">
                  Belum ada penerimaan.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


/*************************************************
 * FORM BARANG MASUK GUDANG
 *
 * HARGA OTOMATIS DARI MASTER ALKER
 *
 * Gudang tidak mengisi harga manual.
 * Harga hanya ditentukan melalui
 * menu MASTER HARGA ALKER.
 *************************************************/

window.showReceivingForm =
  async () => {

    const r =
      await api(
        "masters"
      );


    const items =
      r.data?.items ||
      [];


    /*
     * ==========================================
     * FORMAT RUPIAH
     * ==========================================
     */

    const formatRupiah =
      value => {

        const n =
          Number(value || 0);


        return new Intl.NumberFormat(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
          }
        ).format(n);

      };


    /*
     * ==========================================
     * MODAL
     * ==========================================
     */

    openModal(

      "Catat Barang Baru Masuk Gudang",

      `

        <form id="receivingForm">

          <div class="form-grid">


            <!-- ==============================
                 ALKER
            =============================== -->

            <label>

              Alker

              <select
                name="itemId"
                id="receivingItemId"
                required
              >

                ${
                  items
                    .map(
                      x => `

                        <option
                          value="${esc(
                            x.itemId
                          )}"
                        >

                          ${esc(
                            x.itemName
                          )}

                        </option>

                      `
                    )
                    .join("")
                }

              </select>

            </label>


            <!-- ==============================
                 QTY
            =============================== -->

            <label>

              Qty

              <input
                name="qty"
                type="number"
                min="1"
                value="1"
                required
              >

            </label>


            <!-- ==============================
                 MERK
            =============================== -->

            <label>

              Merk

              <input
                name="brand"
              >

            </label>


            <!-- ==============================
                 TYPE
            =============================== -->

            <label>

              Type

              <input
                name="type"
              >

            </label>


            <!-- ==============================
                 SERIAL NUMBER
            =============================== -->

            <label>

              Serial Number

              <input
                name="serialNumber"
              >

            </label>


            <!-- ==============================
                 HARGA MASTER
            =============================== -->

            <label>

              Harga Master ALKER

              <input
                id="receivingMasterPrice"
                type="text"
                readonly
                style="
                  background:#f3f4f6;
                  font-weight:700;
                  cursor:not-allowed;
                "
              >

              <small
                class="muted"
                style="
                  display:block;
                  margin-top:4px;
                "
              >
                Harga ditentukan dari Master Harga ALKER.
                Tidak dapat diubah di Barang Masuk.
              </small>

            </label>


            <!-- ==============================
                 SUPPLIER
            ============================== -->

            <label>

              Supplier

              <input
                name="supplier"
              >

            </label>


            <!-- ==============================
                 PO / INVOICE
            ============================== -->

            <label>

              No. PO / Invoice

              <input
                name="reference"
              >

            </label>


            <!-- ==============================
                 KETERANGAN
            ============================== -->

            <label class="full-col">

              Keterangan

              <textarea
                name="note"
              ></textarea>

            </label>


            <!-- ==============================
                 FOTO BARANG
            ============================== -->

            <label>

              Foto Barang

              <input
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
              >

            </label>


            <!-- ==============================
                 FOTO DOKUMEN
            ============================== -->

            <label>

              Foto Invoice / Surat Jalan

              <input
                name="docPhoto"
                type="file"
                accept="image/*"
                capture="environment"
              >

            </label>


          </div>


          <!-- ================================
               INFORMASI HARGA
          ================================= -->

          <div
            class="card"
            style="
              margin-top:15px;
              padding:14px;
            "
          >

            <div
              style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:12px;
              "
            >

              <div>

                <strong>
                  Nilai Aset
                </strong>

                <div
                  class="muted"
                  style="margin-top:3px"
                >
                  Mengikuti harga Master ALKER.
                </div>

              </div>


              <strong
                id="receivingMasterPriceInfo"
                style="
                  font-size:18px;
                "
              >
                Rp0
              </strong>

            </div>

          </div>


          <!-- ================================
               ACTION
          ================================= -->

          <div
            class="actions"
            style="
              margin-top:15px;
            "
          >

            <button
              type="submit"
              class="btn primary"
              id="receivingSaveBtn"
            >

              Simpan & Masuk Gudang

            </button>

          </div>

        </form>

      `
    );


    /*
     * ==========================================
     * ELEMENT
     * ==========================================
     */

    const form =
      $("receivingForm");


    const itemSelect =
      $("receivingItemId");


    const priceInput =
      $("receivingMasterPrice");


    const priceInfo =
      $("receivingMasterPriceInfo");


    const saveBtn =
      $("receivingSaveBtn");


    /*
     * ==========================================
     * UPDATE HARGA MASTER DI LAYAR
     * ==========================================
     */

    const updateMasterPriceDisplay =
      () => {

        const selectedItem =
          items.find(
            x =>
              String(x.itemId) ===
              String(
                itemSelect.value
              )
          );


        const price =
          Number(
            selectedItem?.standardPrice ||
            selectedItem?.price ||
            0
          );


        const formatted =
          formatRupiah(
            price
          );


        if(priceInput){

          priceInput.value =
            formatted;

        }


        if(priceInfo){

          priceInfo.textContent =
            formatted;

        }

      };


    /*
     * ==========================================
     * SAAT ALKER DIGANTI
     * ==========================================
     */

    itemSelect.onchange =
      updateMasterPriceDisplay;


    /*
     * Tampilkan harga pertama
     */

    updateMasterPriceDisplay();


    /*
     * ==========================================
     * SUBMIT
     * ==========================================
     */

    form.onsubmit =
      async e => {

        e.preventDefault();


        /*
         * Cegah klik 2x
         */

        if(
          saveBtn &&
          saveBtn.disabled
        ){

          return;

        }


        /*
         * Lock tombol
         */

        if(saveBtn){

          saveBtn.disabled =
            true;

          saveBtn.innerHTML =
            "⏳ Menyimpan...";

        }


        try {

          /*
           * ==================================
           * KIRIM DATA
           * ==================================
           *
           * PENTING:
           * Tidak ada lagi:
           *
           * price: f.price.value
           *
           * Harga diambil backend dari
           * MASTER_ALKER.standardPrice.
           */

          const result =
            await api(
              "receive",
              {

                itemId:
                  form.itemId.value,

                qty:
                  form.qty.value,

                brand:
                  form.brand.value,

                type:
                  form.type.value,

                serialNumber:
                  form.serialNumber.value,

                supplier:
                  form.supplier.value,

                reference:
                  form.reference.value,

                note:
                  form.note.value,

                photo:
                  await fileToBase64(
                    form.photo.files[0]
                  ),

                docPhoto:
                  await fileToBase64(
                    form.docPhoto.files[0]
                  )

              }
            );


          /*
           * ==================================
           * BERHASIL
           * ==================================
           */

          closeModal();


          toast(
            "Barang berhasil masuk Gudang dengan harga Master ALKER."
          );


          await renderReceiving();


        } catch(err) {


          /*
           * ==================================
           * GAGAL
           * ==================================
           */

          toast(
            err.message ||
            "Gagal menyimpan Barang Masuk."
          );


          /*
           * Buka kembali tombol
           */

          if(saveBtn){

            saveBtn.disabled =
              false;

            saveBtn.innerHTML =
              "Simpan & Masuk Gudang";

          }

        }

      };

  };

/*************************************************
 * DISTRIBUSI
 *************************************************/

async function renderDistribution() {

  const r =
    await api(
      "distribution"
    );


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Distribusi
        </h2>

        <p class="muted">
          Pencatatan barang keluar
          dari Gudang menuju teknisi.
        </p>

      </div>


      <button
        class="btn primary"
        onclick="showDistributionForm()"
      >
        + Distribusi
      </button>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Transaksi</th>
            <th>Alker</th>
            <th>Tujuan</th>
            <th>Pemegang</th>
            <th>Tanggal</th>
            <th>Status</th>

          </tr>

        </thead>


        <tbody>

          ${
            (r.data || [])
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.distributionId)}
                    </td>

                    <td>
                      ${esc(x.itemName)}
                    </td>

                    <td>
                      ${esc(x.loker)}
                    </td>

                    <td>
                      ${esc(x.technician)}
                    </td>

                    <td>
                      ${esc(x.date)}
                    </td>

                    <td>
                      ${badge(x.status)}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="6">

                <div class="empty">
                  Belum ada distribusi.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


window.showDistributionForm =
  async () => {

    const [
      m,
      w,
      t
    ] =
      await Promise.all([

        api("masters"),

        api("warehouse"),

        api(
          "technicians",
          {scope: "all"}
        )

      ]);


    openModal(

      "Distribusi Alker",

      `

        <form id="distributionForm">

          <div class="form-grid">


            <label>

              Inventory Gudang

              <select
                name="inventoryId"
                required
              >

                ${
                  (
                    w.data?.items ||
                    []
                  )
                    .map(
                      x => `

                        <option
                          value="${esc(x.inventoryId)}"
                        >

                          ${esc(x.inventoryId)}
                          —
                          ${esc(x.itemName)}
                          ${esc(
                            x.serialNumber
                              ? " • " +
                                x.serialNumber
                              : ""
                          )}

                        </option>

                      `
                    )
                    .join("")
                }

              </select>

            </label>


            <label>

              Teknisi

              <select
                name="technician"
                required
              >

                ${
                  (
                    t.data ||
                    []
                  )
                    .map(
                      x => `

                        <option
                          value="${esc(x.id)}"
                        >
                          ${esc(x.name)}
                          —
                          ${esc(x.loker)}
                        </option>

                      `
                    )
                    .join("")
                }

              </select>

            </label>


            <label>

              Kondisi Saat Diserahkan

              <select
                name="condition"
              >

                <option>
                  BAIK
                </option>

                <option>
                  RUSAK RINGAN
                </option>

              </select>

            </label>


            <label class="full-col">

              Catatan

              <textarea
                name="note"
              ></textarea>

            </label>


          </div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              class="btn primary"
            >
              Distribusikan
            </button>

          </div>

        </form>

      `
    );


    $("distributionForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        try {

          await api(
            "distribute",
            {

              inventoryId:
                f.inventoryId.value,

              technicianId:
                f.technician.value,

              condition:
                f.condition.value,

              note:
                f.note.value
            }
          );


          closeModal();

          toast(
            "Distribusi berhasil dicatat."
          );


          renderDistribution();

        } catch (err) {

          toast(err.message);

        }

      };
  };


/*************************************************
 * PENGADAAN
 *************************************************/

async function renderProcurement() {

  const r =
    await api(
      "procurement"
    );


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Pengadaan
        </h2>

        <p class="muted">
          Kebutuhan pembelian ALKER
          dan SALKER.
        </p>

      </div>


      <button
        class="btn primary"
        onclick="showProcurementForm()"
      >
        + Pengajuan Pembelian
      </button>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Pengadaan</th>
            <th>Alker</th>
            <th>Qty</th>
            <th>Estimasi</th>
            <th>Status</th>
            <th>Tanggal</th>

          </tr>

        </thead>


        <tbody>

          ${
            (r.data || [])
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.procurementId)}
                    </td>

                    <td>
                      ${esc(x.itemName)}
                    </td>

                    <td>
                      ${x.qty}
                    </td>

                    <td>
                      ${money(x.estimate)}
                    </td>

                    <td>
                      ${badge(x.status)}
                    </td>

                    <td>
                      ${esc(x.date)}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="6">

                <div class="empty">
                  Belum ada pengadaan.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


window.showProcurementForm =
  async () => {

    const r =
      await api(
        "masters"
      );


    openModal(

      "Pengajuan Pembelian",

      `

        <form id="procForm">

          <div class="form-grid">


            <label>

              Alker

              <select
                name="itemId"
                required
              >

                ${
                  (
                    r.data?.items ||
                    []
                  )
                    .map(
                      x => `

                        <option
                          value="${esc(x.itemId)}"
                        >
                          ${esc(x.itemName)}
                        </option>

                      `
                    )
                    .join("")
                }

              </select>

            </label>


            <label>

              Qty

              <input
                name="qty"
                type="number"
                min="1"
                value="1"
              >

            </label>


            <label>

              Estimasi Harga / Unit

              <input
                name="estimate"
                type="number"
                min="0"
              >

            </label>


            <label>

              Prioritas

              <select
                name="priority"
              >

                <option>
                  NORMAL
                </option>

                <option>
                  TINGGI
                </option>

                <option>
                  MENDESAK
                </option>

              </select>

            </label>


            <label class="full-col">

              Alasan

              <textarea
                name="reason"
                required
              ></textarea>

            </label>


          </div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              class="btn primary"
            >
              Ajukan
            </button>

          </div>

        </form>

      `
    );


    $("procForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        try {

          await api(
            "createProcurement",
            {

              itemId:
                f.itemId.value,

              qty:
                f.qty.value,

              estimate:
                f.estimate.value,

              priority:
                f.priority.value,

              reason:
                f.reason.value
            }
          );


          closeModal();

          toast(
            "Pengadaan diajukan."
          );


          renderProcurement();

        } catch (err) {

          toast(err.message);

        }

      };
  };


/*************************************************
 * SELURUH INVENTORY
 *************************************************/

async function renderAllInventory() {

  const r =
    await api(
      "inventory",
      {
        scope: "all"
      }
    );


  const all =
    r.data || [];


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Seluruh Inventory
        </h2>

        <p class="muted">
          Pusat pencarian posisi seluruh
          ALKER / SALKER.
        </p>

      </div>

    </div>


    <div class="toolbar">

      <input
        id="invSearch"
        placeholder="Cari ID, nama, SN, teknisi..."
      >

    </div>


    <div id="allInv">
    </div>

  `;


  const draw =
    () => {

      const q =
        (
          $("invSearch")
            .value ||
          ""
        ).toLowerCase();


      const filtered =
        all.filter(
          x =>
            JSON.stringify(x)
              .toLowerCase()
              .includes(q)
        );


      renderInventoryTable(
        $("allInv"),
        filtered,
        "all"
      );
    };


  $("invSearch").oninput =
    draw;


  draw();
}


/*************************************************
 * MASTER DATA
 *************************************************/

async function renderMaster() {

  const r =
    await api(
      "masters"
    );


  const d =
    r.data || {};


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Master Data
        </h2>

        <p class="muted">
          Daftar loker dan master ALKER.
        </p>

      </div>


      <button
        class="btn primary"
        onclick="showMasterForm()"
      >
        + Tambah ALKER
      </button>

    </div>


    <div class="grid two">


      <div class="card">

        <h3>
          Loker
        </h3>


        ${
          (d.lokers || [])
            .map(
              x => `

                <div class="kpi-line">

                  <span>
                    ${esc(x.name)}
                  </span>

                  ${badge(
                    x.status ||
                    "AKTIF"
                  )}

                </div>

              `
            )
            .join("") ||

          `<div class="empty">
            Belum ada loker.
          </div>`
        }

      </div>


      <div class="card">

        <h3>
          Master ALKER
          (${(d.items || []).length})
        </h3>


        ${
          (d.items || [])
            .slice(0, 50)
            .map(
              x => `

                <div class="kpi-line">

                  <span>

                    ${esc(x.itemName)}

                    <small class="muted">
                      ${esc(x.category)}
                    </small>

                  </span>

                  <span>
                    ${esc(x.lokers || "-")}
                  </span>

                </div>

              `
            )
            .join("") ||

          `<div class="empty">
            Belum ada master ALKER.
          </div>`
        }

      </div>


    </div>

  `;
}


window.showMasterForm =
  async () => {

    const r =
      await api(
        "masters"
      );


    const lokers =
      (
        r.data?.lokers ||
        []
      ).filter(
        x =>
          x.name !==
          "GUDANG"
      );


    openModal(

      "Tambah Master ALKER",

      `

        <form id="masterForm">

          <div class="form-grid">


            <label>

              Nama ALKER

              <input
                name="itemName"
                required
              >

            </label>


            <label>

              Kategori

              <input
                name="category"
                required
              >

            </label>


            <label>

              Satuan

              <input
                name="unit"
                value="UNIT"
              >

            </label>


            <label>

              Harga Standar

              <input
                name="price"
                type="number"
                min="0"
              >

            </label>


            <label class="full-col">

              Loker Pengguna

              <select
                name="loker"
                multiple
                size="5"
              >

                ${
                  lokers
                    .map(
                      x => `

                        <option
                          value="${esc(x.name)}"
                        >
                          ${esc(x.name)}
                        </option>

                      `
                    )
                    .join("")
                }

              </select>

            </label>


            <label class="full-col">

              Merk / Spesifikasi

              <textarea
                name="spec"
              ></textarea>

            </label>


          </div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              class="btn primary"
            >
              Simpan
            </button>

          </div>

        </form>

      `
    );


    $("masterForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        const selectedLokers =
          [
            ...f.loker.selectedOptions
          ]
            .map(
              o => o.value
            )
            .join("|");


        try {

          await api(
            "addMasterItem",
            {

              itemName:
                f.itemName.value,

              category:
                f.category.value,

              unit:
                f.unit.value,

              price:
                f.price.value,

              lokers:
                selectedLokers,

              spec:
                f.spec.value
            }
          );


          closeModal();

          toast(
            "Master ALKER ditambahkan."
          );


          renderMaster();

        } catch (err) {

          toast(err.message);

        }

      };
  };

/*************************************************
 * MASTER TEKNISI / MASTER USER
 *************************************************/

async function renderUsers(){

  const r =
    await api("users");

  const users =
    r.data || [];

  const isLeader =
    session.role === "LEADER";


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          ${
            isLeader
              ? "Master Teknisi"
              : "Master User"
          }
        </h2>

        <p class="muted">

          ${
            isLeader

              ? "Kelola akun Teknisi PSB, IOAN dan Maintenance."

              : "Kelola seluruh akun pengguna sistem."

          }

        </p>

      </div>


      <button
        class="btn primary"
        onclick="showUserForm()"
      >

        ${
          isLeader
            ? "+ Tambah Teknisi"
            : "+ Tambah User"
        }

      </button>

    </div>


    <div class="grid cards">

      ${metric(
        "Total Teknisi",
        users.filter(
          x =>
            x.role ===
            "TEKNISI"
        ).length,
        "orang"
      )}


      ${metric(
        "Teknisi Aktif",
        users.filter(
          x =>
            x.role === "TEKNISI" &&
            String(
              x.active
            ).toUpperCase() === "Y"
        ).length,
        "orang"
      )}


      ${metric(
        "Teknisi Nonaktif",
        users.filter(
          x =>
            x.role === "TEKNISI" &&
            String(
              x.active
            ).toUpperCase() === "N"
        ).length,
        "orang"
      )}

    </div>


    <div style="height:15px"></div>


    <div class="card">

      <div class="table-wrap">

        <table class="table">

          <thead>

            <tr>

              <th>Nama</th>

              <th>Username</th>

              <th>Role</th>

              <th>Loker</th>

              <th>Status</th>

              <th>Aksi</th>

            </tr>

          </thead>


          <tbody>

            ${
              users
                .map(
                  x => `

                    <tr>

                      <td>

                        <strong>
                          ${esc(
                            x.name
                          )}
                        </strong>

                      </td>


                      <td>
                        ${esc(
                          x.username
                        )}
                      </td>


                      <td>
                        ${badge(
                          x.role
                        )}
                      </td>


                      <td>
                        ${esc(
                          x.loker ||
                          "-"
                        )}
                      </td>


                      <td>

                        ${
                          String(
                            x.active
                          ).toUpperCase()
                          === "Y"

                            ? badge(
                                "AKTIF"
                              )

                            : badge(
                                "NONAKTIF"
                              )
                        }

                      </td>


                      <td>

                        <div
                          class="actions"
                        >

                          <button
                            class="btn secondary"
                            onclick='showUserForm(
                              ${JSON.stringify(x)}
                            )'
                          >
                            Edit
                          </button>


                          ${
                            x.role ===
                              "TEKNISI" &&
                            String(
                              x.active
                            ).toUpperCase()
                              === "Y"

                              ? `

                                <button
                                  class="btn danger"
                                  onclick='disableUser(
                                    "${esc(
                                      x.userId
                                    )}",
                                    "${esc(
                                      x.name
                                    )}"
                                  )'
                                >
                                  Nonaktifkan
                                </button>

                              `

                              : ""

                          }

                        </div>

                      </td>

                    </tr>

                  `
                )
                .join("") ||

              `

                <tr>

                  <td colspan="6">

                    <div class="empty">

                      ${
                        isLeader
                          ? "Belum ada Teknisi."
                          : "Belum ada User."
                      }

                    </div>

                  </td>

                </tr>

              `
            }

          </tbody>

        </table>

      </div>

    </div>

  `;

}
window.showUserForm = function(user = {}){

  const isEdit =
    Boolean(user.userId);

  const isLeader =
    session.role === "LEADER";


  openModal(

    isEdit
      ? "Edit User"
      : "Tambah User",

    `

      <form id="userForm">

        <div class="form-grid">

          <label>
            Nama Lengkap

            <input
              name="name"
              value="${esc(user.name || "")}"
              required
            >
          </label>


          <label>
            Username

            <input
              name="username"
              value="${esc(user.username || "")}"
              required
            >
          </label>


          <label>
            Password
            ${
              isEdit
                ? "<small class='muted'>Kosongkan jika tidak ingin mengganti.</small>"
                : ""
            }

            <input
              name="password"
              type="password"
              ${isEdit ? "" : "required"}
            >
          </label>


          <label>
            Role

            ${
              isLeader

                ? `
                  <input
                    value="TEKNISI"
                    readonly
                  >

                  <input
                    type="hidden"
                    name="role"
                    value="TEKNISI"
                  >
                `

                : `
                  <select name="role" required>

                    <option value="">
                      Pilih Role
                    </option>

                    <option value="TEKNISI"
                      ${
                        user.role === "TEKNISI"
                          ? "selected"
                          : ""
                      }>
                      TEKNISI
                    </option>

                    <option value="LEADER"
                      ${
                        user.role === "LEADER"
                          ? "selected"
                          : ""
                      }>
                      LEADER
                    </option>

                    <option value="SPV_GUDANG"
                      ${
                        user.role === "SPV_GUDANG"
                          ? "selected"
                          : ""
                      }>
                      SPV GUDANG
                    </option>

                    <option value="ADMIN"
                      ${
                        user.role === "ADMIN"
                          ? "selected"
                          : ""
                      }>
                      ADMIN
                    </option>

                  </select>
                `
            }

          </label>


<label>

  Loker / Divisi Teknisi


  ${
    isLeader

      ? `

        <select
          name="loker"
          id="userLoker"
          required
        >

          <option value="">
            Pilih Loker / Divisi
          </option>


          <option
            value="IOAN / ASSURANCE"
            ${
              user.loker ===
              "IOAN / ASSURANCE"
                ? "selected"
                : ""
            }
          >
            IOAN / ASSURANCE
          </option>


          <option
            value="PSB / FULFILLMENT"
            ${
              user.loker ===
              "PSB / FULFILLMENT"
                ? "selected"
                : ""
            }
          >
            PSB / FULFILLMENT
          </option>


          <option
            value="MAINTENANCE / OSP"
            ${
              user.loker ===
              "MAINTENANCE / OSP"
                ? "selected"
                : ""
            }
          >
            MAINTENANCE / OSP
          </option>

        </select>

      `

      : `

        <select
          name="loker"
          id="userLoker"
          required
        >

          <option value="">
            Pilih Loker
          </option>

          <option value="IOAN / ASSURANCE">
            IOAN / ASSURANCE
          </option>

          <option value="PSB / FULFILLMENT">
            PSB / FULFILLMENT
          </option>

          <option value="MAINTENANCE / OSP">
            MAINTENANCE / OSP
          </option>

          <option value="LEADER">
            LEADER
          </option>

          <option value="GUDANG">
            GUDANG
          </option>

          <option value="ADMIN">
            ADMIN
          </option>

        </select>

      `
  }

</label>

                  <input
                    type="hidden"
                    name="loker"
                    value="${esc(session.loker)}"
                  >
                `

                : `
                  <select
                    name="loker"
                    id="userLoker"
                    required
                  >

                    <option value="">
                      Pilih Loker
                    </option>

                    <option value="IOAN / ASSURANCE">
                      IOAN / ASSURANCE
                    </option>

                    <option value="PSB / FULFILLMENT">
                      PSB / FULFILLMENT
                    </option>

                    <option value="MAINTENANCE / OSP">
                      MAINTENANCE / OSP
                    </option>

                    <option value="LEADER">
                      LEADER
                    </option>

                    <option value="GUDANG">
                      GUDANG
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>

                  </select>
                `
            }

          </label>


          <label>
            Status

            <select name="active">

              <option
                value="Y"
                ${
                  user.active !== "N"
                    ? "selected"
                    : ""
                }
              >
                AKTIF
              </option>

              <option
                value="N"
                ${
                  user.active === "N"
                    ? "selected"
                    : ""
                }
              >
                NONAKTIF
              </option>

            </select>

          </label>

        </div>


        <div
          class="actions"
          style="margin-top:15px"
        >

          <button
            type="button"
            class="btn secondary"
            onclick="closeModal()"
          >
            Batal
          </button>

          <button
            type="submit"
            class="btn primary"
          >
            Simpan User
          </button>

        </div>

      </form>

    `
  );

/*************************************************
 * NONAKTIFKAN TEKNISI
 *************************************************/

window.disableUser =
  async function(
    userId,
    userName
  ){

    if(!userId){

      toast(
        "ID teknisi tidak ditemukan."
      );

      return;

    }


    const yakin =
      confirm(
        "Nonaktifkan teknisi:\n\n" +
        userName +
        "\n\n" +
        "Teknisi tidak akan bisa login lagi.\n" +
        "Data inventory, laporan dan histori tetap disimpan."
      );


    if(!yakin){

      return;

    }


    try{

      await api(
        "deleteUser",
        {
          userId:
            userId
        }
      );


      toast(
        "Teknisi berhasil dinonaktifkan."
      );


      await renderUsers();

    }
    catch(err){

      toast(
        err.message ||
        "Gagal menonaktifkan teknisi."
      );

    }

  };
  
  $("userForm").onsubmit =
    async e => {

      e.preventDefault();

      const f =
        e.target;

      try{

        await api(
          "saveUser",
          {

            userId:
              user.userId || "",

            name:
              f.name.value,

            username:
              f.username.value,

            password:
              f.password.value,

            role:
              f.role.value,

            loker:
              f.loker.value,

            active:
              f.active.value

          }
        );


        closeModal();

        toast(
          isEdit
            ? "User berhasil diperbarui."
            : "User berhasil dibuat."
        );


        await renderUsers();


      }catch(err){

        toast(
          err.message
        );

      }

    };

};

/*************************************************
 * NONAKTIFKAN TEKNISI
 *************************************************/

window.deleteUser =
  async function(
    userId,
    userName
  ){

    if(!userId){

      toast(
        "ID teknisi tidak ditemukan."
      );

      return;

    }


    const yakin =
      confirm(
        "Nonaktifkan teknisi " +
        userName +
        "?\n\n" +
        "Teknisi tidak akan bisa login lagi.\n" +
        "Data inventory dan riwayat tetap disimpan."
      );


    if(!yakin){

      return;

    }


    try{

      await api(
        "deleteUser",
        {
          userId:
            userId
        }
      );


      toast(
        "Teknisi berhasil dinonaktifkan."
      );


      await renderUsers();


    }catch(err){

      toast(
        err.message ||
        "Gagal menonaktifkan teknisi."
      );

    }

  };
  
/*************************************************
 * AUDIT
 *************************************************/

async function renderAudit() {

  const r =
    await api(
      "audit"
    );


  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Audit Trail
        </h2>

        <p class="muted">
          Catatan aktivitas sistem.
        </p>

      </div>

    </div>


    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>Tanggal</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Deskripsi</th>

          </tr>

        </thead>


        <tbody>

          ${
            (r.data || [])
              .map(
                x => `

                  <tr>

                    <td>
                      ${esc(x.date)}
                    </td>

                    <td>
                      ${esc(x.actor)}
                    </td>

                    <td>
                      ${esc(x.action)}
                    </td>

                    <td>
                      ${esc(x.description)}
                    </td>

                  </tr>

                `
              )
              .join("") ||

            `<tr>

              <td colspan="4">

                <div class="empty">
                  Belum ada audit.
                </div>

              </td>

            </tr>`
          }

        </tbody>

      </table>

    </div>

  `;
}


/*************************************************
 * SESSION RESTORE
 *************************************************/

(async () => {
   ...
})();


function initialStatusBadge(status){

  const s =
    String(
      status || ""
    ).toUpperCase();


  if(
    s ===
    "MENUNGGU VERIFIKASI"
  ){

    return `
      <span class="badge yellow">
        MENUNGGU VERIFIKASI
      </span>
    `;

  }


  if(s === "REVISI"){

    return `
      <span class="badge red">
        PERLU REVISI
      </span>
    `;

  }


  if(s === "APPROVED"){

    return `
      <span class="badge green">
        APPROVED
      </span>
    `;

  }


  if(
    s === "DITOLAK"
  ){

    return `
      <span class="badge red">
        DITOLAK
      </span>
    `;

  }


  return `
    <span class="badge">
      ${esc(status || "-")}
    </span>
  `;

}

function renderInventorySimpleTable(
  data
){

  return `

    <div class="table-wrap">

      <table class="table">

        <thead>

          <tr>

            <th>ALKER</th>

            <th>Merk / Type</th>

            <th>Serial Number</th>

            <th>Kondisi</th>

            <th>Status</th>

            <th>Nilai</th>

          </tr>

        </thead>


        <tbody>

          ${
            data
              .map(
                x => `

                  <tr>

                    <td>

                      <strong>
                        ${esc(
                          x.itemName
                        )}
                      </strong>

                      <div
                        class="small muted"
                      >
                        ${esc(
                          x.inventoryId
                        )}
                      </div>

                    </td>


                    <td>

                      ${esc(
                        x.brand || "-"
                      )}

                      /

                      ${esc(
                        x.type || "-"
                      )}

                    </td>


                    <td>
                      ${esc(
                        x.serialNumber ||
                        "-"
                      )}
                    </td>


                    <td>
                      ${badge(
                        x.condition
                      )}
                    </td>


                    <td>
                      ${badge(
                        x.status
                      )}
                    </td>


                    <td>
                      ${money(
                        x.price
                      )}
                    </td>

                  </tr>

                `
              )
              .join("")
          }

        </tbody>

      </table>

    </div>

  `;

}
async function loadPhotoPreview_(
  photoUrl
){

  if(!photoUrl){

    return "";

  }


  try{

    const r =
      await api(
        "photoPreview",
        {
          photoUrl:
            photoUrl
        }
      );


    return r.data?.dataUrl || "";

  }catch(e){

    console.error(
      "PHOTO PREVIEW:",
      e
    );

    return "";

  }

}
function photoBox_(
  title,
  dataUrl
){

  if(!dataUrl){

    return `

      <div class="photo-box empty">

        <div class="photo-title">
          ${esc(title)}
        </div>

        <div class="photo-empty">
          Foto tidak tersedia
        </div>

      </div>

    `;

  }


  return `

    <div class="photo-box">

      <div class="photo-title">
        ${esc(title)}
      </div>

      <img
        src="${dataUrl}"
        alt="${esc(title)}"
        class="photo-preview"
        onclick="openPhotoViewer_('${dataUrl}')"
      >

    </div>

  `;

}
function openPhotoViewer_(
  dataUrl
){

  const old =
    document.getElementById(
      "photoViewer"
    );


  if(old){

    old.remove();

  }


  const div =
    document.createElement(
      "div"
    );


  div.id =
    "photoViewer";


  div.className =
    "photo-viewer";


  div.innerHTML = `

    <button
      class="photo-viewer-close"
      onclick="
        document.getElementById(
          'photoViewer'
        ).remove()
      "
    >
      ×
    </button>

    <img
      src="${dataUrl}"
      class="photo-viewer-img"
    >

  `;


  document.body.appendChild(
    div
  );

}
window.showInitialVerificationDetail =
  async x => {

    openModal(
      "Detail Verifikasi ALKER",
      `
        <div class="detail-grid">

          <div class="detail-box">
            <span>Teknisi</span>
            <strong>
              ${esc(x.technician)}
            </strong>
          </div>

          <div class="detail-box">
            <span>Loker</span>
            <strong>
              ${esc(x.loker)}
            </strong>
          </div>

          <div class="detail-box">
            <span>ALKER</span>
            <strong>
              ${esc(x.itemName)}
            </strong>
          </div>

          <div class="detail-box">
            <span>Merk</span>
            <strong>
              ${esc(x.brand || "-")}
            </strong>
          </div>

          <div class="detail-box">
            <span>Type</span>
            <strong>
              ${esc(x.type || "-")}
            </strong>
          </div>

          <div class="detail-box">
            <span>Serial Number</span>
            <strong>
              ${esc(x.serialNumber || "-")}
            </strong>
          </div>

          <div class="detail-box">
            <span>Kondisi</span>
            <strong>
              ${esc(x.condition || "-")}
            </strong>
          </div>

          <div class="detail-box">
            <span>Status Pemberian</span>
            <strong>
              ${esc(
                x.givenStatus ||
                "BELUM DITENTUKAN"
              )}
            </strong>
          </div>

        </div>

        <div
          id="initialPhotoArea"
          style="margin-top:18px"
        >
          <div class="empty">
            Memuat foto...
          </div>
        </div>
      `
    );


    const photos = [];


    if(x.photoUrl){

      const dataUrl =
        await loadPhotoPreview_(
          x.photoUrl
        );

      if(dataUrl){

        photos.push(
          photoBox_(
            "Foto ALKER",
            dataUrl
          )
        );

      }

    }


    if(x.serialPhotoUrl){

      const dataUrl =
        await loadPhotoPreview_(
          x.serialPhotoUrl
        );

      if(dataUrl){

        photos.push(
          photoBox_(
            "Foto Serial / Label",
            dataUrl
          )
        );

      }

    }


    const area =
      $("initialPhotoArea");


    if(area){

      area.innerHTML =
        photos.length
          ? `
            <div class="photo-grid">
              ${photos.join("")}
            </div>
          `
          : `
            <div class="photo-empty">
              Foto belum tersedia.
            </div>
          `;

    }

  };
  window.showInitialRevisionForm =
  async initial => {

    const r =
      await api(
        "masters"
      );


    const items =
      r.data?.items ||
      [];


    openModal(

      "Perbaiki Pengajuan ALKER",

      `

        <p class="muted">

          Gudang meminta perbaikan
          data ALKER berikut.

        </p>


        <div
          class="card"
          style="margin-bottom:15px"
        >

          <strong>
            ${esc(
              initial.itemName
            )}
          </strong>

          <p class="danger-text">

            ${
              esc(
                initial.reviewNote ||
                "Mohon perbaiki data."
              )
            }

          </p>

        </div>


        <form id="initialRevisionForm">

          <div class="form-grid">

            <input
              type="hidden"
              name="initialId"
              value="${esc(
                initial.initialId
              )}"
            >


            <label>

              Alker

              <input
                value="${esc(
                  initial.itemName
                )}"
                disabled
              >

            </label>


            <label>

              Merk

              <input
                name="brand"
                value="${esc(
                  initial.brand ||
                  ""
                )}"
              >

            </label>


            <label>

              Type

              <input
                name="type"
                value="${esc(
                  initial.type ||
                  ""
                )}"
              >

            </label>


            <label>

              Serial Number

              <input
                name="serialNumber"
                value="${esc(
                  initial.serialNumber ||
                  ""
                )}"
              >

            </label>


            <label>

              Kondisi

              <select
                name="condition"
              >

                <option
                  ${
                    initial.condition ===
                    "BAIK"
                      ? "selected"
                      : ""
                  }
                >
                  BAIK
                </option>

                <option
                  ${
                    initial.condition ===
                    "RUSAK RINGAN"
                      ? "selected"
                      : ""
                  }
                >
                  RUSAK RINGAN
                </option>

                <option
                  ${
                    initial.condition ===
                    "RUSAK BERAT"
                      ? "selected"
                      : ""
                  }
                >
                  RUSAK BERAT
                </option>

              </select>

            </label>


            <label class="full-col">

              Keterangan

              <textarea
                name="note"
              >${esc(
                initial.note ||
                ""
              )}</textarea>

            </label>


            <label>

              Foto Alker Baru

              <input
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
              >

            </label>


            <label>

              Foto Serial Baru

              <input
                name="serialPhoto"
                type="file"
                accept="image/*"
                capture="environment"
              >
            </label>
          </div>
          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              type="button"
              class="btn secondary"
              onclick="closeModal()"
            >
              Batal
            </button>

            <button
              type="submit"
              class="btn primary"
            >
              Kirim Ulang
            </button>

          </div>

        </form>

      `
    );


    $("initialRevisionForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        try{

          await api(
            "initialResubmit",
            {

              initialId:
                f.initialId.value,

              brand:
                f.brand.value,

              type:
                f.type.value,

              serialNumber:
                f.serialNumber.value,

              condition:
                f.condition.value,

              note:
                f.note.value,

              photo:
                await fileToBase64(
                  f.photo.files[0]
                ),

              serialPhoto:
                await fileToBase64(
                  f.serialPhoto.files[0]
                )

            }
          );

          closeModal();

          toast(
            "Perbaikan berhasil dikirim ke Gudang."
          );
          renderMyInventory();
        }catch(err){

          toast(
            err.message
          );
        }
      };

  };
  /*************************************************
 * MASTER HARGA ALKER
 * KHUSUS SPV GUDANG / ADMIN
 *************************************************/

async function renderMasterPrice() {

  $("page").innerHTML = `

    <div class="page-head">

      <div>

        <h2>
          Master Harga ALKER
        </h2>

        <p class="muted">
          Gudang menentukan nilai aset berdasarkan
          nama ALKER. Harga ini akan digunakan
          sebagai nilai master inventory.
        </p>

      </div>

    </div>


    <div id="masterPriceBody">

      <div class="card">
        Memuat master harga...
      </div>

    </div>

  `;


  try {

    const r =
      await api("masterPrices");


    const data =
      r.data || [];


    $("masterPriceBody").innerHTML = `

      <div class="grid cards">

        ${metric(
          "Total ALKER",
          data.length,
          "master harga"
        )}

        ${metric(
          "Sudah Ada Harga",
          data.filter(
            x =>
              Number(x.price || 0) > 0
          ).length,
          "item"
        )}

        ${metric(
          "Belum Ada Harga",
          data.filter(
            x =>
              Number(x.price || 0) <= 0
          ).length,
          "item"
        )}

      </div>


      <div style="height:15px"></div>


      <div class="card">

        <div class="toolbar">

          <input
            id="masterPriceSearch"
            placeholder="Cari nama ALKER..."
          >

        </div>


        <div class="table-wrap">

          <table class="table">

            <thead>

              <tr>

                <th>ID</th>
                <th>Nama ALKER</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th>Harga Master</th>
                <th>Status</th>
                <th>Aksi</th>

              </tr>

            </thead>


            <tbody id="masterPriceTable">

            </tbody>

          </table>

        </div>

      </div>

    `;


    const draw = () => {

      const q =
        (
          $("masterPriceSearch")?.value ||
          ""
        )
          .toLowerCase()
          .trim();


      const filtered =
        data.filter(
          x =>
            JSON.stringify(x)
              .toLowerCase()
              .includes(q)
        );


      $("masterPriceTable").innerHTML =

        filtered
          .map(
            x => `

              <tr>

                <td>
                  ${esc(x.itemId || "-")}
                </td>

                <td>

                  <strong>
                    ${esc(x.itemName || "-")}
                  </strong>

                </td>

                <td>
                  ${esc(x.category || "-")}
                </td>

                <td>
                  ${esc(x.unit || "UNIT")}
                </td>

                <td>

                  <strong>
                    ${money(x.price)}
                  </strong>

                </td>

                <td>

                  ${
                    Number(x.price || 0) > 0
                      ? badge("AKTIF")
                      : badge("BELUM DITENTUKAN")
                  }

                </td>

                <td>

                  <button
                    class="btn secondary"
                    onclick='showMasterPriceForm(${JSON.stringify(x)})'
                  >
                    Ubah Harga
                  </button>

                </td>

              </tr>

            `
          )
          .join("") ||

        `

          <tr>

            <td colspan="7">

              <div class="empty">
                Data ALKER tidak ditemukan.
              </div>

            </td>

          </tr>

        `;

    };


    $("masterPriceSearch").oninput =
      draw;


    draw();


  } catch (err) {

    $("masterPriceBody").innerHTML = `

      <div class="card">

        <strong>
          Gagal memuat Master Harga
        </strong>

        <p class="danger-text">
          ${esc(err.message)}
        </p>

      </div>

    `;

  }

}


/*************************************************
 * FORM UBAH HARGA MASTER
 *************************************************/

window.showMasterPriceForm =
  x => {

    openModal(

      "Ubah Harga Master ALKER",

      `

        <div class="card">

          <div class="detail-grid">

            <div class="detail-box">

              <span>
                ID ALKER
              </span>

              <strong>
                ${esc(x.itemId || "-")}
              </strong>

            </div>


            <div class="detail-box">

              <span>
                Nama ALKER
              </span>

              <strong>
                ${esc(x.itemName || "-")}
              </strong>

            </div>


            <div class="detail-box">

              <span>
                Kategori
              </span>

              <strong>
                ${esc(x.category || "-")}
              </strong>

            </div>


            <div class="detail-box">

              <span>
                Harga Saat Ini
              </span>

              <strong>
                ${money(x.price)}
              </strong>

            </div>

          </div>

        </div>


        <form
          id="masterPriceForm"
          style="margin-top:15px"
        >

          <input
            type="hidden"
            name="itemId"
            value="${esc(x.itemId || "")}"
          >


          <label>

            Harga Master Baru

            <input
              name="price"
              type="number"
              min="0"
              value="${Number(x.price || 0)}"
              required
            >

          </label>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              type="button"
              class="btn secondary"
              onclick="closeModal()"
            >
              Batal
            </button>


            <button
              type="submit"
              class="btn primary"
            >
              Simpan Harga
            </button>

          </div>

        </form>

      `
    );


    $("masterPriceForm").onsubmit =
      async e => {

        e.preventDefault();


        const f =
          e.target;


        const btn =
          f.querySelector(
            'button[type="submit"]'
          );


        if (
          btn &&
          btn.disabled
        ) {

          return;

        }


        if (btn) {

          btn.disabled = true;

          btn.textContent =
            "⏳ Menyimpan...";

        }


        try {

          await api(
            "updateMasterPrice",
            {

              itemId:
                f.itemId.value,

              price:
                f.price.value

            }
          );


          closeModal();


          toast(
            "Harga master ALKER berhasil diperbarui."
          );


          await renderMasterPrice();


        } catch (err) {

          if (btn) {

            btn.disabled =
              false;

            btn.textContent =
              "Simpan Harga";

          }


          toast(
            err.message ||
            "Gagal mengubah harga master."
          );

        }

      };

  };
  window.showReturnForm =
  async inventory => {

    openModal(

      "Pengembalian ALKER",

      `

        <div class="card"
             style="margin-bottom:15px">

          <strong>
            ${esc(
              inventory.itemName
            )}
          </strong>

          <div class="small muted">

            ID:
            ${esc(
              inventory.inventoryId
            )}

            <br>

            SN:
            ${esc(
              inventory.serialNumber ||
              "-"
            )}

          </div>

        </div>


        <form id="returnForm">

          <div class="form-grid">


            <label>

              Kondisi Saat Dikembalikan

              <select
                name="condition"
                required
              >

                <option value="BAIK">
                  BAIK
                </option>

                <option value="RUSAK RINGAN">
                  RUSAK RINGAN
                </option>

                <option value="RUSAK BERAT">
                  RUSAK BERAT
                </option>

              </select>

            </label>


            <label>

              Foto ALKER

              <input
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                required
              >

              <small class="muted">
                Wajib foto kondisi ALKER
                saat diserahkan.
              </small>

            </label>


            <label>

              Foto Serial / Label

              <input
                name="serialPhoto"
                type="file"
                accept="image/*"
                capture="environment"
              >

              <small class="muted">
                Opsional.
              </small>

            </label>


            <label class="full-col">

              Keterangan

              <textarea
                name="note"
                placeholder="Keterangan kondisi ALKER saat dikembalikan..."
              ></textarea>

            </label>


          </div>


          <div
            class="card"
            style="
              margin-top:15px;
              background:#fff8e1;
            "
          >

            <strong>
              ⚠️ Perhatian
            </strong>

            <p class="muted">

              Setelah dikirim, ALKER akan
              berstatus
              <strong>
                MENUNGGU VERIFIKASI
              </strong>.

              ALKER belum menjadi stok Gudang
              sampai diverifikasi oleh SPV Gudang.

            </p>

          </div>


          <div
            class="actions"
            style="margin-top:15px"
          >

            <button
              type="button"
              class="btn secondary"
              onclick="closeModal()"
            >
              Batal
            </button>


            <button
              type="submit"
              class="btn warning"
            >
              Kirim Pengembalian
            </button>

          </div>

        </form>

      `
    );


    $("returnForm").onsubmit =
      async e => {

        e.preventDefault();

        const f =
          e.target;


        try{

          const photo =
            await fileToBase64(
              f.photo.files[0]
            );


          if(!photo){

            throw new Error(
              "Foto ALKER wajib diupload."
            );

          }


          const serialPhoto =
            f.serialPhoto.files[0]
              ? await fileToBase64(
                  f.serialPhoto.files[0]
                )
              : "";


          await api(
            "returnItem",
            {

              inventoryId:
                inventory.inventoryId,

              condition:
                f.condition.value,

              note:
                f.note.value,

              photo:
                photo,

              serialPhoto:
                serialPhoto

            }
          );


          closeModal();


          toast(
            "Pengembalian berhasil diajukan ke Gudang."
          );


          await renderReturns();


        }catch(err){

          toast(
            err.message ||
            "Gagal mengajukan pengembalian."
          );

        }

      };

  };
  function returnStatusBadge_(
  status
){

  const s =
    String(
      status || ""
    ).toUpperCase();


  if(
    s ===
    "MENUNGGU VERIFIKASI"
  ){

    return `
      <span class="badge yellow">
        MENUNGGU VERIFIKASI
      </span>
    `;

  }


  if(
    s ===
    "DITERIMA GUDANG"
  ){

    return `
      <span class="badge green">
        DITERIMA GUDANG
      </span>
    `;

  }


  if(
    s ===
    "REVISI"
  ){

    return `
      <span class="badge red">
        REVISI
      </span>
    `;

  }


  return badge(
    status || "-"
  );

}
