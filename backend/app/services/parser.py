"""YAML Parser for Instana configuration files"""
import yaml
import re
from typing import Dict, List, Any, Optional
from app.models.sensor import Sensor, ParsedConfiguration, SensorCategory


class YAMLParser:
    """Parse Instana configuration.yaml files"""

    SENSOR_PATTERN = re.compile(r'^com\.instana\.(plugin|configuration)\.[\w.]+$')

    # Category mapping patterns
    CATEGORY_PATTERNS = {
        SensorCategory.CLOUD_AWS: ['aws'],
        SensorCategory.CLOUD_AZURE: ['azure'],
        SensorCategory.CLOUD_GCP: ['gcp'],
        SensorCategory.CLOUD_IBM: ['ibmcloud', 'ibm'],
        SensorCategory.CLOUD_ALIBABA: ['alicloud'],
        SensorCategory.DATABASE: [
            'mysql', 'postgres', 'mongodb', 'db2', 'oracle', 'mssql',
            'cassandra', 'redis', 'elasticsearch', 'couchbase', 'clickhouse',
            'cockroachdb', 'mariadb', 'memcached', 'saphana', 'sybase',
            'snowflake', 'redisenterprise'
        ],
        SensorCategory.MESSAGING: [
            'kafka', 'rabbitmq', 'mq', 'activemq', 'rocketmq', 'tibcoems',
            'sqs', 'sns', 'kinesis', 'pubsub', 'servicebus', 'eventhub'
        ],
        SensorCategory.APPLICATION_SERVER: [
            'tomcat', 'jboss', 'weblogic', 'websphere', 'glassfish',
            'liberty', 'wildfly', 'liferay'
        ],
        SensorCategory.MONITORING: [
            'prometheus', 'datadog', 'dynatrace', 'newrelic', 'appdynamics',
            'splunk', 'solarwinds', 'nagios', 'zabbix', 'turbonomic', 'scom'
        ],
        SensorCategory.CONTAINER: [
            'docker', 'kubernetes', 'containerd', 'crio', 'podman'
        ],
        SensorCategory.TRACING: [
            'trace', 'profiling', 'javatrace', 'php', 'clr', 'netcore'
        ],
        SensorCategory.CONFIGURATION: [
            'configuration.integration', 'secrets', 'ignore'
        ],
        SensorCategory.ACTION: [
            'action.'
        ]
    }

    def parse(self, yaml_content: str) -> ParsedConfiguration:
        """
        Parse YAML content and extract sensors

        Args:
            yaml_content: Raw YAML file content

        Returns:
            ParsedConfiguration with all sensors and metadata

        Raises:
            ValueError: If YAML is invalid
        """
        try:
            data = yaml.safe_load(yaml_content)
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML: {str(e)}")

        if not isinstance(data, dict):
            raise ValueError("YAML must contain a dictionary at root level")

        sensors = self._extract_sensors(data, yaml_content)

        return ParsedConfiguration(
            sensors=sensors,
            total_sensors=len(sensors),
            enabled_sensors=sum(1 for s in sensors if s.enabled),
            categories=self._count_categories(sensors),
            has_vault_integration=self._check_vault_integration(data)
        )

    def _extract_sensors(self, data: Dict, raw_content: str) -> List[Sensor]:
        """Extract all sensors from parsed YAML"""
        sensors = []

        for key, value in data.items():
            if self.SENSOR_PATTERN.match(key):
                try:
                    sensor = self._create_sensor(key, value, raw_content)
                    sensors.append(sensor)
                except Exception as e:
                    print(f"Warning: Failed to parse sensor {key}: {str(e)}")
                    continue

        return sorted(sensors, key=lambda s: (s.category.value, s.name))

    def _create_sensor(self, name: str, config: Any, raw_content: str) -> Sensor:
        """Create Sensor object from YAML data"""
        if config is None:
            config = {}

        # Extract description from comments
        description = self._extract_description(name, raw_content)

        # Determine category
        category = self._categorize_sensor(name)

        # Check if requires credentials
        requires_creds = self._requires_credentials(config)

        # Extract environment variables
        env_vars = self._extract_env_variables(name, config)

        # Determine if enabled
        enabled = False
        if isinstance(config, dict):
            enabled = config.get('enabled', False)

        return Sensor(
            id=self._generate_id(name),
            name=name,
            display_name=self._format_display_name(name),
            category=category,
            enabled=enabled,
            config=config if isinstance(config, dict) else {},
            description=description,
            requires_credentials=requires_creds,
            env_variables=env_vars
        )

    def _categorize_sensor(self, name: str) -> SensorCategory:
        """Determine sensor category from name"""
        name_lower = name.lower()

        for category, patterns in self.CATEGORY_PATTERNS.items():
            if any(pattern in name_lower for pattern in patterns):
                return category

        return SensorCategory.OTHER

    def _requires_credentials(self, config: Dict) -> bool:
        """Check if sensor configuration requires credentials"""
        if not isinstance(config, dict):
            return False

        credential_fields = [
            'password', 'token', 'api_key', 'secret', 'access_token',
            'apikey', 'client_secret', 'secret_key'
        ]

        config_str = str(config).lower()
        return any(field in config_str for field in credential_fields)

    def _extract_env_variables(self, name: str, config: Dict) -> List[str]:
        """Extract potential environment variable names"""
        if not isinstance(config, dict):
            return []

        env_vars = []
        sensitive_fields = [
            'password', 'token', 'api_key', 'secret_key', 'access_token',
            'apikey', 'client_secret', 'secret', 'private_key'
        ]

        def check_dict(d: Dict, prefix: str = ""):
            for key, value in d.items():
                current_key = f"{prefix}_{key}" if prefix else key

                # Check if using Vault
                if isinstance(value, dict) and 'configuration_from' in value:
                    continue

                # Check if field is sensitive
                if any(field in key.lower() for field in sensitive_fields):
                    var_name = f"{name.replace('.', '_').upper()}_{current_key.upper()}"
                    env_vars.append(var_name)

                # Recursively check nested dicts
                elif isinstance(value, dict):
                    check_dict(value, current_key)

        check_dict(config)
        return env_vars

    def _extract_description(self, name: str, raw_content: str) -> Optional[str]:
        """Extract description from comments above sensor"""
        lines = raw_content.split('\n')
        description_lines = []

        for i, line in enumerate(lines):
            if name in line and line.strip().startswith(name):
                # Look backwards for comments
                j = i - 1
                while j >= 0:
                    stripped = lines[j].strip()
                    if stripped.startswith('#'):
                        comment = stripped.lstrip('#').strip()
                        if comment and not comment.startswith('---'):
                            description_lines.insert(0, comment)
                        j -= 1
                    elif not stripped:
                        j -= 1
                    else:
                        break
                break

        return ' '.join(description_lines) if description_lines else None

    def _format_display_name(self, name: str) -> str:
        """Format sensor name for display"""
        # com.instana.plugin.mysql -> MySQL
        parts = name.split('.')
        if len(parts) >= 3:
            sensor_name = parts[-1]
            # Handle special cases
            if sensor_name == 'ibmmq':
                return 'IBM MQ'
            elif sensor_name == 'ibmcloud':
                return 'IBM Cloud'
            elif sensor_name.startswith('ibm'):
                return 'IBM ' + sensor_name[3:].replace('_', ' ').title()
            elif sensor_name == 'aws':
                return 'AWS'
            elif sensor_name == 'gcp':
                return 'GCP'
            elif sensor_name == 'mssql':
                return 'MS SQL'
            elif sensor_name == 'mysql':
                return 'MySQL'
            elif sensor_name == 'mongodb':
                return 'MongoDB'
            elif sensor_name == 'postgresql':
                return 'PostgreSQL'
            elif sensor_name == 'rabbitmq':
                return 'RabbitMQ'
            elif sensor_name == 'activemq':
                return 'ActiveMQ'

            return sensor_name.replace('_', ' ').title()
        return name

    def _generate_id(self, name: str) -> str:
        """Generate unique ID for sensor"""
        return name.replace('.', '_')

    def _count_categories(self, sensors: List[Sensor]) -> Dict[str, int]:
        """Count sensors by category"""
        counts = {}
        for sensor in sensors:
            category = sensor.category.value
            counts[category] = counts.get(category, 0) + 1
        return counts

    def _check_vault_integration(self, data: Dict) -> bool:
        """Check if Vault integration is configured"""
        return 'com.instana.configuration.integration.vault' in data

# Made with Bob
