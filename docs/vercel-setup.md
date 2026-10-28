# Setup Vercel untuk Aksa dan dua akun GitHub

## Pengaturan project

Untuk project yang sudah terhubung ke `revanapriyandi/dev-portfolio`, pertahankan koneksi Git dan production branch `main`.

| Pengaturan | Nilai |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | Root repository, tempat `package.json` berada |
| Node.js Version | 24.x, sesuai runtime lokal yang diuji |
| Install Command | `npm ci` atau default Vercel untuk npm |
| Build Command | `npm run build` |
| Output Directory | Default Next.js; jangan ubah menjadi `out` |

Project menggunakan API server dan streaming, sehingga tidak memakai static export. Swiper terpasang lewat `package-lock.json`; tidak perlu layanan atau pengaturan Swiper terpisah.

Perhitungan token berjalan di server memakai js-tiktoken dengan encoding o200k_base yang sesuai merge ranks GPT-OSS. Tidak ada environment tambahan untuk batas prompt: input dibatasi 4.500 token dan jawaban maksimal 700 token. Katalog privat yang besar tidak lagi dimasukkan seluruhnya ke prompt. Jika kuota TPM organisasi sedang terpakai, endpoint mengembalikan 429 dan waktu tunggu, termasuk ketika Groq mengirim error batas token dengan status upstream 413.

## Environment variables untuk fitur baru

Isi melalui Vercel Project → Settings → Environment Variables. Pilih Production; tambahkan juga Preview jika ingin menguji fitur pada deployment preview. Nilai di bawah merupakan nama dan fungsi variabel, bukan credential.

| Variabel | Isi | Kebutuhan |
| --- | --- | --- |
| `GROQ_API_KEY` | API key Groq yang memiliki akses ke model yang dipakai aplikasi, `openai/gpt-oss-120b` | Diperlukan untuk jawaban AI umum |
| `GITHUB_TOKEN` | Fine-grained PAT milik `revanapriyandi` | Untuk metadata repo privat akun utama dan autentikasi API |
| `GITHUB_TOKEN_2` | Fine-grained PAT milik `revanapriyandi19` | Untuk metadata repo privat akun lama dan autentikasi API |
| `GITHUB_REPO_CARD_SECRET` | Kunci acak stabil, misalnya 32 byte acak yang direpresentasikan sebagai 64 karakter hex | Disarankan; menandatangani referensi kartu privat |

Semua variabel di tabel ini merupakan secret server. Jangan tambahkan awalan `NEXT_PUBLIC_`. Jika sudah ada `GROQ_API_KEY` yang valid di Vercel, tidak perlu menggantinya. Jika `GITHUB_REPO_CARD_SECRET` kosong, kode menggunakan `GROQ_API_KEY` sebagai fallback; kunci terpisah memudahkan rotasi credential. Rotasi kunci kartu membatalkan referensi kartu lama.

Tanpa token GitHub, kedua akun tetap bisa menampilkan repo publik. Token dibutuhkan untuk repo privat. Tanpa `GROQ_API_KEY`, jawaban AI umum tidak tersedia; pertanyaan status proyek yang ditangani langsung oleh server tetap dapat dijawab berdasarkan data GitHub yang tersedia.

## Membuat dua token GitHub

Lakukan secara terpisah dalam akun yang sesuai:

1. Masuk ke `revanapriyandi`, kemudian buka Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Pastikan Resource owner adalah `revanapriyandi`. Pilih Only select repositories, lalu pilih repo privat yang nama, deskripsi, dan aktivitas commit-nya boleh dikenalkan kepada pengunjung melalui Aksa.
3. Gunakan Repository permissions: Metadata read dan Contents read. Metadata dibutuhkan untuk daftar repo; Contents read dibutuhkan endpoint commit terakhir. Tidak perlu izin write, admin, atau workflow.
4. Simpan token ke `GITHUB_TOKEN` di Vercel.
5. Ulangi dalam akun `revanapriyandi19`, dengan Resource owner akun tersebut, dan simpan token ke `GITHUB_TOKEN_2`.

Kartu privat tidak memberikan akses ke kode, diff, atau URL repo privat. Namun nama, deskripsi, bahasa, dan pesan/tanggal/SHA commit dapat ditampilkan dalam percakapan. Pilih repo yang informasi tersebut boleh diketahui pengunjung.

## Fitur lama yang perlu dipertahankan

Variabel ini tidak ditambahkan oleh perubahan dua akun, tetapi diperlukan bila fiturnya digunakan:

| Fitur | Variabel |
| --- | --- |
| Login admin | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ADMIN_USER_IDS` |
| Inbox, log chat, dan page views | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Pengiriman contact form lewat Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| Pengiriman contact form lewat email | `EMAIL_ADDRESS`, `GMAIL_PASSKEY` |
| Google Analytics / Tag Manager | `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM` |

Handoff WhatsApp dan draf email dari Aksa memakai aplikasi pengunjung melalui tautan; fitur ini tidak membutuhkan WhatsApp API atau SMTP. SMTP/Telegram di tabel adalah untuk contact form. Tidak ada migrasi database baru dalam perubahan ini. Untuk database yang belum pernah disiapkan, skema lama tersedia di `supabase/`.

## Deploy dan pemeriksaan

Setelah menyimpan environment variables, lakukan deployment baru atau Redeploy. Perubahan environment tidak mengubah deployment yang sudah berjalan. Push ke `main` dapat memicu deployment otomatis bila Git integration dan pengaturan deployment mengizinkannya; sukses push belum membuktikan deployment Ready.

Setelah deployment Ready:

1. Buka feed GitHub; cek filter kedua akun dan tombol/drag slider.
2. Tanyakan contoh proyek di Aksa; cek gambar kartu, teks tebal, dan navigasi slider.
3. Tanyakan proyek yang sedang dikerjakan; jawaban harus menyatakan status belum terverifikasi dan tidak menyimpulkan status dari tanggal/commit.
4. Tanyakan satu repo privat yang dipilih; cek metadata dan kartu tanpa tautan kode privat.
5. Buka resume dari Aksa; chat harus menutup. Periksa draf WhatsApp/email berisi ringkasan tanpa benar-benar mengirim pesan uji.

## Referensi resmi

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Node.js versions di Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [GitHub fine-grained personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub list commits dan izin Contents read](https://docs.github.com/en/rest/commits/commits#list-commits)
