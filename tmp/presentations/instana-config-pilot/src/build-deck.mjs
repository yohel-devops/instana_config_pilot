import fs from 'node:fs/promises';
import path from 'node:path';
import {
  Presentation,
  PresentationFile,
  layers,
  panel,
  column,
  row,
  grid,
  text,
  image,
  rule,
  shape,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
  auto,
} from '@oai/artifact-tool';

const W = 1920;
const H = 1080;
const ROOT = path.resolve('../../..');
const OUT = path.resolve('output');
const SCRATCH = path.resolve('scratch');
const ASSETS = path.join(ROOT, 'docs', 'demo-assets');
const imageBlobs = new Map();
for (const file of ['app-home.png', 'sensor-catalog.png', 'generated-yaml.png', 'generated-env.png', 'compare-mode.png']) {
  const bytes = await fs.readFile(path.join(ASSETS, file));
  imageBlobs.set(file, new Blob([bytes], { type: 'image/png' }));
}

const C = {
  ink: '#101828',
  muted: '#475467',
  soft: '#EAECF0',
  paper: '#F8FAFC',
  white: '#FFFFFF',
  blue: '#0F62FE',
  cyan: '#08BDBA',
  purple: '#6F4CFF',
  green: '#24A148',
  amber: '#F1C21B',
  red: '#DA1E28',
  navy: '#071426',
  slate: '#162033',
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function T(value, opts = {}) {
  return text(value, {
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    name: opts.name,
    style: {
      fontFace: 'Aptos',
      fontSize: opts.size ?? 28,
      bold: opts.bold ?? false,
      color: opts.color ?? C.ink,
      italic: opts.italic ?? false,
      align: opts.align,
    },
  });
}

function bullet(textValue, color = C.blue) {
  return row({ width: fill, height: hug, gap: 18, align: 'center' }, [
    shape({ name: 'bullet-dot', geometry: 'ellipse', width: fixed(14), height: fixed(14), fill: color, line: { color, transparency: 100 } }),
    T(textValue, { size: 28, color: C.ink, width: fill }),
  ]);
}

function pill(label, color = C.blue) {
  return panel({ fill: color, padding: { x: 22, y: 10 }, borderRadius: 'rounded-full' },
    T(label, { size: 18, bold: true, color: C.white, width: hug })
  );
}

function footer(slideNo) {
  return row({ width: fill, height: hug, justify: 'between', align: 'center' }, [
    T('Instana Config Pilot | IBM Bob Hackathon', { size: 16, color: '#667085', width: hug }),
    T(String(slideNo).padStart(2, '0'), { size: 16, color: '#667085', width: hug, bold: true }),
  ]);
}

function slideShell({ title, subtitle, slideNo, children, dark = false }) {
  const s = presentation.slides.add();
  const bg = dark ? C.navy : C.paper;
  const titleColor = dark ? C.white : C.ink;
  const subColor = dark ? '#C7D7FE' : C.muted;
  s.compose(
    layers({ name: 'slide', width: fill, height: fill }, [
      panel({ name: 'background', fill: bg, width: fill, height: fill }),
      column({ name: 'root', width: fill, height: fill, padding: { x: 96, y: 70 }, gap: 34 }, [
        column({ name: 'title-stack', width: fill, height: hug, gap: 12 }, [
          T(title, { name: 'slide-title', size: 56, bold: true, color: titleColor, width: wrap(1500) }),
          subtitle ? T(subtitle, { name: 'slide-subtitle', size: 25, color: subColor, width: wrap(1280) }) : T('', { size: 1, color: bg, width: hug }),
        ]),
        children,
        footer(slideNo),
      ]),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
  return s;
}

function screenshot(file, alt, width = fill, height = fill) {
  return panel({ fill: C.white, width, height, line: { color: '#D0D5DD', transparency: 0 }, padding: 10 },
    image({ blob: imageBlobs.get(file), width: fill, height: fill, fit: 'contain', alt })
  );
}

// 1 Cover
{
  const s = presentation.slides.add();
  s.compose(layers({ width: fill, height: fill }, [
    panel({ fill: C.navy, width: fill, height: fill }),
    grid({ width: fill, height: fill, columns: [fr(0.9), fr(1.1)], columnGap: 64, padding: { x: 96, y: 80 } }, [
      column({ width: fill, height: fill, justify: 'center', gap: 30 }, [
        pill('IBM Bob Hackathon', C.blue),
        T('Instana\nConfig Pilot', { name: 'cover-title', size: 88, bold: true, color: C.white, width: wrap(760) }),
        T('Generate, validate, compare, and export IBM Instana configuration YAML from a guided browser workflow.', { name: 'cover-subtitle', size: 30, color: '#D4E3FF', width: wrap(760) }),
        rule({ width: fixed(240), stroke: C.cyan, weight: 6 }),
        T('Frontend-first delivery built with IBM Bob', { size: 23, bold: true, color: '#A7F3D0', width: wrap(700) }),
      ]),
      column({ width: fill, height: fill, justify: 'center', gap: 16 }, [
        screenshot('app-home.png', 'Instana Config Pilot app home screenshot', fill, fixed(610)),
        T('Browser-based workflow: template -> sensors -> validation -> export', { size: 20, color: '#C7D7FE', width: fill }),
      ]),
    ]),
  ]), { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 });
}

// 2 Problem
slideShell({
  title: 'Manual Instana YAML editing is fragile',
  subtitle: 'Large configuration files create operational risk before changes ever reach a real environment.',
  slideNo: 2,
  children: grid({ width: fill, height: fill, columns: [fr(1), fr(1), fr(1)], columnGap: 34 }, [
    column({ width: fill, height: fill, justify: 'center', gap: 18 }, [T('01', { size: 30, color: C.red, bold: true }), T('Syntax and indentation errors', { size: 42, bold: true, width: fill }), T('A single spacing mistake can break an otherwise valid sensor configuration.', { size: 25, color: C.muted, width: fill })]),
    column({ width: fill, height: fill, justify: 'center', gap: 18 }, [T('02', { size: 30, color: C.amber, bold: true }), T('Incomplete sensor fields', { size: 42, bold: true, width: fill }), T('Different servers and environments need different sensors, credentials, tags, and tuning values.', { size: 25, color: C.muted, width: fill })]),
    column({ width: fill, height: fill, justify: 'center', gap: 18 }, [T('03', { size: 30, color: C.blue, bold: true }), T('Hard-to-review changes', { size: 42, bold: true, width: fill }), T('Teams need to understand exactly what changed before applying configuration.', { size: 25, color: C.muted, width: fill })]),
  ]),
});

// 3 Solution
slideShell({
  title: 'A guided workflow from template to usable YAML',
  subtitle: 'Instana Config Pilot turns configuration work into a repeatable browser flow.',
  slideNo: 3,
  children: column({ width: fill, height: fill, justify: 'center', gap: 32 }, [
    row({ width: fill, height: hug, gap: 20, align: 'center', justify: 'center' }, [pill('Load template', C.blue), pill('Detect sensors', C.purple), pill('Configure fields', C.cyan), pill('Validate risks', C.green), pill('Export files', C.ink)]),
    grid({ width: fill, height: hug, columns: [fr(1), fr(1)], columnGap: 70 }, [
      column({ gap: 20, width: fill, height: hug }, [bullet('Detects `com.instana.plugin.*` blocks from Instana-style YAML'), bullet('Builds a dynamic sensor catalog with known and unknown sensors'), bullet('Generates `configuration.yaml` without hand-editing indentation')]),
      column({ gap: 20, width: fill, height: hug }, [bullet('Generates `.env.example` placeholders for credentials', C.green), bullet('Flags missing required values and hardcoded-secret risks', C.green), bullet('Compares generated YAML against another file before review', C.green)]),
    ]),
  ]),
});

// 4 App screenshot
slideShell({
  title: 'The demo starts with a real Instana-style template',
  subtitle: 'The frontend loads the template, discovers sensor blocks, and exposes the workflow in one screen.',
  slideNo: 4,
  children: screenshot('app-home.png', 'Application home screenshot', fill, fill),
});

// 5 Catalog
slideShell({
  title: 'Sensor catalog: searchable, filterable, configurable',
  subtitle: 'Known sensors get curated fields; unknown plugin blocks are still preserved through dynamic metadata.',
  slideNo: 5,
  children: grid({ width: fill, height: fill, columns: [fr(1.25), fr(0.75)], columnGap: 42 }, [
    screenshot('sensor-catalog.png', 'Sensor catalog screenshot', fill, fill),
    column({ width: fill, height: fill, justify: 'center', gap: 24 }, [
      T('What the user gets', { size: 34, bold: true }),
      bullet('Search and category filters'),
      bullet('One-click sensor enablement'),
      bullet('Required-field guidance'),
      bullet('IBM MQ demo values for fast walkthrough'),
    ]),
  ]),
});

// 6 Outputs
slideShell({
  title: 'Generated outputs separate configuration from secrets',
  subtitle: '`configuration.yaml` carries structure; `.env.example` carries placeholders for sensitive values.',
  slideNo: 6,
  children: grid({ width: fill, height: fill, columns: [fr(1), fr(1)], columnGap: 34 }, [
    column({ width: fill, height: fill, gap: 14 }, [T('configuration.yaml', { size: 28, bold: true }), screenshot('generated-yaml.png', 'Generated YAML screenshot', fill, fill)]),
    column({ width: fill, height: fill, gap: 14 }, [T('.env.example', { size: 28, bold: true }), screenshot('generated-env.png', 'Generated env screenshot', fill, fill)]),
  ]),
});

// 7 Compare
slideShell({
  title: 'Compare mode makes configuration review visible',
  subtitle: 'Before applying changes, teams can compare generated YAML against another candidate file.',
  slideNo: 7,
  children: grid({ width: fill, height: fill, columns: [fr(1.2), fr(0.8)], columnGap: 40 }, [
    screenshot('compare-mode.png', 'Compare mode screenshot', fill, fill),
    column({ width: fill, height: fill, justify: 'center', gap: 24 }, [
      T('Review before apply', { size: 40, bold: true }),
      bullet('Visual line-by-line diff'),
      bullet('Candidate YAML validation'),
      bullet('Clear A/B comparison for operators'),
    ]),
  ]),
});

// 8 Bob
slideShell({
  title: 'IBM Bob was the development partner',
  subtitle: 'Bob helped move from idea to architecture, implementation, refactor, and final documentation.',
  slideNo: 8,
  dark: true,
  children: grid({ width: fill, height: fill, columns: [fr(1), fr(1)], columnGap: 64 }, [
    column({ width: fill, height: fill, justify: 'center', gap: 24 }, [
      T('Bob IDE usage', { size: 42, bold: true, color: C.white }),
      bullet('Architecture exploration and planning', C.cyan),
      bullet('Frontend implementation and TypeScript refactor', C.cyan),
      bullet('Documentation, runbook, and submission prep', C.cyan),
      bullet('Task evidence exported to `bob_sessions/`', C.cyan),
    ]),
    column({ width: fill, height: fill, justify: 'center', gap: 24 }, [
      T('Hackathon pivot', { size: 42, bold: true, color: C.white }),
      T('The original plan included web + API + MCP. When BobCoins became a practical constraint, the team pivoted to a frontend-first MVP that preserved the core product value.', { size: 30, color: '#D4E3FF', width: fill }),
      rule({ width: fixed(260), stroke: C.green, weight: 6 }),
      T('A working demo beat a broader unfinished architecture.', { size: 28, bold: true, color: '#A7F3D0', width: fill }),
    ]),
  ]),
});

// 9 Architecture
slideShell({
  title: 'Final architecture: browser-first and static deployable',
  subtitle: 'The functional delivery removes API dependency and keeps the Instana workflow local to the frontend.',
  slideNo: 9,
  children: grid({ width: fill, height: fill, columns: [fr(1), fr(1)], columnGap: 60 }, [
    column({ width: fill, height: fill, justify: 'center', gap: 20 }, [
      pill('React + TypeScript + Vite', C.blue),
      T('Client-side engines', { size: 48, bold: true }),
      T('sensorDetector -> sensorCatalog -> validator -> yamlGenerator -> envGenerator -> diffEngine', { size: 30, color: C.muted, width: fill }),
    ]),
    column({ width: fill, height: fill, justify: 'center', gap: 18 }, [
      T('Delivery scope', { size: 34, bold: true }),
      bullet('Static frontend served by Nginx'),
      bullet('Backend remains as reference/prototype code'),
      bullet('No production secrets or client data required'),
      bullet('Future MCP/API path remains possible after MVP'),
    ]),
  ]),
});

// 10 Impact
slideShell({
  title: 'Impact: safer configuration, faster review',
  subtitle: 'A focused proof of concept for teams that manage Instana agent configuration.',
  slideNo: 10,
  children: grid({ width: fill, height: fill, columns: [fr(1), fr(1)], columnGap: 64 }, [
    column({ width: fill, height: fill, justify: 'center', gap: 20 }, [
      T('What changes', { size: 42, bold: true }),
      bullet('Less manual YAML editing'),
      bullet('More consistent operational tags'),
      bullet('Secrets pushed toward environment variables'),
      bullet('Diffs visible before config reaches a server'),
    ]),
    column({ width: fill, height: fill, justify: 'center', gap: 20 }, [
      T('Next steps', { size: 42, bold: true }),
      bullet('Add unit tests for frontend engines', C.purple),
      bullet('Improve nested YAML rendering for more sensors', C.purple),
      bullet('Add frontend-only ZIP bundle export', C.purple),
      bullet('Revisit API/MCP integration after MVP', C.purple),
    ]),
  ]),
});

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.join(SCRATCH, 'previews'), { recursive: true });
const pptxBlob = await PresentationFile.exportPptx(presentation);
await pptxBlob.save(path.join(OUT, 'Instana-Config-Pilot-pitch-deck.pptx'));

for (let i = 0; i < presentation.slides.count; i++) {
  const slide = presentation.slides.getItem(i);
  const pngBlob = await presentation.export({ slide, format: 'png' });
  const bytes = Buffer.from(await pngBlob.arrayBuffer());
  await fs.writeFile(path.join(SCRATCH, 'previews', `slide-${String(i + 1).padStart(2, '0')}.png`), bytes);
}

console.log(JSON.stringify({ slides: presentation.slides.count, pptx: path.join(OUT, 'Instana-Config-Pilot-pitch-deck.pptx'), previews: path.join(SCRATCH, 'previews') }, null, 2));
