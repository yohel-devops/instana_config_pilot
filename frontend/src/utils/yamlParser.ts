import type { Sensor, ParsedConfiguration } from '../types/instana';

export function parseYAMLToConfig(yamlContent: string): ParsedConfiguration {
  const sensors: Sensor[] = [];
  let sensorId = 0;

  // Split by lines
  const lines = yamlContent.split('\n');
  
  let currentSensor: Partial<Sensor> | null = null;
  let currentIndent = 0;
  let inSensorBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;

    // Remove leading # for commented lines
    const cleanLine = trimmed.startsWith('#') ? trimmed.substring(1).trim() : trimmed;
    
    // Skip pure comments (lines that are just comments without config)
    if (trimmed.startsWith('#') && !cleanLine.includes('com.instana.plugin')) continue;

    // Detect sensor block start (com.instana.plugin.*)
    if (cleanLine.startsWith('com.instana.plugin.')) {
      // Save previous sensor if exists
      if (currentSensor && currentSensor.key) {
        const sensorName = currentSensor.name || formatSensorName(currentSensor.key);
        const finalSensor = {
          id: `sensor-${sensorId++}`,
          name: sensorName,
          key: currentSensor.key,
          display_name: sensorName,
          category: getCategoryFromKey(currentSensor.key),
          enabled: currentSensor.enabled ?? false,
          config: currentSensor.configuration || {},
          configuration: currentSensor.configuration || {},
          requires_credentials: (currentSensor.credentials?.length || 0) > 0,
          credentials: currentSensor.credentials || [],
          env_variables: currentSensor.credentials?.map(c => c.env_var) || [],
        };
        
        // Add default configuration fields if none were found
        if (Object.keys(finalSensor.configuration).length === 0) {
          finalSensor.configuration = getDefaultConfigForSensor(currentSensor.key);
          finalSensor.config = finalSensor.configuration;
        }
        
        // Add default credentials if none were found
        if (finalSensor.credentials.length === 0) {
          finalSensor.credentials = getDefaultCredentialsForSensor(currentSensor.key);
          finalSensor.requires_credentials = finalSensor.credentials.length > 0;
          finalSensor.env_variables = finalSensor.credentials.map(c => c.env_var);
        }
        
        sensors.push(finalSensor);
      }

      // Start new sensor
      const sensorKey = cleanLine.replace(':', '');
      currentSensor = {
        key: sensorKey,
        name: formatSensorName(sensorKey),
        enabled: false,
        configuration: {},
        credentials: [],
      };
      inSensorBlock = true;
      currentIndent = line.search(/\S/);
      continue;
    }

    // Parse sensor properties
    if (inSensorBlock && currentSensor) {
      const lineIndent = line.search(/\S/);
      
      // Check if we're still in the same sensor block
      if (lineIndent <= currentIndent && cleanLine.startsWith('com.instana.plugin.')) {
        // New sensor starting, save current and start new
        if (currentSensor.key) {
          const sensorName = currentSensor.name || formatSensorName(currentSensor.key);
          const finalSensor = {
            id: `sensor-${sensorId++}`,
            name: sensorName,
            key: currentSensor.key,
            display_name: sensorName,
            category: getCategoryFromKey(currentSensor.key),
            enabled: currentSensor.enabled ?? false,
            config: currentSensor.configuration || {},
            configuration: currentSensor.configuration || {},
            requires_credentials: (currentSensor.credentials?.length || 0) > 0,
            credentials: currentSensor.credentials || [],
            env_variables: currentSensor.credentials?.map(c => c.env_var) || [],
          };
          
          // Add default configuration fields if none were found
          if (Object.keys(finalSensor.configuration).length === 0) {
            finalSensor.configuration = getDefaultConfigForSensor(currentSensor.key);
            finalSensor.config = finalSensor.configuration;
          }
          
          // Add default credentials if none were found
          if (finalSensor.credentials.length === 0) {
            finalSensor.credentials = getDefaultCredentialsForSensor(currentSensor.key);
            finalSensor.requires_credentials = finalSensor.credentials.length > 0;
            finalSensor.env_variables = finalSensor.credentials.map(c => c.env_var);
          }
          
          sensors.push(finalSensor);
        }
        
        const sensorKey = cleanLine.replace(':', '');
        currentSensor = {
          key: sensorKey,
          name: formatSensorName(sensorKey),
          enabled: false,
          configuration: {},
          credentials: [],
        };
        currentIndent = lineIndent;
        continue;
      }

      // Parse key-value pairs
      if (cleanLine.includes(':')) {
        const colonIndex = cleanLine.indexOf(':');
        const key = cleanLine.substring(0, colonIndex).trim();
        const value = cleanLine.substring(colonIndex + 1).trim();
        
        // Skip array indicators and nested structures
        if (key === '-' || !key || key.startsWith('#')) continue;
        
        if (key === 'enabled') {
          currentSensor.enabled = value === 'true';
        } else if (isCredentialField(key)) {
          // Add to credentials
          if (!currentSensor.credentials) currentSensor.credentials = [];
          // Check if already exists
          const exists = currentSensor.credentials.some(c => c.field === key);
          if (!exists) {
            currentSensor.credentials.push({
              field: key,
              env_var: `INSTANA_${key.toUpperCase()}`,
              value: value || '',
              required: isRequiredField(key),
            });
          }
        } else if (isCommonConfigField(key)) {
          // Add to configuration
          if (!currentSensor.configuration) currentSensor.configuration = {};
          // Only add if not already present (avoid duplicates from nested structures)
          if (!currentSensor.configuration[key]) {
            currentSensor.configuration[key] = value || '';
          }
        }
      }
    }
  }

  // Save last sensor
  if (currentSensor && currentSensor.key) {
    const sensorName = currentSensor.name || formatSensorName(currentSensor.key);
    const finalSensor = {
      id: `sensor-${sensorId++}`,
      name: sensorName,
      key: currentSensor.key,
      display_name: sensorName,
      category: getCategoryFromKey(currentSensor.key),
      enabled: currentSensor.enabled ?? false,
      config: currentSensor.configuration || {},
      configuration: currentSensor.configuration || {},
      requires_credentials: (currentSensor.credentials?.length || 0) > 0,
      credentials: currentSensor.credentials || [],
      env_variables: currentSensor.credentials?.map(c => c.env_var) || [],
    };
    
    // Add default configuration fields if none were found
    if (Object.keys(finalSensor.configuration).length === 0) {
      finalSensor.configuration = getDefaultConfigForSensor(currentSensor.key);
      finalSensor.config = finalSensor.configuration;
    }
    
    // Add default credentials if none were found
    if (finalSensor.credentials.length === 0) {
      finalSensor.credentials = getDefaultCredentialsForSensor(currentSensor.key);
      finalSensor.requires_credentials = finalSensor.credentials.length > 0;
      finalSensor.env_variables = finalSensor.credentials.map(c => c.env_var);
    }
    
    sensors.push(finalSensor);
  }

  // Calculate categories
  const categories: Record<string, number> = {};
  sensors.forEach(sensor => {
    categories[sensor.category] = (categories[sensor.category] || 0) + 1;
  });

  return {
    sensors,
    total_sensors: sensors.length,
    enabled_sensors: sensors.filter(s => s.enabled).length,
    categories,
    has_vault_integration: yamlContent.includes('com.instana.configuration.integration.vault'),
    source_file: 'configuration.yaml',
  };
}

function formatSensorName(key: string): string {
  const parts = key.split('.');
  const name = parts[parts.length - 1] || key;
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCategoryFromKey(key: string): string {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('aws')) return 'AWS';
  if (lowerKey.includes('azure')) return 'Azure';
  if (lowerKey.includes('gcp') || lowerKey.includes('google')) return 'GCP';
  if (lowerKey.includes('ibm')) return 'IBM Cloud';
  if (lowerKey.includes('database') || lowerKey.includes('mysql') || lowerKey.includes('postgres') || lowerKey.includes('mongodb') || lowerKey.includes('rds')) {
    return 'Database';
  }
  if (lowerKey.includes('messaging') || lowerKey.includes('kafka') || lowerKey.includes('rabbitmq') || lowerKey.includes('activemq') || lowerKey.includes('mq') || lowerKey.includes('sqs') || lowerKey.includes('sns')) {
    return 'Messaging';
  }
  if (lowerKey.includes('web') || lowerKey.includes('http') || lowerKey.includes('nginx') || lowerKey.includes('apache')) {
    return 'Web Server';
  }
  if (lowerKey.includes('cache') || lowerKey.includes('redis') || lowerKey.includes('memcached')) {
    return 'Cache';
  }
  if (lowerKey.includes('container') || lowerKey.includes('docker') || lowerKey.includes('kubernetes')) {
    return 'Container';
  }
  if (lowerKey.includes('host') || lowerKey.includes('hardware')) {
    return 'Infrastructure';
  }
  return 'Other';
}

function isCredentialField(field: string): boolean {
  const credentialFields = ['password', 'token', 'api_key', 'apikey', 'secret', 'user', 'username', 'access_key', 'secret_key'];
  return credentialFields.some(cf => field.toLowerCase().includes(cf));
}

function isRequiredField(field: string): boolean {
  const requiredFields = ['password', 'token', 'api_key', 'apikey'];
  return requiredFields.some(rf => field.toLowerCase().includes(rf));
}

function isCommonConfigField(field: string): boolean {
  const configFields = [
    'host', 'port', 'instance', 'database', 'databases',
    'poll_rate', 'poll_interval', 'channel', 'queue_manager',
    'url', 'endpoint', 'region', 'namespace',
    'tabschema', 'availabilityZone', 'accessTokenType',
    'sslTrustStorePassword', 'sslTrustStoreLocation',
    'cloudwatch_period', 'include_tags', 'exclude_tags',
    'include_untagged', 'tags', 'enabled'
  ];
  return configFields.some(cf => field.toLowerCase() === cf.toLowerCase());
}

function getDefaultConfigForSensor(sensorKey: string): Record<string, any> {
  const lowerKey = sensorKey.toLowerCase();
  
  // Database sensors
  if (lowerKey.includes('db2') || lowerKey.includes('mysql') || lowerKey.includes('postgres') ||
      lowerKey.includes('oracle') || lowerKey.includes('mongodb') || lowerKey.includes('cassandra')) {
    return {
      host: 'localhost',
      port: '5432',
      database: 'mydb',
      poll_rate: '60',
    };
  }
  
  // Messaging sensors
  if (lowerKey.includes('kafka') || lowerKey.includes('rabbitmq') || lowerKey.includes('activemq') ||
      lowerKey.includes('ibmmq') || lowerKey.includes('.mq')) {
    return {
      host: 'localhost',
      port: '1414',
      channel: 'SYSTEM.DEF.SVRCONN',
      queue_manager: 'QM1',
      poll_rate: '60',
    };
  }
  
  // Web servers
  if (lowerKey.includes('nginx') || lowerKey.includes('apache') || lowerKey.includes('httpd')) {
    return {
      url: 'http://localhost/status',
      poll_rate: '60',
    };
  }
  
  // AWS services
  if (lowerKey.includes('aws')) {
    return {
      region: 'us-east-1',
      cloudwatch_period: '60',
      include_untagged: 'true',
    };
  }
  
  // Default configuration
  return {
    poll_rate: '60',
    enabled: 'true',
  };
}

function getDefaultCredentialsForSensor(sensorKey: string): Array<{field: string, env_var: string, value: string, required: boolean}> {
  const lowerKey = sensorKey.toLowerCase();
  
  // Database sensors need user/password
  if (lowerKey.includes('db2') || lowerKey.includes('mysql') || lowerKey.includes('postgres') ||
      lowerKey.includes('oracle') || lowerKey.includes('mongodb') || lowerKey.includes('cassandra')) {
    return [
      { field: 'user', env_var: 'INSTANA_DB_USER', value: '', required: true },
      { field: 'password', env_var: 'INSTANA_DB_PASSWORD', value: '', required: true },
    ];
  }
  
  // Messaging sensors need user/password
  if (lowerKey.includes('kafka') || lowerKey.includes('rabbitmq') || lowerKey.includes('activemq') ||
      lowerKey.includes('ibmmq') || lowerKey.includes('.mq')) {
    return [
      { field: 'user', env_var: 'INSTANA_MQ_USER', value: '', required: false },
      { field: 'password', env_var: 'INSTANA_MQ_PASSWORD', value: '', required: false },
    ];
  }
  
  // AWS services need access keys
  if (lowerKey.includes('aws')) {
    return [
      { field: 'access_key_id', env_var: 'AWS_ACCESS_KEY_ID', value: '', required: true },
      { field: 'secret_access_key', env_var: 'AWS_SECRET_ACCESS_KEY', value: '', required: true },
    ];
  }
  
  return [];
}

// Made with Bob
