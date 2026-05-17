const path = require('path');
const pptxgen = require('pptxgenjs');

const root = path.resolve(__dirname, '..', '..');
const assets = path.join(root, 'docs', 'demo-assets');
const out = path.join(root, 'docs', 'presentation', 'Instana-Config-Pilot-pitch-deck.pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Yohel';
pptx.company = 'IBM Bob Hackathon';
pptx.subject = 'Instana Config Pilot pitch deck';
pptx.title = 'Instana Config Pilot';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
};

const W = 13.333;
const H = 7.5;
const C = {
  ink: '101828',
  muted: '475467',
  paper: 'F8FAFC',
  white: 'FFFFFF',
  blue: '0F62FE',
  cyan: '08BDBA',
  purple: '6F4CFF',
  green: '24A148',
  amber: 'F1C21B',
  red: 'DA1E28',
  navy: '071426',
  border: 'D0D5DD',
  panel: 'FFFFFF',
};

function addBg(slide, color = C.paper) {
  slide.background = { color };
}

function title(slide, value, x, y, w, color = C.ink) {
  slide.addText(value, {
    x, y, w, h: 0.55,
    margin: 0,
    fontFace: 'Aptos Display',
    fontSize: 28,
    bold: true,
    color,
    breakLine: false,
    fit: 'shrink',
  });
}

function subtitle(slide, value, x, y, w, color = C.muted) {
  slide.addText(value, {
    x, y, w, h: 0.32,
    margin: 0,
    fontFace: 'Aptos',
    fontSize: 12.5,
    color,
    fit: 'shrink',
  });
}

function foot(slide, n, dark = false) {
  const color = dark ? 'AAB6D3' : '667085';
  slide.addText('Instana Config Pilot | IBM Bob Hackathon', {
    x: 0.65, y: 7.05, w: 3.2, h: 0.18,
    margin: 0,
    fontSize: 6.5,
    color,
  });
  slide.addText(String(n).padStart(2, '0'), {
    x: 12.65, y: 7.05, w: 0.25, h: 0.18,
    margin: 0,
    align: 'right',
    fontSize: 6.5,
    bold: true,
    color,
  });
}

function pill(slide, value, x, y, w, color = C.blue) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34,
    rectRadius: 0.08,
    fill: { color },
    line: { color, transparency: 100 },
  });
  slide.addText(value, {
    x, y: y + 0.08, w, h: 0.16,
    margin: 0,
    align: 'center',
    fontSize: 6.5,
    bold: true,
    color: C.white,
    fit: 'shrink',
  });
}

function bullet(slide, value, x, y, w, color = C.blue, textColor = C.ink) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y: y + 0.08, w: 0.06, h: 0.06,
    fill: { color },
    line: { color, transparency: 100 },
  });
  slide.addText(value, {
    x: x + 0.14, y, w, h: 0.24,
    margin: 0,
    fontSize: 8.5,
    color: textColor,
    fit: 'shrink',
  });
}

function screenshot(slide, file, x, y, w, h) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.border, width: 0.5 },
  });
  slide.addImage({
    path: path.join(assets, file),
    x: x + 0.07,
    y: y + 0.07,
    w: w - 0.14,
    h: h - 0.14,
    sizing: { type: 'contain', x: x + 0.07, y: y + 0.07, w: w - 0.14, h: h - 0.14 },
  });
}

function shell(n, t, st, dark = false) {
  const slide = pptx.addSlide();
  addBg(slide, dark ? C.navy : C.paper);
  title(slide, t, 0.65, 0.62, 10.6, dark ? C.white : C.ink);
  if (st) subtitle(slide, st, 0.65, 1.52, 9.2, dark ? 'C7D7FE' : C.muted);
  foot(slide, n, dark);
  return slide;
}

// 1
{
  const s = pptx.addSlide();
  addBg(s, C.navy);
  pill(s, 'IBM Bob Hackathon', 0.7, 0.55, 1.6, C.blue);
  s.addText('Instana\nConfig\nPilot', {
    x: 0.7, y: 1.1, w: 4.5, h: 1.85,
    margin: 0,
    fontFace: 'Aptos Display',
    fontSize: 34,
    bold: true,
    color: C.white,
    breakLine: false,
    fit: 'shrink',
  });
  s.addText('Generate, validate, compare, and export IBM Instana configuration YAML from a guided browser workflow.', {
    x: 0.7, y: 3.05, w: 4.55, h: 0.7,
    margin: 0,
    fontSize: 12.5,
    color: 'D4E3FF',
    fit: 'shrink',
  });
  s.addShape(pptx.ShapeType.line, {
    x: 0.7, y: 4.03, w: 1.55, h: 0,
    line: { color: C.cyan, width: 3 },
  });
  s.addText('Frontend-first delivery built with IBM Bob', {
    x: 0.7, y: 4.28, w: 4.4, h: 0.3,
    margin: 0,
    fontSize: 10.5,
    bold: true,
    color: 'A7F3D0',
  });
  screenshot(s, 'app-home.png', 5.55, 0.72, 6.95, 4.95);
  s.addText('Browser-based workflow: template -> sensors -> validation -> export', {
    x: 5.55, y: 5.85, w: 6.7, h: 0.25,
    margin: 0,
    fontSize: 8.5,
    color: 'C7D7FE',
  });
}

// 2
{
  const s = shell(2, 'Manual Instana YAML editing is fragile', 'Large configuration files create operational risk before changes ever reach a real environment.');
  const cards = [
    ['01', C.red, 'Syntax and indentation errors', 'A single spacing mistake can break an otherwise valid sensor configuration.'],
    ['02', C.amber, 'Incomplete sensor fields', 'Different servers and environments need different sensors, credentials, tags, and tuning values.'],
    ['03', C.blue, 'Hard-to-review changes', 'Teams need to understand exactly what changed before applying configuration.'],
  ];
  cards.forEach((c, i) => {
    const x = 0.65 + i * 4.1;
    s.addText(c[0], { x, y: 3.35, w: 0.5, h: 0.24, margin: 0, fontSize: 10, bold: true, color: c[1] });
    s.addText(c[2], { x, y: 3.72, w: 3.55, h: 0.7, margin: 0, fontSize: 18, bold: true, color: C.ink, fit: 'shrink' });
    s.addText(c[3], { x, y: 4.58, w: 3.55, h: 0.45, margin: 0, fontSize: 10, color: C.muted, fit: 'shrink' });
  });
}

// 3
{
  const s = shell(3, 'A guided workflow from template to usable YAML', 'Instana Config Pilot turns configuration work into a repeatable browser flow.');
  const steps = [
    ['Load template', C.blue], ['Detect sensors', C.purple], ['Configure fields', C.cyan], ['Validate risks', C.green], ['Export files', C.ink],
  ];
  steps.forEach((step, i) => pill(s, step[0], 0.75 + i * 2.45, 2.63, 1.65, step[1]));
  [
    'Detects com.instana.plugin.* blocks from Instana-style YAML',
    'Builds a dynamic sensor catalog with known and unknown sensors',
    'Generates configuration.yaml without hand-editing indentation',
  ].forEach((b, i) => bullet(s, b, 0.75, 3.35 + i * 0.38, 5.2));
  [
    'Generates .env.example placeholders for credentials',
    'Flags missing required values and hardcoded-secret risks',
    'Compares generated YAML against another file before review',
  ].forEach((b, i) => bullet(s, b, 6.85, 3.35 + i * 0.38, 5.2, C.green));
}

// 4
{
  const s = shell(4, 'The demo starts with a real Instana-style template', 'The frontend loads the template, discovers sensor blocks, and exposes the workflow in one screen.');
  screenshot(s, 'app-home.png', 1.2, 2.12, 10.9, 4.15);
}

// 5
{
  const s = shell(5, 'Sensor catalog: searchable, filterable, configurable', 'Known sensors get curated fields; unknown plugin blocks are still preserved through dynamic metadata.');
  screenshot(s, 'sensor-catalog.png', 0.72, 2.0, 7.35, 4.55);
  s.addText('What the user gets', { x: 8.35, y: 2.55, w: 3.4, h: 0.35, margin: 0, fontSize: 15, bold: true, color: C.ink });
  ['Search and category filters', 'One-click sensor enablement', 'Required-field guidance', 'IBM MQ demo values for fast walkthrough'].forEach((b, i) => bullet(s, b, 8.35, 3.12 + i * 0.42, 3.5));
}

// 6
{
  const s = shell(6, 'Generated outputs separate configuration from secrets', 'configuration.yaml carries structure; .env.example carries placeholders for sensitive values.');
  s.addText('configuration.yaml', { x: 0.75, y: 2.16, w: 4.5, h: 0.26, margin: 0, fontSize: 12.5, bold: true, color: C.ink });
  s.addText('.env.example', { x: 6.85, y: 2.16, w: 4.5, h: 0.26, margin: 0, fontSize: 12.5, bold: true, color: C.ink });
  screenshot(s, 'generated-yaml.png', 0.75, 2.55, 5.75, 3.8);
  screenshot(s, 'generated-env.png', 6.85, 2.55, 5.75, 3.8);
}

// 7
{
  const s = shell(7, 'Compare mode makes configuration review visible', 'Before applying changes, teams can compare generated YAML against another candidate file.');
  screenshot(s, 'compare-mode.png', 0.72, 2.05, 7.35, 4.48);
  s.addText('Review before apply', { x: 8.35, y: 2.75, w: 3.4, h: 0.35, margin: 0, fontSize: 15, bold: true, color: C.ink });
  ['Visual line-by-line diff', 'Candidate YAML validation', 'Clear A/B comparison for operators'].forEach((b, i) => bullet(s, b, 8.35, 3.32 + i * 0.42, 3.4));
}

// 8
{
  const s = shell(8, 'IBM Bob was the development partner', 'Bob helped move from idea to architecture, implementation, refactor, and final documentation.', true);
  s.addText('Bob IDE usage', { x: 0.75, y: 2.3, w: 4.5, h: 0.35, margin: 0, fontSize: 18, bold: true, color: C.white });
  ['Architecture exploration and planning', 'Frontend implementation and TypeScript refactor', 'Documentation, runbook, and submission prep', 'Task evidence exported to bob_sessions/'].forEach((b, i) => bullet(s, b, 0.75, 2.9 + i * 0.42, 4.9, C.cyan, 'D4E3FF'));
  s.addText('Hackathon pivot', { x: 6.75, y: 2.3, w: 4.5, h: 0.35, margin: 0, fontSize: 18, bold: true, color: C.white });
  s.addText('The original plan included web + API + MCP. When BobCoins became a practical constraint, the team pivoted to a frontend-first MVP that preserved the core product value.', {
    x: 6.75, y: 2.9, w: 4.9, h: 0.92,
    margin: 0,
    fontSize: 12,
    color: 'D4E3FF',
    fit: 'shrink',
  });
  s.addShape(pptx.ShapeType.line, { x: 6.75, y: 4.15, w: 1.7, h: 0, line: { color: C.green, width: 3 } });
  s.addText('A working demo beat a broader unfinished architecture.', {
    x: 6.75, y: 4.38, w: 4.9, h: 0.32,
    margin: 0,
    fontSize: 12,
    bold: true,
    color: 'A7F3D0',
  });
}

// 9
{
  const s = shell(9, 'Final architecture: browser-first and static deployable', 'The functional delivery removes API dependency and keeps the Instana workflow local to the frontend.');
  pill(s, 'React + TypeScript + Vite', 0.75, 3.05, 2.2, C.blue);
  s.addText('Client-side engines', { x: 0.75, y: 3.55, w: 4.8, h: 0.45, margin: 0, fontSize: 22, bold: true, color: C.ink });
  s.addText('sensorDetector -> sensorCatalog -> validator -> yamlGenerator -> envGenerator -> diffEngine', {
    x: 0.75, y: 4.15, w: 5.0, h: 0.6,
    margin: 0,
    fontSize: 12.5,
    color: C.muted,
    fit: 'shrink',
  });
  s.addText('Delivery scope', { x: 7.0, y: 2.7, w: 3.8, h: 0.35, margin: 0, fontSize: 15, bold: true, color: C.ink });
  ['Static frontend served by Nginx', 'Backend remains as reference/prototype code', 'No production secrets or client data required', 'Future MCP/API path remains possible after MVP'].forEach((b, i) => bullet(s, b, 7.0, 3.25 + i * 0.42, 4.4));
}

// 10
{
  const s = shell(10, 'Impact: safer configuration, faster review', 'A focused proof of concept for teams that manage Instana agent configuration.');
  s.addText('What changes', { x: 2.0, y: 2.65, w: 3.8, h: 0.4, margin: 0, fontSize: 18, bold: true, color: C.ink });
  ['Less manual YAML editing', 'More consistent operational tags', 'Secrets pushed toward environment variables', 'Diffs visible before config reaches a server'].forEach((b, i) => bullet(s, b, 2.0, 3.25 + i * 0.42, 4.25));
  s.addText('Next steps', { x: 7.4, y: 2.65, w: 3.8, h: 0.4, margin: 0, fontSize: 18, bold: true, color: C.ink });
  ['Add unit tests for frontend engines', 'Improve nested YAML rendering for more sensors', 'Add frontend-only ZIP bundle export', 'Revisit API/MCP integration after MVP'].forEach((b, i) => bullet(s, b, 7.4, 3.25 + i * 0.42, 4.25, C.purple));
}

pptx.writeFile({ fileName: out });
