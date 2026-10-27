# SiapTKA — Belajar, Latih, Siap TKA

Aplikasi web persiapan **TKA (Tes Kemampuan Akademik)** dengan React + TypeScript + Tailwind CSS, backend **Express**, dan database **PostgreSQL**. Soal, riwayat ujian, rekap siswa, dan data kelas sekarang tersimpan di database — bukan lagi hanya di browser.

> ⚠️ Ini masih MVP/demo, bukan sistem ujian produksi. Belum ada autentikasi, token ujian, atau pengawasan ujian sesungguhnya.

## Fitur

### Untuk siswa

- **Dashboard** ringkasan skor, target, jadwal tes, dan hasil terbaru.
- **Tryout & latihan** dengan pencarian, filter mapel/tingkat, dan detail aturan ujian.
- **Ruang ujian (CBT)**:
  - Timer berjalan berdasarkan waktu mulai dan tetap akurat setelah refresh.
  - Jawaban tersimpan otomatis di browser selama ujian berlangsung.
  - Navigasi soal, tandai ragu-ragu, dan progres pengerjaan.
  - Dialog konfirmasi keluar dan pengumpulan jawaban.
  - Auto-submit saat waktu habis; hasil akhir dikirim ke PostgreSQL.
- **Hasil & pembahasan** per soal: jawabanmu, kunci, dan penjelasan.
- **Analisis kemampuan**: radar mapel, tren skor, penguasaan topik, kekuatan, area perbaikan, dan rencana belajar.
- **Mode gelap** dan layout responsif mobile-first.

### Untuk guru

- **Dashboard guru** dengan statistik kelas, live monitoring demo, dan papan skor.
- **Bank soal** (khusus mode guru):
  - Tambah, edit, dan hapus soal langsung di PostgreSQL.
  - Dukungan pilihan ganda, pilihan ganda kompleks, dan benar/salah.
  - Filter mapel/kesulitan dan pencarian.
  - Ekspor bank soal ke CSV.
- **Rekap nilai**:
  - Statistik peserta, partisipasi, dan rata-rata nilai.
  - Filter kelas/status dan pencarian siswa.
  - Ringkasan performa kelas dan daftar siswa yang belum selesai.
  - Ekspor rekap ke CSV.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- Komponen UI bergaya **shadcn/ui** (Radix Slot, CVA, clsx, tailwind-merge)
- **React Router** (`HashRouter`, cocok untuk hosting statis)
- **Recharts** untuk grafik, **Sonner** untuk notifikasi, **Lucide** untuk ikon
- **Express 5** + **pg** + **Zod** untuk API
- **PostgreSQL 15+**
- **tsx** untuk menjalankan TypeScript di server

## Kebutuhan

- Node.js 20 atau lebih baru
- PostgreSQL 15 atau lebih baru (Windows: installer resmi PostgreSQL)

Proyek ini **tidak mengubah** service PostgreSQL yang sudah ada. Di Windows, `npm run db:start` membuat cluster terpisah di folder `.pgdata` pada port **55432** dengan autentikasi trust khusus lokal. Jika PostgreSQL hanya terpasang di lokasi lain, atur `PG_BIN` ke folder `bin` PostgreSQL.

## Menjalankan proyek

```bash
npm install
npm run db:start    # buat/nyalakan PostgreSQL lokal (port 55432)
npm run db:setup    # buat tabel + isi data awal
npm run dev:all     # jalankan Vite (5173) + API (3001)
```

Buka **http://localhost:5173**.

**Cara cepat di Windows:** klik dua kali **`Buka SiapTKA.bat`**. File itu menyalakan database, menyiapkan data, menjalankan web + API, lalu membuka browser. Tutup jendela terminal untuk menghentikan aplikasi (database lokal tetap berjalan; hentikan dengan `npm run db:stop`).

### Perintah lain

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Frontend Vite saja (API harus jalan terpisah) |
| `npm run dev:api` | API Express dengan auto-reload |
| `npm run dev:all` | Frontend + API sekaligus |
| `npm run dev:open` | Seperti `dev:all`, langsung membuka browser |
| `npm run db:start` | Buat cluster bila belum ada, lalu nyalakan |
| `npm run db:stop` | Hentikan PostgreSQL lokal |
| `npm run db:status` | Cek status database lokal |
| `npm run db:setup` | Jalankan skema + seed data (aman diulang) |
| `npm run db:reset` | Hapus **seluruh** cluster lokal lalu buat ulang |
| `npm run build` | Type-check + build produksi ke `dist/` |
| `npm start` | Jalankan API + serve `dist/` di port 3001 |
| `npm run lint` | Oxlint |

## Konfigurasi database

Default koneksi ada di `.env`:

```env
DATABASE_URL=postgres://postgres@127.0.0.1:55432/siap_tka
PORT=3001
DATABASE_SSL=false
```

Untuk memakai database PostgreSQL lain:

1. Buat database, misalnya `siap_tka`.
2. Ubah `DATABASE_URL` di `.env` (sertakan user/password/host/port).
3. Set `DATABASE_SSL=true` bila penyedia cloud mewajibkannya.
4. Jalankan `npm run db:setup`.

Contoh:

```env
DATABASE_URL=postgres://user:password@localhost:5432/siap_tka
```

### Mengembalikan data demo

`npm run db:setup` hanya menambah data yang belum ada, sehingga soal yang sudah diedit tidak tertimpa. Untuk mengembalikan seluruh data demo ke kondisi awal:

```bash
npm run db:reset
npm run db:setup
```

> `db:reset` hanya menghapus folder `.pgdata` milik proyek ini, bukan database PostgreSQL lain di komputer.

## API

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/api/health` | Cek koneksi database |
| `GET` | `/api/bootstrap` | Ambil soal, attempt, rekap, dan kelas sekaligus |
| `GET` | `/api/questions` | Daftar soal |
| `POST` | `/api/questions` | Tambah soal |
| `PUT` | `/api/questions/:id` | Ubah soal |
| `DELETE` | `/api/questions/:id` | Hapus soal |
| `GET` | `/api/attempts` | Riwayat ujian |
| `POST` | `/api/attempts` | Simpan hasil ujian |

Saat development, Vite meneruskan `/api` ke `http://127.0.0.1:3001`. Pada produksi, `npm start` menyajikan `dist/` dan API dari port yang sama.

## Mode demo

Gunakan tombol **Siswa / Guru** di bagian bawah sidebar (desktop) atau menu profil (mobile) untuk berpindah peran.

| Peran | Profil demo | Akses |
| --- | --- | --- |
| Siswa | Aulia Rahma · XII IPA 2 | Dashboard, tryout, ujian, hasil, analisis |
| Guru | Dimas Prakoso · Guru Matematika | Dashboard guru, bank soal, rekap nilai |

Perpindahan peran tidak memerlukan kata sandi karena ini hanya simulasi UI.

## Rute aplikasi

| Rute | Halaman |
| --- | --- |
| `#/` | Dashboard (siswa/guru sesuai peran) |
| `#/tryout` | Daftar tryout & latihan |
| `#/tryout/:examId` | Detail dan aturan ujian |
| `#/ujian/:examId` | Ruang ujian (tanpa layout aplikasi) |
| `#/hasil` | Daftar hasil |
| `#/hasil/:attemptId` | Detail hasil & pembahasan |
| `#/analisis` | Analisis kemampuan |
| `#/bank-soal` | Bank soal (guru) |
| `#/rekap` | Rekap nilai (guru) |

## Penyimpanan data

| Lokasi | Isi |
| --- | --- |
| PostgreSQL `questions` | Bank soal |
| PostgreSQL `attempts` | Riwayat dan hasil ujian |
| PostgreSQL `student_recaps` | Rekap siswa untuk guru |
| PostgreSQL `classes` | Statistik kelas |
| `localStorage` `siap-tka:role:v1` | Peran aktif (`siswa` / `guru`) |
| `localStorage` `siap-tka:theme:v1` | Tema (`light` / `dark`) |
| `localStorage` `siap-tka:session:<examId>` | Sesi ujian yang sedang berjalan |

Sesi ujian aktif sengaja tetap di browser agar timer dan jawaban sementara tetap aman saat refresh. Hasil akhir baru dianggap tersimpan setelah API mengembalikan sukses.

## Struktur proyek

```
server/
├─ index.ts          # API Express + serve dist/ di produksi
├─ db.ts             # Connection pool PostgreSQL
├─ schema.sql        # Skema tabel & index
└─ scripts/
   ├─ local-db.ts    # initdb/start/stop/status cluster lokal
   └─ setup.ts       # Migrasi skema + seed data

src/
├─ components/
│  ├─ layout/        # Sidebar, topbar, bottom nav, shell
│  ├─ ui/            # Komponen dasar bergaya shadcn/ui
│  └─ ...            # Stat card, score ring, chart tooltip, dll.
├─ context/          # State global: peran, tema, data dari API
├─ data/             # Seed soal, paket ujian, mapel, data guru
├─ lib/              # API client, analitik, sesi ujian, util
├─ pages/            # Dashboard, ujian, hasil, analisis, bank soal, rekap
├─ App.tsx           # Routing + gerbang koneksi database
└─ index.css         # Token tema Tailwind & dark mode
```

## Catatan teknis

- Timer ujian dihitung dari `startedAt` + durasi paket, sehingga tidak bergantung pada interval browser.
- Jawaban disimpan ke `localStorage` setiap kali berubah; hasil akhir dikirim ke PostgreSQL saat submit.
- Jika penyimpanan ke database gagal, sesi ujian tidak dihapus sehingga siswa bisa mencoba mengumpulkan lagi.
- Skor dihitung dari jumlah jawaban benar dibagi total soal.
- Data seed dibuat deterministik dengan hash FNV-1a agar skor demo konsisten.
- Build saat ini menghasilkan satu chunk besar (~930 kB). Untuk produksi, pertimbangkan code splitting per halaman.

## Langkah berikutnya menuju produksi

1. **Autentikasi & peran** — login siswa/guru, token sesi, dan otorisasi di server.
2. **Ujian terpusat** — jadwal, token ujian, pembatasan perangkat, dan pengawasan.
3. **Sinkronisasi jawaban** — simpan jawaban ke server secara berkala, bukan hanya saat submit.
4. **Manajemen paket ujian** — CRUD paket, jadwal, dan penugasan kelas dari database.
5. **Bank soal lengkap** — impor CSV/Excel, analisis butir soal, dan riwayat versi.
6. **PWA / Capacitor** — mode offline, instalasi ke home screen, dan versi Android/iOS.
7. **Pengujian** — unit test untuk penilaian/timer, E2E test untuk alur ujian, dan audit aksesibilitas.
