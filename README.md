# SiapTKA — Belajar, Latih, Siap TKA

Aplikasi web demo untuk persiapan **TKA (Tes Kemampuan Akademik)**. Dibangun dengan React + TypeScript + Tailwind CSS dan komponen bergaya shadcn/ui. Semua data disimpan di `localStorage`, jadi aplikasi bisa langsung dicoba tanpa backend.

> ⚠️ Ini adalah MVP/demo frontend, bukan sistem ujian produksi. Tidak ada autentikasi, server, atau pengawasan ujian yang sesungguhnya.

## Fitur

### Untuk siswa

- **Dashboard** ringkasan skor, target, jadwal tes, dan hasil terbaru.
- **Tryout & latihan** dengan pencarian, filter mapel/tingkat, dan detail aturan ujian.
- **Ruang ujian (CBT)**:
  - Timer yang berjalan berdasarkan waktu mulai dan tetap akurat setelah refresh.
  - Simpan jawaban otomatis ke `localStorage`.
  - Navigasi soal, tandai ragu-ragu, dan progres pengerjaan.
  - Dialog konfirmasi keluar dan pengumpulan jawaban.
  - Auto-submit saat waktu habis.
- **Hasil & pembahasan** per soal: jawabanmu, kunci, dan penjelasan.
- **Analisis kemampuan**: radar mapel, tren skor, penguasaan topik, kekuatan, area perbaikan, dan rencana belajar.
- **Mode gelap** dan layout responsif mobile-first.

### Untuk guru

- **Dashboard guru** dengan statistik kelas, live monitoring demo, dan papan skor.
- **Bank soal** (khusus mode guru):
  - Tambah, edit, dan hapus soal.
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
- **Recharts** untuk grafik
- **Sonner** untuk notifikasi
- **Lucide React** untuk ikon
- **Plus Jakarta Sans** via Fontsource

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

**Cara cepat di Windows:** klik dua kali file **`Buka SiapTKA.bat`** di folder proyek. File tersebut menjalankan server dan membuka browser secara otomatis. Tutup jendela terminal untuk menghentikan aplikasi.

Perintah lain:

```bash
npm run build    # type-check + build produksi ke folder dist
npm run preview  # pratinjau hasil build
npm run lint     # Oxlint
```

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

Data demo disimpan di browser:

| Key | Isi |
| --- | --- |
| `siap-tka:attempts:v1` | Riwayat percobaan ujian |
| `siap-tka:questions:v1` | Bank soal |
| `siap-tka:role:v1` | Peran aktif (`siswa` / `guru`) |
| `siap-tka:theme:v1` | Tema (`light` / `dark`) |
| `siap-tka:session:<examId>` | Sesi ujian yang sedang berjalan |

Untuk mengembalikan data demo ke kondisi awal, buka DevTools → Application → Local Storage, lalu hapus key di atas dan refresh halaman.

## Struktur proyek

```
src/
├─ components/
│  ├─ layout/        # Sidebar, topbar, bottom nav, shell
│  ├─ ui/            # Komponen dasar bergaya shadcn/ui
│  └─ ...            # Stat card, score ring, chart tooltip, dll.
├─ context/          # State global: peran, tema, soal, riwayat
├─ data/             # Seed soal, paket ujian, mapel, data guru
├─ lib/              # Analitik, sesi ujian, util format & CSV
├─ pages/            # Dashboard, ujian, hasil, analisis, bank soal, rekap
├─ App.tsx           # Routing
└─ index.css         # Token tema Tailwind & dark mode
```

## Catatan teknis

- Timer ujian dihitung dari `startedAt` + durasi paket, sehingga tidak bergantung pada interval browser.
- Jawaban disimpan setiap kali berubah; sesi juga dipulihkan saat halaman dibuka kembali.
- Skor dihitung dari jumlah jawaban benar dibagi total soal.
- Data seed dibuat deterministik dengan hash FNV-1a agar skor demo konsisten.
- Build saat ini menghasilkan satu chunk besar (~927 kB). Untuk produksi, pertimbangkan code splitting per halaman.

## Langkah berikutnya menuju produksi

1. **Backend & database** — Supabase/PostgreSQL untuk soal, paket ujian, sesi, dan nilai.
2. **Autentikasi & peran** — login siswa/guru, token sesi, dan otorisasi di server.
3. **Ujian terpusat** — jadwal, token ujian, pembatasan perangkat, dan pengawasan.
4. **Sinkronisasi jawaban** — simpan ke server secara berkala, bukan hanya `localStorage`.
5. **Bank soal lengkap** — impor CSV/Excel, bank soal per mapel, analisis butir soal.
6. **PWA / Capacitor** — mode offline, instalasi ke home screen, dan versi Android/iOS.
7. **Pengujian** — unit test untuk penilaian/timer, E2E test untuk alur ujian, dan audit aksesibilitas.
