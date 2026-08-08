# ALKER CONTROL
Sistem Asset, Inventory & Responsibility Management

## Arsitektur
- GitHub Pages: frontend HTML/CSS/JS
- Google Apps Script: API/backend
- Google Sheets: database
- Google Drive: penyimpanan foto/dokumen

## Modul
1. Login & role
2. Master teknisi/loker/user
3. Master ALKER per loker
4. Inventory awal teknisi -> review -> approve/revisi
5. Stok gudang
6. Barang baru masuk gudang
7. Distribusi gudang -> teknisi/loker
8. Request ALKER baru
9. Request penggantian
10. Pengembalian
11. Kerusakan/hilang
12. Pengadaan
13. Histori mutasi
14. Dashboard sesuai role
15. Foto dari HP/laptop
16. Audit trail

## Role
- ADMIN
- SPV_GUDANG
- LEADER
- TEKNISI

## Loker awal
- IOAN / ASSURANCE
- PSB / FULFILLMENT
- MAINTENANCE / OSP
- LEADER
- GUDANG

## Instalasi Backend
1. Buat Google Spreadsheet kosong.
2. Buka Extensions > Apps Script.
3. Salin seluruh isi `Code.gs`.
4. Ubah `SPREADSHEET_ID` dan `DRIVE_FOLDER_ID` jika ingin memakai ID tertentu. Jika dikosongkan, script dapat membuat/menemukan resource sesuai konfigurasi.
5. Jalankan fungsi `setupSystem()` sekali dari Apps Script dan berikan izin.
6. Deploy > New deployment > Web app.
7. Execute as: Me.
8. Who has access: Anyone.
9. Salin URL `/exec`.
10. Masukkan URL tersebut ke `API_URL` di `app.js`.
11. Upload `index.html`, `style.css`, `app.js` ke GitHub Pages.

## Login awal
Setelah `setupSystem()`:
- admin / admin123
- gudang / gudang123
- leader / leader123
- teknisi / teknisi123

SEGERA ganti password setelah login. Password disimpan sebagai SHA-256 hash, bukan plaintext.

## Catatan foto
Frontend mengompres foto sebelum dikirim. Backend menyimpan file ke Google Drive dan hanya menyimpan URL/file ID di database.
