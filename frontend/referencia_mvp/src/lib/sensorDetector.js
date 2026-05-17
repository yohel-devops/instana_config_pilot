import { SENSOR_CATALOG, createUnknownSensor, sensorTypeFromRawName } from './sensorCatalog.js';

const PLUGIN_LINE = /^\s*#?\s*(com\.instana\.plugin\.([A-Za-z0-9_.-]+))\s*:/;

export function detectSensors(sourceYaml) {
  const text = sourceYaml || '';
  const blocks = extractPluginBlocks(text);
  const detected = [];
  const dynamicCatalog = { ...SENSOR_CATALOG };

  for (const block of blocks) {
    const type = sensorTypeFromRawName(block.rawName);
    const known = dynamicCatalog[type];
    if (!known) {
      dynamicCatalog[type] = createUnknownSensor(block);
    } else {
      dynamicCatalog[type] = mergeTemplateSensor(known, createUnknownSensor(block), block.yamlKey);
    }
    if (!detected.includes(type)) detected.push(type);
  }

  if (!detected.length) {
    return { detectedSensors: Object.keys(SENSOR_CATALOG), catalog: dynamicCatalog, pluginCount: 0 };
  }

  return { detectedSensors: detected.sort(), catalog: dynamicCatalog, pluginCount: detected.length };
}

function mergeTemplateSensor(known, dynamic, yamlKey) {
  return {
    ...known,
    yamlKey,
    env: unique([...(known.env || []), ...(dynamic.env || [])]),
    defaults: { ...(dynamic.defaults || {}), ...(known.defaults || {}) },
    fields: mergeFields(known.fields || [], dynamic.fields || []),
    requiredFields: unique([...(known.requiredFields || []), ...(dynamic.requiredFields || [])])
  };
}

function mergeFields(primaryFields, templateFields) {
  const merged = [];
  const seen = new Set();

  for (const field of [...primaryFields, ...templateFields]) {
    const key = field?.[0];
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(field);
  }

  return merged;
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function extractPluginBlocks(sourceYaml) {
  const lines = String(sourceYaml || '').split(/\r?\n/);
  const starts = [];

  lines.forEach((line, index) => {
    const match = line.match(PLUGIN_LINE);
    if (match) starts.push({ index, yamlKey: match[1], rawName: match[2].toLowerCase() });
  });

  return starts.map((start, i) => {
    const end = starts[i + 1]?.index ?? lines.length;
    return {
      ...start,
      blockText: lines.slice(start.index, end).join('\n')
    };
  });
}

export function detectTags(sourceYaml) {
  const tags = [];
  const lines = String(sourceYaml || '').split(/\r?\n/);
  for (const line of lines) {
    const cleaned = line.trim().replace(/^#\s?/, '').replace(/["']/g, '');
    const match = cleaned.match(/^-\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)$/);
    if (match) tags.push({ key: match[1], value: match[2], locked: ['client', 'environment', 'zone', 'owner'].includes(match[1]) });
  }
  return tags;
}
