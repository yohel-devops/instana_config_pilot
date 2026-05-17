import { SENSOR_CATALOG, createUnknownSensor, sensorTypeFromRawName, SensorCatalog, SensorMetadata } from './sensorCatalog';

const PLUGIN_LINE = /^\s*#?\s*(com\.instana\.plugin\.([A-Za-z0-9_.-]+))\s*:/;

export interface DetectedSensorsResult {
  detectedSensors: string[];
  catalog: SensorCatalog;
  pluginCount: number;
}

export interface PluginBlock {
  index: number;
  yamlKey: string;
  rawName: string;
  blockText: string;
}

export interface Tag {
  key: string;
  value: string;
  locked: boolean;
}

export function detectSensors(sourceYaml: string): DetectedSensorsResult {
  const text = sourceYaml || '';
  const blocks = extractPluginBlocks(text);
  const detected: string[] = [];
  const dynamicCatalog: SensorCatalog = { ...SENSOR_CATALOG };

  for (const block of blocks) {
    const type = sensorTypeFromRawName(block.rawName);
    const known = dynamicCatalog[type];
    const sensorParams = { type, yamlKey: block.yamlKey, rawName: block.rawName, blockText: block.blockText };
    if (!known) {
      dynamicCatalog[type] = createUnknownSensor(sensorParams);
    } else {
      dynamicCatalog[type] = mergeTemplateSensor(known, createUnknownSensor(sensorParams), block.yamlKey);
    }
    if (!detected.includes(type)) detected.push(type);
  }

  if (!detected.length) {
    return { detectedSensors: Object.keys(SENSOR_CATALOG), catalog: dynamicCatalog, pluginCount: 0 };
  }

  return { detectedSensors: detected.sort(), catalog: dynamicCatalog, pluginCount: detected.length };
}

function mergeTemplateSensor(known: SensorMetadata, dynamic: SensorMetadata, yamlKey: string): SensorMetadata {
  return {
    ...known,
    yamlKey,
    env: unique([...(known.env || []), ...(dynamic.env || [])]),
    defaults: { ...(dynamic.defaults || {}), ...(known.defaults || {}) },
    fields: mergeFields(known.fields || [], dynamic.fields || []),
    requiredFields: unique([...(known.requiredFields || []), ...(dynamic.requiredFields || [])])
  };
}

function mergeFields(primaryFields: [string, string, string][], templateFields: [string, string, string][]): [string, string, string][] {
  const merged: [string, string, string][] = [];
  const seen = new Set<string>();

  for (const field of [...primaryFields, ...templateFields]) {
    const key = field?.[0];
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(field);
  }

  return merged;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function extractPluginBlocks(sourceYaml: string): PluginBlock[] {
  const lines = String(sourceYaml || '').split(/\r?\n/);
  const starts: Array<{ index: number; yamlKey: string; rawName: string }> = [];

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

export function detectTags(sourceYaml: string): Tag[] {
  const tags: Tag[] = [];
  const lines = String(sourceYaml || '').split(/\r?\n/);
  for (const line of lines) {
    const cleaned = line.trim().replace(/^#\s?/, '').replace(/["']/g, '');
    const match = cleaned.match(/^-\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)$/);
    if (match) {
      tags.push({
        key: match[1],
        value: match[2],
        locked: ['client', 'environment', 'zone', 'owner'].includes(match[1])
      });
    }
  }
  return tags;
}

// Made with Bob
