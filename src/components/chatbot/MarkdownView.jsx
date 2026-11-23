// Parser markdown sederhana & ringan tanpa library eksternal
// Mendukung: paragraf, tebal (**bold**), miring (*italic*), kode inline (`code`),
// blok kode (```), daftar butir (- atau *), dan daftar nomor (1.).

export default function MarkdownView({ content }) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'codeblock') {
          return (
            <pre
              key={idx}
              className="overflow-x-auto rounded-lg bg-canvas-deep/80 p-2.5 font-mono text-xs text-accent"
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === 'bullet-list') {
          return (
            <ul key={idx} className="list-disc space-y-1 pl-4 text-sm">
              {block.items.map((item, i) => (
                <li key={i}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'number-list') {
          return (
            <ol key={idx} className="list-decimal space-y-1 pl-4 text-sm">
              {block.items.map((item, i) => (
                <li key={i}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx}>
            <InlineMarkdown text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

function InlineMarkdown({ text }) {
  if (!text) return null;
  const parts = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **Tebal**
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-100">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // `Kode`
      parts.push(
        <code
          key={match.index}
          className="rounded bg-canvas-deep/80 px-1 py-0.5 font-mono text-[11px] text-accent"
        >
          {match[3]}
        </code>
      );
    } else if (match[4]) {
      // *Miring*
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {match[4]}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

function parseBlocks(raw) {
  const lines = raw.split('\n');
  const blocks = [];
  let currentList = null;
  let inCode = false;
  let codeLines = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', text: currentParagraph.join(' ') });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        blocks.push({ type: 'codeblock', text: codeLines.join('\n') });
        codeLines = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Butir (- atau *)
    const bulletMatch = line.match(/^[\s]*[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'bullet-list') {
        flushList();
        currentList = { type: 'bullet-list', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Nomor (1.)
    const numMatch = line.match(/^[\s]*\d+\.\s+(.*)$/);
    if (numMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'number-list') {
        flushList();
        currentList = { type: 'number-list', items: [] };
      }
      currentList.items.push(numMatch[1]);
      continue;
    }

    flushList();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (inCode && codeLines.length > 0) {
    blocks.push({ type: 'codeblock', text: codeLines.join('\n') });
  }

  return blocks;
}
