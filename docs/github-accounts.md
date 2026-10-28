# Integrasi dua akun GitHub

Akun yang disetujui: `revanapriyandi` dan `revanapriyandi19`.

## Rancangan dan rencana implementasi

- [x] Gabungkan repo milik kedua akun melalui server. Token dipasangkan secara eksplisit dengan pemilik; jangan ikut menampilkan repo kolaborator atau organisasi. Ikuti pagination dan urutkan berdasarkan push terbaru. Jika token gagal, coba repo publik akun tersebut; kegagalan satu akun tidak menggagalkan akun lain.
- [x] Pakai `owner/name` sebagai identitas repo dalam prompt, tag, API, dan key React. Feed halaman hanya memuat repo publik. Repo privat hanya dikirim ke pengunjung melalui kartu yang direferensikan Aksa memakai tanda tangan dengan masa berlaku.
- [x] Pertahankan kartu proyek, tombol kontak, serta scroll/highlight dari pekerjaan Claude Code. Tambahkan status memuat, kosong, dan gagal pada kartu repo.
- [x] Tampilkan seluruh repo publik dalam slider dengan swipe, tombol sebelumnya/berikutnya, serta filter Semua dan masing-masing akun. Jangan membatasi enam repo atau menghapus repo akun lama yang belum memiliki deskripsi.
- [x] Gabungkan kartu proyek dan repo di dalam slider chat Aksa; tampilkan posisi kartu, navigasi, dan dukung maksimal 12 rekomendasi bila pengunjung meminta banyak data.
- [x] Pertanyaan riwayat proyek menampilkan kartu sebagai bukti. Server menambahkan kartu proyek yang disebut dalam jawaban bila model lupa tag, tanpa membuat proyek baru atau menduplikasi kartu.
- [x] Pertanyaan status aktif/selesai memakai jawaban server yang menyatakan status belum terverifikasi. Commit terakhir diambil dari GitHub untuk maksimal tiga repo relevan dan diperlakukan sebagai bukti aktivitas saja. Teks tebal, kode inline, dan daftar dirender sebagai elemen React; HTML mentah tidak dijalankan.
- [x] Garis highlight Aksa digambar sebagai overlay di dalam kartu, di atas galeri, agar tidak terpotong oleh kontainer grid atau tertutup gambar.
- [x] Membuka resume lewat Aksa atau navigasi menutup panel chat. Modal resume berada di atas chat dan tombol tutup mendapat fokus.
- [x] Kontak WhatsApp dan email dari Aksa menyertakan ringkasan kebutuhan/pertanyaan pengunjung dalam draf pesan. Ringkasan berasal dari pesan pengunjung, tanpa menganggap jawaban AI sebagai janji/keputusan; tag internal dibuang. Tersedia tombol salin ringkasan untuk Fastwork atau saluran lain.
- [x] Uji dua akun, pagination, fallback, tabrakan nama, batas publik/privat, serta tanda tangan. Jalankan TypeScript, lint sumber, build, dan pemeriksaan browser.

## Arah tampilan

Slider feed dan chat memakai Swiper 14.3.0, mendukung drag/swipe, tombol navigasi, keyboard, dan pengurangan animasi sesuai preferensi sistem. Feed memakai progress bar; chat memakai indikator posisi kartu.

Kartu proyek dalam chat memakai gambar penuh di atas dengan rasio 16:10 dan `object-contain`, lalu judul dan ringkasan di bawah. Tinggi Swiper mengikuti slide aktif supaya thumbnail tidak tenggelam dalam ruang kosong.

Mengikuti portofolio pengembang yang sudah disetujui: ENERGY 2 / RHYTHM 2 / MOTION 2. Kartu memakai warna, font, dan bentuk yang sudah ada. Identitas lengkap membedakan dua repo bernama sama; label Private menjelaskan mengapa kartu tidak memiliki tautan. Efek scroll/highlight tetap berfungsi sebagai penunjuk bagian yang dijelaskan Aksa.

## Konfigurasi

`GITHUB_TOKEN` untuk `revanapriyandi`, `GITHUB_TOKEN_2` untuk `revanapriyandi19`. Keduanya opsional untuk repo publik, server-only, dan tidak boleh memakai awalan `NEXT_PUBLIC_`. Untuk repo privat gunakan fine-grained personal access token milik akun terkait, akses repo yang ingin dikenalkan saja, dengan Metadata read; tambahkan Contents read bila ingin membaca commit terakhir. Isi di `.env.local` atau environment hosting, jangan di source control.

Metadata repo privat (nama, deskripsi, bahasa, serta pesan/tanggal/SHA commit terakhir bila Contents read tersedia) dapat diberikan kepada Groq sebagai konteks Aksa dan ditampilkan kepada pengunjung melalui chat sesuai permintaan pemilik portofolio. Kode, diff, isi file, token, dan URL repo privat tidak dikirim. Pilih repo yang metadatanya memang boleh dikenalkan. Batas jumlah kartu bukan pengamanan terhadap pengunjung chat yang meminta metadata berulang kali. Data GitHub disimpan dalam cache server sampai satu jam.

Kartu privat memakai HMAC yang berlaku 24 jam. Kunci berasal dari `GITHUB_REPO_CARD_SECRET` atau, bila kosong, `GROQ_API_KEY`. Rotasi kunci membatalkan referensi lama. Token/kunci tidak dikirim ke browser.

Dokumentasi API: https://docs.github.com/en/rest/repos/repos

## Verifikasi pada 28 Oktober 2026

- `npm test`: 19 pengujian lulus, termasuk dua akun, pagination, fallback token, akses kartu privat bertanda tangan, pemisahan identitas repo, tambahan kartu bukti di stream, penolakan klaim status proyek, rendering teks aman, dan ringkasan kontak.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`, dan `git diff --check`: lulus pada sumber akhir. TypeScript dijalankan setelah build agar tidak berbenturan dengan regenerasi `.next/types`.
- GitHub langsung: 48 repo publik non-fork/non-arsip, terdiri atas 11 milik `revanapriyandi` dan 37 milik `revanapriyandi19`. Commit terakhir diverifikasi untuk `dev-portfolio` dan `Simperu`; tanggal commit tidak dipakai sebagai status aktif/selesai.
- Browser pada lebar 1036 dan 390 piksel: filter akun lama memuat 37 slide; tombol, drag mouse, dan keyboard Swiper berpindah slide. Tidak ditemukan overflow horizontal. Gambar proyek selesai dimuat, sekitar 303×189 piksel di desktop dan 267×166 piksel di ponsel, memakai `object-contain`.
- Rendering tebal dan daftar, tautan commit nyata pada kartu repo publik, garis highlight di atas galeri, modal resume z-index 80 yang menutup chat dan memfokuskan tombol tutup, serta tema terang/gelap diperiksa di browser.
- Draf WhatsApp dicegat dalam browser pengujian untuk memeriksa ringkasan tanpa mengirim pesan; email memuat ringkasan yang sama. Respons contoh dipakai untuk memeriksa UI kartu dan sudah dilepas setelah pengujian. Pertanyaan status proyek diuji ke endpoint nyata tanpa provider LLM.
- Pada saat verifikasi, belum ada token GitHub maupun Groq di environment lokal. Akses langsung repo privat dan keluaran Groq nyata belum diverifikasi; kasus privat/provider pada pengujian otomatis memakai fixture. Verifikasi ini dilakukan sebelum rilis sumber; status deployment produksi harus diperiksa terpisah. Panduan konfigurasi tersedia di [vercel-setup.md](vercel-setup.md).
- Console lokal memuat 404 dari skrip Vercel Analytics karena aplikasi berjalan di luar Vercel. Build juga mengingatkan adanya lockfile di direktori induk. Keduanya tidak menghalangi pemeriksaan ini.

Gate tampilan untuk perubahan ini:

- Hard gate PASS: gambar berhasil dimuat, tidak ada overflow pada dua ukuran layar yang diperiksa, HTML masukan di-escape, tombol baru memakai handler/tautan nyata, dan kondisi memuat/kosong/gagal tersedia.
- Purpose gate PASS: gambar penuh memperlihatkan proyek; identitas pemilik membedakan repo; label privat menjelaskan absennya tautan; progress dan penghitung menunjukkan posisi.
- Liveliness PASS: ENERGY 2 / RHYTHM 2 / MOTION 2 mengikuti arahan lama, dengan perpindahan Swiper yang dipicu pengunjung dan dukungan reduced motion.
- Craft PASS: build, TypeScript, lint, dan 19 tes lulus; navigasi slider, tema, handoff, dan modal diperiksa pada browser.
