import { ActiveSensor } from './yamlGenerator';
import { Tag } from './sensorDetector';
import { SensorCatalog } from './sensorCatalog';

const ENV_PREFIX = '${';

export interface ValidationIssue {
  type: 'ok' | 'error' | 'warning' | 'security';
  title: string;
  detail: string;
}

export interface ValidateConfigParams {
  tags: Tag[];
  activeSensors: ActiveSensor[];
  catalog: SensorCatalog;
}

export function validateConfig({ tags, activeSensors, catalog = {} }: ValidateConfigParams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const getTag = (key: string) => tags.find(t => t.key === key)?.value || '';

  if (!getTag('client').trim()) issues.push(issue('error', 'Missing client tag', 'The generated YAML should include client=<value>.'));
  if (!getTag('zone').trim()) issues.push(issue('error', 'Missing zone tag', 'The generated YAML should include zone=<value>.'));
  if (!getTag('owner').trim()) issues.push(issue('warning', 'Missing owner tag', 'Owner is recommended for operational routing.'));

  activeSensors.forEach(sensor => {
    const config = sensor.config || {};
    const requiredFields = catalog[sensor.type]?.requiredFields || [];
    const handledRequired = new Set<string>();

    if (sensor.type === 'ibmmq' || sensor.type === 'mq') {
      const qmName = config.queueManagerName || config.name;
      if (!String(qmName || '').trim()) issues.push(issue('error', 'MQ missing queue manager', 'MQ requires a queue manager name.'));
      if (!String(config.host || '').trim()) issues.push(issue('error', 'MQ missing host', 'MQ requires a host for remote monitoring.'));
      if (!String(config.port || '').trim()) issues.push(issue('error', 'MQ missing port', 'MQ requires a remote administration port for remote monitoring.'));
      if (!String(config.channel || '').trim()) issues.push(issue('error', 'MQ missing channel', 'MQ requires a channel.'));
      if (config.tls_enabled === false) issues.push(issue('security', 'MQ TLS disabled', 'TLS should be enabled for production MQ monitoring.'));
      ['queueManagerName', 'name', 'host', 'port', 'channel'].forEach(key => handledRequired.add(key));
    }

    if (sensor.type === 'db2') {
      if (!String(config.instance || '').trim()) issues.push(issue('error', 'DB2 missing instance', 'DB2 requires an instance name.'));
      if (!String(config.host || '').trim()) issues.push(issue('error', 'DB2 missing host', 'DB2 requires a host.'));
      if (!String(config.port || '').trim()) issues.push(issue('error', 'DB2 missing port', 'DB2 requires a port.'));
      if (!String(config.database || '').trim()) issues.push(issue('error', 'DB2 missing database', 'DB2 requires a database.'));
      ['instance', 'host', 'port', 'database'].forEach(key => handledRequired.add(key));
    }

    requiredFields.forEach(key => {
      if (handledRequired.has(key)) return;
      if (!String(config[key] || '').trim()) {
        issues.push(issue('error', `${catalog[sensor.type]?.label || sensor.type} missing ${key}`, `${key} is marked as required for this sensor.`));
      }
    });

    Object.entries(config).forEach(([key, value]) => {
      const lower = key.toLowerCase();
      const secretLike = lower.includes('password') || lower.includes('token') || lower.includes('secret') || lower.includes('apikey') || lower.includes('api_key');
      const text = String(value || '').trim();
      if (secretLike && text && !text.startsWith(ENV_PREFIX)) {
        issues.push(issue('security', 'Hardcoded secret', `${key} should use \${VARIABLE_ENV} instead of plain text.`));
      }
    });
  });

  if (!issues.length) issues.push(issue('ok', 'Ready', 'No blocking findings detected.'));
  return issues;
}

export function validateUploadedYaml(text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!text) return [issue('warning', 'File missing', 'Upload a YAML file to compare.')];
  if (!text.includes(':')) issues.push(issue('error', 'YAML may be invalid', 'No key/value separator found.'));
  if (text.includes('\t')) issues.push(issue('warning', 'Tabs detected', 'YAML should use spaces for indentation.'));
  if (!/com\.instana\.plugin\./.test(text)) issues.push(issue('warning', 'No Instana plugin blocks detected', 'The file does not appear to include com.instana.plugin.* blocks.'));
  if (!issues.length) issues.push(issue('ok', 'YAML candidate ready', 'The uploaded file can be compared visually.'));
  return issues;
}

function issue(type: ValidationIssue['type'], title: string, detail: string): ValidationIssue {
  return { type, title, detail };
}

// Made with Bob
