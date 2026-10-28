import { projectsData } from "@/utils/data/projects-data";
import type { RepoActivity } from "@/utils/github-activity";
import type { RepoCard } from "@/utils/github";
import { repoReference } from "@/utils/repo-access";

export function isProjectStatusQuestion(question: string): boolean {
  const status = /\b(sedang|masih|lagi|sekarang|saat ini|aktif|current|currently|ongoing|in progress|right now|working on|selesai|completed|finished|status)\b/i.test(question);
  const project = /\b(projects?|proyek|projek|kerjakan|dikerjakan|mengerjakan|pekerjaan|work|working)\b/i.test(question) || projectsData.some((p) => question.toLowerCase().includes(p.name.toLowerCase()));
  return status && project;
}

export function projectStatusReply(question: string, activities: RepoActivity[], repos: RepoCard[]): string {
  const indonesian = /\b(apa|proyek|projek|kerjakan|dikerjakan|sekarang|sedang|saat ini|masih|selesai|pekerjaan|yang)\b/i.test(question);
  let reply = indonesian
    ? "Status proyek yang sedang dikerjakan atau sudah selesai belum tercatat secara terverifikasi di portofolio ini. Tanggal proyek dan commit terbaru hanya menunjukkan aktivitas, sehingga saya belum bisa memastikan status pengerjaannya."
    : "The portfolio has no verified record of which projects are currently in progress or completed. Project dates and recent commits show activity, so I cannot confirm their delivery status.";
  if (activities.length) {
    reply += indonesian ? "\n\nAktivitas commit terakhir yang dapat diverifikasi:" : "\n\nLatest verifiable commit activity:";
    for (const activity of activities) {
      const date = new Date(activity.date).toLocaleString(indonesian ? "id-ID" : "en-GB", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
      const message = activity.message.replace(/[\[\]<>*_`]/g, "");
      reply += `\n- **${activity.fullName}** · ${date} WIB · ${activity.sha.slice(0, 7)}: ${message}`;
    }
  }
  reply += indonesian ? "\n\nUntuk status pengerjaan terbaru, konfirmasi langsung ke Revan. [[whatsapp]]" : "\n\nPlease contact Revan directly to confirm current project status. [[whatsapp]]";
  for (const activity of activities) {
    const repo = repos.find((r) => r.fullName === activity.fullName);
    const reference = repo?.private ? repoReference(activity.fullName) : activity.fullName;
    if (reference) reply += ` [[repo:${reference}]]`;
  }
  return reply;
}
