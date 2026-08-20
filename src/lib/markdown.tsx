import type { ReactNode } from 'react';

/** Lightweight markdown renderer (bold, italics, code, lists, headings, paragraphs) */
export function renderMarkdown(md: string): ReactNode[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${listKey++}`} className="my-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        {listItems.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const inline = (text: string): ReactNode => {
    const parts: ReactNode[] = [];
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const token = m[0];
      if (token.startsWith('**')) {
        parts.push(<strong key={k++} className="font-semibold text-white">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*')) {
        parts.push(<em key={k++}>{token.slice(1, -1)}</em>);
      } else {
        parts.push(
          <code key={k++} className="rounded bg-black/40 px-1 py-0.5 text-[12px] text-accent-400">
            {token.slice(1, -1)}
          </code>
        );
      }
      last = m.index + token.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length ? <>{parts}</> : text;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const bullet = line.match(/^\s*[-*•]\s+(.+)/);
    if (bullet) {
      listItems.push(bullet[1]);
      continue;
    }
    flushList();

    if (!line.trim()) {
      nodes.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h4 key={i} className="mt-3 mb-1 font-display text-sm font-semibold text-white">
          {inline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={i} className="mt-3 mb-1 font-display text-base font-semibold text-white">
          {inline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      nodes.push(
        <h2 key={i} className="mt-3 mb-1 font-display text-lg font-semibold text-white">
          {inline(line.slice(2))}
        </h2>
      );
      continue;
    }

    nodes.push(
      <p key={i} className="text-sm leading-relaxed text-slate-300">
        {inline(line)}
      </p>
    );
  }

  flushList();
  return nodes;
}
