export enum SensorCategory {
  CLOUD_AWS = 'cloud_aws',
  CLOUD_AZURE = 'cloud_azure',
  CLOUD_GCP = 'cloud_gcp',
  CLOUD_IBM = 'cloud_ibm',
  CLOUD_ALIBABA = 'cloud_alibaba',
  DATABASE = 'database',
  MESSAGING = 'messaging',
  APPLICATION_SERVER = 'application_server',
  MONITORING = 'monitoring',
  CONTAINER = 'container',
  TRACING = 'tracing',
  CONFIGURATION = 'configuration',
  ACTION = 'action',
  OTHER = 'other'
}

export interface SensorConfig {
  enabled?: boolean;
  poll_rate?: number;
  tags?: string[];
  [key: string]: any;
}

export interface Credential {
  field: string;
  env_var: string;
  value?: string;
  required: boolean;
}

export interface ValidationIssue {
  level: 'ERROR' | 'WARNING' | 'INFO';
  field: string;
  message: string;
  suggestion?: string;
}

export interface Sensor {
  id: string;
  name: string;
  key: string;
  display_name: string;
  category: SensorCategory | string;
  enabled: boolean;
  config: SensorConfig;
  configuration?: Record<string, any>;
  description?: string;
  requires_credentials: boolean;
  credentials?: Credential[];
  env_variables: string[];
  validation_results?: ValidationIssue[];
}

export interface ParsedConfiguration {
  sensors: Sensor[];
  total_sensors: number;
  enabled_sensors: number;
  categories: Record<string, number>;
  has_vault_integration: boolean;
  source_file?: string;
  version?: string;
}

export enum ValidationLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ValidationResult {
  is_valid: boolean;
  issues: ValidationIssue[];
  sensor_id: string;
}

export enum ChangeType {
  ADDED = 'added',
  REMOVED = 'removed',
  MODIFIED = 'modified',
  UNCHANGED = 'unchanged'
}

export interface SensorDiff {
  sensor_id: string;
  sensor_name: string;
  change_type: ChangeType;
  original_config?: SensorConfig;
  modified_config?: SensorConfig;
  field_changes: Record<string, any>;
}

export interface DiffStats {
  total_sensors: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export interface ComparisonResult {
  added_sensors: string[];
  removed_sensors: string[];
  modified_sensors: SensorDiff[];
  stats: DiffStats;
  diff_text: string;
}

// Made with Bob
