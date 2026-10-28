import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g).map((part, i) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="break-words rounded bg-panel px-1 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function AssistantText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length;) {
    if (!lines[i].trim()) { i++; continue; }
    const list = /^\s*(?:([-*•])|(\d+)[.)])\s+/.exec(lines[i]);
    if (list) {
      const ordered = Boolean(list[2]);
      const items: ReactNode[] = [];
      const start = Number(list[2] || 1);
      while (i < lines.length) {
        const item = /^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/.exec(lines[i]);
        if (!item || Boolean(item[2]) !== ordered) break;
        items.push(<li key={i}>{inline(item[3])}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={i} start={start} className="list-decimal space-y-1.5 pl-4">{items}</ol> : <ul key={i} className="list-disc space-y-1.5 pl-4">{items}</ul>);
    } else {
      const paragraph = [lines[i++]];
      while (i < lines.length && lines[i].trim() && !/^\s*(?:[-*•]|\d+[.)])\s+/.test(lines[i])) paragraph.push(lines[i++]);
      blocks.push(<p key={i} className="whitespace-pre-wrap">{inline(paragraph.join("\n"))}</p>);
    }
  }
  return <div className="space-y-2.5 break-words">{blocks}</div>;
}
