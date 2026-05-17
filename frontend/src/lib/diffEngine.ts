import { diffLines, Change } from 'diff';

export function buildLineDiffHtml(left: string, right: string, escapeHtml: (value: string) => string): string {
  if (!right) return '<div class="hint">Upload File B to compare it against the generated YAML.</div>';
  const changes: Change[] = diffLines(left || '', right || '');
  return changes
    .map(part => {
      const cls = part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-same';
      const prefix = part.added ? 'B ' : part.removed ? 'A ' : '  ';
      return part.value
        .split('\n')
        .filter(Boolean)
        .map(line => `<div class="${cls}">${prefix}${escapeHtml(line)}</div>`)
        .join('');
    })
    .join('');
}

// Made with Bob
