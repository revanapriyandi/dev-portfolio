export function assistantError(error: unknown): { status: number; message: string; retryAfter?: number } {
  const failure = error as { status?: number; name?: string; message?: string; error?: { code?: string; type?: string; error?: { code?: string; type?: string } }; headers?: { get?: (name: string) => string | null } };
  const detail = failure?.error?.error ?? failure?.error;
  if (failure?.status === 429 || detail?.code === "rate_limit_exceeded" || failure?.status === 413) {
    const seconds = Number(failure.headers?.get?.("retry-after"));
    return { status: 429, message: "Aksa sedang mencapai batas token layanan AI. Tunggu sekitar satu menit lalu coba lagi, atau hubungi Revan melalui WhatsApp.", retryAfter: Number.isFinite(seconds) && seconds > 0 ? Math.min(3600, Math.ceil(seconds)) : 60 };
  }
  if (failure?.status === 401 || failure?.status === 403 || failure?.status === 404) return { status: 503, message: "Konfigurasi layanan AI belum tersedia atau model tidak dapat diakses. Silakan hubungi Revan langsung." };
  if (failure?.message === "ASSISTANT_CONTEXT_TOO_LARGE") return { status: 413, message: "Konteks pertanyaan terlalu panjang. Coba satu pertanyaan yang lebih singkat." };
  if (failure?.name === "APIConnectionTimeoutError") return { status: 504, message: "Layanan AI terlalu lama merespons. Silakan coba lagi." };
  return { status: 502, message: "Layanan AI sedang mengalami kendala. Silakan coba lagi atau hubungi Revan langsung." };
}
