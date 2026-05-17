export const SENSOR_CATALOG = {
  host: {
    label: 'Host Agent', category: 'system', yamlKey: 'com.instana.plugin.host', env: [],
    defaults: { enabled: true },
    fields: [['enabled', 'Enabled', 'checkbox']],
    requiredFields: []
  },
  os: {
    label: 'Operating System', category: 'system', yamlKey: 'com.instana.plugin.os', env: [],
    defaults: { enabled: true, poll_rate: '30s' },
    fields: [['enabled', 'Enabled', 'checkbox'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: []
  },
  ibmmq: {
    label: 'IBM MQ', category: 'messaging', yamlKey: 'com.instana.plugin.ibmmq', env: ['IBMMQ_USERNAME', 'IBMMQ_PASSWORD', 'IBMMQ_KEYSTORE_PASSWORD'],
    defaults: {
      enabled: true,
      poll_rate: '60',
      enableStatisticsQueueMetrics: false,
      support_ha: false,
      aggregateChannelInstances: false,
      queueManagerName: '',
      host: '',
      port: '',
      channel: '',
      username: '${IBMMQ_USERNAME}',
      password: '${IBMMQ_PASSWORD}',
      tls_enabled: true,
      keystore: '',
      keystorePassword: '${IBMMQ_KEYSTORE_PASSWORD}',
      cipherSuite: ''
    },
    fields: [
      ['queueManagerName', 'Queue manager', 'text'],
      ['host', 'Host', 'text'],
      ['port', 'Port', 'text'],
      ['channel', 'Channel', 'text'],
      ['username', 'User env var', 'text'],
      ['password', 'Password env var', 'text'],
      ['tls_enabled', 'TLS', 'checkbox'],
      ['keystore', 'Keystore path', 'text'],
      ['keystorePassword', 'Keystore password env var', 'text'],
      ['cipherSuite', 'Cipher suite', 'text'],
      ['poll_rate', 'Poll rate', 'text'],
      ['support_ha', 'Support HA', 'checkbox']
    ],
    requiredFields: ['queueManagerName', 'host', 'port', 'channel']
  },
  ibmmqmft: {
    label: 'IBM MQ Managed File Transfer', category: 'messaging', yamlKey: 'com.instana.plugin.ibmmqmft', env: ['IBMMQMFT_USERNAME', 'IBMMQMFT_PASSWORD'],
    defaults: { enabled: true, instance: '', coordinationQueueManager: '', host: '', port: '', channel: '', username: '${IBMMQMFT_USERNAME}', password: '${IBMMQMFT_PASSWORD}', poll_rate: '10' },
    fields: [['instance', 'Instance', 'text'], ['coordinationQueueManager', 'Coordination queue manager', 'text'], ['host', 'Host', 'text'], ['port', 'Port', 'text'], ['channel', 'Channel', 'text'], ['username', 'User env var', 'text'], ['password', 'Password env var', 'text'], ['poll_rate', 'Poll rate', 'text']],
    requiredFields: ['instance', 'coordinationQueueManager', 'host', 'port', 'channel']
  },
  mq: {
    label: 'IBM MQ', category: 'messaging', yamlKey: 'com.instana.plugin.mq', env: ['MQ_USER', 'MQ_PASSWORD'],
    defaults: { name: '', host: '', port: '1414', channel: '', username: '${MQ_USER}', password: '${MQ_PASSWORD}', tls_enabled: true, poll_rate: '10s' },
    fields: [['name', 'Queue manager', 'text'], ['host', 'Host', 'text'], ['port', 'Port', 'text'], ['channel', 'Channel', 'text'], ['username', 'User env var', 'text'], ['password', 'Password env var', 'text'], ['tls_enabled', 'TLS', 'checkbox'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['name', 'host', 'port', 'channel']
  },
  httpd: {
    label: 'Apache HTTPD', category: 'web', yamlKey: 'com.instana.plugin.httpd', env: ['HTTPD_PASSWORD'],
    defaults: { enabled: true, statusUrl: 'http://localhost/server-status', username: '', password: '${HTTPD_PASSWORD}', poll_rate: '30s' },
    fields: [['statusUrl', 'Status URL', 'text'], ['username', 'User env var', 'text'], ['password', 'Password env var', 'text'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['statusUrl']
  },
  db2: {
    label: 'IBM DB2', category: 'database', yamlKey: 'com.instana.plugin.db2', env: ['DB2_USER', 'DB2_PASSWORD'],
    defaults: { enabled: true, instance: '', host: 'localhost', port: '50000', database: '', username: '${DB2_USER}', password: '${DB2_PASSWORD}', poll_rate: '30s' },
    fields: [['instance', 'Instance', 'text'], ['host', 'Host', 'text'], ['port', 'Port', 'text'], ['database', 'Database', 'text'], ['username', 'User env var', 'text'], ['password', 'Password env var', 'text'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['instance', 'host', 'port', 'database']
  },
  nginx: {
    label: 'NGINX', category: 'web', yamlKey: 'com.instana.plugin.nginx', env: [],
    defaults: { enabled: true, statusUrl: 'http://localhost/nginx_status', poll_rate: '30s' },
    fields: [['statusUrl', 'Status URL', 'text'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['statusUrl']
  },
  redis: {
    label: 'Redis', category: 'database', yamlKey: 'com.instana.plugin.redis', env: ['REDIS_PASSWORD'],
    defaults: { enabled: true, host: 'localhost', port: '6379', password: '${REDIS_PASSWORD}', poll_rate: '30s' },
    fields: [['host', 'Host', 'text'], ['port', 'Port', 'text'], ['password', 'Password env var', 'text'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['host', 'port']
  },
  postgresql: {
    label: 'PostgreSQL', category: 'database', yamlKey: 'com.instana.plugin.postgresql', env: ['POSTGRES_USER', 'POSTGRES_PASSWORD'],
    defaults: { enabled: true, host: 'localhost', port: '5432', database: '', username: '${POSTGRES_USER}', password: '${POSTGRES_PASSWORD}', poll_rate: '30s' },
    fields: [['host', 'Host', 'text'], ['port', 'Port', 'text'], ['database', 'Database', 'text'], ['username', 'User env var', 'text'], ['password', 'Password env var', 'text'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['host', 'port', 'database']
  },
  kafka: {
    label: 'Apache Kafka', category: 'messaging', yamlKey: 'com.instana.plugin.kafka', env: ['KAFKA_USER', 'KAFKA_PASSWORD'],
    defaults: { enabled: true, brokers: 'localhost:9092', username: '${KAFKA_USER}', password: '${KAFKA_PASSWORD}', poll_rate: '30s' },
    fields: [['brokers', 'Brokers', 'text'], ['username', 'User env var', 'text'], ['password', 'Password env var', 'text'], ['poll_rate', 'Poll rate', 'select']],
    requiredFields: ['brokers']
  }
};

export function createUnknownSensor({ type, yamlKey, rawName, blockText = '' }) {
  const dynamic = extractFieldsFromBlock(rawName, blockText);
  return {
    label: prettifyName(rawName),
    category: categorizeSensor(rawName),
    yamlKey,
    env: dynamic.env,
    defaults: dynamic.defaults,
    fields: dynamic.fields,
    requiredFields: dynamic.requiredFields
  };
}

export function sensorTypeFromRawName(rawName) {
  return String(rawName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

export function prettifyName(rawName) {
  const special = {
    ibmmq: 'IBM MQ', ibmmqmft: 'IBM MQ Managed File Transfer', httpd: 'Apache HTTPD', db2: 'IBM DB2', db2z: 'IBM DB2 z/OS', websphere: 'WebSphere', websphereliberty: 'WebSphere Liberty', iib: 'IBM Integration Bus', ace: 'App Connect Enterprise'
  };
  const key = String(rawName || '').toLowerCase();
  if (special[key]) return special[key];
  return key.split('.').map(part => part.replace(/[-_]/g, ' ')).join(' / ').replace(/\b\w/g, c => c.toUpperCase());
}

export function categorizeSensor(rawName) {
  const name = String(rawName || '').toLowerCase();
  if (/aws|azure|gcp|alicloud|ibmcloud/.test(name)) return 'cloud';
  if (/mq|kafka|rabbit|activemq|nats|sqs|sns|pubsub|servicebus|eventhub|rocketmq|tibcoems/.test(name)) return 'messaging';
  if (/db2|postgres|mysql|maria|oracle|sql|redis|mongo|cassandra|hbase|clickhouse|cockroach|couchbase|dynamodb|rds|elasticsearch|opensearch/.test(name)) return 'database';
  if (/nginx|httpd|apache|tomcat|weblogic|websphere|iis|haproxy|traefik|varnish|glassfish|jetty/.test(name)) return 'web';
  if (/docker|container|kubernetes|openshift|crio|containerd|host|os|linux|windows|vsphere|xen|vmware/.test(name)) return 'system';
  if (/vault|secret|security|cve|zabbix|prometheus|datadog|dynatrace|appdynamics/.test(name)) return 'observability';
  if (/action|github|gitlab|ansible|script|issue/.test(name)) return 'automation';
  return 'other';
}

function extractFieldsFromBlock(rawName, blockText) {
  const defaults = { enabled: true };
  const fields = [['enabled', 'Enabled', 'checkbox']];
  const requiredFields = [];
  const env = [];
  const seen = new Set(['enabled']);
  const lines = String(blockText || '').split(/\r?\n/);
  const fieldLines = lines
    .map((originalLine, index) => {
      const uncommented = uncommentTemplateLine(originalLine);
      const match = uncommented.match(/^(\s*)([A-Za-z_][A-Za-z0-9_.-]*)\s*:\s*([^#]*)/);
      if (!match) return null;
      const key = match[2].trim();
      if (!key || key.startsWith('com.instana.plugin.')) return null;
      return {
        index,
        originalLine,
        key,
        value: match[3],
        indent: match[1].length
      };
    })
    .filter(Boolean);
  const directIndent = Math.min(...fieldLines.map(line => line.indent).filter(indent => indent > 0));

  if (!Number.isFinite(directIndent)) {
    return { defaults, fields, env, requiredFields };
  }

  for (const fieldLine of fieldLines) {
    if (fieldLine.indent !== directIndent) continue;
    const key = fieldLine.key;
    if (!key || seen.has(key)) continue;
    if (key.length > 40) continue;
    const rawValue = cleanValue(fieldLine.value);
    if (isContainerField(fieldLine, fieldLines, rawValue)) continue;
    const fieldType = fieldTypeFor(key, rawValue);
    const envName = secretEnvName(rawName, key);
    seen.add(key);
    fields.push([key, labelFromKey(key), fieldType]);
    if (isRequiredFieldLine(fieldLine.originalLine)) requiredFields.push(key);
    if (envName) {
      env.push(envName);
      defaults[key] = '${' + envName + '}';
    } else {
      defaults[key] = rawValue;
    }
  }

  return { defaults, fields, env: Array.from(new Set(env)), requiredFields: Array.from(new Set(requiredFields)) };
}

function uncommentTemplateLine(line) {
  return String(line || '').replace(/^(\s*)#\s?/, '$1');
}

function isContainerField(fieldLine, fieldLines, value) {
  if (value !== '') return false;
  const nextSibling = fieldLines.find(line => line.index > fieldLine.index && line.indent <= fieldLine.indent);
  return fieldLines.some(line =>
    line.index > fieldLine.index &&
    line.indent > fieldLine.indent &&
    (!nextSibling || line.index < nextSibling.index)
  );
}

function isRequiredFieldLine(line) {
  const text = String(line || '').toLowerCase();
  if (!/(required field|\(required\)|\brequired\b)/.test(text)) return false;
  return !/(required only|not required|optional)/.test(text);
}

function cleanValue(value) {
  const cleaned = String(value || '').trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned || cleaned.startsWith('<') || cleaned === 'null') return '';
  if (cleaned === 'true') return true;
  if (cleaned === 'false') return false;
  return cleaned;
}

function fieldTypeFor(key, value) {
  const lower = String(key).toLowerCase();
  if (typeof value === 'boolean' || lower === 'enabled' || lower.startsWith('enable') || lower.includes('enabled')) return 'checkbox';
  if (lower === 'poll_rate' || lower === 'pollrate') return 'select';
  return 'text';
}

function secretEnvName(rawName, key) {
  const lower = String(key).toLowerCase();
  if (!/(password|token|secret|apikey|api_key|accesskey|access_key|username|user)/.test(lower)) return null;
  const prefix = String(rawName || 'INSTANA').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const suffix = String(key).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${prefix}_${suffix}`;
}

function labelFromKey(key) {
  return String(key).replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());
}
